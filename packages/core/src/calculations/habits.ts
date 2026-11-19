import type { HabitLog } from '@lifeos/shared-types';

/**
 * Calculates current streak and best streak from a sorted list of unique YYYY-MM-DD completion dates.
 */
export function calculateStreak(
  completedDates: string[],
  referenceDateStr?: string
): { currentStreak: number; bestStreak: number } {
  if (completedDates.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  // Deduplicate and sort descending (newest first)
  const uniqueDates = Array.from(new Set(completedDates)).sort().reverse();

  const todayStr = referenceDateStr ?? getLocalDateString();
  const yesterdayStr = getAdjacentDateString(todayStr, -1);

  // Check if today or yesterday is completed to maintain streak
  let currentStreak = 0;
  let checkDate = uniqueDates[0] === todayStr ? todayStr : (uniqueDates[0] === yesterdayStr ? yesterdayStr : null);

  if (checkDate) {
    let expected = checkDate;
    for (const d of uniqueDates) {
      if (d === expected) {
        currentStreak++;
        expected = getAdjacentDateString(expected, -1);
      } else if (d > expected) {
        // Skip ahead or already counted
        continue;
      } else {
        // Gap found
        break;
      }
    }
  }

  // Calculate best all-time streak
  let bestStreak = 0;
  let runningStreak = 0;
  const chronological = [...uniqueDates].reverse();

  for (let i = 0; i < chronological.length; i++) {
    if (i === 0) {
      runningStreak = 1;
    } else {
      const prev = chronological[i - 1];
      const curr = chronological[i];
      const nextExpected = getAdjacentDateString(prev, 1);
      if (curr === nextExpected) {
        runningStreak++;
      } else {
        runningStreak = 1;
      }
    }
    if (runningStreak > bestStreak) {
      bestStreak = runningStreak;
    }
  }

  return {
    currentStreak,
    bestStreak: Math.max(bestStreak, currentStreak),
  };
}

export function isHabitCompletedForDate(
  habitLogs: HabitLog[],
  habitId: string,
  targetDateYYYYMMDD: string
): boolean {
  return habitLogs.some(
    (log) => log.habitId === habitId && log.completedDate === targetDateYYYYMMDD
  );
}

function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getAdjacentDateString(dateStr: string, offsetDays: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + offsetDays);
  return getLocalDateString(dt);
}
