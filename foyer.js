/* ===================== foyer (welcome screen) ===================== */
// Shown every time the app opens. The app is for keeping words you've already logged,
// so the foyer leads with what's fading: the due count, plus one quick rep on the word
// you're closest to forgetting. Relies on globals from app.js (entries, countDue,
// switchTab, startSession, applySrsRating, saveEntries, bumpDaily, bumpStreak, streak...).
// Every open starts with Danno asleep; tapping him wakes him and opens the foyer.

const foyerEl        = document.getElementById('foyer');
const foyerHello     = document.getElementById('foyerHello');
const foyerSub       = document.getElementById('foyerSub');
const foyerPrimary   = document.getElementById('foyerPrimary');
const foyerSecondary = document.getElementById('foyerSecondary');
const foyerStats     = document.getElementById('foyerStats');
const recallBtn      = document.getElementById('recall');
const recallKo       = document.getElementById('recallKo');
const recallAnswer   = document.getElementById('recallAnswer');
const recallRom      = document.getElementById('recallRom');
const recallMeaning  = document.getElementById('recallMeaning');
const recallHint     = document.getElementById('recallHint');
const recallRate     = document.getElementById('recallRate');
const dannoWrap      = document.getElementById('dannoWrap');
const brandHome      = document.getElementById('brandHome');

const motionOk = typeof gsap !== 'undefined' && !matchMedia('(prefers-reduced-motion: reduce)').matches;

let recallEntry = null;
let primaryAction = null;
let secondaryAction = null;

/* ---------- content ---------- */
function streakDisplay(){
  const today = todayStr();
  return (streak.lastDate === today || streak.lastDate === yesterdayStr()) ? streak.count : 0;
}
function nextReviewText(){
  const now = Date.now();
  const next = entries.reduce((min, e) => (e.srs && e.srs.dueAt > now && e.srs.dueAt < min) ? e.srs.dueAt : min, Infinity);
  if(next === Infinity) return '';
  const hours = Math.round((next - now) / 3600000);
  if(hours < 1) return 'within the hour';
  if(hours < 20) return `in ${hours}h`;
  const days = Math.round(hours / 24);
  return days <= 1 ? 'tomorrow' : `in ${days} days`;
}
// the due word you're closest to forgetting: lowest box first, then most overdue
function pickRecallEntry(){
  const now = Date.now();
  return entries
    .filter(e => e.srs && e.srs.dueAt <= now)
    .sort((a, b) => (a.srs.box - b.srs.box) || (a.srs.dueAt - b.srs.dueAt))[0] || null;
}

function renderFoyer(){
  const h = new Date().getHours();
  foyerHello.textContent = h < 5 ? '아직 안 자요?' : h < 12 ? '좋은 아침!' : h < 18 ? '안녕하세요!' : '좋은 저녁!';

  const due = countDue();
  const total = entries.length;
  const solid = entries.filter(e => e.srs && e.srs.box >= 3).length;

  if(total === 0){
    foyerSub.textContent = 'your 단어장 is empty. log a word you heard today and danno will help you keep it.';
    setActions('log your first word', (btn) => closeFoyer(btn, () => switchTab('log'), landOnInput), null);
  }else if(due > 0){
    foyerSub.textContent = due === 1 ? '1 word is starting to fade.' : `${due} words are starting to fade.`;
    setActions(`review now <span class="foyer-pill">${due} due</span>`, (btn) => closeFoyer(btn, () => { switchTab('train'); startSession(); }),
               'open my log <span aria-hidden="true">→</span>', (btn) => closeFoyer(btn, () => switchTab('log')));
  }else{
    const next = nextReviewText();
    foyerSub.textContent = next ? `nothing's fading. next review ${next}.` : "nothing's fading right now.";
    setActions('open my log <span aria-hidden="true">→</span>', (btn) => closeFoyer(btn, () => switchTab('log')),
               'practice anyway', (btn) => closeFoyer(btn, () => switchTab('train')));
  }

  const s = streakDisplay();
  foyerStats.textContent = total === 0 ? '' :
    `${total} word${total === 1 ? '' : 's'} logged · ${solid} remembered well` + (s ? ` · ${s}-day streak` : '');

  setRecall(pickRecallEntry());
}

function setActions(primaryHtml, onPrimary, secondaryHtml, onSecondary){
  foyerPrimary.innerHTML = primaryHtml;
  primaryAction = onPrimary;
  foyerSecondary.hidden = !secondaryHtml;
  if(secondaryHtml) foyerSecondary.innerHTML = secondaryHtml;
  secondaryAction = onSecondary;
}
foyerPrimary.addEventListener('click', () => primaryAction && primaryAction(foyerPrimary));
foyerSecondary.addEventListener('click', () => secondaryAction && secondaryAction(foyerSecondary));

