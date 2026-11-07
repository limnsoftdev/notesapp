/* ===================== study: unit courses, image cards and written responses ===================== */
// For courses with `unitPicker` (AP World): you choose a unit, and everything else stays inside it.
// Cards use the same Leitner intervals as the question bank, stored under `<course>:card:<id>`.
// Written responses go through gradeResponse() in study-grading.js, so a different grader can
// replace the auto-check without touching these screens.
// Loaded after study.js and uses its globals. All course text goes through escapeHtml.

const CARD_RUN_SIZE = 12;
const SAVE_DRAFT_MS = 400;
const REQUEUE_GAP = 4;

let cardRun = null;   // the card review on screen
let writer = null;    // the written response on screen

function focusedUnit(course){
  if(!course.unitPicker) return null;
  return course.units.find(u => u.id === study.unitFocus[course.id]) || null;
}

/* ---------- images and sources ---------- */
function renderImage(course, key, caption){
  const image = course.images[key];
  return `<figure class="src-figure">
    <img class="src-img" src="images/apwh/${escapeHtml(key)}.jpg" alt="${escapeHtml(image.alt)}" loading="lazy" decoding="async">
    <figcaption>${caption ? `<span>${escapeHtml(caption)}</span>` : ''}<a class="src-credit" href="${escapeHtml(image.page)}" target="_blank" rel="noopener">${escapeHtml(image.credit)}</a></figcaption>
  </figure>`;
}
function renderSource(course, id, heading){
  const source = course.sources[id];
  const head = heading ? `<p class="src-heading">${escapeHtml(heading)}</p>` : '';
  if(source.kind === 'image') return `<div class="src">${head}${renderImage(course, source.img, source.cite)}</div>`;
  return `<div class="src">${head}<blockquote class="src-text">${escapeHtml(source.text)}</blockquote><p class="src-cite">${escapeHtml(source.cite)}</p></div>`;
}

/* ---------- choosing a unit ---------- */
function renderUnitPicker(course){
  studyView.innerHTML = `
    <div class="study-screen">
      <div class="course-top">
        <button class="study-back" type="button" data-act="home" aria-label="all courses">${ICON.back}</button>
        <div class="course-top-text">
          <p class="course-org on-ground">${escapeHtml(course.org)}</p>
          <h2 class="course-heading on-ground">${escapeHtml(course.title)}</h2>
        </div>
        ${statChips()}
      </div>
      <p class="study-section">choose a unit</p>
      <div class="study-card unit-list">
        ${course.units.map(unit => {
          const stats = unitStats(course, unit.id);
          if(!stats.total) return `<div class="unit-row static soon">
            <span class="unit-top"><span class="unit-name">${escapeHtml(unit.title)}</span><span class="unit-count">coming soon</span></span>
            <span class="unit-weight">${escapeHtml(unit.dates)} · ${escapeHtml(unit.share)} of the exam</span>
          </div>`;
          const lessons = lessonsOf(course).filter(l => l.unit === unit.id);
          const done = lessons.filter(l => study.lessons[l.id] && study.lessons[l.id].done).length;
          return `<button class="unit-row" type="button" data-act="open-unit" data-course="${escapeHtml(course.id)}" data-unit="${escapeHtml(unit.id)}">
            <span class="unit-top"><span class="unit-name">${escapeHtml(unit.title)}</span><span class="unit-count">${done}/${lessons.length} lessons</span></span>
            <span class="unit-weight">${escapeHtml(unit.dates)} · ${escapeHtml(unit.share)} of the exam</span>
            ${meter(lessons.length ? done / lessons.length : 0)}
          </button>`;
        }).join('')}
      </div>
      <details class="study-card exam-parts">
        <summary>how the ${escapeHtml(course.examDate)} exam works</summary>
        <div class="exam-table">
          ${course.examParts.map(([name, what, time, share]) => `<div class="exam-row"><b>${escapeHtml(name)}</b><span>${escapeHtml(what)}</span><span class="exam-num">${escapeHtml(time)} · ${escapeHtml(share)}</span></div>`).join('')}
        </div>
      </details>
      <p class="study-disclaimer">${escapeHtml(course.disclaimer)}</p>
    </div>`;
}

