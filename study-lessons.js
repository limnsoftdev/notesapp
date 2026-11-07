/* ===================== study: lesson player and visuals ===================== */
// Lessons teach before they test. A lesson (courses/lessons-*.js) is a list of steps:
//   teach:  an explanation, optionally with a visual
//   stages: a visual you step through, one idea per tap
//   order:  put items in sequence        match: pair two columns
//   sort:   drop each item into a bucket  q: a question from the course's bank
//   widget: an interactive tool you have to use to continue
//   pick:   choose an answer, each option explaining itself: [text, isRight, why]
//   recall: type what you remember, then see which key terms you got: [label, ...terms]
// A teach step can show a course image (`image`), and a pick step can show a source (`source`).
// Visuals are code rather than data, so course files stay plain text and can't inject markup.
// Loaded after study.js and uses its globals.


/* ---------- drawing helpers ---------- */
const svgWrap = (height, inner, label) =>
  `<svg class="lesson-visual" viewBox="0 0 340 ${height}" role="img" aria-label="${escapeHtml(label)}">${inner}</svg>`;
const vBox = (x, y, w, h, text, on, sub) => `
  <rect class="v-box${on ? ' on' : ''}" x="${x}" y="${y}" width="${w}" height="${h}" rx="12"/>
  <text class="v-label${on ? ' on' : ''}" x="${x + w / 2}" y="${y + h / 2 + (sub ? -3 : 4)}" text-anchor="middle">${text}</text>
  ${sub ? `<text class="v-sub${on ? ' on' : ''}" x="${x + w / 2}" y="${y + h / 2 + 11}" text-anchor="middle">${sub}</text>` : ''}`;

// a row of stations with a dot that travels to the current one
function vChain(labels, stage, label){
  const gap = 340 / labels.length;
  const center = i => gap * i + gap / 2;
  const w = Math.min(gap - 8, 62);
  const line = `<line class="v-line" x1="${center(0)}" y1="50" x2="${center(labels.length - 1)}" y2="50"/>
    <line class="v-line done" x1="${center(0)}" y1="50" x2="${center(stage)}" y2="50"/>`;
  const boxes = labels.map((text, i) => vBox(center(i) - w / 2, 28, w, 44, text, i === stage)).join('');
  const from = center(Math.max(stage - 1, 0));
  const packet = `<circle class="v-packet" r="7" cy="88" cx="0" style="--from:${from}px;--to:${center(stage)}px"/>`;
  return svgWrap(104, line + boxes + packet, label);
}

