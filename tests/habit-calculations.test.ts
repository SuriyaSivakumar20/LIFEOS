import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateStreak } from '../packages/core/src/calculations/habits.ts';

describe('Habit Streak Calculations', () => {
  it('should calculate streak accurately for consecutive days', () => {
    // Reference date: 2026-11-16
    const completedDates = [
      '2026-11-16',
      '2026-11-15',
      '2026-11-14',
      '2026-11-13',
    ];

    const { currentStreak, bestStreak } = calculateStreak(completedDates, '2026-11-16');

    assert.equal(currentStreak, 4);
    assert.equal(bestStreak, 4);
  });

  it('should allow yesterday completion to keep active streak intact', () => {
    // Today is 2026-11-16, yesterday was completed
    const completedDates = [
      '2026-11-15',
      '2026-11-14',
      '2026-11-13',
    ];

    const { currentStreak } = calculateStreak(completedDates, '2026-11-16');
    assert.equal(currentStreak, 3);
  });

  it('should break streak when a day gap exists', () => {
    // Gap on 2026-11-14
    const completedDates = [
      '2026-11-16',
      '2026-11-15',
      '2026-11-13', // skipped 14
      '2026-11-12',
      '2026-11-11',
    ];

    const { currentStreak, bestStreak } = calculateStreak(completedDates, '2026-11-16');
    assert.equal(currentStreak, 2);
    assert.equal(bestStreak, 3); // 11, 12, 13 was 3
  });

  it('should return 0 streak for empty logs', () => {
    const { currentStreak, bestStreak } = calculateStreak([], '2026-11-16');
    assert.equal(currentStreak, 0);
    assert.equal(bestStreak, 0);
  });
});
