const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

/**
 * Applies coach changes to a copy of the plan. Past days are never touched.
 * Returns { plan, applied } where applied is the number of changes made.
 */
export function applyProposal(plan, proposal, currentWeek = 0, today = new Date()) {
  if (!plan?.weeks || !proposal?.changes) return { plan, applied: 0 };
  const todayIdx = (today.getDay() + 6) % 7;
  const weeks = plan.weeks.map(w => ({ ...w, workouts: [...(w.workouts || [])] }));
  let applied = 0;
  for (const c of proposal.changes) {
    const wi = c.week - 1;
    const di = DAYS.indexOf(c.day);
    if (wi < 0 || wi >= weeks.length || di < 0) continue;
    if (wi < currentWeek || (wi === currentWeek && di < todayIdx)) continue;
    const w = weeks[wi];
    const next = { day: c.day, type: c.type, km: c.km ?? null, desc: { es: c.desc_es, en: c.desc_en }, coach: true };
    const pos = w.workouts.findIndex(x => x.day === c.day);
    if (pos >= 0) w.workouts[pos] = next; else w.workouts.push(next);
    if (w.keyWorkout?.day === c.day) w.keyWorkout = next;
    w.kmTotal = Math.round(w.workouts.reduce((sum, x) => sum + (Number(x.km) || 0), 0));
    applied++;
  }
  return { plan: { ...plan, weeks }, applied };
}