const VISUALS = {
  'net-journey': (s) => vChain(['Laptop', 'Switch', 'Router', 'Modem', 'Server'], s, 'A packet travelling from a laptop through a switch, router and modem to a server'),
  'boot-chain': (s) => vChain(['Power', 'POST', 'Boot', 'Kernel', 'Login'], s, 'The startup sequence from power on to the login screen'),
  'dora': (s) => {
    const steps = [['Discover', 'anyone have an address?', 1], ['Offer', 'you can have .25', -1], ['Request', 'I\'d like .25, please', 1], ['Acknowledge', '.25 is yours for 24h', -1]];
    const rows = steps.map(([name, line, dir], i) => {
      const y = 34 + i * 40;
      if(i > s) return `<line class="v-line" x1="74" y1="${y}" x2="266" y2="${y}" stroke-dasharray="3 6"/>`;
      const [x1, x2] = dir > 0 ? [74, 262] : [266, 78];
      return `<g class="v-appear${i === s ? ' current' : ''}">
        <line class="v-arrow" x1="${x1}" y1="${y}" x2="${x2}" y2="${y}"/>
        <path class="v-head" d="M${x2} ${y}l${-dir * 9} -5v10z"/>
        <text class="v-label" x="170" y="${y - 7}" text-anchor="middle">${name}</text>
        <text class="v-sub" x="170" y="${y + 14}" text-anchor="middle">${line}</text>
      </g>`;
    }).join('');
    return svgWrap(186, `${vBox(4, 10, 62, 166, 'Client', false, 'no IP')}${vBox(274, 10, 62, 166, 'DHCP', false, 'server')}${rows}`, 'The four messages of a DHCP lease between a client and a server');
  },
  'laser-cycle': (s) => {
    const names = ['Processing', 'Charging', 'Exposing', 'Developing', 'Transferring', 'Fusing', 'Cleaning'];
    const cx = 170, cy = 118;
    const nodes = names.map((name, i) => {
      const angle = -Math.PI / 2 + (i / names.length) * Math.PI * 2;
      const x = cx + Math.cos(angle) * 88, y = cy + Math.sin(angle) * 88;
      const lx = cx + Math.cos(angle) * 118, ly = cy + Math.sin(angle) * 104;
      return `<circle class="v-dot${i === s ? ' on' : ''}${i < s ? ' past' : ''}" cx="${x}" cy="${y}" r="${i === s ? 15 : 12}"/>
        <text class="v-num${i === s ? ' on' : ''}" x="${x}" y="${y + 5}" text-anchor="middle">${i + 1}</text>
        <text class="v-sub${i === s ? ' strong' : ''}" x="${lx}" y="${ly + (Math.abs(Math.cos(angle)) < .3 ? (angle < 0 ? -6 : 16) : 4)}" text-anchor="${Math.cos(angle) > .3 ? 'start' : Math.cos(angle) < -.3 ? 'end' : 'middle'}">${name}</text>`;
    }).join('');
    return svgWrap(240, `<circle class="v-ring" cx="${cx}" cy="${cy}" r="88"/><circle class="v-drum${s >= 0 ? ' spin' : ''}" cx="${cx}" cy="${cy}" r="42"/><text class="v-label" x="${cx}" y="${cy + 5}" text-anchor="middle">Drum</text>${nodes}`, 'The seven steps of the laser printing cycle around the imaging drum');
  },
  'cia': (s) => {
    const on = i => i === s;
    return svgWrap(190, `<path class="v-tri" d="M170 28L300 158H40z"/>
      ${vBox(112, 8, 116, 44, 'Confidentiality', on(0), 'who can see it')}
      ${vBox(6, 138, 116, 44, 'Integrity', on(1), 'is it unchanged')}
      ${vBox(218, 138, 116, 44, 'Availability', on(2), 'can you reach it')}`, 'The CIA triad: confidentiality, integrity and availability');
  },
  'funding-ladder': (s) => {
    const steps = [['Savings', '$'], ['Friends', '$$'], ['Loans', '$$$'], ['Angels', '$$$$'], ['VC', '$$$$$']];
    const bars = steps.map(([name, money], i) => {
      const h = 34 + i * 26, x = 8 + i * 66, y = 170 - h;
      const on = i === s;
      return `<rect class="v-box${on ? ' on' : ''}${i < s ? ' past' : ''}" x="${x}" y="${y}" width="60" height="${h}" rx="10"/>
        <text class="v-label${on ? ' on' : ''}" x="${x + 30}" y="${y + 21}" text-anchor="middle">${money}</text>
        <text class="v-sub${on ? ' strong' : ''}" x="${x + 30}" y="188" text-anchor="middle">${name}</text>`;
    }).join('');
    return svgWrap(196, bars, 'Funding sources rising from personal savings up to venture capital');
  },
  'reformation-chain': (s) => vChain(['Protest', 'Politics', 'Response', 'Result'], s, 'The Reformation moving from protest to politics, the Catholic response and the result'),
  // stage 0 shows them all, then each stage lights up one state
  'empire-bars': (s) => {
    const START = 1400, END = 1800;
    const X = year => 78 + (Math.max(START, Math.min(END, year)) - START) / (END - START) * 254;
    const rows = [['Ottoman', 1400, 1800, 1], ['Safavid', 1501, 1736, 2], ['Mughal', 1526, 1800, 3], ['Ming', 1400, 1644, 4], ['Qing', 1644, 1800, 4], ['Russia', 1400, 1800, 5], ['Songhai', 1464, 1591, 6]];
    const lanes = [['Ottoman', 1], ['Safavid', 2], ['Mughal', 3], ['Ming / Qing', 4], ['Russia', 5], ['Songhai', 6]];
    const laneY = stage => 28 + (stage - 1) * 28;
    const bars = rows.map(([name, from, to, stage]) => {
      const on = s === stage;
      const x = X(from), w = X(to) - x;
      return `<rect class="v-box${on ? ' on' : ''}" x="${x}" y="${laneY(stage)}" width="${w}" height="20" rx="6"/>
        ${stage === 4 ? `<text class="v-sub${on ? ' on' : ''}" x="${x + w / 2}" y="${laneY(stage) + 14}" text-anchor="middle">${name}</text>` : ''}`;
    }).join('');
    const labels = lanes.map(([name, stage]) => `<text class="v-sub${s === stage ? ' strong' : ''}" x="72" y="${laneY(stage) + 14}" text-anchor="end">${name}</text>`).join('');
    const years = [1450, 1600, 1750].map(year => `<text class="v-sub" x="${X(year)}" y="16" text-anchor="middle">${year}</text>`).join('');
    return svgWrap(204, `<rect class="v-band" x="${X(1450)}" y="20" width="${X(1750) - X(1450)}" height="176" rx="6"/>${bars}${labels}${years}`, 'A timeline of the Ottoman, Safavid, Mughal, Ming, Qing, Russian and Songhai states from 1400 to 1800');
  },
  'risk-matrix': (s) => {
    const cells = [
      ['Reduce', 'often, but small', 66, 16],
      ['Avoid', 'often and severe', 202, 16],
      ['Retain', 'rare and small', 66, 96],
      ['Transfer', 'rare but severe', 202, 96]
    ];
    const order = [1, 0, 3, 2]; // teaching order: avoid, reduce, transfer, retain
    const boxes = cells.map(([name, sub, x, y], i) => vBox(x, y, 130, 72, name, order[s] === i, sub)).join('');
    return svgWrap(196, `${boxes}
      <text class="v-sub" x="16" y="56" text-anchor="middle" transform="rotate(-90 16 92)">how often it happens →</text>
      <text class="v-sub" x="198" y="186" text-anchor="middle">how bad it would be →</text>`, 'A risk grid of how often a loss happens against how bad it would be');
  }
};