/* ---------- the unit test tab ---------- */
function renderUnitTestTab(course, unit){
  const stats = unitStats(course, unit.id);
  const mocks = (study.mocks[course.id] || []).filter(m => m.unitId === unit.id);
  const active = study.active && study.active.courseId === course.id ? study.active : null;
  const activeHere = active && active.unitId === unit.id;
  const value = readiness(course, unit.id);
  const size = Math.min(20, stats.total);
  const quick = Math.min(10, stats.total);
  const button = (label, sub, n) => `<button class="study-btn" type="button" data-act="start-exam" data-course="${escapeHtml(course.id)}" data-unit="${escapeHtml(unit.id)}" data-size="${n}"${active ? ' disabled' : ''}><b>${label}</b><span>${sub}</span></button>`;
  return `
    <div class="study-card">
      <p class="course-fact">Multiple choice at the real exam’s pace: one minute per question, with sets on the same source kept together.</p>
      <div class="ready-row"><span class="ready-value">${pct(value)}</span><span class="ready-label">of this unit’s ${stats.total} questions right on your last try</span></div>
      ${meter(value)}
    </div>
    <div class="study-actions">
      ${activeHere ? `
        <button class="study-btn gold wide" type="button" data-act="resume-exam">resume test · ${clockText((active.endsAt - Date.now()) / 1000)} left</button>
        <button class="study-link wide" type="button" data-act="discard-exam">discard this attempt</button>
      ` : `${button('unit test', `${size} questions, ${size} min`, size)}${button('sprint', `${quick} questions, ${quick} min`, quick)}`}
    </div>
    ${mocks.length ? `
      <div class="study-card score-chart" role="img" aria-label="your last ${Math.min(mocks.length, 8)} scores on this unit">
        <p class="study-card-title">your scores</p>
        <div class="score-bars">${mocks.slice(-8).map(m => {
          const score = Math.round(m.score / m.total * 100);
          return `<div class="score-bar"><span>${score}</span><i style="height:${Math.max(score, 4)}%"></i></div>`;
        }).join('')}</div>
      </div>` : ''}
    <button class="study-btn wide" type="button" data-act="set-tab" data-tab="write"><b>add the writing</b><span>the AP score is 60% written and short answers</span></button>
    <p class="study-disclaimer">${escapeHtml(course.disclaimer)}</p>`;
}

/* ---------- cards: see it, recall it, use it ---------- */
const cardKey = (course, card) => `${course.id}:card:${card.id}`;
const cardsOf = (course, unit) => (course.cards || []).filter(card => card.unit === unit.id);
const cardBox = (course, card) => (study.progress[cardKey(course, card)] || {}).box || 0;

