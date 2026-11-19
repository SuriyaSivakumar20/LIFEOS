import type {
  ITransactionRepository,
  ICategoryRepository,
  ITaskRepository,
  IHabitRepository,
  IReminderRepository,
  ISettingsRepository,
  FinancialSummary,
  CategoryExpenseBreakdown,
  Task,
  Reminder,
  Habit,
  HabitWithTodayStatus,
  UserProfile,
  AppSettings,
  Transaction,
} from '@lifeos/shared-types';
import { calculateFinancialSummary, calculateCategoryBreakdown } from '../calculations/money';
import { getGreeting, formatLocalDateString, formatDisplayDate } from '../calculations/time';
import { isHabitCompletedForDate } from '../calculations/habits';

export interface HomeDashboardData {
  greeting: string;
  displayDate: string;
  financialSummary: FinancialSummary;
  todayTasks: Task[];
  completedTasksCount: number;
  totalTodayTasksCount: number;
  habitsSummary: {
    totalHabits: number;
    completedTodayCount: number;
    habitsWithStatus: HabitWithTodayStatus[];
  };
  upcomingReminders: Reminder[];
  userProfile: UserProfile | null;
  settings: AppSettings | null;
}

export class GetHomeDashboardUseCase {
  constructor(
    private transactionRepo: ITransactionRepository,
    private taskRepo: ITaskRepository,
    private habitRepo: IHabitRepository,
    private reminderRepo: IReminderRepository,
    private settingsRepo: ISettingsRepository
  ) {}

  async execute(now: Date = new Date()): Promise<HomeDashboardData> {
    const todayStr = formatLocalDateString(now);
    const { greeting } = getGreeting(now);
    const displayDate = formatDisplayDate(now);

    const [
      transactions,
      todayTasks,
      habits,
      todayLogs,
      upcomingReminders,
      userProfile,
      settings,
    ] = await Promise.all([
      this.transactionRepo.getAll(),
      this.taskRepo.getTodayTasks(todayStr),
      this.habitRepo.getAll(),
      this.habitRepo.getTodayLogs(todayStr),
      this.reminderRepo.getUpcoming(3),
      this.settingsRepo.getProfile(),
      this.settingsRepo.getSettings(),
    ]);

    const currency = userProfile?.currency ?? 'INR';
    const financialSummary = calculateFinancialSummary(transactions, currency);

    const completedTasksCount = todayTasks.filter((t: Task) => t.status === 'completed').length;

    const habitsWithStatus: HabitWithTodayStatus[] = (habits as Habit[])
      .filter((h: Habit) => !h.isArchived)
      .map((h: Habit) => ({
        ...h,
        isCompletedToday: isHabitCompletedForDate(todayLogs, h.id, todayStr),
      }));

    const completedTodayCount = habitsWithStatus.filter((h) => h.isCompletedToday).length;

    return {
      greeting,
      displayDate,
      financialSummary,
      todayTasks,
      completedTasksCount,
      totalTodayTasksCount: todayTasks.length,
      habitsSummary: {
        totalHabits: habitsWithStatus.length,
        completedTodayCount,
        habitsWithStatus,
      },
      upcomingReminders,
      userProfile,
      settings,
    };
  }
}

export interface MoneyOverviewData {
  summary: FinancialSummary;
  breakdown: CategoryExpenseBreakdown[];
  recentTransactions: Transaction[];
}

export class GetMoneyOverviewUseCase {
  constructor(
    private transactionRepo: ITransactionRepository,
    private categoryRepo: ICategoryRepository,
    private settingsRepo: ISettingsRepository
  ) {}

  async execute(): Promise<MoneyOverviewData> {
    const [transactions, categories, profile] = await Promise.all([
      this.transactionRepo.getAll(),
      this.categoryRepo.getAll(),
      this.settingsRepo.getProfile(),
    ]);

    const currency = profile?.currency ?? 'USD';
    const summary = calculateFinancialSummary(transactions, currency);
    const breakdown = calculateCategoryBreakdown(transactions, categories);
    const recentTransactions = await this.transactionRepo.getRecent(10);

    return {
      summary,
      breakdown,
      recentTransactions,
    };
  }
}