/* ---------- break-even tool ---------- */
const BE_TARGET = 500;
function breakEvenChart(price, cost, fixed){
  const maxUnits = 2000, maxDollars = 80000;
  const margin = price - cost;
  const units = margin > 0 ? fixed / margin : Infinity;
  const X = u => 44 + (Math.min(u, maxUnits) / maxUnits) * 286;
  const Y = d => 170 - (Math.min(d, maxDollars) / maxDollars) * 160;
  const revenueEnd = Math.min(maxUnits, maxDollars / price);
  const costEnd = Math.min(maxUnits, (maxDollars - fixed) / cost);
  const point = units <= maxUnits && units * price <= maxDollars
    ? `<circle class="v-breakeven" cx="${X(units)}" cy="${Y(units * price)}" r="7"/>`
    : '';
  return `
    <line class="v-axis" x1="44" y1="170" x2="330" y2="170"/><line class="v-axis" x1="44" y1="10" x2="44" y2="170"/>
    <text class="v-sub" x="330" y="186" text-anchor="end">units sold</text>
    <text class="v-sub" x="40" y="18" text-anchor="end">$</text>
    <line class="v-fixed" x1="44" y1="${Y(fixed)}" x2="330" y2="${Y(fixed)}"/>
    <line class="v-cost" x1="44" y1="${Y(fixed)}" x2="${X(costEnd)}" y2="${Y(fixed + costEnd * cost)}"/>
    <line class="v-revenue" x1="44" y1="170" x2="${X(revenueEnd)}" y2="${Y(revenueEnd * price)}"/>
    ${point}`;
}
function breakEvenReadout(price, cost, fixed){
  const margin = price - cost;
  if(margin <= 0) return { units: Infinity, text: `<b>You lose money on every sale.</b> Price has to be above the $${cost} variable cost.` };
  const units = Math.ceil(fixed / margin);
  return { units, text: `Each sale leaves <b>$${margin}</b> toward fixed costs: $${fixed.toLocaleString()} ÷ $${margin} = <b>${units.toLocaleString()} units</b> to break even.` };
}
const WIDGETS = {
  'break-even': {
    init: () => ({ price: 30, cost: 18, fixed: 12000, ok: false }),
    render: (st) => {
      const sliders = [['price', 'Price', 20, 60, 1, '$'], ['cost', 'Variable cost per unit', 5, 30, 1, '$'], ['fixed', 'Monthly fixed costs', 4000, 20000, 500, '$']];
      const read = breakEvenReadout(st.price, st.cost, st.fixed);
      return `<svg class="lesson-visual" id="beChart" viewBox="0 0 340 192" role="img" aria-label="Revenue and total cost lines crossing at the break-even point">${breakEvenChart(st.price, st.cost, st.fixed)}</svg>
        <div class="be-legend"><span class="rev">revenue</span><span class="cst">total cost</span><span class="pt">break-even</span></div>
        <p class="be-readout" id="beReadout" aria-live="polite">${read.text}</p>
        ${sliders.map(([key, label, min, max, step, unit]) => `<label class="be-slider">
          <span><span>${label}</span><b id="be-${key}">${unit}${st[key].toLocaleString()}</b></span>
          <input type="range" data-be="${key}" min="${min}" max="${max}" step="${step}" value="${st[key]}">
        </label>`).join('')}`;
    }
  }
};

/* ---------- running a lesson ---------- */
function freshStepState(step, courseId){
  switch(step.type){
    case 'stages': return { s: 0 };
    case 'order': return { pool: shuffled(step.items.map((_, i) => i)), placed: [], wrongAt: null };
    case 'match': return { left: shuffled(step.pairs.map((_, i) => i)), right: shuffled(step.pairs.map((_, i) => i)), sel: null, done: [], miss: null };
    case 'sort': return { queue: shuffled(step.items.map((_, i) => i)), last: null };
    case 'q': return { order: shuffled([0, 1, 2, 3]), picked: null };
    case 'pick': return { order: shuffled(step.options.map((_, i) => i)), picked: null };
    case 'recall': return { text: '', checked: false, hits: [] };
    case 'widget': return WIDGETS[step.widget].init();
    default: return {};
  }
}
function startLesson(course, def){
  lesson = { courseId: course.id, def, i: 0, mistakes: 0, fresh: true, finished: false, st: freshStepState(def.steps[0], course.id) };
  renderStudy();
  scrollTo(0, 0);
}
const lessonText = (text) => escapeHtml(text).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

function stepCanContinue(step, st){
  switch(step.type){
    case 'stages': return st.s === step.stages.length - 1;
    case 'order': return st.placed.length === step.items.length && st.wrongAt === null && st.solved;
    case 'match': return st.done.length === step.pairs.length;
    case 'sort': return st.queue.length === 0;
    case 'q': return st.picked !== null;
    case 'pick': return st.picked !== null;
    case 'recall': return st.checked;
    case 'widget': return st.ok;
    default: return true;
  }
}

