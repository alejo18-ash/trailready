// Single source of truth for plan length and calendar position.

const MAX_WEEKS = 32;
const MIN_WEEKS = 4;

/** Ideal plan length for a race distance (km). */
export function idealWeeksFor(distancia) {
  const d = Number(distancia) || 0;
  if (d <= 25) return 12;
  if (d <= 55) return 16;
  if (d <= 80) return 20;
  if (d <= 110) return 24;
  return 28;
}

/** Monday 00:00 (local) of the week containing `date`. */
export function mondayOf(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dow = (d.getDay() + 6) % 7; // Mon=0 … Sun=6
  d.setDate(d.getDate() - dow);
  return d;
}

/** Whole weeks from this Monday up to (and including) the race week. */
export function weeksUntilRace(fecha) {
  if (!fecha) return null;
  const race = new Date(fecha + 'T12:00:00');
  if (isNaN(race)) return null;
  const diff = mondayOf(race) - mondayOf(new Date());
  return Math.floor(diff / (7 * 24 * 3600 * 1000)) + 1;
}

/**
 * Plan length: the plan always ends on race week.
 * If there is more time than ideal, the extra goes into a longer base (capped).
 */
export function planLengthWeeks(raceData) {
  const available = raceData?.fecha ? weeksUntilRace(raceData.fecha) : raceData?.weeksAvailable;
  const ideal = idealWeeksFor(raceData?.distancia);
  const total = Math.max(MIN_WEEKS, Math.min(MAX_WEEKS, available || ideal));
  return { total, ideal, available: available || ideal, insufficient: (available || ideal) < ideal * 0.6 };
}

/** Index of the current week inside a plan, from its start date. */
export function currentWeekIndex(plan, fallbackStart) {
  if (!plan?.weeks?.length) return 0;
  const start = plan.startDate ? new Date(plan.startDate) : (fallbackStart ? mondayOf(new Date(fallbackStart)) : null);
  if (!start || isNaN(start)) return 0;
  const idx = Math.floor((mondayOf(new Date()) - mondayOf(start)) / (7 * 24 * 3600 * 1000));
  return Math.max(0, Math.min(plan.weeks.length - 1, idx));
}
