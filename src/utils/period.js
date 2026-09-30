/**
 * True when an admin-entered period (e.g. "Jun 2023 – Present")
 * describes an ongoing role.
 */
export function isCurrentPeriod(period) {
  return /\bpresent\b/i.test(String(period || ''))
}