function renderStepBody(step, st){
  switch(step.type){
    case 'teach':
      return `${step.visual ? VISUALS[step.visual](step.stage || 0) : ''}
        ${step.image ? renderImage(courseById(lesson.courseId), step.image) : ''}
        <p class="lesson-body">${lessonText(step.body)}</p>`;
    case 'pick': {
      const opts = st.order.map(index => {
        const [text, isRight] = step.options[index];
        let state = '', mark = ICON.dot;
        if(st.picked !== null){
          if(isRight){ state = ' is-right'; mark = ICON.check; }
          else if(index === st.picked){ state = ' is-wrong'; mark = ICON.cross; }
          else state = ' is-dim';
        }
        return `<button class="quiz-option${state}" type="button" data-act="l-pick" data-option="${index}"${st.picked !== null ? ' disabled' : ''}><span class="option-mark">${mark}</span><span class="option-text">${escapeHtml(text)}</span></button>`;
      }).join('');
      return `${step.source ? renderSource(courseById(lesson.courseId), step.source) : ''}<div class="quiz-options">${opts}</div>`;
    }
    case 'recall': {
      if(!st.checked){
        return `<label class="write-field"><span class="sr-only">What you remember</span>
          <textarea class="write-area" id="recallText" rows="6" placeholder="Names, events, terms. Any order. Spelling doesn’t matter much.">${escapeHtml(st.text)}</textarea></label>
          <button class="stage-btn primary wide" type="button" data-act="l-recall">check what I remembered</button>`;
      }
      return `<p class="recall-count"><b>${st.hits.length}</b> of ${step.terms.length} key terms</p>
        <ul class="recall-terms">${step.terms.map(([label], index) => `<li class="${st.hits.includes(index) ? 'hit' : 'miss'}">${st.hits.includes(index) ? ICON.check : ICON.cross}<span>${escapeHtml(label)}</span></li>`).join('')}</ul>`;
    }
    case 'stages': {
      const stage = step.stages[st.s];
      return `${VISUALS[step.visual](st.s)}
        <div class="stage-text" aria-live="polite">
          <p class="stage-name">${escapeHtml(stage.name)}</p>
          <p class="lesson-body">${lessonText(stage.text)}</p>
        </div>
        <div class="stage-nav">
          <button class="stage-btn" type="button" data-act="l-stage" data-dir="-1"${st.s === 0 ? ' disabled' : ''}>back</button>
          <span class="stage-count">${st.s + 1} of ${step.stages.length}</span>
          <button class="stage-btn primary" type="button" data-act="l-stage" data-dir="1"${st.s === step.stages.length - 1 ? ' disabled' : ''}>next step</button>
        </div>`;
    }
    case 'order': {
      const slots = step.items.map((_, i) => {
        const item = st.placed[i];
        const state = st.solved ? ' right' : (st.wrongAt !== null && i === st.wrongAt ? ' wrong' : '');
        return item === undefined
          ? `<div class="order-slot empty"><span>${i + 1}</span></div>`
          : `<button class="order-slot${state}" type="button" data-act="l-unplace" data-pos="${i}"${st.solved ? ' disabled' : ''}><span>${i + 1}</span>${escapeHtml(step.items[item])}</button>`;
      }).join('');
      const left = st.pool.filter(i => !st.placed.includes(i));
      const full = st.placed.length === step.items.length;
      return `<div class="order-slots">${slots}</div>
        ${left.length ? `<div class="chip-pool">${left.map(i => `<button class="lesson-chip" type="button" data-act="l-place" data-item="${i}">${escapeHtml(step.items[i])}</button>`).join('')}</div>` : ''}
        ${full && !st.solved ? `<button class="stage-btn primary wide" type="button" data-act="l-check-order">check the order</button>` : ''}
        ${st.wrongAt !== null ? `<p class="lesson-hint bad">Step ${st.wrongAt + 1} is the first one out of place. Tap it to take it back.</p>` : ''}
`;
    }
    case 'match': {
      const col = (list, side) => list.map(i => {
        const isDone = st.done.includes(i);
        const selected = side === 'a' && st.sel === i;
        const miss = st.miss && st.miss[side] === i;
        return `<button class="match-card${isDone ? ' done' : ''}${selected ? ' selected' : ''}${miss ? ' miss' : ''}" type="button" data-act="l-match" data-side="${side}" data-item="${i}"${isDone ? ' disabled' : ''}>${escapeHtml(step.pairs[i][side === 'a' ? 0 : 1])}</button>`;
      }).join('');
      return `<div class="match-grid"><div>${col(st.left, 'a')}</div><div>${col(st.right, 'b')}</div></div>
        ${st.done.length === step.pairs.length ? '' : `<p class="lesson-hint">${st.sel === null ? 'Tap something on the left, then its match on the right.' : 'Now tap its match on the right.'}</p>`}`;
    }
    case 'sort': {
      const next = st.queue[0];
      const feedback = st.last ? `<p class="lesson-hint ${st.last.right ? 'good' : 'bad'}">${lessonText(st.last.text)}</p>` : '';
      if(next === undefined) return '<p class="sort-done">All sorted.</p>';
      return `<div class="sort-card" aria-live="polite">${escapeHtml(step.items[next][0])}</div>
        <div class="sort-buckets">${step.buckets.map((name, i) => `<button class="sort-bucket" type="button" data-act="l-sort" data-bucket="${i}">${escapeHtml(name)}</button>`).join('')}</div>
        <p class="sort-left">${st.queue.length} left</p>${feedback}`;
    }
    case 'q': {
      const item = ITEM_BY_KEY.get(`${lesson.courseId}:${step.ref}`);
      const opts = st.order.map(optionIndex => {
        let state = '', mark = ICON.dot;
        if(st.picked !== null){
          if(optionIndex === CORRECT_OPTION){ state = ' is-right'; mark = ICON.check; }
          else if(optionIndex === st.picked){ state = ' is-wrong'; mark = ICON.cross; }
          else state = ' is-dim';
        }
        return `<button class="quiz-option${state}" type="button" data-act="l-answer" data-option="${optionIndex}"${st.picked !== null ? ' disabled' : ''}><span class="option-mark">${mark}</span><span class="option-text">${escapeHtml(item.options[optionIndex])}</span></button>`;
      }).join('');
      return `${item.source ? renderSource(courseById(lesson.courseId), item.source) : ''}
        <p class="lesson-question">${escapeHtml(item.text)}</p>
        <div class="quiz-options">${opts}</div>`;
    }
    case 'widget':
      return `<p class="lesson-body">${lessonText(step.body)}</p>${WIDGETS[step.widget].render(st)}
        <p class="lesson-hint ${st.ok ? 'good' : ''}" id="widgetHint">${st.ok ? lessonText(step.done) : lessonText(step.goal)}</p>`;
    default:
      return '';
  }
}
const STEP_KICKER = { order: 'put it in order', match: 'match them up', sort: 'sort them', q: 'your turn', pick: 'your turn', recall: 'from memory', widget: 'try it', stages: 'step through it', teach: 'learn' };