function pickCards(course, unit, kind){
  const now = Date.now();
  const state = card => study.progress[cardKey(course, card)];
  const pool = cardsOf(course, unit).filter(card => !kind || card.kind === kind);
  const due = pool.filter(card => state(card) && state(card).dueAt <= now).sort((a, b) => state(a).box - state(b).box);
  const fresh = shuffled(pool.filter(card => !state(card)));
  const later = pool.filter(card => state(card) && state(card).dueAt > now).sort((a, b) => state(a).dueAt - state(b).dueAt);
  return due.concat(fresh, later).slice(0, CARD_RUN_SIZE);
}
function renderCardsTab(course, unit){
  const cards = cardsOf(course, unit);
  const now = Date.now();
  const due = cards.filter(card => { const p = study.progress[cardKey(course, card)]; return p && p.dueAt <= now; }).length;
  const fresh = cards.filter(card => !study.progress[cardKey(course, card)]).length;
  const startButton = (label, sub, kind, gold) => `<button class="study-btn${gold ? ' gold wide' : ''}" type="button" data-act="ap-cards" data-course="${escapeHtml(course.id)}" data-kind="${kind}"><b>${label}</b><span>${sub}</span></button>`;
  const dots = box => `<span class="card-dots" aria-label="memory strength ${box} of ${MAX_BOX}">${Array.from({ length: MAX_BOX }, (_, i) => `<i class="${i < box ? 'on' : ''}"></i>`).join('')}</span>`;
  const gallery = (kind, title) => `
    <p class="study-section">${title}</p>
    <div class="card-grid">
      ${cards.filter(card => card.kind === kind).map(card => `<button class="card-tile" type="button" data-act="ap-card-one" data-course="${escapeHtml(course.id)}" data-card="${escapeHtml(card.id)}">
        <img src="images/apwh/${escapeHtml(card.img)}.jpg" alt="" loading="lazy" decoding="async">
        <span class="card-tile-name">${study.progress[cardKey(course, card)] ? escapeHtml(card.name) : 'not seen yet'}</span>
        ${dots(cardBox(course, card))}
      </button>`).join('')}
    </div>`;
  return `
    <div class="study-card">
      <p class="course-fact">See the image, recall who or what it is, then read how to use it in an essay.</p>
      <p class="course-note">${due ? `${plural(due, 'card')} due now. ` : ''}${fresh ? `${fresh} you haven’t seen yet.` : ''}</p>
    </div>
    <div class="study-actions">
      ${startButton(due ? `review ${plural(due, 'card')} due` : 'study cards', 'what you need most', '', true)}
      ${startButton('rulers', 'who they were', 'ruler')}
      ${startButton('evidence', 'events, places, ideas', 'evidence')}
    </div>
    ${gallery('ruler', 'rulers')}
    ${gallery('evidence', 'evidence')}`;
}
function startCardRun(course, cards){
  if(!cards.length){ showToast('nothing to study here yet'); return; }
  cardRun = { courseId: course.id, queue: cards.map(card => card.id), i: 0, shown: false, right: 0, wrong: 0, seen: {}, requeued: {} };
  renderStudy();
  scrollTo(0, 0);
}
function renderCardRun(){
  const course = courseById(cardRun.courseId);
  if(cardRun.i >= cardRun.queue.length){ renderCardSummary(course); return; }
  const card = course.cards.find(c => c.id === cardRun.queue[cardRun.i]);
  const box = cardBox(course, card);
  const next = BOX_INTERVALS[Math.min(box + 1, MAX_BOX)];
  const days = Math.round(next / 86400000);
  studyView.innerHTML = `
    <div class="quiz">
      <div class="quiz-head">
        <button class="icon-btn end-session" type="button" data-act="ap-cards-end" aria-label="end review">${ICON.close}</button>
        <div class="train-progress-bar" role="progressbar" aria-label="progress" aria-valuemin="0" aria-valuemax="${cardRun.queue.length}" aria-valuenow="${cardRun.i}"><div class="train-progress-fill" style="width:${pct(cardRun.i / cardRun.queue.length)}"></div></div>
        <span class="train-progress-text">${cardRun.i + 1}/${cardRun.queue.length}</span>
      </div>
      <div class="quiz-card cardrun-card${cardRun.shown ? ' shown' : ' enter'}">
        <p class="quiz-tag">${card.kind === 'ruler' ? 'who is this?' : 'what is this?'}</p>
        ${renderImage(course, card.img)}
        <p class="cardrun-clue">${escapeHtml(card.clue)}</p>
        ${cardRun.shown ? `
          <div class="cardrun-answer" aria-live="polite">
            <h3 class="cardrun-name">${escapeHtml(card.name)}</h3>
            <p class="cardrun-when">${escapeHtml(card.when)}</p>
            <p class="cardrun-fact">${escapeHtml(card.fact)}</p>
            <p class="cardrun-use-label">use it in an essay</p>
            <p class="cardrun-use">${escapeHtml(card.use)}</p>
          </div>` : ''}
      </div>
      ${cardRun.shown ? `
        <div class="quiz-nav">
          <button class="study-btn plain" type="button" data-act="ap-card-rate" data-right="0"><b>not quite</b></button>
          <button class="study-btn gold" type="button" data-act="ap-card-rate" data-right="1"><b>got it</b><span>${days <= 1 ? 'back tomorrow' : `back in ${days} days`}</span></button>
        </div>` : `<button class="study-btn gold wide lesson-next" type="button" data-act="ap-card-show">show answer</button>`}
    </div>`;
}
function renderCardSummary(course){
  const total = Object.keys(cardRun.seen).length;
  const right = Object.values(cardRun.seen).filter(Boolean).length;
  const mood = resultMood(total ? right / total * 100 : 0);
  studyView.innerHTML = `
    <div class="lesson-done">
      <img class="done-danno" src="danno/${mood.pose}.png" width="300" height="500" alt="">
      <p class="study-kicker">review finished</p>
      <h2 class="study-title">${right} of ${plural(total, 'card')} on the first try</h2>
      <p class="results-line on-ground">${escapeHtml(mood.line.replace('the misses below are your next points', 'the ones you missed come back soonest').replace('look through the misses below', 'those cards come back soonest'))}</p>
      <button class="study-btn gold wide" type="button" data-act="ap-cards-end">back to cards</button>
    </div>`;
  if(total && right === total) confetti(40);
}

