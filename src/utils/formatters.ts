/**
 * Formats an integer amount of cents to a standard USD currency string (e.g. 1299 -> "$12.99").
 */
export function formatCentsToCurrency(cents: number): string {
  const dollars = (cents / 100).toFixed(2);
  return `$${dollars}`;
}

/**
 * Formats ETA range (e.g., min: 20, max: 30 -> "20–30 min").
 */
export function formatEtaRange(minMinutes: number, maxMinutes: number): string {
  return `${minMinutes}–${maxMinutes} min`;
}

/**
 * Formats ISO date string to readable time / date string.
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(date);
}