// answering or finishing an activity brings up the result sheet; reading steps keep the plain button
function lessonSheet(step, st){
  if(!st.sheet) return '';
  const last = lesson.i === lesson.def.steps.length - 1;
  const label = last ? 'finish lesson' : 'continue';
  const why = step.type === 'q'
    ? escapeHtml(ITEM_BY_KEY.get(`${lesson.courseId}:${step.ref}`).why)
    : step.type === 'pick'
      ? lessonText(step.options[st.picked][2] || '')
      : lessonText(step.why || (st.last && st.last.text) || '');
  return resultSheet({
    good: st.sheet.good,
    title: st.sheet.title,
    chips: lesson.combo >= 2 ? [`${lesson.combo} in a row`] : [],
    why,
    enter: !!lesson.fx,
    action: `<button class="study-btn ${st.sheet.good ? 'gold' : 'solid'} wide" type="button" data-act="l-next">${label}</button>`
  });
}
const READING_STEPS = ['teach', 'stages'];
function renderLesson(){
  if(lesson.finished){ streakBar.set(0); renderLessonDone(); return; }
  const { def, i, st } = lesson;
  const step = def.steps[i];
  const can = stepCanContinue(step, st);
  const last = i === def.steps.length - 1;
  const sheet = lessonSheet(step, st);
  studyView.innerHTML = `
    <div class="lesson-screen">
      <div class="quiz-head">
        <button class="icon-btn end-session" type="button" data-act="l-exit" aria-label="leave this lesson">${ICON.close}</button>
        <div class="train-progress-bar" role="progressbar" aria-label="lesson progress" aria-valuemin="0" aria-valuemax="${def.steps.length}" aria-valuenow="${i}"><div class="train-progress-fill" style="width:${pct((i + (can ? 1 : 0)) / def.steps.length)}"></div></div>
      </div>
      <div class="lesson-card${lesson.fresh ? ' enter' : ''}">
        ${READING_STEPS.includes(step.type) ? '<img class="lesson-danno" src="danno/peek.png" width="300" height="500" alt="">' : ''}
        <p class="quiz-tag">${escapeHtml(STEP_KICKER[step.type])}</p>
        ${step.title ? `<h3 class="lesson-title">${escapeHtml(step.title)}</h3>` : ''}
        ${step.prompt ? `<p class="lesson-prompt">${lessonText(step.prompt)}</p>` : ''}
        ${renderStepBody(step, st)}
      </div>
      ${sheet || `<button class="study-btn gold wide lesson-next" type="button" data-act="l-next"${can ? '' : ' disabled'}>${last ? 'finish lesson' : 'continue'}</button>`}
    </div>`;
  lesson.fresh = false;
  streakBar.set(lesson.combo || 0, lesson);
  playLessonFx();
}
// each action leaves a note of what should react, and it plays once the screen is redrawn
function playLessonFx(){
  const fx = lesson.fx;
  lesson.fx = null;
  if(!fx) return;
  (fx.pop || []).forEach(selector => popEl(studyView.querySelector(selector)));
  if(fx.burst) burstAt(studyView.querySelector(fx.burst));
  if(fx.shake) shakeEl(studyView.querySelector(fx.shake));
  if(fx.slide) slideIn(studyView.querySelector(fx.slide.selector), fx.slide.dir);
  if(fx.stagger) staggerIn(studyView.querySelectorAll(fx.stagger));
  if(fx.answer) playAnswerFx(fx.answer.good, lesson.combo);
}
function renderLessonDone(){
  const course = courseById(lesson.courseId);
  const clean = lesson.mistakes === 0;
  studyView.innerHTML = `
    <div class="lesson-done">
      <img class="done-danno" src="danno/${clean ? 'stand' : lesson.mistakes > 3 ? 'knees' : 'peek'}.png" width="300" height="500" alt="">
      <p class="study-kicker">lesson complete</p>
      <h2 class="study-title">${escapeHtml(lesson.def.title)}</h2>
      <div class="done-stats">
        <div><b>${study.streak.count}</b><span>day streak</span></div>
        <div><b>${clean ? 'none' : lesson.mistakes}</b><span>${lesson.mistakes === 1 ? 'mistake' : 'mistakes'}</span></div>
      </div>
      <button class="study-btn gold wide" type="button" data-act="l-exit" data-course="${escapeHtml(course.id)}">back to the path</button>
    </div>`;
  if(motionAllowed()){
    const danno = studyView.querySelector('.done-danno');
    confetti(clean ? 70 : 40);
    burstAt(danno);
    danno.animate(
      [{ transform: 'translateY(30px) scale(.8)', opacity: 0 }, { transform: 'translateY(-12px) scale(1.04)', opacity: 1, offset: .6 }, { transform: 'none', opacity: 1 }],
      { duration: 520, easing: 'cubic-bezier(.22,1,.36,1)' }
    ).onfinish = () => hopDanno(danno, 3);
    studyView.querySelectorAll('.done-stats > div').forEach((stat, index) => {
      stat.animate([{ transform: 'translateY(16px) scale(.9)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 380, delay: 220 + index * 110, easing: 'cubic-bezier(.34,1.56,.64,1)', fill: 'backwards' });
    });
  }
}

/* ---------- lesson input ---------- */
function lessonAction(el){
  const step = lesson.def.steps[lesson.i];
  const st = lesson.st;
  switch(el.dataset.act){
    case 'l-exit': {
      const courseId = lesson.courseId;
      const track = lesson.def.track;
      if(lesson.finished && !track) pathHopFrom = lesson.def.id;
      lesson = null;
      showScreen({ name: 'course', courseId, tab: track || 'learn' }, 'back');
      return;
    }
    case 'l-next': {
      if(lesson.leaving) return;
      lesson.leaving = true;
      leaveThen(() => {
        if(!lesson) return;
        lesson.leaving = false;
        if(lesson.i === lesson.def.steps.length - 1){ finishLesson(); return; }
        lesson.i++;
        lesson.st = freshStepState(lesson.def.steps[lesson.i], lesson.courseId);
        lesson.fresh = true;
        renderLesson();
        scrollTo(0, 0);
      });
      return;
    }
    case 'l-stage': st.s += Number(el.dataset.dir); lesson.fx = { slide: { selector: '.stage-text', dir: Number(el.dataset.dir) } }; break;
    case 'l-place': st.placed.push(Number(el.dataset.item)); st.wrongAt = null; lesson.fx = { pop: [`.order-slots > :nth-child(${st.placed.length})`] }; break;
    case 'l-unplace': st.placed.splice(Number(el.dataset.pos), 1); st.wrongAt = null; lesson.fx = { pop: ['.chip-pool'] }; break;
    case 'l-check-order': {
      const wrong = st.placed.findIndex((item, pos) => item !== pos);
      if(wrong === -1){ st.solved = true; st.wrongAt = null; }
      else{
        st.wrongAt = wrong;
        lesson.mistakes++;
        lesson.combo = 0;
        lesson.fx = { shake: '.order-slot.wrong' };
      }
      break;
    }
    case 'l-match': {
      const item = Number(el.dataset.item);
      if(el.dataset.side === 'a'){ st.sel = item; st.miss = null; lesson.fx = { pop: ['.match-card.selected'] }; break; }
      if(st.sel === null){ shakeEl(studyView.querySelector('.match-grid > div:first-child')); return; }
      if(st.sel === item){
        st.done.push(item);
        st.sel = null;
        st.miss = null;
        const pair = side => `.match-card[data-side="${side}"][data-item="${item}"]`;
        lesson.fx = { pop: [pair('a'), pair('b')], burst: pair('b') };
      }else{
        st.miss = { a: st.sel, b: item };
        st.sel = null;
        lesson.mistakes++;
        lesson.combo = 0;
        lesson.fx = { shake: '.match-card.miss[data-side="b"]' };
      }
      break;
    }
    case 'l-sort': {
      const current = st.queue[0];
      const [text, bucket, note] = step.items[current];
      const right = Number(el.dataset.bucket) === bucket;
      if(right){
        st.queue.shift();
        lesson.fx = { pop: ['.sort-card'], burst: `.sort-bucket[data-bucket="${el.dataset.bucket}"]` };
      }else{
        lesson.mistakes++;
        lesson.combo = 0;
        lesson.fx = { shake: '.sort-card' };
      }
      st.last = { right, text: right ? (note || `Yes: **${step.buckets[bucket]}**.`) : `Not quite. "${text}" doesn't belong there. Try the other one.` };
      break;
    }
    case 'l-pick': {
      if(st.picked !== null) return;
      st.picked = Number(el.dataset.option);
      const right = !!step.options[st.picked][1];
      if(right){
        lesson.combo = (lesson.combo || 0) + 1;
        markStudied();
      }else{
        lesson.mistakes++;
        lesson.combo = 0;
      }
      st.sheet = { good: right, title: pickOne(right ? PRAISE : ENCOURAGE) };
      lesson.fx = { answer: { good: right } };
      saveStudy();
      break;
    }
    case 'l-recall': {
      if(st.checked) return;
      const text = normalizeAnswer(st.text);
      if(wordCount(text) === 0){ showToast('type anything you remember first'); shakeEl(document.getElementById('recallText')); return; }
      st.hits = step.terms.flatMap(([, ...terms], index) => (termsFound(text, terms).length ? [index] : []));
      st.checked = true;
      const good = st.hits.length >= step.min;
      // remembering less than you hoped isn't a mistake: it's what shows you what to study
      lesson.combo = good ? (lesson.combo || 0) + 1 : 0;
      st.sheet = { good, title: good ? pickOne(PRAISE) : 'now you know what to study' };
      lesson.fx = { answer: { good }, stagger: '.recall-terms li' };
      markStudied();
      saveStudy();
      break;
    }
    case 'l-answer': {
      if(st.picked !== null) return;
      st.picked = Number(el.dataset.option);
      const right = st.picked === CORRECT_OPTION;
      recordAnswer(`${lesson.courseId}:${step.ref}`, right);
      if(right){
        lesson.combo = (lesson.combo || 0) + 1;
        markStudied();
      }else{
        lesson.mistakes++;
        lesson.combo = 0;
      }
      st.sheet = { good: right, title: pickOne(right ? PRAISE : ENCOURAGE) };
      lesson.fx = { answer: { good: right } };
      saveStudy();
      break;
    }
  }
  // finishing an activity counts toward the streak and gets the full reaction
  if(['order', 'match', 'sort'].includes(step.type) && !st.sheet && stepCanContinue(step, st)){
    lesson.combo = (lesson.combo || 0) + 1;
    st.sheet = { good: true, title: pickOne(PRAISE) };
    lesson.fx = { ...(lesson.fx || {}), answer: { good: true } };
  }
  renderLesson();
}
function finishLesson(){
  const { def } = lesson;
  study.lessons[def.id] = { done: true, at: Date.now(), mistakes: lesson.mistakes };
  markStudied();
  saveStudy();
  lesson.finished = true;
  renderLesson();
  scrollTo(0, 0);
}

// sliders update in place: re-rendering would drop the thumb out from under your finger
studyView.addEventListener('input', (e) => {
  if(e.target.id === 'recallText' && lesson){ lesson.st.text = e.target.value; return; }
  const key = e.target.dataset.be;
  if(!key || !lesson) return;
  const step = lesson.def.steps[lesson.i];
  const st = lesson.st;
  st[key] = Number(e.target.value);
  document.getElementById('be-' + key).textContent = `$${st[key].toLocaleString()}`;
  document.getElementById('beChart').innerHTML = breakEvenChart(st.price, st.cost, st.fixed);
  const read = breakEvenReadout(st.price, st.cost, st.fixed);
  document.getElementById('beReadout').innerHTML = read.text;
  if(!st.ok && read.units <= BE_TARGET){
    st.ok = true;
    const hint = document.getElementById('widgetHint');
    hint.innerHTML = lessonText(step.done);
    hint.classList.add('good');
    burstAt(hint);
    confetti(26);
    studyView.querySelector('.lesson-next').disabled = false;
    studyView.querySelector('.train-progress-fill').style.width = pct((lesson.i + 1) / lesson.def.steps.length);
  }
});

/* ---------- reactions: what a right or wrong answer feels like ---------- */
// Practice and lessons respond to every answer; mock tests stay silent like the real thing.
// Everything checks prefers-reduced-motion itself because script animations ignore the
// global CSS rule, and the sheet's words and colors still say the same thing without motion.
const motionAllowed = () => !matchMedia('(prefers-reduced-motion: reduce)').matches;
const PRAISE = ['nice!', 'you got it!', 'exactly!', 'sharp!', 'that’s it!', 'nailed it!', '잘했어!', '좋아!'];
const ENCOURAGE = ['so close', 'almost', 'good try', 'not this time'];
const COMBO_CONFETTI = 3;
const pickOne = (list) => list[Math.floor(Math.random() * list.length)];

function resultSheet({ good, title, chips = [], why, action, extra = '', enter }){
  return `<div class="result-sheet ${good ? 'good' : 'bad'}${enter ? ' enter' : ''}" role="status">
    <img class="sheet-danno" src="danno/${good ? 'stand' : 'knees'}.png" width="300" height="500" alt="">
    <p class="sheet-title">${good ? ICON.check : ICON.cross}<span>${escapeHtml(title)}</span></p>
    ${chips.length ? `<p class="sheet-chips">${chips.map(chip => `<span>${escapeHtml(chip)}</span>`).join('')}</p>` : ''}
    ${why ? `<p class="sheet-why">${why}</p>` : ''}
    ${extra}
    ${action}
  </div>`;
}
function burstAt(el, duration = 900){
  if(!el || !motionAllowed()) return;
  const rect = el.getBoundingClientRect();
  const layer = buildRateLayer(rect.left + rect.width / 2, rect.top + rect.height / 2);
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), duration);
}
function popEl(el, peak = 1.06){
  if(!el || !motionAllowed()) return;
  el.animate(
    [{ transform: 'scale(.97)' }, { transform: `scale(${peak})`, offset: .45 }, { transform: 'scale(1)' }],
    { duration: 340, easing: 'cubic-bezier(.34,1.56,.64,1)' }
  );
}
function shakeEl(el){
  if(!el || !motionAllowed()) return;
  el.animate(
    [{ transform: 'translateX(0)' }, { transform: 'translateX(-7px)', offset: .2 }, { transform: 'translateX(6px)', offset: .45 }, { transform: 'translateX(-3px)', offset: .7 }, { transform: 'translateX(0)' }],
    { duration: 340, easing: 'ease-out' }
  );
}
function hopDanno(el, hops = 2){
  if(!el || !motionAllowed()) return;
  const frames = [{ transform: 'translateY(0) scale(1.08,.9)' }];
  for(let i = 0; i < hops; i++){
    frames.push({ transform: `translateY(${-30 + i * 10}px) scale(.96,1.06)` });
    frames.push({ transform: 'translateY(0) scale(1.08,.9)' });
  }
  frames.push({ transform: 'translateY(0) scale(1,1)' });
  el.animate(frames, { duration: 300 * hops + 120, easing: 'ease-in-out' });
}
function confetti(pieces = 34){
  if(!motionAllowed()) return;
  const layer = document.createElement('div');
  layer.className = 'confetti-layer';
  layer.setAttribute('aria-hidden', 'true');
  const colors = ['var(--gold)', '#2FC79A', '#FFFFFF', '#8FD3FF', '#FF9AA2'];
  for(let i = 0; i < pieces; i++){
    const bit = document.createElement('i');
    bit.style.left = `${Math.random() * 100}%`;
    bit.style.background = colors[i % colors.length];
    layer.appendChild(bit);
    const drift = (Math.random() - .5) * 120;
    bit.animate(
      [{ transform: 'translate(0,-20px) rotate(0deg)', opacity: 1 }, { opacity: 1, offset: .75 }, { transform: `translate(${drift}px, ${innerHeight * (.55 + Math.random() * .45)}px) rotate(${420 + Math.random() * 500}deg)`, opacity: 0 }],
      { duration: 1000 + Math.random() * 700, delay: Math.random() * 180, easing: 'cubic-bezier(.2,.6,.5,1)', fill: 'both' }
    );
  }
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 2000);
}
// plays once, right after the answer's screen has been drawn
function playAnswerFx(good, combo){
  if(!motionAllowed()) return;
  const danno = studyView.querySelector('.sheet-danno');
  if(good){
    const option = studyView.querySelector('.quiz-option.is-right');
    popEl(option);
    burstAt(option ? option.querySelector('.option-mark') : studyView.querySelector('.sheet-title'));
    hopDanno(danno, combo >= COMBO_CONFETTI ? 3 : 2);
    const fill = studyView.querySelector('.train-progress-fill');
    if(fill) fill.animate([{ filter: 'brightness(1)' }, { filter: 'brightness(1.5)', offset: .4 }, { filter: 'brightness(1)' }], { duration: 600 });
    if(combo >= COMBO_CONFETTI) confetti(combo >= 5 ? 48 : 30);
  }else{
    shakeEl(studyView.querySelector('.quiz-option.is-wrong'));
    if(danno) danno.animate([{ transform: 'translateY(-10px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }], { duration: 360, easing: 'ease-out' });
  }
}
// the old card leaves before the next one arrives, so moving on feels like progress
function leaveThen(next){
  const parts = studyView.querySelectorAll('.quiz-card, .lesson-card, .result-sheet');
  if(!motionAllowed() || !parts.length){ next(); return; }
  parts.forEach(part => part.animate(
    [{ transform: 'translateX(0)', opacity: 1 }, { transform: 'translateX(-36px)', opacity: 0 }],
    { duration: 130, easing: 'ease-in', fill: 'forwards' }
  ));
  setTimeout(next, 120);
}

/* ---------- the path comes alive ---------- */
let pathHopFrom = null; // the lesson just finished, so Danno can hop onward from it
function afterPathRender(){
  const from = pathHopFrom;
  pathHopFrom = null;
  requestAnimationFrame(() => {
    const danno = studyView.querySelector('.path-danno');
    const target = danno && danno.closest('.path-stop');
    if(target) target.scrollIntoView({ block: 'center' });
    if(!from || !danno || !motionAllowed()) return;
    const node = studyView.querySelector(`.path-node[data-lesson="${from}"]`);
    if(!node) return;
    const a = node.getBoundingClientRect(), b = danno.getBoundingClientRect();
    const dx = a.left + a.width / 2 - (b.left + b.width / 2);
    const dy = a.top - b.bottom + 10;
    popEl(node, 1.16);
    burstAt(node);
    danno.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(1.08,.9)` },
        { transform: `translate(${dx}px, ${dy}px) scale(1.08,.9)`, offset: .35 },
        { transform: `translate(${dx / 2}px, ${dy / 2 - 56}px) scale(.96,1.06)`, offset: .68 },
        { transform: 'translate(0,0) scale(1.1,.88)', offset: .92 },
        { transform: 'translate(0,0) scale(1,1)' }
      ],
      { duration: 950, easing: 'ease-in-out' }
    );
    const road = studyView.querySelector('.path-line .road-done');
    if(road) road.animate([{ opacity: .4 }, { opacity: 1 }], { duration: 900 });
  });
}

/* ---------- results that feel earned ---------- */
function resultMood(percent){
  if(percent >= 90) return { pose: 'stand', line: 'that was seriously good', big: true };
  if(percent >= 70) return { pose: 'stand', line: 'strong work', big: true };
  if(percent >= 40) return { pose: 'peek', line: 'getting there. the misses below are your next points', big: false };
  return { pose: 'knees', line: 'tough one, and that’s how it sticks. look through the misses below', big: false };
}
function playResultsFx(percent){
  const score = studyView.querySelector('.results-score');
  const danno = studyView.querySelector('.results-danno');
  const motion = motionAllowed();
  if(!motion || !score) return;
  const started = performance.now();
  const count = (now) => {
    const t = Math.min(1, (now - started) / 750);
    const eased = 1 - Math.pow(1 - t, 3);
    score.textContent = `${Math.round(percent * eased)}%`;
    if(t < 1 && score.isConnected) requestAnimationFrame(count);
  };
  requestAnimationFrame(count);
  studyView.querySelectorAll('.study-meter i').forEach((bar, i) => {
    bar.animate([{ width: 0 }, { width: bar.style.width }], { duration: 650, delay: 120 + i * 70, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
  });
  if(percent >= 70){
    hopDanno(danno, 3);
    confetti(percent >= 90 ? 60 : 36);
  }else if(danno){
    danno.animate([{ transform: 'translateY(16px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }], { duration: 420, easing: 'ease-out' });
  }
}