/* ---------- one quick rep ---------- */
function setRecall(entry){
  recallEntry = entry;
  recallBtn.hidden = !entry;
  recallRate.hidden = true;
  if(!entry) return;
  recallBtn.classList.remove('revealed');
  recallKo.textContent = entry.korean;
  recallRom.textContent = entry.romanized || '';
  recallMeaning.textContent = entry.meaning;
  recallAnswer.hidden = true;
  recallHint.hidden = false;
}
recallBtn.addEventListener('click', () => {
  if(!recallEntry || recallBtn.classList.contains('revealed')) return;
  recallBtn.classList.add('revealed');
  recallAnswer.hidden = false;
  recallHint.hidden = true;
  recallRate.hidden = false;
  if(motionOk){
    gsap.from(recallAnswer, { opacity: 0, y: 8, duration: .3, ease: 'power3.out' });
    gsap.from(recallRate.children, { opacity: 0, y: 8, duration: .3, stagger: .05, ease: 'power3.out' });
    dannoPeek();
  }
});
recallRate.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-rating]');
  if(!btn || !recallEntry) return;
  const rating = btn.dataset.rating;
  applySrsRating(recallEntry, rating);
  saveEntries(entries);
  bumpDaily();
  bumpStreak();
  updateDueDot();
  if(motionOk) rating === 'correct' ? dannoHop() : dannoSulk();
  if(motionOk){
    gsap.to([recallBtn, recallRate], { opacity: 0, y: -10, duration: .2, ease: 'power2.in', onComplete: () => {
      renderFoyer();
      gsap.fromTo([recallBtn, recallRate], { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .3, ease: 'power3.out' });
    }});
  }else{
    renderFoyer();
  }
});

/* ---------- danno ---------- */
// pose swaps are instant, so they're always hidden inside fast motion (a squash, the top of a hop)
let dannoPose = 'stand';
const dannoEl = document.getElementById('danno');
function setPose(p){
  dannoPose = p;
  foyerEl.querySelectorAll('.danno-pose').forEach(el => { el.style.opacity = el.dataset.pose === p ? 1 : 0; });
}
// idle breathing is a CSS animation on the pose images (see .danno.idle in styles.css) rather
// than endless GSAP tweens: it's cheaper, and infinite tweens on the global timeline crash
// Chrome when anything retimes that timeline
function startIdle(){
  dannoEl.classList.add('idle');
}
function stopIdle(){
  dannoEl.classList.remove('idle');
  gsap.set('#danno', { scaleX: 1, scaleY: 1, rotate: 0 });
}
function dannoHop(height = 70, landPose = 'stand'){
  return gsap.timeline()
    .add(stopIdle)
    .to('#danno', { scaleY: .84, scaleX: 1.1, duration: .12, ease: 'power2.in' })
    .to('#danno', { y: -height, scaleY: 1.1, scaleX: .93, duration: .28, ease: 'power2.out' })
    .add(() => setPose(landPose), '-=.14')
    .to('#dannoShadow', { scale: .6, opacity: .5, duration: .28, ease: 'power2.out' }, '<-.14')
    .to('#danno', { y: 0, scaleY: 1, scaleX: 1, duration: .26, ease: 'power2.in' })
    .to('#dannoShadow', { scale: 1, opacity: 1, duration: .26, ease: 'power2.in' }, '<')
    .to('#danno', { scaleY: .88, scaleX: 1.08, duration: .08, ease: 'power1.out' })
    .to('#danno', { scaleY: 1, scaleX: 1, duration: .55, ease: 'elastic.out(1, .4)' })
    .add(startIdle);
}
function dannoPeek(){
  return gsap.timeline()
    .add(stopIdle)
    .to('#danno', { scaleY: .92, scaleX: 1.05, duration: .1, ease: 'power2.in' })
    .add(() => setPose('peek'))
    .to('#danno', { scaleY: 1, scaleX: 1, duration: .45, ease: 'elastic.out(1, .45)' })
    .add(startIdle);
}
function dannoSulk(){
  return gsap.timeline()
    .add(stopIdle)
    .to('#danno', { scaleY: .8, scaleX: 1.1, duration: .16, ease: 'power2.in' })
    .add(() => setPose('knees'))
    .to('#danno', { scaleY: 1, scaleX: 1, duration: .5, ease: 'elastic.out(1, .5)' })
    .to('#danno', { rotate: -3, duration: .7, ease: 'sine.inOut', yoyo: true, repeat: 1 })
    .add(dannoHop(50));
}

