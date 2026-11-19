export type DayPeriod = 'morning' | 'afternoon' | 'evening' | 'night';

export interface GreetingInfo {
  greeting: string;
  period: DayPeriod;
}

/**
 * Returns greeting and day period based strictly on local hours:
 * - 05:00 - 11:59: Good morning
 * - 12:00 - 16:59: Good afternoon
 * - 17:00 - 21:59: Good evening
 * - 22:00 - 04:59: Good night
 */
export function getGreeting(date: Date = new Date()): GreetingInfo {
  const hours = date.getHours();

  if (hours >= 5 && hours < 12) {
    return { greeting: 'Good morning', period: 'morning' };
  } else if (hours >= 12 && hours < 17) {
    return { greeting: 'Good afternoon', period: 'afternoon' };
  } else if (hours >= 17 && hours < 22) {
    return { greeting: 'Good evening', period: 'evening' };
  } else {
    return { greeting: 'Good night', period: 'night' };
  }
}

/**
 * Formats date into YYYY-MM-DD
 */
export function formatLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a date into a human readable string: "Monday, 16 November"
 */
export function formatDisplayDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

/**
 * Formats a short date: "Nov 16, 2026"
 */
export function formatShortDate(isoString: string): string {
  try {
    const dt = new Date(isoString);
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(dt);
  } catch {
    return isoString;
  }
}
