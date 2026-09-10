// Calendar-day arithmetic avoids daylight-saving and UTC date shifts.
const BuildCalendar = (() => {
  const DAY_MS = 86400000;
  const weekdays = {Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6};
  function dayNumber(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
    const [y, m, d] = value.split('-').map(Number);
    const time = Date.UTC(y, m - 1, d);
    return new Date(time).toISOString().slice(0, 10) === value ? time / DAY_MS : null;
  }
  const iso = day => new Date(day * DAY_MS).toISOString().slice(0, 10);
  const today = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  function sessionDate(plan, session) {
    const start = dayNumber(plan.startDate);
    const offset = weekdays[session.day];
    if (start == null || offset == null) return null;
    const startWeekday = (new Date(start * DAY_MS).getUTCDay() + 6) % 7;
    return iso(start + (session.week - 1) * 7 + (offset - startWeekday + 7) % 7);
  }
  function currentWeek(plan, date = today()) {
    const start = dayNumber(plan.startDate), now = dayNumber(date);
    const week = start == null || now == null ? Number(plan.currentWeek) || 1 : Math.floor((now - start) / 7) + 1;
    return Math.max(1, Math.min(Number(plan.weeks) || 12, week));
  }
  function isDue(plan, session, date = today()) {
    const scheduled = sessionDate(plan, session);
    return scheduled ? scheduled <= date : session.week < currentWeek(plan, date);
  }
  function startForRace(raceDate, weeks) {
    const race = dayNumber(raceDate);
    return race == null ? null : iso(race - ((Number(weeks) || 12) * 7 - 1));
  }
  return {sessionDate, currentWeek, isDue, startForRace};
})();
