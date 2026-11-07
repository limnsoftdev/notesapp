/* ===================== study: test-prep courses ===================== */
// Courses are plain data (courses/*.js, pushed onto window.STUDY_COURSES), so adding one needs
// no code. Loaded after app.js and uses its globals (escapeHtml, showToast, appEl, switchTab,
// BOX_INTERVALS, MAX_BOX). All course text goes through escapeHtml.
// Study is its own world, separate from the word log: its own colors (html.world-study), its
// own screens and its own streak. It never touches the word log's daily goal or streak.
// Unlike word training, answers grade themselves, because each question has one right option.
// Missed questions come back through the same Leitner intervals as words.

const STUDY_KEY = 'koWordLog.study.v1';
const PRACTICE_SIZE = 10;
const SPRINT_SIZE = 25;
const CLOCK_WARNING_SECS = 300;

// the correct option is always authored first, so "right" means option index 0
const CORRECT_OPTION = 0;

const COURSES = (window.STUDY_COURSES || []).map(course => ({
  ...course,
  lessons: (window.STUDY_LESSONS || {})[course.id] || [],
  items: course.questions.map(([id, obj, text, options, why, source]) => ({
    key: `${course.id}:${id}`, unitId: id.split('-')[0], obj, text, options, why, source
  }))
}));
const ITEM_BY_KEY = new Map();
COURSES.forEach(course => course.items.forEach(item => ITEM_BY_KEY.set(item.key, item)));

function loadStudy(){
  const empty = { progress: {}, mocks: {}, active: null, reported: [], lessons: {}, responses: {}, drafts: {}, unitFocus: {}, streak: { count: 0, lastDate: null }, world: 'words' };
  try{
    return { ...empty, ...JSON.parse(localStorage.getItem(STUDY_KEY)) };
  }catch(e){
    return empty;
  }
}
let study = loadStudy();
function saveStudy(){ localStorage.setItem(STUDY_KEY, JSON.stringify(study)); }

/* ---------- backup (called from app.js) ---------- */
function studyHasData(){ return Object.keys(study.lessons).length > 0 || Object.keys(study.progress).length > 0 || Object.keys(study.mocks).length > 0 || Object.keys(study.responses).length > 0; }
function studyBackupData(){
  const { progress, mocks, reported, lessons, responses, streak } = study; // an attempt in progress isn't worth restoring
  return { progress, mocks, reported, lessons, responses, streak };
}
// keeps whichever answer is newest per question, and every mock from both sides
function mergeStudyBackup(incoming){
  if(!incoming || typeof incoming !== 'object') return;
  Object.entries(incoming.progress || {}).forEach(([key, p]) => {
    const mine = study.progress[key];
    if(!mine || (p.at || 0) > (mine.at || 0)) study.progress[key] = p;
  });
  Object.entries(incoming.mocks || {}).forEach(([courseId, list]) => {
    const mine = study.mocks[courseId] || [];
    const seen = new Set(mine.map(m => m.at));
    study.mocks[courseId] = mine.concat(list.filter(m => !seen.has(m.at))).sort((a, b) => a.at - b.at);
  });
  study.reported = [...new Set([...study.reported, ...(incoming.reported || [])])];
  study.lessons = { ...(incoming.lessons || {}), ...study.lessons };
  Object.entries(incoming.responses || {}).forEach(([id, list]) => {
    const mine = study.responses[id] || [];
    const seen = new Set(mine.map(attempt => attempt.at));
    study.responses[id] = mine.concat(list.filter(attempt => !seen.has(attempt.at))).sort((a, b) => a.at - b.at);
  });
  if(incoming.streak && (incoming.streak.lastDate || '') > (study.streak.lastDate || '')) study.streak = incoming.streak;
  saveStudy();
  if(!studyView.hidden) renderStudy();
}

/* ---------- progress ---------- */
function recordAnswer(key, isRight){
  const now = Date.now();
  const p = study.progress[key] || { box: 0, dueAt: now, right: 0, wrong: 0, last: null, at: 0 };
  p.box = isRight ? Math.min(p.box + 1, MAX_BOX) : 0;
  p.dueAt = now + (isRight ? BOX_INTERVALS[p.box] : 0);
  p[isRight ? 'right' : 'wrong']++;
  p.last = isRight ? 'r' : 'w';
  p.at = now;
  study.progress[key] = p;
}
// the streak belongs to study alone; the word log keeps its own
function markStudied(){
  const today = todayStr();
  if(study.streak.lastDate !== today){
    study.streak = { count: study.streak.lastDate === yesterdayStr() ? study.streak.count + 1 : 1, lastDate: today };
  }
}
function unitStats(course, unitId){
  const items = course.items.filter(i => i.unitId === unitId);
  const right = items.filter(i => (study.progress[i.key] || {}).last === 'r').length;
  return { total: items.length, right, pct: items.length ? right / items.length : 0 };
}
// the share of the bank you got right last time, counted the way the test weights each unit
function readiness(course, unitId){
  // a course can list units that aren't built yet, and those can't count against you
  const units = course.units.filter(u => (unitId ? u.id === unitId : unitStats(course, u.id).total > 0));
  const totalWeight = units.reduce((sum, u) => sum + u.weight, 0);
  return totalWeight ? units.reduce((sum, u) => sum + u.weight * unitStats(course, u.id).pct, 0) / totalWeight : 0;
}
function reviewQueue(course, unitId){
  const now = Date.now();
  return course.items
    .filter(i => (!unitId || i.unitId === unitId) && study.progress[i.key] && study.progress[i.key].dueAt <= now)
    .sort((a, b) => study.progress[a.key].box - study.progress[b.key].box);
}
function weakestUnit(course){
  return course.units
    .map(u => ({ unit: u, pct: unitStats(course, u.id).pct }))
    .sort((a, b) => a.pct - b.pct || b.unit.weight - a.unit.weight)[0].unit;
}

