// Deterministic observations. No fitness prediction or automatic execution grade.
const BuildSessionEvidence = (() => {
  function describe(session, activity) {
    if (!activity) return null;
    const observed = [`Recorded on ${activity.date || 'an unspecified date'}: ${activity.distanceKm.toFixed(2)} km.`];
    if (session.distanceKm != null) {
      const difference = activity.distanceKm - session.distanceKm;
      observed.push(Math.abs(difference)<.005?`Recorded distance matches the supplied ${session.distanceKm} km after rounding.`:`${Math.abs(difference).toFixed(2)} km ${difference < 0 ? 'below' : 'above'} the supplied ${session.distanceKm} km distance.`);
    } else observed.push('No total distance was supplied; distance completion cannot be calculated.');
    if (activity.distanceKm > 0 && activity.movingSeconds > 0) {
      const pace = Math.round(activity.movingSeconds / activity.distanceKm);
      observed.push(`Whole-run moving pace: ${Math.floor(pace / 60)}:${String(pace % 60).padStart(2, '0')}/km.`);
    }
    if (activity.averageHeartrate != null) observed.push(`Recorded average heart rate: ${Math.round(activity.averageHeartrate)} bpm.`);
    const interpretation = ({
      easy: 'Distance and average pace do not establish whether the effort was easy. Review control and recovery against your prescription.',
      recovery: 'The purpose is recovery. Faster or farther does not automatically mean better execution.',
      long: 'Distance is one part of the long run. Review the prescribed effort, duration and any work within it before judging execution.',
      interval: 'Whole-run pace includes warm-up and recoveries. It cannot establish completion of the prescribed repetitions.',
      threshold: 'The whole-run average cannot isolate the sustained threshold work. Review time at the prescribed effort.',
      marathon: 'The whole-run average cannot isolate a marathon-pace block. Review the prescribed block separately.',
      steady: 'Compare the intended steady effort with what you completed. Whole-run pace alone cannot establish control.',
      race: 'This is race evidence, separate from delivery of the training plan.'
    })[session.type] || 'Compare the recorded activity with the purpose of the planned session.';
    const limits = ['Splits, laps and heart-rate streams are not available in this version.'];
    if (activity.averageHeartrate == null) limits.push('No average heart rate is available.');
    limits.push('These observations do not verify session quality or predict a marathon time. Your review remains separate.');
    return {observed, interpretation, limits};
  }
  return {describe};
})();