/* ---------- the write tab ---------- */
const RESPONSE_LABEL = { saq: 'Short answer', leq: 'Long essay', dbq: 'Document-based question' };
const responsesOf = (course, unit) => (course.responses || []).filter(def => def.unit === unit.id);
const responseMax = (def) => rubricFor(def).length;
function renderWriteTab(course, unit){
  const skills = lessonsOf(course).filter(l => l.track === 'write'); // the same skills serve every unit
  const doneCount = skills.filter(l => study.lessons[l.id] && study.lessons[l.id].done).length;
  const group = (type) => responsesOf(course, unit).filter(def => def.type === type).map(def => {
    const attempts = study.responses[def.id] || [];
    const best = attempts.length ? Math.max(...attempts.map(attempt => attempt.earned)) : null;
    const hasDraft = study.drafts[def.id] && Object.values(study.drafts[def.id].answers || {}).some(Boolean);
    return `<button class="unit-row" type="button" data-act="ap-write" data-course="${escapeHtml(course.id)}" data-def="${escapeHtml(def.id)}">
      <span class="unit-top"><span class="unit-name">${escapeHtml(def.title)}</span><span class="unit-count">${best === null ? (hasDraft ? 'draft saved' : `${def.minutes} min`) : `best ${best}/${responseMax(def)}`}</span></span>
    </button>`;
  }).join('');
  return `
    <div class="study-card">
      <p class="course-fact">Knowing it and using it are different skills. These train the second one.</p>
      <p class="course-note">${doneCount} of ${skills.length} skills done. Most of them grade themselves.</p>
    </div>
    <p class="study-section">skills</p>
    <div class="study-card unit-list">
      ${skills.map(l => {
        const done = study.lessons[l.id] && study.lessons[l.id].done;
        return `<button class="unit-row skill-row" type="button" data-act="start-lesson" data-course="${escapeHtml(course.id)}" data-lesson="${escapeHtml(l.id)}">
          <span class="skill-check${done ? ' on' : ''}" aria-hidden="true">${done ? ICON.check : ''}</span>
          <span class="skill-text"><span class="unit-name">${escapeHtml(l.title)}</span><span class="unit-weight">${escapeHtml(l.blurb)}</span></span>
          ${done ? '<span class="sr-only">done</span>' : ''}
        </button>`;
      }).join('')}
    </div>
    <p class="study-section">write it for real</p>
    ${['saq', 'dbq', 'leq'].map(type => `
      <div class="study-card unit-list">
        <p class="write-group">${RESPONSE_LABEL[type]}</p>
        ${group(type)}
      </div>`).join('')}
    <p class="study-disclaimer">Rubrics follow College Board’s published AP History rubrics. The writing prompts are original and stay inside this unit, and the real long essay covers about half the course.</p>`;
}

