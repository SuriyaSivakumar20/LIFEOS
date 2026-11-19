import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatMinorUnits,
  parseMajorToMinor,
  calculateFinancialSummary,
  calculateCategoryBreakdown,
} from '../packages/core/src/calculations/money.ts';
import type { Transaction, Category } from '../packages/shared-types/src/index.ts';

describe('Money Calculations', () => {
  it('should format minor currency units to localized string including INR and USD', () => {
    assert.match(formatMinorUnits(1050, 'USD'), /\$10\.50/);
    assert.match(formatMinorUnits(0, 'USD'), /\$0\.00/);
    assert.match(formatMinorUnits(250000, 'USD'), /\$2,500\.00/);

    // INR formatting defaults
    const inrFormatted = formatMinorUnits(150050, 'INR');
    assert.ok(inrFormatted.includes('₹') || inrFormatted.includes('INR'), 'Formatted INR should have rupee symbol or currency code');
    assert.match(formatMinorUnits(0, 'INR'), /₹|INR/);
  });

  it('should parse user major amount input into integer minor units with edge cases', () => {
    assert.equal(parseMajorToMinor('12.50'), 1250);
    assert.equal(parseMajorToMinor('100'), 10000);
    assert.equal(parseMajorToMinor('$45.99'), 4599);
    assert.equal(parseMajorToMinor('₹1,500.50'), 150050);
    assert.equal(parseMajorToMinor('0.05'), 5);
    assert.equal(parseMajorToMinor(15.25), 1525);

    // Negative amounts
    assert.equal(parseMajorToMinor('-50.25'), -5025);
    assert.equal(parseMajorToMinor('-100'), -10000);

    // Invalid and empty amounts
    assert.equal(parseMajorToMinor(''), 0);
    assert.equal(parseMajorToMinor('   '), 0);
    assert.equal(parseMajorToMinor('invalid'), 0);
    assert.equal(parseMajorToMinor('abc$#@'), 0);
  });

  it('should calculate financial summary strictly from transaction records including refunds', () => {
    const transactions: Transaction[] = [
      {
        id: 'tx-1',
        accountId: 'acc-1',
        categoryId: 'cat-salary',
        amountMinor: 500000, // ₹5,000.00
        type: 'income',
        timestamp: '2026-11-16T10:00:00.000Z',
        userTimezone: 'Asia/Kolkata',
        description: 'Monthly Salary',
        createdAt: '2026-11-16T10:00:00.000Z',
        updatedAt: '2026-11-16T10:00:00.000Z',
      },
      {
        id: 'tx-2',
        accountId: 'acc-1',
        categoryId: 'cat-rent',
        amountMinor: 150000, // ₹1,500.00
        type: 'expense',
        timestamp: '2026-11-16T11:00:00.000Z',
        userTimezone: 'Asia/Kolkata',
        description: 'Apartment Rent',
        createdAt: '2026-11-16T11:00:00.000Z',
        updatedAt: '2026-11-16T11:00:00.000Z',
      },
      {
        id: 'tx-3',
        accountId: 'acc-1',
        categoryId: 'cat-groceries',
        amountMinor: 25000, // ₹250.00
        type: 'expense',
        timestamp: '2026-11-16T12:00:00.000Z',
        userTimezone: 'Asia/Kolkata',
        description: 'Groceries',
        createdAt: '2026-11-16T12:00:00.000Z',
        updatedAt: '2026-11-16T12:00:00.000Z',
      },
      {
        id: 'tx-4',
        accountId: 'acc-1',
        categoryId: 'cat-groceries',
        amountMinor: 5000, // ₹50.00 refund
        type: 'refund',
        timestamp: '2026-11-16T14:00:00.000Z',
        userTimezone: 'Asia/Kolkata',
        description: 'Grocery Return Refund',
        createdAt: '2026-11-16T14:00:00.000Z',
        updatedAt: '2026-11-16T14:00:00.000Z',
      },
    ];

    const summary = calculateFinancialSummary(transactions, 'INR');

    assert.equal(summary.totalIncomeMinor, 500000);
    assert.equal(summary.totalExpensesMinor, 175000);
    assert.equal(summary.totalRefundsMinor, 5000);
    // Balance = 500,000 - 175,000 + 5,000 = 330,000
    assert.equal(summary.availableBalanceMinor, 330000);
    assert.equal(summary.transactionCount, 4);
  });

  it('should return 0 financial values when transaction records are empty', () => {
    const summary = calculateFinancialSummary([], 'INR');
    assert.equal(summary.totalIncomeMinor, 0);
    assert.equal(summary.totalExpensesMinor, 0);
    assert.equal(summary.totalRefundsMinor, 0);
    assert.equal(summary.availableBalanceMinor, 0);
    assert.equal(summary.transactionCount, 0);
  });

  it('should calculate category breakdown percentages properly', () => {
    const categories: Category[] = [
      { id: 'cat-rent', name: 'Housing', type: 'expense', icon: 'home', color: '#E6AD54', isSystem: true, createdAt: '', updatedAt: '' },
      { id: 'cat-food', name: 'Food', type: 'expense', icon: 'utensils', color: '#F28C28', isSystem: true, createdAt: '', updatedAt: '' },
    ];

    const transactions: Transaction[] = [
      {
        id: '1',
        accountId: 'acc',
        categoryId: 'cat-rent',
        amountMinor: 8000,
        type: 'expense',
        timestamp: '',
        userTimezone: 'UTC',
        description: 'Rent',
        createdAt: '',
        updatedAt: '',
      },
      {
        id: '2',
        accountId: 'acc',
        categoryId: 'cat-food',
        amountMinor: 2000,
        type: 'expense',
        timestamp: '',
        userTimezone: 'UTC',
        description: 'Food',
        createdAt: '',
        updatedAt: '',
      },
    ];

    const breakdown = calculateCategoryBreakdown(transactions, categories);

    assert.equal(breakdown.length, 2);
    assert.equal(breakdown[0].categoryName, 'Housing');
    assert.equal(breakdown[0].totalMinor, 8000);
    assert.equal(breakdown[0].percentage, 80);

    assert.equal(breakdown[1].categoryName, 'Food');
    assert.equal(breakdown[1].totalMinor, 2000);
    assert.equal(breakdown[1].percentage, 20);
  });

  it('should offset category expenses when refund transactions exist', () => {
    const categories: Category[] = [
      { id: 'cat-food', name: 'Food', type: 'expense', icon: 'utensils', color: '#F28C28', isSystem: true, createdAt: '', updatedAt: '' },
    ];

    const transactions: Transaction[] = [
      {
        id: '1',
        accountId: 'acc',
        categoryId: 'cat-food',
        amountMinor: 5000,
        type: 'expense',
        timestamp: '',
        userTimezone: 'Asia/Kolkata',
        description: 'Groceries',
        createdAt: '',
        updatedAt: '',
      },
      {
        id: '2',
        accountId: 'acc',
        categoryId: 'cat-food',
        amountMinor: 1500,
        type: 'refund',
        timestamp: '',
        userTimezone: 'Asia/Kolkata',
        description: 'Groceries Refund',
        createdAt: '',
        updatedAt: '',
      },
    ];

    const breakdown = calculateCategoryBreakdown(transactions, categories);
    assert.equal(breakdown.length, 1);
    assert.equal(breakdown[0].categoryName, 'Food');
    assert.equal(breakdown[0].totalMinor, 3500); // 5000 - 1500
    assert.equal(breakdown[0].percentage, 100);
  });
});
