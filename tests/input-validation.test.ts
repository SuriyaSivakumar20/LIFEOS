import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  TransactionInputSchema,
  TaskInputSchema,
  HabitInputSchema,
  JournalInputSchema,
  UserProfileSchema,
  AppSettingsSchema,
} from '../packages/core/src/validation/schemas.ts';

describe('Input Validation Schemas', () => {
  it('should validate a valid transaction input', () => {
    const valid = {
      accountId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      categoryId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      amountMinor: 2500,
      type: 'expense' as const,
      timestamp: '2026-11-16T12:00:00.000Z',
      userTimezone: 'UTC',
      description: 'Coffee',
    };

    const res = TransactionInputSchema.safeParse(valid);
    assert.equal(res.success, true);
  });

  it('should reject non-integer or negative transaction amounts', () => {
    const invalidAmount = {
      accountId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      categoryId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      amountMinor: -100,
      type: 'expense' as const,
      timestamp: '2026-11-16T12:00:00.000Z',
      userTimezone: 'UTC',
      description: 'Coffee',
    };

    const res = TransactionInputSchema.safeParse(invalidAmount);
    assert.equal(res.success, false);
  });

  it('should validate task input priority and status', () => {
    const validTask = {
      title: 'Review quarterly goals',
      priority: 'high' as const,
      status: 'pending' as const,
    };
    assert.equal(TaskInputSchema.safeParse(validTask).success, true);

    const invalidTask = {
      title: '',
      priority: 'super-urgent',
      status: 'done',
    };
    assert.equal(TaskInputSchema.safeParse(invalidTask).success, false);
  });

  it('should validate habit target days (1 to 7)', () => {
    assert.equal(
      HabitInputSchema.safeParse({ title: 'Read', frequency: 'daily', targetDaysPerWeek: 7 }).success,
      true
    );
    assert.equal(
      HabitInputSchema.safeParse({ title: 'Workout', frequency: 'weekly', targetDaysPerWeek: 0 }).success,
      false
    );
    assert.equal(
      HabitInputSchema.safeParse({ title: 'Run', frequency: 'daily', targetDaysPerWeek: 8 }).success,
      false
    );
  });

  it('should validate journal entry content', () => {
    assert.equal(
      JournalInputSchema.safeParse({ title: 'Reflection', content: 'Today was productive', mood: 'great' }).success,
      true
    );
    assert.equal(
      JournalInputSchema.safeParse({ title: '', content: '' }).success,
      false
    );
  });

  it('should validate user profile settings', () => {
    assert.equal(
      UserProfileSchema.safeParse({ name: 'Alex', timezone: 'America/New_York', currency: 'USD' }).success,
      true
    );
    assert.equal(
      AppSettingsSchema.safeParse({
        themeMode: 'dark',
        analyticsEnabled: false,
        biometricsEnabled: false,
        notificationsEnabled: true,
        weekStartsOn: 1,
      }).success,
      true
    );
  });
});