/* ---------- entrances ---------- */
// The app opens on Danno asleep and nothing else (the page starts with .is-asleep, so the
// first paint is already right). Tapping him *is* logging in: he wakes, the word 단어장
// forms above him, and the wipe carries you straight into your log. The foyer's other
// content (greeting, quick rep, buttons) only shows when you come back via the topbar logo.
//
// Beats (seconds after the tap):
//   0.00  poke: he squashes and rebounds
//   0.30  단 · 어 · 장 rise out of a blur, 0.14s apart           (each 0.6s, done ≈1.2)
//   0.75  he wakes and hops to his feet                           (lands ≈1.45)
//   1.85  wipe out of Danno into the log                          (≈0.9s)
let waking = false;
// true when danno was put back to sleep because you came back to the app (not a fresh load):
// waking him then returns you to whatever you were doing instead of jumping to the log
let resumedFromAway = false;
const SYL_TILT = [-7, 4, -5];
function wakeUp(){
  if(waking) return;
  waking = true;
  stopIdle();
  const syls = foyerEl.querySelectorAll('.foyer-syl');
  gsap.set(syls, { y: 28, opacity: 0, scale: .9, rotate: (i) => SYL_TILT[i], filter: 'blur(10px)' });
  // swap asleep for waking: the logo (which already held its space) becomes visible, the
  // rest of the foyer stays out of the layout
  foyerEl.classList.replace('is-asleep', 'is-waking');

  gsap.timeline()
    // poke
    .to('#danno', { scaleY: .9, scaleX: 1.06, duration: .08, ease: 'power2.in' }, 0)
    .to('#danno', { scaleY: 1, scaleX: 1, duration: .4, ease: 'elastic.out(1, .45)' }, .08)
    // the word forms: each syllable rises, sharpens and straightens
    .to(syls, { y: 0, opacity: 1, scale: 1, rotate: 0, filter: 'blur(0px)', duration: .6, ease: 'back.out(1.7)', stagger: .14 }, .3)
    .to('#foyerSpot', { opacity: 1, scale: 1.1, duration: .9, ease: 'power2.out' }, .3)
    // he wakes up and hops to his feet
    .add(dannoHop(70), .75)
    // a beat to see him standing under his word, then straight in
    .add(() => {
      waking = false;
      const resumed = resumedFromAway;
      resumedFromAway = false;
      closeFoyer(dannoWrap, () => { if(!resumed) switchTab('log'); });
    }, 1.85);
}
// coming back via the topbar logo: he's already awake, so just a quick entrance
function shortEntrance(){
  foyerEl.classList.remove('is-asleep', 'is-waking');
  setPose('stand');
  gsap.set('.foyer-syl', { y: 0, opacity: 1, scale: 1, rotate: 0, filter: 'none' });
  gsap.timeline()
    .fromTo('#foyerLogo', { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: .4, ease: 'power3.out' })
    .fromTo('#dannoWrap', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .45, ease: 'back.out(1.6)' }, '<.05')
    .add(revealContent(), '<.15')
    .add(startIdle);
}
function revealContent(){
  const parts = [foyerEl.querySelector('#foyerGreet'), recallBtn, ...foyerEl.querySelectorAll('.foyer-btn'), foyerStats];
  gsap.set(parts, { opacity: 0, y: 16 });
  return gsap.timeline()
    .to('#foyerSpot', { opacity: 1, scale: 1.1, duration: .8, ease: 'power2.out' })
    .to(parts, { opacity: 1, y: 0, duration: .55, ease: 'power3.out', stagger: .07 }, '<.1');
}

/* ---------- open / close ---------- */
function openFoyer(){
  renderFoyer();
  foyerEl.hidden = false;
  document.documentElement.classList.add('foyer-open');
  if(!motionOk){ foyerEl.classList.remove('is-asleep'); setPose('stand'); return; }
  gsap.set(foyerEl, { opacity: 1 });
  gsap.set('.foyer-inner', { opacity: 1, y: 0 });
  gsap.set('#foyerSpot', { opacity: 0, scale: .8 });
  if(foyerEl.classList.contains('is-asleep')){
    setPose('knees');
    startIdle();
  }else{
    shortEntrance();
  }
}
// Leaving is a wipe: a gold band with a paper band right behind it sweeps left to right
// across the screen and off the other side. The app is swapped in at the moment the paper
// band covers everything, so the old screen goes out on the band's leading edge and the new
// one comes in on its trailing edge. Order flips on the way out (paper leads, gold trails)
// so both edges show the two-tone stripe.
const wipeGold  = document.getElementById('wipeGold');
const wipePaper = document.getElementById('wipePaper');
let leaving = false;