/* ---------- writing a response ---------- */
function openWriter(course, def){
  const draft = study.drafts[def.id] || {};
  const startedAt = draft.startedAt || Date.now();
  writer = { courseId: course.id, def, answers: { ...(draft.answers || {}) }, startedAt, view: 'write', grading: false, result: null, marks: {}, showDocs: true };
  study.drafts[def.id] = { answers: writer.answers, startedAt };
  saveStudy();
  renderStudy();
  scrollTo(0, 0);
  slideIn(studyView.querySelector('.write-card'), 1);
}
let draftTimer = null;
function saveDraftSoon(){
  clearTimeout(draftTimer);
  draftTimer = setTimeout(() => {
    if(!writer) return;
    study.drafts[writer.def.id] = { answers: writer.answers, startedAt: writer.startedAt };
    saveStudy();
  }, SAVE_DRAFT_MS);
}
const elapsedText = () => {
  const left = writer.def.minutes * 60 - (Date.now() - writer.startedAt) / 1000;
  return left >= 0 ? `${clockText(left)} left` : `${clockText(-left)} over`;
};
function writerField(id, label, rows, placeholder){
  return `<label class="write-field">
    <span class="write-label">${label}</span>
    <textarea class="write-area" data-answer="${id}" rows="${rows}" placeholder="${escapeHtml(placeholder || '')}" spellcheck="true">${escapeHtml(writer.answers[id] || '')}</textarea>
  </label>`;
}
function writerPrompt(course, def){
  const prompt = text => text.split('\n').filter(Boolean).map(line => `<p class="write-prompt">${escapeHtml(line)}</p>`).join('');
  if(def.type === 'saq'){
    return `${def.sources.map(id => renderSource(course, id)).join('')}
      ${def.parts.map(part => writerField(part.id, `${part.label}. ${escapeHtml(part.prompt)}`, 3, 'Answer, cite, explain.')).join('')}`;
  }
  const docs = def.type === 'dbq'
    ? `<details class="doc-list"${writer.showDocs ? ' open' : ''} data-docs>
        <summary>the ${def.sources.length} documents</summary>
        ${def.sources.map((id, index) => renderSource(course, id, `Document ${index + 1}`)).join('')}
      </details>`
    : '';
  return `${prompt(def.prompt)}
    <ul class="write-checklist">${(RUBRICS[def.rubric] || []).filter(row => !row.needs).map(row => `<li>${escapeHtml(row.label)}</li>`).join('')}</ul>
    ${docs}
    ${writerField('plan', 'First, empty your head. List everything you remember. This part isn’t scored.', 3, 'Names, events, terms. Any order.')}
    ${writerField('essay', 'Your response', 14, 'Start with context, then your thesis.')}
    <p class="write-count" id="writeCount" aria-live="off">${plural(wordCount(writer.answers.essay), 'word')}</p>`;
}
function renderWriter(){
  const course = courseById(writer.courseId);
  const { def } = writer;
  if(writer.view === 'grade'){ renderGrade(course, def); return; }
  studyView.innerHTML = `
    <div class="quiz">
      <div class="quiz-head">
        <button class="icon-btn end-session" type="button" data-act="ap-write-end" aria-label="leave, your draft is saved">${ICON.close}</button>
        <p class="write-kind">${escapeHtml(RESPONSE_LABEL[def.type])}</p>
        <span class="quiz-clock" id="writeClock" role="timer">${elapsedText()}</span>
      </div>
      <div class="quiz-card write-card">
        <h3 class="lesson-title">${escapeHtml(def.title)}</h3>
        <p class="course-note">${escapeHtml(def.intro)}</p>
        ${writerPrompt(course, def)}
      </div>
      <button class="study-btn gold wide lesson-next${writer.grading ? ' is-working' : ''}" type="button" data-act="ap-grade"${writer.grading ? ' disabled' : ''}>${writer.grading ? 'checking…' : 'check my answer'}</button>
      <button class="study-link wide" type="button" data-act="ap-restart">start over</button>
    </div>`;
}
function modelAnswer(def){
  if(def.type === 'saq') return def.parts.map(part => `<p><b>${escapeHtml(part.label)}.</b> ${escapeHtml(part.model)}</p>`).join('');
  return `${def.modelContext ? `<p><b>Context:</b> ${escapeHtml(def.modelContext)}</p>` : ''}
    <p><b>Thesis:</b> ${escapeHtml(def.modelThesis)}</p>
    <p><b>Evidence you could use:</b></p>
    <ul>${def.modelEvidence.map(line => `<li>${escapeHtml(line)}</li>`).join('')}</ul>`;
}
function earnedTotal(rubric){
  return rubric.filter(row => writer.marks[row.id] === true).length;
}
function renderGrade(course, def){
  const rubric = rubricFor(def);
  const undecided = rubric.filter(row => writer.marks[row.id] === null).length;
  const notes = Object.fromEntries(writer.result.rows.map(row => [row.id, row.note]));
  const earned = earnedTotal(rubric);
  const answerFor = (row) => row.part ? writer.answers[row.part] : writer.answers.essay;
  studyView.innerHTML = `
    <div class="study-screen still">
      <div class="study-card results-head grade-head">
        <p class="course-org">suggested score</p>
        <p class="results-score">${earned}/${rubric.length}</p>
        <p class="results-line">${escapeHtml(writer.result.note)}</p>
      </div>
      <div class="study-card grade-list">
        ${rubric.map(row => {
          const mark = writer.marks[row.id];
          const blocked = row.needs && writer.marks[row.needs] !== true;
          return `<div class="grade-row" data-row="${escapeHtml(row.id)}">
            <p class="grade-group">${escapeHtml(row.group)}</p>
            <p class="grade-label">${escapeHtml(row.label)}</p>
            <p class="grade-detail">${escapeHtml(row.detail)}</p>
            ${row.part ? `<p class="grade-answer">${escapeHtml(answerFor(row) || 'left blank')}</p>` : ''}
            ${notes[row.id] ? `<p class="grade-note">${escapeHtml(notes[row.id])}</p>` : ''}
            <div class="grade-toggle" role="group" aria-label="${escapeHtml(row.label)}">
              <button type="button" class="${mark === true ? 'on yes' : ''}" data-act="ap-mark" data-row="${escapeHtml(row.id)}" data-value="1" aria-pressed="${mark === true}"${blocked ? ' disabled' : ''}>${ICON.check} earned</button>
              <button type="button" class="${mark === false ? 'on no' : ''}" data-act="ap-mark" data-row="${escapeHtml(row.id)}" data-value="0" aria-pressed="${mark === false}">${ICON.cross} not yet</button>
            </div>
          </div>`;
        }).join('')}
      </div>
      <details class="study-card model-answer" open>
        <summary>${def.type === 'saq' ? 'model answers' : 'a strong plan for this prompt'}</summary>
        ${modelAnswer(def)}
        <p class="course-note">One good way to answer, not the only one.</p>
      </details>
      ${def.type !== 'saq' ? `<details class="study-card model-answer"><summary>reread your response</summary><p class="grade-answer full">${escapeHtml(writer.answers.essay || 'left blank')}</p></details>` : ''}
      <div class="summary-actions">
        <button class="summary-back" type="button" data-act="ap-grade-back">keep editing</button>
        <button class="summary-again" type="button" data-act="ap-grade-save">${undecided ? `decide ${undecided} more` : 'save score'}</button>
      </div>
    </div>`;
}
async function runGrade(){
  const course = courseById(writer.courseId);
  const target = writer;
  target.grading = true;
  renderWriter();
  // long enough to read as checking, even though the auto-check is instant
  const [result] = await Promise.all([gradeResponse(course, target.def, target.answers), new Promise(done => setTimeout(done, motionAllowed() ? 420 : 0))]);
  if(writer !== target) return;
  target.grading = false;
  target.result = result;
  target.marks = Object.fromEntries(result.rows.map(row => [row.id, row.earned]));
  // a higher point can't be earned without the point beneath it
  rubricFor(target.def).forEach(row => { if(row.needs && target.marks[row.needs] !== true) target.marks[row.id] = false; });
  target.view = 'grade';
  renderWriter();
  scrollTo(0, 0);
  const rubric = rubricFor(target.def);
  gradeRevealFx(earnedTotal(rubric), rubric.length);
}
function saveGrade(){
  const rubric = rubricFor(writer.def);
  const { def, answers } = writer;
  const earned = earnedTotal(rubric);
  (study.responses[def.id] = study.responses[def.id] || []).push({
    at: Date.now(), earned, total: rubric.length, by: writer.result.by,
    marks: { ...writer.marks }, answers: { ...answers }
  });
  delete study.drafts[def.id];
  markStudied();
  saveStudy();
  writer = null;
  showToast(`saved: ${earned} of ${rubric.length}`);
  renderStudy();
  scrollTo(0, 0);
  screenFx('back');
  const row = studyView.querySelector(`[data-act="ap-write"][data-def="${def.id}"]`);
  if(row){
    row.scrollIntoView({ block: 'center' });
    popEl(row, 1.04);
    burstAt(row);
  }
  confetti(earned / rubric.length >= .7 ? 50 : 22);
}

