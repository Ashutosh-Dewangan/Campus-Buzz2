/**
 * Safely parses event dates, guarding against JavaScript's default
 * UTC-midnight shift when parsing ISO date strings (YYYY-MM-DD) without timestamps.
 */
export function parseEventDate(dateStr: string, timeStr?: string): Date {
  if (!dateStr) return new Date(NaN);

  const trimmedDate = dateStr.trim();
  // Check for YYYY-MM-DD pattern
  const match = trimmedDate.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);

    let hours = 0;
    let minutes = 0;
    if (timeStr) {
      const timeMatch = timeStr.trim().match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
      if (timeMatch) {
        hours = parseInt(timeMatch[1], 10);
        minutes = parseInt(timeMatch[2], 10);
        const meridiem = timeMatch[3]?.toUpperCase();
        if (meridiem === "PM" && hours < 12) hours += 12;
        if (meridiem === "AM" && hours === 12) hours = 0;
      }
    }
    return new Date(year, month, day, hours, minutes);
  }

  // Fallback to combined or date-only
  const combined = timeStr ? `${trimmedDate} ${timeStr}` : trimmedDate;
  const parsed = new Date(combined);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  return new Date(trimmedDate);
}
