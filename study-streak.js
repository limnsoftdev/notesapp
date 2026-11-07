/* ===================== study: the progress bar reacts to a streak ===================== */
// Deliberately subtle: the gold warms to amber, a soft shine sweeps across it (both in
// styles.css, driven by #studyView[data-streak]), the bar gives a small bounce on each right
// answer. The count itself is shown in the result sheet, not over the bar. The bar is redrawn
// on every answer, so this runs after each redraw and slides the fill forward from where it
// was. Mock tests always pass a streak of 0 and stay plain.

const streakBar = (() => {
  const STREAK_START = 2;
  let streak = 0, lastSession = null, lastShare = 0;

  const level = (n) => n < STREAK_START ? 0 : n < 5 ? 1 : n < 8 ? 2 : 3;
  const motion = () => !matchMedia('(prefers-reduced-motion: reduce)').matches;

  function set(next, session){
    const previous = streak;
    streak = next;
    studyView.dataset.streak = level(next);
    const track = studyView.querySelector('.train-progress-bar');
    const fill = studyView.querySelector('.train-progress-fill');
    if(!track || !fill) { lastSession = null; return; }

    const share = parseFloat(fill.style.width) / 100 || 0;
    if(motion()){
      if(session === lastSession && share !== lastShare){
        fill.animate(
          [{ width: `${lastShare * 100}%` }, { width: `${share * 100}%` }],
          { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)' }
        );
      }
      if(next > previous && next >= STREAK_START){
        track.animate(
          [{ transform: 'scaleY(1)' }, { transform: 'scaleY(1.5)', offset: .35 }, { transform: 'scaleY(1)' }],
          { duration: 340, easing: 'ease-out' }
        );
      }
    }
    lastSession = session;
    lastShare = share;
  }
  return { set };
})();