/* ---------- choosing questions ---------- */
function shuffled(list){
  const copy = [...list];
  for(let i = copy.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
// options are reshuffled every time, so you learn the answer and not its position
const quizItem = (item) => ({ key: item.key, order: shuffled([0, 1, 2, 3]) });

// due first, then questions you haven't seen, then whatever comes back soonest
function pickPractice(course, unitId, obj){
  const pool = course.items.filter(i => (!unitId || i.unitId === unitId) && (!obj || i.obj === obj));
  const now = Date.now();
  const state = i => study.progress[i.key];
  const due = pool.filter(i => state(i) && state(i).dueAt <= now).sort((a, b) => state(a).box - state(b).box);
  const fresh = shuffled(pool.filter(i => !state(i)));
  const later = pool.filter(i => state(i) && state(i).dueAt > now).sort((a, b) => state(a).dueAt - state(b).dueAt);
  return due.concat(fresh, later).slice(0, PRACTICE_SIZE);
}
// splits a mock across units by the real test's weights (largest remainder, so it sums exactly),
// using the questions you've seen least recently within each unit
function pickExam(course, size){
  const totalWeight = course.units.reduce((sum, u) => sum + u.weight, 0);
  const shares = course.units.map(u => {
    const exact = size * u.weight / totalWeight;
    return { unit: u, count: Math.floor(exact), remainder: exact - Math.floor(exact) };
  });
  let left = size - shares.reduce((sum, s) => sum + s.count, 0);
  [...shares].sort((a, b) => b.remainder - a.remainder).forEach(s => { if(left > 0){ s.count++; left--; } });
  const lastSeen = i => (study.progress[i.key] || {}).at || 0;
  return shuffled(shares.flatMap(s =>
    shuffled(course.items.filter(i => i.unitId === s.unit.id))
      .sort((a, b) => lastSeen(a) - lastSeen(b))
      .slice(0, s.count)
  ));
}
// a unit test keeps questions on the same source together, like the sets on the real exam,
// and starts with whatever you've seen least recently
function pickUnitTest(course, unitId, size){
  const lastSeen = i => (study.progress[i.key] || {}).at || 0;
  const groups = new Map();
  shuffled(course.items.filter(i => i.unitId === unitId)).forEach(item => {
    const key = item.source || item.key;
    if(!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  });
  const staleness = group => Math.max(...group.map(lastSeen));
  const chosen = [];
  let count = 0;
  [...groups.values()].sort((a, b) => staleness(a) - staleness(b)).forEach(group => {
    if(count + group.length > size) return;
    chosen.push(group);
    count += group.length;
  });
  // whatever didn't fit can still top the test up to its exact length, one question at a time
  const used = new Set(chosen.flat());
  course.items.filter(i => i.unitId === unitId && !used.has(i)).sort((a, b) => lastSeen(a) - lastSeen(b)).forEach(item => {
    if(count >= size) return;
    chosen.push([item]);
    count++;
  });
  return shuffled(chosen).flat();
}

/* ---------- view state ---------- */
const studyView = document.getElementById('studyView');
let studyScreen = study.lastCourse && COURSES.some(c => c.id === study.lastCourse) ? { name: 'course', courseId: study.lastCourse } : { name: 'home' };  // home | course | results
let quiz = null;                // the practice run or exam on screen
let lesson = null;              // the lesson on screen
let result = null;              // what the results screen shows
let clockTimer = null;

const courseById = (id) => COURSES.find(c => c.id === id);
const pct = (n) => `${Math.round(n * 100)}%`;
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const secsPerQuestion = (course) => course.exam.minutes * 60 / course.exam.questions;
function clockText(secs){
  const s = Math.max(0, Math.ceil(secs));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
const ICON = {
  back: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  close: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  check: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M4 12.5l5.5 5.5L20 6.5" stroke="currentColor" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  cross: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round"/></svg>',
  dot: '<svg viewBox="0 0 24 24" width="10" height="10" aria-hidden="true"><circle cx="12" cy="12" r="6" fill="currentColor"/></svg>',
  flag: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M6 21V4h11l-2 4 2 4H6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};
const meter = (value) => `<div class="study-meter" aria-hidden="true"><i style="width:${pct(value)}"></i></div>`;

function renderStudy(){
  // an exam can run out while you're away, so it's graded the moment you come back
  if(study.active && study.active.endsAt <= Date.now()){
    if(quiz === study.active) quiz = null;
    finishExam(true);
  }
  appEl.classList.toggle('in-session', !!quiz || !!lesson || !!cardRun || !!writer || studyScreen.name === 'results');
  if(lesson){ stopClock(); renderLesson(); return; }
  if(quiz){ renderQuiz(); return; }
  if(cardRun){ stopClock(); streakBar.set(0); renderCardRun(); return; }
  if(writer){ stopClock(); streakBar.set(0); renderWriter(); return; }
  stopClock();
  streakBar.set(0);
  if(studyScreen.name === 'results') renderResults();
  else if(studyScreen.name === 'course') renderCourse(courseById(studyScreen.courseId));
  else renderHome();
}
function showScreen(next, fx){
  studyScreen = next;
  renderStudy();
  scrollTo(0, 0);
  if(fx) screenFx(fx);
}

/* ---------- home ---------- */
function statChips(){
  return `<div class="study-stats">
    <span class="study-stat"><b>${study.streak.lastDate === todayStr() || study.streak.lastDate === yesterdayStr() ? study.streak.count : 0}</b> day streak</span>
  </div>`;
}
const lessonsOf = (course) => course.lessons || [];
const lessonsDone = (course) => lessonsOf(course).filter(l => study.lessons[l.id] && study.lessons[l.id].done).length;

function renderHome(){
  studyView.innerHTML = `
    <div class="study-screen">
      <div class="study-hero">
        <div>
          <h2 class="study-title">what are we learning?</h2>
          ${statChips()}
        </div>
      </div>
      <div class="course-list">
        ${COURSES.map((course, courseIndex) => {
          const total = lessonsOf(course).length;
          const done = lessonsDone(course);
          return `<button class="course-card" type="button" data-act="open-course" data-course="${escapeHtml(course.id)}">
            ${courseIndex === 0 ? '<img class="card-danno" src="danno/knees.png" width="300" height="500" alt="">' : ''}
            <span class="course-org">${escapeHtml(course.org)}${study.active && study.active.courseId === course.id ? ' · test in progress' : ''}</span>
            <span class="course-name">${escapeHtml(course.title)}</span>
            <span class="course-blurb">${escapeHtml(course.blurb)}</span>
            ${meter(total ? done / total : 0)}
            <span class="course-foot"><span>${done} of ${total} lessons</span><span>${pct(readiness(course))} ready</span></span>
          </button>`;
        }).join('')}
      </div>
    </div>`;
}

/* ---------- course ---------- */
const PATH_ICON = {
  lesson: '<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><path d="M4 5.5C7 4 10 4 12 6c2-2 5-2 8-.5V19c-3-1.5-6-1.5-8 .5-2-2-5-2-8-.5zM12 6v13.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  practice: '<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="4.5" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></svg>',
  exam: '<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><path d="M6 21V4h12l-2.5 4 2.5 4H6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  done: '<svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true"><path d="M4.5 12.5l5 5L19.5 7" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};
const PRACTICE_CLEARED = .7; // a unit's practice stop counts as cleared at this share of its bank

// the path is built from data: each unit's lessons, then a practice stop, then the final mock
function pathStops(course, onlyUnit){
  const stops = [];
  (onlyUnit ? [onlyUnit] : course.units).forEach(unit => {
    if(!onlyUnit) stops.push({ kind: 'unit', unit }); // inside a unit, the page heading already says which
    lessonsOf(course).filter(l => l.unit === unit.id && !l.track).forEach(def => {
      stops.push({ kind: 'lesson', unit, def, title: def.title, done: !!(study.lessons[def.id] && study.lessons[def.id].done) });
    });
    const stats = unitStats(course, unit.id);
    stops.push({ kind: 'practice', unit, title: `Practice: ${stats.right}/${stats.total}`, done: stats.pct >= PRACTICE_CLEARED });
  });
  stops.push(onlyUnit
    ? { kind: 'exam', title: 'Unit test', done: (study.mocks[course.id] || []).some(m => m.unitId === onlyUnit.id) }
    : { kind: 'exam', title: 'Full mock test', done: (study.mocks[course.id] || []).length > 0 });
  return stops;
}
function renderPath(course, onlyUnit){
  const stops = pathStops(course, onlyUnit);
  // sweeps out to one side and back through the middle, then out to the other
  const SWAY = [50, 68, 80, 68, 50, 32, 20, 32];
  const STEP = 124, BANNER = 112, NODE_MID = 35;
  let y = onlyUnit ? 40 : 8, index = 0; // with no banner above, leave room for Danno under the tabs
  const placed = stops.map(stop => {
    if(stop.kind === 'unit'){ const at = y; y += BANNER; return { ...stop, y: at }; }
    const at = { ...stop, y, x: SWAY[index++ % SWAY.length] };
    y += STEP;
    return at;
  });
  const height = y;
  const nodes = placed.filter(s => s.kind !== 'unit');
  const current = nodes.find(s => !s.done);
  const currentIndex = current ? nodes.indexOf(current) : nodes.length - 1;
  const curveThrough = (list) => list.map((n, i) => {
    if(i === 0) return `M${n.x} ${n.y + NODE_MID}`;
    const prev = list[i - 1];
    const mid = (prev.y + n.y) / 2 + NODE_MID;
    return `C${prev.x} ${mid} ${n.x} ${mid} ${n.x} ${n.y + NODE_MID}`;
  }).join(' ');

  const html = placed.map(stop => {
    if(stop.kind === 'unit'){
      return `<div class="path-unit" style="top:${stop.y}px">
        <b>${escapeHtml(stop.unit.title)}</b>
        <span>${stop.unit.share ? `${escapeHtml(stop.unit.share)} of the exam` : `${plural(stop.unit.weight, 'question')} on the test`}</span>
      </div>`;
    }
    const isCurrent = stop === current;
    const attrs = stop.kind === 'lesson'
      ? `data-act="start-lesson" data-course="${escapeHtml(course.id)}" data-lesson="${escapeHtml(stop.def.id)}"`
      : stop.kind === 'practice'
        ? `data-act="practice-unit" data-course="${escapeHtml(course.id)}" data-unit="${escapeHtml(stop.unit.id)}"`
        : `data-act="set-tab" data-tab="test"`;
    const labelSide = stop.x > 50 ? 'left' : 'right';
    return `<div class="path-stop" style="left:${stop.x}%;top:${stop.y}px">
      ${isCurrent ? `<img class="path-danno${labelSide === 'left' ? ' flip' : ''}" src="danno/knees.png" width="300" height="500" alt="">` : ''}
      <button class="path-node ${stop.kind}${stop.done ? ' done' : ''}${isCurrent ? ' current' : ''}" type="button" ${attrs} aria-label="${escapeHtml(stop.title)}${stop.done ? ', done' : ''}${isCurrent ? ', up next' : ''}">
        ${stop.done ? PATH_ICON.done : PATH_ICON[stop.kind]}
      </button>
      <span class="path-label ${labelSide}">${isCurrent ? '<em>up next</em>' : ''}${escapeHtml(stop.title)}</span>
    </div>`;
  }).join('');

  return `<div class="path" style="height:${height}px">
    <svg class="path-line" viewBox="0 0 100 ${height}" preserveAspectRatio="none" aria-hidden="true">
      <path class="road" d="${curveThrough(nodes)}"/>
      ${currentIndex > 0 ? `<path class="road-done" d="${curveThrough(nodes.slice(0, currentIndex + 1))}"/>` : ''}
    </svg>
    ${html}
  </div>`;
}
function renderPracticeTab(course, onlyUnit){
  const due = reviewQueue(course, onlyUnit && onlyUnit.id).length;
  const locked = study.active && study.active.courseId === course.id;
  const reported = study.reported.filter(key => key.startsWith(course.id + ':'));
  return `
    <div class="study-actions">
      ${due ? `<button class="study-btn gold wide" type="button" data-act="practice-review" data-course="${escapeHtml(course.id)}"${locked ? ' disabled' : ''}>review ${plural(due, 'question')} due</button>` : ''}
      <button class="study-btn wide" type="button" data-act="practice-any" data-course="${escapeHtml(course.id)}"${locked ? ' disabled' : ''}><b>smart practice</b><span>what you need most, 10 questions</span></button>
    </div>
    <div class="study-card unit-list">
      ${onlyUnit ? onlyUnit.objectives.map((name, index) => {
        const items = course.items.filter(i => i.unitId === onlyUnit.id && i.obj === index + 1);
        const right = items.filter(i => (study.progress[i.key] || {}).last === 'r').length;
        return `<button class="unit-row" type="button" data-act="practice-topic" data-course="${escapeHtml(course.id)}" data-unit="${escapeHtml(onlyUnit.id)}" data-obj="${index + 1}"${locked ? ' disabled' : ''}>
          <span class="unit-top"><span class="unit-name">${escapeHtml(name)}</span><span class="unit-count">${right}/${items.length}</span></span>
          ${meter(items.length ? right / items.length : 0)}
        </button>`;
      }).join('') : course.units.map(unit => {
        const stats = unitStats(course, unit.id);
        return `<button class="unit-row" type="button" data-act="practice-unit" data-course="${escapeHtml(course.id)}" data-unit="${escapeHtml(unit.id)}"${locked ? ' disabled' : ''}>
          <span class="unit-top"><span class="unit-name">${escapeHtml(unit.title)}</span><span class="unit-count">${stats.right}/${stats.total}</span></span>
          ${meter(stats.pct)}
        </button>`;
      }).join('')}
    </div>
    ${reported.length ? `
      <details class="study-card reported">
        <summary>${plural(reported.length, 'question')} you marked to check</summary>
        <ul>${reported.map(key => `<li>${escapeHtml(ITEM_BY_KEY.get(key) ? ITEM_BY_KEY.get(key).text : key)}</li>`).join('')}</ul>
      </details>` : ''}`;
}
function renderTestTab(course){
  const mocks = study.mocks[course.id] || [];
  const active = study.active && study.active.courseId === course.id ? study.active : null;
  const value = readiness(course);
  const pace = Math.round(secsPerQuestion(course));
  return `
    <div class="study-card">
      <p class="course-fact">The real test: ${course.exam.questions} questions, ${course.exam.minutes} minutes, about ${pace} seconds each.</p>
      <p class="course-note">${escapeHtml(course.exam.note)}</p>
      <div class="ready-row"><span class="ready-value">${pct(value)}</span><span class="ready-label">of the question bank right on your last try, weighted like the test</span></div>
      ${meter(value)}
    </div>
    <div class="study-actions">
      ${active ? `
        <button class="study-btn gold wide" type="button" data-act="resume-exam">resume test · ${clockText((active.endsAt - Date.now()) / 1000)} left</button>
        <button class="study-link wide" type="button" data-act="discard-exam">discard this attempt</button>
      ` : `
        <button class="study-btn" type="button" data-act="start-exam" data-course="${escapeHtml(course.id)}" data-size="${course.exam.questions}"><b>full mock</b><span>${course.exam.questions} questions, ${course.exam.minutes} min</span></button>
        <button class="study-btn" type="button" data-act="start-exam" data-course="${escapeHtml(course.id)}" data-size="${SPRINT_SIZE}"><b>sprint</b><span>${SPRINT_SIZE} questions, same pace</span></button>
      `}
    </div>
    ${mocks.length ? `
      <div class="study-card score-chart" role="img" aria-label="your last ${Math.min(mocks.length, 8)} test scores">
        <p class="study-card-title">your scores</p>
        <div class="score-bars">${mocks.slice(-8).map(m => {
          const value = Math.round(m.score / m.total * 100);
          return `<div class="score-bar"><span>${value}</span><i style="height:${Math.max(value, 4)}%"></i></div>`;
        }).join('')}</div>
      </div>` : ''}
    <p class="study-disclaimer">${escapeHtml(course.disclaimer || 'Original practice questions written from FBLA’s published objectives. They are not real test questions, and your score here doesn’t predict your result.')}</p>`;
}
function renderCourse(course){
  const unit = focusedUnit(course);
  if(course.unitPicker && !unit){ renderUnitPicker(course); return; }
  const tab = studyScreen.tab || 'learn';
  const tabs = unit
    ? [['learn', 'learn'], ['cards', 'cards'], ['practice', 'practice'], ['write', 'write'], ['test', 'test']]
    : [['learn', 'learn'], ['practice', 'practice'], ['test', 'test']];
  const body = {
    learn: () => renderPath(course, unit),
    cards: () => renderCardsTab(course, unit),
    practice: () => renderPracticeTab(course, unit),
    write: () => renderWriteTab(course, unit),
    test: () => (unit ? renderUnitTestTab(course, unit) : renderTestTab(course))
  };
  studyView.innerHTML = `
    <div class="study-screen">
      <div class="course-top">
        <button class="study-back" type="button" data-act="${unit ? 'units' : 'home'}" data-course="${escapeHtml(course.id)}" aria-label="${unit ? 'all units' : 'all courses'}">${ICON.back}</button>
        <div class="course-top-text">
          <p class="course-org on-ground">${escapeHtml(unit ? course.title : course.org)}</p>
          <h2 class="course-heading on-ground">${escapeHtml(unit ? unit.title : course.title)}</h2>
        </div>
        ${statChips()}
      </div>
      <nav class="course-tabs${unit ? ' five' : ''}" aria-label="course sections">
        <i class="tab-thumb" aria-hidden="true" style="--n:${tabs.length};--i:${tabs.findIndex(([id]) => id === tab)}"></i>
        ${tabs.map(([id, label]) => `<button class="course-tab${id === tab ? ' active' : ''}" type="button" data-act="set-tab" data-tab="${id}"${id === tab ? ' aria-current="page"' : ''}>${label}</button>`).join('')}
      </nav>
      <div class="tab-body">${body[tab]()}</div>
    </div>`;
  if(tab === 'learn') afterPathRender();
}

/* ---------- starting a run ---------- */
function startPractice(course, items){
  if(!items.length){ showToast('nothing to practice here yet'); return; }
  quiz = {
    mode: 'practice', courseId: course.id, items: items.map(quizItem), i: 0, picked: null,
    firstTry: {}, requeued: {}
  };
  renderStudy();
  scrollTo(0, 0);
}
function startExam(course, size, unitId){
  const items = unitId ? pickUnitTest(course, unitId, size) : pickExam(course, size);
  if(!items.length){ showToast('nothing to practice here yet'); return; }
  const now = Date.now();
  study.active = {
    mode: 'exam', courseId: course.id, unitId: unitId || null, items: items.map(quizItem), i: 0,
    answers: {}, flags: {}, startedAt: now,
    endsAt: now + items.length * secsPerQuestion(course) * 1000
  };
  saveStudy();
  quiz = study.active;
  renderStudy();
  scrollTo(0, 0);
}

/* ---------- question screen ---------- */
function renderQuiz(){
  const course = courseById(quiz.courseId);
  const current = quiz.items[quiz.i];
  const item = ITEM_BY_KEY.get(current.key);
  const unit = course.units.find(u => u.id === item.unitId);
  const isExam = quiz.mode === 'exam';
  const chosen = isExam ? quiz.answers[current.key] : quiz.picked;
  const revealed = !isExam && chosen !== null;
  const answeredCount = isExam ? Object.keys(quiz.answers).length : quiz.i + (revealed ? 1 : 0);

  const options = current.order.map((optionIndex, position) => {
    let state = '';
    let mark = String.fromCharCode(65 + position);
    if(revealed){
      if(optionIndex === CORRECT_OPTION){ state = ' is-right'; mark = ICON.check; }
      else if(optionIndex === chosen){ state = ' is-wrong'; mark = ICON.cross; }
      else state = ' is-dim';
    }else if(optionIndex === chosen){
      state = ' is-selected';
    }
    return `<button class="quiz-option${state}" type="button" data-act="choose" data-option="${optionIndex}"${revealed ? ' disabled' : ''}${isExam ? ` aria-pressed="${optionIndex === chosen}"` : ''}>
      <span class="option-mark">${mark}</span><span class="option-text">${escapeHtml(item.options[optionIndex])}</span>
    </button>`;
  }).join('');

  const reportedHere = study.reported.includes(current.key);
  const lastQuestion = quiz.i === quiz.items.length - 1;
  const sheet = revealed ? resultSheet({
    good: chosen === CORRECT_OPTION,
    title: quiz.praise,
    chips: quiz.combo >= 2 ? [`${quiz.combo} in a row`] : [],
    why: escapeHtml(item.why),
    enter: quiz.justAnswered,
    extra: `<button class="report-btn" type="button" data-act="report" aria-pressed="${reportedHere}">${reportedHere ? 'marked to check' : 'answer looks wrong?'}</button>`,
    action: `<button class="study-btn ${chosen === CORRECT_OPTION ? 'gold' : 'solid'} wide" type="button" data-act="next">${lastQuestion ? 'see results' : 'next question'}</button>`
  }) : '';

  const footer = isExam
    ? `${quiz.confirming ? examConfirm() : `
        <div class="quiz-nav three">
          <button class="study-btn plain" type="button" data-act="prev"${quiz.i === 0 ? ' disabled' : ''}>back</button>
          <button class="study-btn plain flag-btn${quiz.flags[current.key] ? ' on' : ''}" type="button" data-act="flag" aria-pressed="${!!quiz.flags[current.key]}">${ICON.flag} flag</button>
          ${quiz.i === quiz.items.length - 1
            ? '<button class="study-btn gold" type="button" data-act="ask-submit">finish</button>'
            : '<button class="study-btn gold" type="button" data-act="next">next</button>'}
        </div>
        <div class="quiz-links">
          <button class="study-link" type="button" data-act="toggle-grid" aria-expanded="${!!quiz.showGrid}">${quiz.showGrid ? 'hide question list' : 'all questions'}</button>
          <button class="study-link" type="button" data-act="ask-submit">finish test</button>
        </div>
        ${quiz.showGrid ? examGrid() : ''}`}`
    : sheet;

  studyView.innerHTML = `
    <div class="quiz">
      <div class="quiz-head">
        <button class="icon-btn end-session" type="button" data-act="leave" aria-label="${isExam ? 'leave the test; the clock keeps running' : 'end practice'}">${ICON.close}</button>
        <div class="train-progress-bar" role="progressbar" aria-label="progress" aria-valuemin="0" aria-valuemax="${quiz.items.length}" aria-valuenow="${answeredCount}"><div class="train-progress-fill" style="width:${pct(answeredCount / quiz.items.length)}"></div></div>
        ${isExam ? '<span class="quiz-clock" id="examClock" role="timer"></span>' : `<span class="train-progress-text">${quiz.i + 1}/${quiz.items.length}</span>`}
      </div>
      ${isExam ? `<p class="quiz-pace"><span>question ${quiz.i + 1} of ${quiz.items.length}</span><span id="examPace"></span></p>` : ''}
      <div class="quiz-card${quiz.fresh !== false ? ` enter${quiz.movingBack ? ' back' : ''}` : ''}" tabindex="-1">
        <p class="quiz-tag">${course.unitPicker ? '' : `${escapeHtml(unit.title)} · `}${escapeHtml(unit.objectives[item.obj - 1])}</p>
        ${item.source ? renderSource(course, item.source) : ''}
        <h3 class="quiz-question">${escapeHtml(item.text)}</h3>
        <div class="quiz-options">${options}</div>
      </div>
      ${footer}
    </div>`;

  if(isExam){ startClock(); updateClock(); }
  else stopClock();
  focusAfterRender(revealed);
  quiz.fresh = false;
  streakBar.set(isExam ? 0 : quiz.combo || 0, quiz);
  if(quiz.justAnswered){
    quiz.justAnswered = false;
    playAnswerFx(chosen === CORRECT_OPTION, quiz.combo);
  }
}
function focusAfterRender(revealed){
  const target = revealed ? studyView.querySelector('[data-act="next"]') : studyView.querySelector('.quiz-card');
  if(target) target.focus({ preventScroll: true });
}
function examGrid(){
  return `<div class="quiz-grid" role="group" aria-label="jump to a question">${quiz.items.map((it, index) => {
    const states = [
      quiz.answers[it.key] !== undefined ? 'done' : '',
      quiz.flags[it.key] ? 'flagged' : '',
      index === quiz.i ? 'current' : ''
    ].filter(Boolean).join(' ');
    return `<button type="button" class="${states}" data-act="goto" data-index="${index}" aria-label="question ${index + 1}${quiz.answers[it.key] !== undefined ? ', answered' : ', not answered'}${quiz.flags[it.key] ? ', flagged' : ''}">${index + 1}</button>`;
  }).join('')}</div>`;
}
function examConfirm(){
  const blank = quiz.items.length - Object.keys(quiz.answers).length;
  const flagged = Object.keys(quiz.flags).filter(key => quiz.flags[key]).length;
  const details = [blank ? `${blank} unanswered` : '', flagged ? `${flagged} flagged` : ''].filter(Boolean).join(', ');
  return `<div class="quiz-confirm" role="alertdialog" aria-label="finish the test?">
    <p>${details ? `${details}. finish anyway?` : 'everything is answered. finish the test?'}</p>
    <div class="quiz-nav">
      <button class="study-btn plain" type="button" data-act="cancel-submit">keep going</button>
      <button class="study-btn gold" type="button" data-act="submit">finish test</button>
    </div>
  </div>`;
}

/* ---------- exam clock ---------- */
function startClock(){
  if(!clockTimer) clockTimer = setInterval(updateClock, 1000);
}
function stopClock(){
  clearInterval(clockTimer);
  clockTimer = null;
}
function updateClock(){
  if(!quiz || quiz.mode !== 'exam'){ stopClock(); return; }
  const left = (quiz.endsAt - Date.now()) / 1000;
  if(left <= 0){
    quiz = null;
    finishExam(true);
    if(!studyView.hidden) renderStudy();
    return;
  }
  const clock = document.getElementById('examClock');
  if(clock){
    clock.textContent = clockText(left);
    clock.classList.toggle('low', left <= CLOCK_WARNING_SECS);
  }
  const pace = document.getElementById('examPace');
  if(pace){
    const course = courseById(quiz.courseId);
    const elapsed = (Date.now() - quiz.startedAt) / 1000;
    const behind = elapsed - Object.keys(quiz.answers).length * secsPerQuestion(course);
    pace.textContent = behind > secsPerQuestion(course) ? `${clockText(behind)} behind pace` : 'on pace';
    pace.classList.toggle('behind', behind > secsPerQuestion(course));
  }
}

/* ---------- finishing ---------- */
// a blank loses the point but leaves that question's review schedule alone: running out of
// time says nothing about whether you know it, and it shouldn't undo what you've learned
function finishExam(timedOut){
  const exam = study.active;
  if(!exam) return;
  const course = courseById(exam.courseId);
  const rows = exam.items.map(it => {
    const answer = exam.answers[it.key];
    return { key: it.key, answer, right: answer === CORRECT_OPTION };
  });
  rows.filter(row => row.answer !== undefined).forEach(row => {
    recordAnswer(row.key, row.right);
    markStudied();
  });
  const score = rows.filter(row => row.right).length;
  const secs = Math.round((Math.min(Date.now(), exam.endsAt) - exam.startedAt) / 1000);
  const unitsSummary = {};
  rows.forEach(row => {
    const unitId = ITEM_BY_KEY.get(row.key).unitId;
    unitsSummary[unitId] = unitsSummary[unitId] || { right: 0, total: 0 };
    unitsSummary[unitId].total++;
    if(row.right) unitsSummary[unitId].right++;
  });
  (study.mocks[course.id] = study.mocks[course.id] || []).push({ at: Date.now(), score, total: rows.length, secs, units: unitsSummary, unitId: exam.unitId || null });
  study.active = null;
  saveStudy();
  stopClock();
  if(quiz === exam) quiz = null;
  result = { mode: 'exam', courseId: course.id, score, total: rows.length, secs, timedOut, rows, units: unitsSummary };
  studyScreen = { name: 'results' };
  if(timedOut) showToast('time’s up. your test was submitted');
}
function finishPractice(){
  const run = quiz;
  const keys = Object.keys(run.firstTry);
  const rows = keys.map(key => ({ key, answer: run.firstTry[key].answer, right: run.firstTry[key].right }));
  const unitsSummary = {};
  rows.forEach(row => {
    const unitId = ITEM_BY_KEY.get(row.key).unitId;
    unitsSummary[unitId] = unitsSummary[unitId] || { right: 0, total: 0 };
    unitsSummary[unitId].total++;
    if(row.right) unitsSummary[unitId].right++;
  });
  result = { mode: 'practice', courseId: run.courseId, score: rows.filter(r => r.right).length, total: rows.length, rows, units: unitsSummary };
  quiz = null;
  studyScreen = result.total ? { name: 'results' } : { name: 'course', courseId: run.courseId };
  renderStudy();
  scrollTo(0, 0);
}

function renderResults(){
  const course = courseById(result.courseId);
  const percent = result.total ? Math.round(result.score / result.total * 100) : 0;
  const missed = result.rows.filter(row => !row.right);
  const unitRows = course.units.filter(u => result.units[u.id]).map(u => {
    const { right, total } = result.units[u.id];
    return { unit: u, right, total, share: right / total };
  });
  const weakest = [...unitRows].sort((a, b) => a.share - b.share)[0];
  const mood = resultMood(percent);
  // inside one unit, the useful breakdown is by topic
  const focus = focusedUnit(course);
  const breakdown = focus
    ? focus.objectives.map((name, index) => {
        const rows = result.rows.filter(row => ITEM_BY_KEY.get(row.key).obj === index + 1);
        return { name, right: rows.filter(row => row.right).length, total: rows.length };
      }).filter(row => row.total)
    : unitRows.map(row => ({ name: row.unit.title, right: row.right, total: row.total }));

  studyView.innerHTML = `
    <div class="study-screen">
      <div class="study-card results-head">
        <img class="results-danno" src="danno/${mood.pose}.png" width="300" height="500" alt="">
        <p class="course-org">${result.mode === 'exam' ? (result.timedOut ? 'time ran out' : 'mock finished') : 'practice finished'}</p>
        <p class="results-score">${percent}%</p>
        <p class="results-sub">${result.score} of ${result.total} right${result.secs ? ` in ${clockText(result.secs)}` : ''}</p>
        <p class="results-line">${escapeHtml(mood.line)}</p>
        ${weakest && weakest.share < 1 && !focus ? `<p class="results-next">work on next: <b>${escapeHtml(weakest.unit.title)}</b></p>` : ''}
      </div>
      <div class="study-card unit-list">
        ${breakdown.map(row => `<div class="unit-row static">
          <span class="unit-top"><span class="unit-name">${escapeHtml(row.name)}</span><span class="unit-count">${row.right}/${row.total}</span></span>
          ${meter(row.right / row.total)}
        </div>`).join('')}
      </div>
      ${missed.length ? `
        <p class="study-section">${plural(missed.length, 'question')} to learn from</p>
        <div class="review-list">
          ${missed.map(row => {
            const item = ITEM_BY_KEY.get(row.key);
            return `<details class="study-card review-item">
              <summary>${escapeHtml(item.text)}</summary>
              ${item.source ? renderSource(course, item.source) : ''}
              ${row.answer !== undefined ? `<p class="review-yours">${ICON.cross}<span>you chose: ${escapeHtml(item.options[row.answer])}</span></p>` : '<p class="review-yours">left blank</p>'}
              <p class="review-right">${ICON.check}<span>${escapeHtml(item.options[CORRECT_OPTION])}</span></p>
              <p class="feedback-why">${escapeHtml(item.why)}</p>
            </details>`;
          }).join('')}
        </div>` : ''}
      <div class="summary-actions">
        <button class="summary-back" type="button" data-act="open-course" data-course="${escapeHtml(course.id)}">${focus ? 'back to unit' : 'back to course'}</button>
        ${focus
          ? `<button class="summary-again" type="button" data-act="practice-any" data-course="${escapeHtml(course.id)}">keep practicing</button>`
          : weakest && weakest.share < 1
          ? `<button class="summary-again" type="button" data-act="practice-unit" data-course="${escapeHtml(course.id)}" data-unit="${escapeHtml(weakest.unit.id)}">practice ${escapeHtml(weakest.unit.title)}</button>`
          : `<button class="summary-again" type="button" data-act="practice-any" data-course="${escapeHtml(course.id)}">keep practicing</button>`}
      </div>
    </div>`;
  if(!result.played){
    result.played = true;
    playResultsFx(percent);
  }
}

/* ---------- actions ---------- */
function choose(option){
  const current = quiz.items[quiz.i];
  if(quiz.mode === 'exam'){
    quiz.answers[current.key] = option;
    saveStudy();
    renderQuiz();
    popEl(studyView.querySelector('.quiz-option.is-selected'), 1.03); // says it registered, not whether it's right
    return;
  }
  if(quiz.picked !== null) return; // one answer per question, by mouse, touch or keyboard
  quiz.picked = option;
  const isRight = option === CORRECT_OPTION;
  recordAnswer(current.key, isRight);
  quiz.combo = isRight ? (quiz.combo || 0) + 1 : 0;
  quiz.praise = pickOne(isRight ? PRAISE : ENCOURAGE);
  quiz.justAnswered = true;
  if(!quiz.firstTry[current.key]){
    quiz.firstTry[current.key] = { answer: option, right: isRight };
    markStudied();
  }
  // a miss comes back once at the end of this run, while the explanation is still fresh
  if(!isRight && !quiz.requeued[current.key]){
    quiz.requeued[current.key] = true;
    quiz.items.push(quizItem(ITEM_BY_KEY.get(current.key)));
  }
  saveStudy();
  renderQuiz();
}
function goTo(index){
  quiz.movingBack = index < quiz.i;
  quiz.i = Math.max(0, Math.min(index, quiz.items.length - 1));
  quiz.fresh = true;
  if(quiz.mode === 'exam') saveStudy();
  renderQuiz();
  scrollTo(0, 0);
}
function advance(){
  if(quiz.mode === 'exam'){
    if(quiz.i === quiz.items.length - 1){ quiz.confirming = true; renderQuiz(); return; }
    goTo(quiz.i + 1);
    return;
  }
  if(quiz.picked === null || quiz.leaving) return;
  quiz.leaving = true;
  leaveThen(() => {
    if(!quiz) return;
    quiz.leaving = false;
    if(quiz.i === quiz.items.length - 1){ finishPractice(); return; }
    quiz.picked = null;
    goTo(quiz.i + 1);
  });
}
function toggleFlag(){
  const key = quiz.items[quiz.i].key;
  if(quiz.flags[key]) delete quiz.flags[key];
  else quiz.flags[key] = true;
  saveStudy();
  renderQuiz();
  popEl(studyView.querySelector('.flag-btn'), 1.1);
}

studyView.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if(!el || el.disabled) return;
  if(el.dataset.act.startsWith('l-')){ lessonAction(el); return; }
  if(el.dataset.act.startsWith('ap-')){ apAction(el); return; }
  const course = el.dataset.course ? courseById(el.dataset.course) : null;
  switch(el.dataset.act){
    case 'home': study.lastCourse = null; saveStudy(); showScreen({ name: 'home' }, 'back'); break;
    case 'units': delete study.unitFocus[course.id]; saveStudy(); showScreen({ name: 'course', courseId: course.id }, 'back'); break;
    case 'open-unit': study.unitFocus[course.id] = el.dataset.unit; saveStudy(); showScreen({ name: 'course', courseId: course.id }, 'forward'); break;
    case 'practice-topic': studyScreen = { name: 'course', courseId: course.id, tab: 'practice' }; startPractice(course, pickPractice(course, el.dataset.unit, Number(el.dataset.obj))); break;
    case 'open-course': study.lastCourse = course.id; saveStudy(); showScreen({ name: 'course', courseId: course.id }, 'forward'); break;
    case 'set-tab': {
      const oldThumb = studyView.querySelector('.tab-thumb');
      const from = oldThumb ? Number(oldThumb.style.getPropertyValue('--i')) : 0;
      studyScreen = { ...studyScreen, tab: el.dataset.tab };
      renderStudy();
      scrollTo(0, 0);
      const newThumb = studyView.querySelector('.tab-thumb');
      screenFx('tab', { from, to: newThumb ? Number(newThumb.style.getPropertyValue('--i')) : 0 });
      break;
    }
    case 'start-lesson': startLesson(course, course.lessons.find(l => l.id === el.dataset.lesson)); break;
    case 'practice-unit': studyScreen = { name: 'course', courseId: course.id, tab: studyScreen.tab || 'learn' }; startPractice(course, pickPractice(course, el.dataset.unit)); break;
    case 'practice-any': {
      const focus = focusedUnit(course);
      studyScreen = { name: 'course', courseId: course.id, tab: focus ? 'practice' : undefined };
      startPractice(course, pickPractice(course, focus && focus.id));
      break;
    }
    case 'practice-review': {
      const focus = focusedUnit(course);
      startPractice(course, reviewQueue(course, focus && focus.id).slice(0, PRACTICE_SIZE));
      break;
    }
    case 'start-exam': studyScreen = { name: 'course', courseId: course.id, tab: 'test' }; startExam(course, Number(el.dataset.size), el.dataset.unit); break;
    case 'resume-exam': quiz = study.active; quiz.confirming = false; renderStudy(); scrollTo(0, 0); break;
    case 'discard-exam': study.active = null; saveStudy(); renderStudy(); showToast('attempt discarded'); break;
    case 'choose': choose(Number(el.dataset.option)); break;
    case 'next': advance(); break;
    case 'prev': goTo(quiz.i - 1); break;
    case 'goto': goTo(Number(el.dataset.index)); break;
    case 'flag': toggleFlag(); break;
    case 'toggle-grid': quiz.showGrid = !quiz.showGrid; renderQuiz(); slideIn(studyView.querySelector('.quiz-grid'), 0); break;
    case 'ask-submit': quiz.confirming = true; renderQuiz(); slideIn(studyView.querySelector('.quiz-confirm'), 0); break;
    case 'cancel-submit': quiz.confirming = false; renderQuiz(); break;
    case 'submit': finishExam(false); renderStudy(); scrollTo(0, 0); break;
    case 'report': {
      const key = quiz.items[quiz.i].key;
      study.reported = study.reported.includes(key) ? study.reported.filter(k => k !== key) : [...study.reported, key];
      saveStudy();
      renderQuiz();
      popEl(studyView.querySelector('.report-btn'), 1.12);
      break;
    }
    case 'leave':
      if(quiz.mode === 'exam'){
        const { courseId } = quiz;
        quiz = null;
        showScreen({ name: 'course', courseId }, 'back');
        showToast('the clock keeps running, like the real test');
      }else if(Object.keys(quiz.firstTry).length){
        finishPractice();
      }else{
        const { courseId } = quiz;
        quiz = null;
        showScreen({ name: 'course', courseId }, 'back');
      }
      break;
  }
});

// speed matters at 30 seconds a question: 1-4 or A-D answers, enter moves on, F flags
document.addEventListener('keydown', (e) => {
  if(!quiz || studyView.hidden || e.ctrlKey || e.metaKey || e.altKey) return;
  if(!foyerEl.hidden || !settingsOverlay.hidden) return;
  const key = e.key.toLowerCase();
  const position = '1234'.includes(key) ? Number(key) - 1 : 'abcd'.indexOf(key);
  if(key.length === 1 && position >= 0){
    if(quiz.confirming) return;
    e.preventDefault();
    choose(quiz.items[quiz.i].order[position]);
  }else if(key === 'enter' && e.target.tagName !== 'BUTTON' && !quiz.confirming){
    e.preventDefault();
    advance();
  }else if(key === 'f' && quiz.mode === 'exam' && !quiz.confirming){
    toggleFlag();
  }else if(key === 'arrowright' && quiz.mode === 'exam' && !quiz.confirming){
    advance();
  }else if(key === 'arrowleft' && quiz.mode === 'exam' && !quiz.confirming && quiz.i > 0){
    goTo(quiz.i - 1);
  }
});

/* ---------- moving between the word log and study ---------- */
const WORLD_COLORS = { words: '#0A47B8', study: '#0E5A4A' };
const worldSwitch = document.getElementById('worldSwitch');
function syncSwitch(world){
  worldSwitch.dataset.world = world;
  worldSwitch.querySelectorAll('button').forEach(btn => {
    const on = btn.dataset.world === world;
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-pressed', String(on));
  });
}
function syncWorld(world){
  document.documentElement.classList.toggle('world-study', world === 'study');
  document.querySelector('meta[name="theme-color"]').content = WORLD_COLORS[world];
  syncSwitch(world);
}
function enterStudy(){
  study.world = 'study';
  saveStudy();
  logView.hidden = trainView.hidden = true;
  studyView.hidden = false;
  syncWorld('study');
  renderStudy();
  scrollTo(0, 0);
}
// called by switchTab: opening anything in the word log means leaving study
function leaveStudy(){
  if(study.world !== 'words'){ study.world = 'words'; saveStudy(); }
  studyView.hidden = true;
  syncWorld('words');
}
// waking Danno returns you to whichever world you were last in
function openLastWorld(){
  if(study.world === 'study') enterStudy();
  else switchTab('log');
}
worldSwitch.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-world]');
  if(btn) changeWorld(btn.dataset.world, btn);
});
syncWorld('words');