function closeFoyer(origin, go, onLand){
  if(leaving) return;
  const finish = () => {
    foyerEl.hidden = true;
    document.documentElement.classList.remove('foyer-open');
    if(motionOk) stopIdle();
    go();
    scrollTo(0, 0);
  };
  if(!motionOk){ finish(); onLand && onLand(); return; }

  leaving = true;
  // band = the screen plus a shallow elliptical cap at each end (curved top to bottom, but only
  // `cap` px deep, so the band stays barely wider than the screen and the fully-covered moment
  // is a blink). it only ever moves sideways (transform-only)
  const vw = innerWidth, vh = innerHeight, cap = Math.min(140, vw * .35);
  const W = vw + cap * 2 + 24;
  const start = -W, middle = (vw - W) / 2, end = vw;
  gsap.set([wipeGold, wipePaper], { width: W, height: vh, borderRadius: `${cap}px / ${vh / 2}px`, x: start });
  wipeGold.hidden = wipePaper.hidden = false;

  // in: accelerate to the middle. out: leave at the same speed and ease off. one motion
  const IN = .42, OUT = .5, LAG = .07;
  gsap.timeline({ onComplete: () => {
      wipeGold.hidden = wipePaper.hidden = true;
      leaving = false;
      onLand && onLand();
    } })
    .to(origin, { scale: .96, duration: .1, yoyo: true, repeat: 1, ease: 'power1.inOut' }, 0)
    .to(wipeGold,  { x: middle, duration: IN, ease: 'power2.in' }, 0)
    .to(wipePaper, { x: middle, duration: IN, ease: 'power2.in' }, LAG)
    .add(() => {
      finish();
      gsap.from(document.querySelectorAll('.app > :not([hidden])'),
        { x: -24, opacity: 0, duration: .55, stagger: .04, ease: 'power3.out', delay: .06, clearProps: 'transform,opacity' });
    }, LAG + IN)
    .to(wipePaper, { x: end, duration: OUT, ease: 'power2.out' }, LAG + IN)
    .to(wipeGold,  { x: end, duration: OUT, ease: 'power2.out' }, LAG * 2 + IN);
}
// after "log your first word": put the cursor in the box and give it a gold pulse
function landOnInput(){
  phraseInput.focus();
  if(!motionOk) return;
  gsap.fromTo('.add-panel',
    { boxShadow: '0 0 0 0 rgba(242,184,75,.75)' },
    { boxShadow: '0 0 0 16px rgba(242,184,75,0)', duration: .9, ease: 'power2.out', clearProps: 'boxShadow' });
}
brandHome.addEventListener('click', openFoyer);

// tap danno: asleep, it wakes him and opens the app; awake, he hops or peeks
dannoWrap.addEventListener('click', () => {
  if(!motionOk || leaving || waking) return;
  if(foyerEl.classList.contains('is-asleep')) return wakeUp();
  (Math.random() < .5 ? dannoHop : dannoPeek)();
});
dannoWrap.addEventListener('keydown', (e) => {
  if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); dannoWrap.click(); }
});

/* ---------- every visit starts with danno ---------- */
// phones usually resume the app from the background instead of reloading it, so a fresh
// load alone would skip him. coming back after more than AWAY_MS puts him back to sleep;
// a quick switch to another app and back (copying a word, say) doesn't interrupt you
const AWAY_MS = 60 * 1000;
let hiddenAt = null;
function putDannoToSleep(){
  gsap.killTweensOf(['#danno', '#dannoWrap', '#dannoShadow', '#foyerSpot', '.foyer-syl', '.foyer-inner', '.foyer-inner > *']);
  gsap.set('#danno', { x: 0, y: 0, scaleX: 1, scaleY: 1, rotate: 0 });
  gsap.set('#dannoWrap', { opacity: 1, y: 0 });
  gsap.set('#dannoShadow', { scale: 1, opacity: 1 });
  foyerEl.classList.remove('is-waking');
  foyerEl.classList.add('is-asleep');
  waking = false;
  resumedFromAway = true;
  if(!settingsOverlay.hidden) closeSettings();
  openFoyer();
}
document.addEventListener('visibilitychange', () => {
  if(document.hidden){ hiddenAt = Date.now(); return; }
  const away = hiddenAt && Date.now() - hiddenAt >= AWAY_MS;
  hiddenAt = null;
  if(away && motionOk && foyerEl.hidden && !leaving) putDannoToSleep();
});

openFoyer();
