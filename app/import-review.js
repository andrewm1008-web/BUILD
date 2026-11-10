// Suggestions are opt-in; the source prescription is never silently rewritten.
const BuildImportReview = (() => {
  function suggestions(plan) {
    return plan.sessions.flatMap((session, index) => {
      if (session.originalType) return [];
      let proposed, reason;
      if (session.type === 'easy' && /\bsteady\b/i.test(session.title)) {
        proposed = 'steady'; reason = 'The title describes steady work, but the supplied type is easy.';
      } else if (session.type === 'interval' && /\beasy\b.*\bstrides\b/i.test(session.title)) {
        proposed = 'easy'; reason = 'An easy run with strides may not be a full interval session.';
      } else if (session.type !== 'rest' && /^rest\s+or\b/i.test(session.title)) {
        proposed = 'rest'; reason = 'Optional rest should not require a training review. An optional jog can stay in Runs.';
      } else if (session.type === 'long' && session.week === plan.weeks && /\bmarathon\b/i.test(session.title)) {
        proposed = 'race'; reason = 'This may be race day. Race entries are excluded from training execution scoring.';
      }
      return proposed ? [{index, original: session.type, proposed, reason}] : [];
    });
  }
  return {suggestions};
})();
