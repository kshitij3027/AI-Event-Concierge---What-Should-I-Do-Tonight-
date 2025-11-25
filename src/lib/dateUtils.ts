/**
 * Date utility functions for event discovery
 */

/**
 * Get the start of today in UTC ISO format
 */
export function getTodayStartUTC(): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.toISOString();
}

/**
 * Get the end of today (approximately 11:59 PM local time) in UTC ISO format
 */
export function getTodayEndUTC(): string {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  return now.toISOString();
}

/**
 * Get tonight's date range (from now until ~10PM local)
 */
export function getTonightRange(): { start: string; end: string } {
  const now = new Date();
  const end = new Date(now);
  end.setHours(22, 0, 0, 0); // 10 PM local
  
  // If it's already past 10 PM, extend to midnight
  if (now.getHours() >= 22) {
    end.setHours(23, 59, 59, 999);
  }
  
  return {
    start: now.toISOString(),
    end: end.toISOString(),
  };
}

/**
 * Get tomorrow's date range
 */
export function getTomorrowRange(): { start: string; end: string } {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const start = new Date(tomorrow);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(tomorrow);
  end.setHours(23, 59, 59, 999);
  
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

/**
 * Get the next weekend (Saturday and Sunday) date range
 */
export function getWeekendRange(): { start: string; end: string } {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Calculate days until Saturday
  let daysUntilSaturday = 6 - dayOfWeek;
  if (daysUntilSaturday <= 0) {
    // It's already Saturday or Sunday
    daysUntilSaturday = dayOfWeek === 0 ? 6 : 0; // If Sunday, get next Saturday
  }
  
  const saturday = new Date(today);
  saturday.setDate(today.getDate() + daysUntilSaturday);
  saturday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);
  sunday.setHours(23, 59, 59, 999);
  
  // If it's already the weekend, start from now
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return {
      start: today.toISOString(),
      end: sunday.toISOString(),
    };
  }
  
  return {
    start: saturday.toISOString(),
    end: sunday.toISOString(),
  };
}

/**
 * Get the next 7 days range
 */
export function getWeekRange(): { start: string; end: string } {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 7);
  end.setHours(23, 59, 59, 999);
  
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

/**
 * Get the next 30 days range
 */
export function getMonthRange(): { start: string; end: string } {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 30);
  end.setHours(23, 59, 59, 999);
  
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

/**
 * Format a date string for display
 */
export function formatEventDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Check if it's today
  if (date.toDateString() === now.toDateString()) {
    return `Today at ${formatTime(date)}`;
  }
  
  // Check if it's tomorrow
  if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow at ${formatTime(date)}`;
  }
  
  // Check if it's within this week
  const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntil <= 7) {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    return `${dayName} at ${formatTime(date)}`;
  }
  
  // Otherwise, show full date
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Format time for display
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format a short date (e.g., "Nov 25")
 */
export function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Check if an event is happening soon (within 24 hours)
 */
export function isHappeningSoon(dateString: string): boolean {
  const eventDate = new Date(dateString);
  const now = new Date();
  const hoursUntil = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntil >= 0 && hoursUntil <= 24;
}

/**
 * Get a relative time description
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  
  if (diffMs < 0) {
    return 'Past';
  }
  
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `In ${diffMinutes} min`;
  }
  
  if (diffHours < 24) {
    return `In ${diffHours}h`;
  }
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) {
    return 'Tomorrow';
  }
  
  if (diffDays < 7) {
    return `In ${diffDays} days`;
  }
  
  return formatShortDate(dateString);
}

