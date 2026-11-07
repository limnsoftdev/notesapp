/* ===================== feedback: every click does something ===================== */
// The rule for the whole app: when you click something, something happens right away.
// Every button squishes under your finger, and screens add their own moments on top.
// Uses Web Animations so it still works if the GSAP CDN fails, and setTimeout for sequencing so a
// backgrounded tab can't strand anything. Script animations ignore the global reduced-motion CSS
// rule, so everything checks motionAllowed() itself. Loaded last.

const FX_EASE = 'cubic-bezier(.22,1,.36,1)';
const FX_SPRING = 'cubic-bezier(.34,1.56,.64,1)';
const PRESSABLE = 'button, a[href], summary, [role="button"]';
// these already have a physical press in CSS (a wall that compresses), or their own animation
const OWN_PRESS = '.path-node, .study-btn.gold, .study-btn.solid, .danno-wrap, .voice-mic, .voice-side';
const SHAKE_WHEN_DISABLED = '.lesson-next, .study-btn, .stage-btn, .summary-again';
const LARGE_PRESS_PX = 180; // big things only give a little

/* ---------- the press, for everything ---------- */
let pressed = null;
function releasePress(){
  if(!pressed) return;
  const { el, anim, scale } = pressed;
  pressed = null;
  anim.cancel();
  if(el.isConnected){
    el.animate(
      [{ transform: `scale(${scale})` }, { transform: 'scale(1.025)', offset: .55 }, { transform: 'scale(1)' }],
      { duration: 240, easing: 'ease-out' }
    );
  }
}
function disabledButtonAt(x, y, within){
  return [...within.querySelectorAll('button:disabled')].find(btn => {
    if(!btn.matches(SHAKE_WHEN_DISABLED)) return false;
    const rect = btn.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  });
}
document.addEventListener('pointerdown', (e) => {
  if(e.button !== 0 || !motionAllowed()) return;
  const el = e.target.closest(PRESSABLE);
  if(!el){
    // disabled buttons ignore the pointer, so find them by position: "not yet" is still an answer
    const locked = disabledButtonAt(e.clientX, e.clientY, document);
    if(locked) shakeEl(locked);
    return;
  }
  releasePress();
  if(el.matches(OWN_PRESS)) return;
  const scale = el.offsetWidth > LARGE_PRESS_PX ? .98 : .93;
  pressed = { el, scale, anim: el.animate([{ transform: 'scale(1)' }, { transform: `scale(${scale})` }], { duration: 90, easing: 'ease-out', fill: 'forwards' }) };
}, { passive: true });
['pointerup', 'pointercancel', 'blur'].forEach(type => window.addEventListener(type, releasePress, { passive: true }));

// details open instantly by default, so their content arrives instead of just appearing
let openedByClick = null;
document.addEventListener('click', (e) => {
  const summary = e.target.closest('summary');
  if(summary) openedByClick = summary.parentElement;
}, true);
document.addEventListener('toggle', (e) => {
  if(e.target !== openedByClick) return;
  openedByClick = null;
  if(!e.target.open || !motionAllowed()) return;
  [...e.target.children].filter(child => child.tagName !== 'SUMMARY').forEach((child, index) => {
    child.animate([{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 240, delay: index * 30, easing: FX_EASE, fill: 'backwards' });
  });
}, true);

/* ---------- small helpers the screens share ---------- */
// dir: 1 arrives from the right, -1 from the left, 0 just drops in
function slideIn(el, dir = 1){
  if(!el || !motionAllowed()) return;
  el.animate([{ opacity: 0, transform: dir ? `translateX(${dir * 24}px)` : 'translateY(-8px)' }, { opacity: 1, transform: 'none' }], { duration: 240, easing: FX_EASE });
}
function staggerIn(list){
  if(!motionAllowed()) return;
  [...list].forEach((el, index) => {
    el.animate([{ opacity: 0, transform: 'translateX(-10px)' }, { opacity: 1, transform: 'none' }], { duration: 240, delay: index * 45, easing: FX_EASE, fill: 'backwards' });
  });
}

/* ---------- moving between study screens ---------- */
// forward slides in from the right, back from the left, and a tab only moves what's below the tabs
function screenFx(kind, detail){
  const screen = studyView.querySelector('.study-screen');
  if(!screen) return;
  screen.classList.add('still');
  if(!motionAllowed()) return;
  if(kind === 'tab'){
    const body = screen.querySelector('.tab-body');
    const thumb = screen.querySelector('.tab-thumb');
    const { from, to } = detail;
    if(thumb) thumb.animate([{ transform: `translateX(calc(${from} * (100% + var(--tab-gap))))` }, { transform: `translateX(calc(${to} * (100% + var(--tab-gap))))` }], { duration: 300, easing: FX_SPRING });
    if(body) body.animate([{ opacity: 0, transform: `translateX(${to >= from ? 28 : -28}px)` }, { opacity: 1, transform: 'none' }], { duration: 260, easing: FX_EASE });
    return;
  }
  const dir = kind === 'back' ? -1 : 1;
  screen.animate([{ opacity: 0, transform: `translateX(${dir * 44}px)` }, { opacity: 1, transform: 'none' }], { duration: 300, easing: FX_EASE });
  [...screen.querySelectorAll('.unit-row, .course-card')].slice(0, 9).forEach((row, index) => {
    row.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 280, delay: 50 + index * 28, easing: FX_EASE, fill: 'backwards' });
  });
}

