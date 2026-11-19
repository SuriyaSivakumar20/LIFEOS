import { z } from 'zod';

export const TransactionInputSchema = z.object({
  accountId: z.string().uuid({ message: 'Valid account ID is required' }),
  categoryId: z.string().uuid({ message: 'Valid category ID is required' }),
  amountMinor: z.number().int({ message: 'Amount must be an integer in minor units' }).positive({ message: 'Amount must be positive' }),
  type: z.enum(['income', 'expense', 'transfer', 'refund']),
  timestamp: z.string().datetime({ message: 'Timestamp must be an ISO 8601 UTC string' }),
  userTimezone: z.string().min(1, { message: 'User timezone is required' }),
  description: z.string().min(1, { message: 'Description cannot be empty' }).max(120),
  notes: z.string().max(500).optional().nullable(),
  tags: z.array(z.string().max(30)).optional(),
});

export const TaskInputSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }).max(150),
  description: z.string().max(1000).optional().nullable(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['pending', 'completed', 'cancelled']),
  dueDate: z.string().datetime().optional().nullable(),
});

export const HabitInputSchema = z.object({
  title: z.string().min(1, { message: 'Habit title is required' }).max(100),
  frequency: z.enum(['daily', 'weekly']),
  targetDaysPerWeek: z.number().int().min(1).max(7),
});

export const JournalInputSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }).max(150),
  content: z.string().min(1, { message: 'Content is required' }),
  mood: z.enum(['great', 'good', 'neutral', 'bad', 'awful']).optional().nullable(),
  tags: z.array(z.string().max(30)).optional(),
});

export const UserProfileSchema = z.object({
  name: z.string().min(1).max(100),
  timezone: z.string().min(1),
  currency: z.string().length(3),
});

export const AppSettingsSchema = z.object({
  themeMode: z.enum(['dark', 'light', 'system']),
  analyticsEnabled: z.boolean(),
  biometricsEnabled: z.boolean(),
  notificationsEnabled: z.boolean(),
  weekStartsOn: z.union([z.literal(0), z.literal(1)]),
});
