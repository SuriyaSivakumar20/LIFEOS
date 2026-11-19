import type {
  Transaction,
  Category,
  FinancialSummary,
  CategoryExpenseBreakdown,
} from '@lifeos/shared-types';

/**
 * Formats integer minor currency units (e.g. 1050 for ₹10.50) into a localized formatted string.
 * Defaults to INR (Indian Rupee) for new Indian user profile.
 */
export function formatMinorUnits(amountMinor: number, currency = 'INR'): string {
  if (isNaN(amountMinor) || !isFinite(amountMinor)) {
    amountMinor = 0;
  }
  const major = amountMinor / 100;
  const curr = (currency || 'INR').toUpperCase();
  const locale = curr === 'INR' ? 'en-IN' : 'en-US';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(major);
  } catch {
    // Fallback if currency code or locale is unusual
    const sign = major < 0 ? '-' : '';
    const symbol = curr === 'INR' ? '₹' : curr === 'USD' ? '$' : `${curr} `;
    return `${sign}${symbol}${Math.abs(major).toFixed(2)}`;
  }
}

/**
 * Parses user major unit input (e.g. "12.50", "₹1,250.50", or 12.5) into integer minor units (1250, 125050).
 * Preserves negative sign for refunds or credit adjustments, returns 0 for invalid inputs.
 */
export function parseMajorToMinor(amountMajor: string | number): number {
  if (typeof amountMajor === 'number') {
    if (isNaN(amountMajor) || !isFinite(amountMajor)) return 0;
    return Math.round(amountMajor * 100);
  }

  if (typeof amountMajor !== 'string') {
    return 0;
  }

  const trimmed = amountMajor.trim();
  if (!trimmed) return 0;

  // Detect negative
  const isNegative = trimmed.startsWith('-') || trimmed.includes('(');

  // Strip everything except digits and decimal point
  const clean = trimmed.replace(/[^0-9.]/g, '');
  if (!clean) return 0;

  const parsed = parseFloat(clean);
  if (isNaN(parsed) || !isFinite(parsed)) return 0;

  const minor = Math.round(parsed * 100);
  return isNegative ? -minor : minor;
}

/**
 * Calculates financial summary (total income, total expenses, refunds, and available balance)
 * strictly from stored transaction records.
 */
export function calculateFinancialSummary(
  transactions: Transaction[],
  currency = 'INR'
): FinancialSummary {
  let totalIncomeMinor = 0;
  let totalExpensesMinor = 0;
  let totalRefundsMinor = 0;

  for (const t of transactions) {
    const amt = typeof t.amountMinor === 'number' && isFinite(t.amountMinor) ? t.amountMinor : 0;

    if (t.type === 'income') {
      if (amt >= 0) {
        totalIncomeMinor += amt;
      } else {
        // Negative income is an income reversal/deduction
        totalIncomeMinor += amt;
      }
    } else if (t.type === 'expense') {
      if (amt < 0) {
        // Negative expense is treated as a credit / refund
        totalRefundsMinor += Math.abs(amt);
      } else {
        totalExpensesMinor += amt;
      }
    } else if (t.type === 'refund') {
      totalRefundsMinor += Math.abs(amt);
    }
  }

  // Available balance: total income minus net expenses (expenses minus refunds)
  const availableBalanceMinor = totalIncomeMinor - totalExpensesMinor + totalRefundsMinor;

  return {
    totalIncomeMinor,
    totalExpensesMinor,
    totalRefundsMinor,
    availableBalanceMinor,
    currency: currency || 'INR',
    transactionCount: transactions.length,
  };
}

/**
 * Calculates category breakdown percentages and totals strictly from expense and refund transactions.
 */
export function calculateCategoryBreakdown(
  transactions: Transaction[],
  categories: Category[]
): CategoryExpenseBreakdown[] {
  const categoryMap = new Map<string, Category>();
  for (const c of categories) {
    categoryMap.set(c.id, c);
  }

  const categoryTotals = new Map<string, number>();

  for (const t of transactions) {
    const amt = typeof t.amountMinor === 'number' && isFinite(t.amountMinor) ? t.amountMinor : 0;

    if (t.type === 'expense') {
      const current = categoryTotals.get(t.categoryId) ?? 0;
      categoryTotals.set(t.categoryId, current + amt);
    } else if (t.type === 'refund') {
      // Refunds reduce the category's total expenses
      const current = categoryTotals.get(t.categoryId) ?? 0;
      categoryTotals.set(t.categoryId, current - Math.abs(amt));
    }
  }

  // Calculate net total expenses across categories
  let netTotalExpensesMinor = 0;
  categoryTotals.forEach((totalMinor) => {
    if (totalMinor > 0) {
      netTotalExpensesMinor += totalMinor;
    }
  });

  const breakdown: CategoryExpenseBreakdown[] = [];

  categoryTotals.forEach((totalMinor, categoryId) => {
    // Only display categories with non-zero activity
    if (totalMinor === 0) return;

    const cat = categoryMap.get(categoryId);
    const nonNegativeTotal = Math.max(0, totalMinor);
    const percentage =
      netTotalExpensesMinor > 0 ? (nonNegativeTotal / netTotalExpensesMinor) * 100 : 0;

    breakdown.push({
      categoryId,
      categoryName: cat?.name ?? 'Other',
      categoryColor: cat?.color ?? '#A8A39A',
      categoryIcon: cat?.icon ?? 'more-horizontal',
      totalMinor,
      percentage: Math.round(percentage * 10) / 10,
    });
  });

  // Sort descending by total amount
  return breakdown.sort((a, b) => b.totalMinor - a.totalMinor);
}
