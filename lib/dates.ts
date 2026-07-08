// Start of the current local day, as an ISO timestamp — used to decide which
// completed items still belong on today's active list.
export function startOfTodayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}