/* ---------- input ---------- */
function apAction(el){
  const course = el.dataset.course ? courseById(el.dataset.course) : null;
  switch(el.dataset.act){
    case 'ap-cards': startCardRun(course, pickCards(course, focusedUnit(course), el.dataset.kind)); return;
    case 'ap-card-one': startCardRun(course, course.cards.filter(card => card.id === el.dataset.card)); return;
    case 'ap-card-show': cardRun.shown = true; renderCardRun(); flipInCard(); return;
    case 'ap-card-rate': {
      const id = cardRun.queue[cardRun.i];
      const right = el.dataset.right === '1';
      const live = courseById(cardRun.courseId);
      flyOffCard(right);
      if(right) burstAt(el, 700);
      recordAnswer(`${live.id}:card:${id}`, right);
      if(!(id in cardRun.seen)) cardRun.seen[id] = right;
      // a miss comes back once in this run, a few cards later
      if(!right && !cardRun.requeued[id]){
        cardRun.requeued[id] = true;
        cardRun.queue.splice(Math.min(cardRun.i + REQUEUE_GAP, cardRun.queue.length), 0, id);
      }
      markStudied();
      saveStudy();
      cardRun.i++;
      cardRun.shown = false;
      renderCardRun();
      scrollTo(0, 0);
      riseNextCard();
      return;
    }
    case 'ap-cards-end': {
      const courseId = cardRun.courseId;
      cardRun = null;
      showScreen({ name: 'course', courseId, tab: 'cards' }, 'back');
      return;
    }
    case 'ap-write': openWriter(course, course.responses.find(def => def.id === el.dataset.def)); return;
    case 'ap-write-end': {
      const courseId = writer.courseId;
      clearTimeout(draftTimer);
      study.drafts[writer.def.id] = { answers: writer.answers, startedAt: writer.startedAt };
      saveStudy();
      writer = null;
      showScreen({ name: 'course', courseId, tab: 'write' }, 'back');
      return;
    }
    case 'ap-restart':
      if(!el.dataset.sure){
        el.dataset.sure = '1';
        el.textContent = 'tap again to erase your draft';
        shakeEl(el);
        return;
      }
      clearTimeout(draftTimer);
      writer.answers = {};
      writer.startedAt = Date.now();
      study.drafts[writer.def.id] = { answers: writer.answers, startedAt: writer.startedAt };
      saveStudy();
      renderWriter();
      scrollTo(0, 0);
      slideIn(studyView.querySelector('.write-card'), -1);
      return;
    case 'ap-grade': if(!writer.grading) runGrade(); return;
    case 'ap-grade-back': writer.view = 'write'; renderWriter(); scrollTo(0, 0); slideIn(studyView.querySelector('.write-card'), -1); return;
    case 'ap-grade-save': {
      const open = rubricFor(writer.def).find(row => writer.marks[row.id] === null);
      if(!open){ saveGrade(); return; }
      // saving has to wait, so take you to what's still undecided instead of doing nothing
      const row = studyView.querySelector(`.grade-row[data-row="${open.id}"]`);
      row.scrollIntoView({ block: 'center', behavior: motionAllowed() ? 'smooth' : 'auto' });
      row.classList.add('needs-you');
      shakeEl(el);
      setTimeout(() => shakeEl(row), 320);
      return;
    }
    case 'ap-mark': {
      const { row: id, value } = el.dataset;
      const y = scrollY;
      const before = earnedTotal(rubricFor(writer.def));
      writer.marks[id] = value === '1';
      // taking back a point also takes back any point that depends on it
      rubricFor(writer.def).forEach(row => { if(row.needs === id && !writer.marks[id]) writer.marks[row.id] = false; });
      renderWriter();
      scrollTo(0, y);
      gradeMarkFx(id, value, before, earnedTotal(rubricFor(writer.def)));
      return;
    }
  }
}
studyView.addEventListener('input', (e) => {
  const id = e.target.dataset.answer;
  if(!id || !writer) return;
  writer.answers[id] = e.target.value;
  saveDraftSoon();
  if(id === 'essay'){
    const count = document.getElementById('writeCount');
    if(count) count.textContent = plural(wordCount(e.target.value), 'word');
  }
});
// keeps the documents open or closed as you left them, even after coming back from grading
studyView.addEventListener('toggle', (e) => {
  if(writer && e.target.matches && e.target.matches('[data-docs]')) writer.showDocs = e.target.open;
}, true);
setInterval(() => {
  const clock = writer && writer.view === 'write' && !studyView.hidden ? document.getElementById('writeClock') : null;
  if(!clock) return;
  clock.textContent = elapsedText();
  clock.classList.toggle('low', (Date.now() - writer.startedAt) / 1000 > writer.def.minutes * 60);
}, 1000);