/* ---------- cards ---------- */
function flipInCard(){
  if(!motionAllowed()) return;
  const card = studyView.querySelector('.cardrun-card');
  if(!card) return;
  card.animate([{ transform: 'perspective(900px) rotateY(-68deg)', opacity: .5 }, { transform: 'perspective(900px) rotateY(6deg)', opacity: 1, offset: .7 }, { transform: 'perspective(900px) rotateY(0)' }], { duration: 400, easing: 'ease-out' });
  [...card.querySelectorAll('.cardrun-answer > *')].forEach((part, index) => {
    part.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 280, delay: 180 + index * 55, easing: FX_EASE, fill: 'backwards' });
  });
  [...studyView.querySelectorAll('.quiz-nav .study-btn')].forEach((btn, index) => {
    btn.animate([{ opacity: 0, transform: 'scale(.85)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 300, delay: 300 + index * 70, easing: FX_SPRING, fill: 'backwards' });
  });
}
// hand the card's look to a copy that flies off (right = got it, left = not quite), like training
function flyOffCard(good){
  if(!motionAllowed()) return;
  const card = studyView.querySelector('.cardrun-card');
  if(!card) return;
  const rect = card.getBoundingClientRect();
  const copy = card.cloneNode(true);
  copy.classList.add('card-flying');
  copy.setAttribute('aria-hidden', 'true');
  Object.assign(copy.style, { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px` });
  document.body.appendChild(copy);
  const dir = good ? 1 : -1;
  copy.animate(
    [{ transform: 'none', opacity: 1 }, { transform: `translateX(${dir * innerWidth}px) rotate(${dir * 14}deg)`, opacity: .4 }],
    { duration: 340, easing: 'cubic-bezier(.5,0,.8,.5)', fill: 'forwards' }
  );
  setTimeout(() => copy.remove(), 380);
}
function riseNextCard(){
  if(!motionAllowed()) return;
  const card = studyView.querySelector('.cardrun-card');
  if(card) card.animate([{ transform: 'scale(.94) translateY(14px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 320, easing: FX_SPRING });
}

/* ---------- grading ---------- */
function countUp(el, to, suffix, from = 0){
  if(!el) return;
  if(!motionAllowed() || from === to){ el.textContent = `${to}${suffix}`; return; }
  const started = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - started) / 450);
    el.textContent = `${Math.round(from + (to - from) * (1 - Math.pow(1 - t, 3)))}${suffix}`;
    if(t < 1 && el.isConnected) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
function gradeRevealFx(earned, total){
  const score = studyView.querySelector('.results-score');
  countUp(score, earned, `/${total}`);
  if(!motionAllowed()) return;
  popEl(score, 1.12);
  [...studyView.querySelectorAll('.grade-row')].forEach((row, index) => {
    const delay = 80 + index * 70;
    row.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 320, delay, easing: FX_EASE, fill: 'backwards' });
    const earnedBtn = row.querySelector('.grade-toggle .on.yes');
    if(earnedBtn) earnedBtn.animate([{ transform: 'scale(.8)' }, { transform: 'scale(1.08)', offset: .6 }, { transform: 'scale(1)' }], { duration: 340, delay: delay + 160, easing: 'ease-out', fill: 'backwards' });
  });
}
function gradeMarkFx(id, value, from, to){
  const score = studyView.querySelector('.results-score');
  countUp(score, to, score.textContent.slice(score.textContent.indexOf('/')), from);
  const btn = studyView.querySelector(`[data-act="ap-mark"][data-row="${id}"][data-value="${value}"]`);
  popEl(btn, 1.08);
  if(value === '1') burstAt(btn, 700);
  if(from !== to) popEl(score, 1.14);
}

/* ---------- the logo: 단어장 becomes daneo ---------- */
// 단어장 is dan-eo-jang, so the change says what it means: 장 falls off the end, and 단 and 어
// flip over into "dan" and "eo". Coming back, they flip again and 장 drops into place.
const LOGO = { width: 371, height: 142, cuts: [0, 123, 241, 371] }; // cuts sit in the gaps between syllables
const LOGO_MS = 760;
const brandMark = document.getElementById('brandMark');
let logoRun = 0;
function logoSlices(){
  const shown = brandMark.querySelector('.brand-logo');
  const scale = (shown.offsetHeight || 30) / LOGO.height;
  return [0, 1, 2].map(index => {
    const slice = document.createElement('div');
    const from = LOGO.cuts[index] * scale;
    slice.className = 'brand-slice';
    Object.assign(slice.style, {
      left: `${from}px`, width: `${(LOGO.cuts[index + 1] - LOGO.cuts[index]) * scale}px`,
      backgroundSize: `${LOGO.width * scale}px ${LOGO.height * scale}px`, backgroundPosition: `${-from}px 0`
    });
    return slice;
  });
}
function logoWords(){
  const word = brandMark.querySelector('.brand-daneo');
  return [...word.children].map(part => {
    const copy = part.cloneNode(true);
    copy.classList.add('brand-part');
    copy.style.left = `${part.offsetLeft}px`;
    return copy;
  });
}
// edge-on, a flipped piece is a thin line, so it's invisible until it's actually turning
const flipOut = (el, delay) => el.animate([{ transform: 'rotateX(0)', opacity: 1 }, { transform: 'rotateX(80deg)', opacity: 1, offset: .95 }, { transform: 'rotateX(88deg)', opacity: 0 }], { duration: 170, delay, easing: 'ease-in', fill: 'both' });
const flipIn = (el, delay) => el.animate([{ transform: 'rotateX(-88deg)', opacity: 0 }, { transform: 'rotateX(-78deg)', opacity: 1, offset: .05 }, { transform: 'rotateX(14deg)', opacity: 1, offset: .65 }, { transform: 'rotateX(0)', opacity: 1 }], { duration: 340, delay, easing: 'ease-out', fill: 'both' });
function morphLogo(world){
  const run = ++logoRun;
  const old = brandMark.querySelector('.brand-fx');
  if(old) old.remove();
  const layer = document.createElement('div');
  layer.className = 'brand-fx';
  layer.setAttribute('aria-hidden', 'true');
  const [dan, eo, jang] = logoSlices();
  const words = logoWords();
  layer.append(dan, eo, jang, ...words);
  brandMark.appendChild(layer);
  brandMark.classList.add('morphing');
  if(world === 'study'){
    jang.animate(
      [{ transform: 'none', opacity: 1 }, { transform: 'translateY(-4px) rotate(-10deg)', opacity: 1, offset: .22 }, { transform: 'translate(12px, 60px) rotate(48deg)', opacity: 0 }],
      { duration: 480, easing: 'cubic-bezier(.5,0,.9,.6)', fill: 'both' }
    );
    flipOut(dan, 130);
    flipOut(eo, 175);
    words.forEach((word, index) => flipIn(word, 300 + index * 45));
  }else{
    words.forEach((word, index) => flipOut(word, index * 45));
    flipIn(dan, 170);
    flipIn(eo, 215);
    jang.animate(
      [{ transform: 'translateY(-48px) rotate(-22deg)', opacity: 0 }, { transform: 'translateY(0) rotate(0) scale(1.1,.86)', opacity: 1, offset: .7 }, { transform: 'translateY(-4px) scale(.97,1.04)', offset: .85 }, { transform: 'none', opacity: 1 }],
      { duration: 430, delay: 300, easing: 'ease-in', fill: 'both' }
    );
  }
  setTimeout(() => {
    if(run !== logoRun) return;
    layer.remove();
    brandMark.classList.remove('morphing');
    brandMark.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.09)', offset: .4 }, { transform: 'scale(1)' }], { duration: 280, easing: 'ease-out' });
  }, LOGO_MS);
}

/* ---------- changing worlds ---------- */
// the new world's color spreads out from the button you pressed, and the screens swap once it
// covers them. The topbar stays above the color so the logo can change in front of it.
const SWEEP_MS = 300;
let sweepEl = null;
function groundOf(world){
  // read it from the stylesheet, since it depends on the theme too
  const root = document.documentElement;
  const had = root.classList.contains('world-study');
  root.classList.toggle('world-study', world === 'study');
  const color = getComputedStyle(root).getPropertyValue('--ground').trim();
  root.classList.toggle('world-study', had);
  return color;
}
function changeWorld(world, origin){
  const go = () => (world === 'study' ? enterStudy() : switchTab('log'));
  const current = study.world === 'study' ? 'study' : 'words';
  if(!motionAllowed()){ go(); return; }
  if(world === current){
    go();
    brandMark.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-5deg)', offset: .3 }, { transform: 'rotate(4deg)', offset: .65 }, { transform: 'rotate(0)' }], { duration: 320, easing: 'ease-in-out' });
    return;
  }
  syncSwitch(world);
  morphLogo(world);
  if(sweepEl) sweepEl.remove();
  const rect = origin.getBoundingClientRect();
  const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
  const radius = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy));
  const sweep = sweepEl = document.createElement('div');
  sweep.className = 'world-sweep';
  sweep.setAttribute('aria-hidden', 'true');
  Object.assign(sweep.style, { left: `${cx - radius}px`, top: `${cy - radius}px`, width: `${radius * 2}px`, height: `${radius * 2}px`, background: groundOf(world) });
  document.body.appendChild(sweep);
  document.body.classList.add('sweeping');
  sweep.animate([{ transform: 'scale(0)' }, { transform: 'scale(1)' }], { duration: SWEEP_MS, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
  setTimeout(() => {
    if(sweep !== sweepEl) return;
    go();
    sweep.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: 'ease-out', fill: 'forwards' });
    setTimeout(() => {
      sweep.remove();
      if(sweep === sweepEl){ sweepEl = null; document.body.classList.remove('sweeping'); }
    }, 240);
  }, SWEEP_MS);
}
