/* ===================== storage ===================== */
const STORAGE_KEY = 'koWordLog.v1';

function loadEntries(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){ return []; }
}
function saveEntries(entries){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}
let entries = loadEntries();
migrateSrs();

function migrateSrs(){
  let changed = false;
  entries.forEach(e => {
    if(!e.srs){
      e.srs = { box: 0, dueAt: e.createdAt || Date.now(), correct: 0, wrong: 0 };
      changed = true;
    }
  });
  if(changed) saveEntries(entries);
}

/* ===================== settings ===================== */
const SETTINGS_KEY = 'koWordLog.settings.v1';
const DEFAULT_SETTINGS = {theme:'auto', sort:'fading', dailyGoal:10, gifApiKey:'', krdictApiKey:'', examples:true};
function loadSettings(){
  try{
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? {...DEFAULT_SETTINGS, ...JSON.parse(raw)} : {...DEFAULT_SETTINGS};
  }catch(e){ return {...DEFAULT_SETTINGS}; }
}
function saveSettings(){ localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }
let settings = loadSettings();

function applyTheme(){
  let actual = settings.theme;
  if(actual === 'auto'){
    actual = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', actual);
}
applyTheme();
if(window.matchMedia){
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if(settings.theme === 'auto') applyTheme();
  });
}

/* ===================== hangul detection ===================== */
function hasHangul(str){
  return /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7A3]/.test(str);
}

/* ===================== romanization (Revised Romanization, simplified) ===================== */
const ONSETS = ['g','kk','n','d','tt','r','m','b','pp','s','ss','','j','jj','ch','k','t','p','h'];
const VOWELS = ['a','ae','ya','yae','eo','e','yeo','ye','o','wa','wae','oe','yo','u','wo','we','wi','yu','eu','ui','i'];
const FINALS = ['','k','k','k','n','n','n','t','l','k','m','l','l','l','p','l','m','p','p','t','t','ng','t','t','k','t','p','t'];
// finals that can "link" onto a following null-onset syllable as a fresh onset sound
const LINK_ONSET = {1:'g',2:'kk',4:'n',7:'d',8:'r',16:'m',17:'b',19:'s',20:'ss',22:'j',23:'ch',24:'k',25:'t',26:'p',27:'h'};

function decompose(codePoint){
  const base = codePoint - 0xAC00;
  if(base < 0 || base > 11171) return null;
  const final = base % 28;
  const medial = ((base - final) / 28) % 21;
  const initial = Math.floor((base - final) / 28 / 21);
  return {initial, medial, final};
}

function romanize(str){
  const chars = Array.from(str);
  const syll = chars.map(c => {
    const d = decompose(c.codePointAt(0));
    return d ? {...d, char: c, hangul: true} : {char: c, hangul: false};
  });

  let out = '';
  let pendingLinkOnset = null;

  for(let i = 0; i < syll.length; i++){
    const s = syll[i];
    if(!s.hangul){
      out += s.char;
      pendingLinkOnset = null;
      continue;
    }

    let onsetStr;
    if(pendingLinkOnset !== null){
      onsetStr = pendingLinkOnset;
    }else{
      onsetStr = ONSETS[s.initial];
    }
    pendingLinkOnset = null;

    out += onsetStr + VOWELS[s.medial];

    if(s.final !== 0){
      const next = syll[i+1];
      if(next && next.hangul && next.initial === 11 && (LINK_ONSET[s.final] || s.final === 21)){
        pendingLinkOnset = (s.final === 21) ? 'ng' : LINK_ONSET[s.final];
      }else{
        out += FINALS[s.final];
      }
    }
  }
  return out;
}

/* ===================== auto categorization ===================== */
const CATEGORIES = ['greetings','food & drink','travel','numbers','time','family','emotions','questions','shopping','work & study','other'];

const CATEGORY_KEYWORDS = {
  'greetings': ['hello','hi','bye','goodbye','nice to meet','good morning','good night','see you','thanks','thank you','sorry','excuse me','welcome'],
  'food & drink': ['eat','food','drink','water','rice','coffee','tea','restaurant','delicious','hungry','thirsty','meal','soup','meat','fruit','menu'],
  'travel': ['airport','train','bus','ticket','hotel','taxi','subway','directions','map','left','right','straight','station','flight','passport','luggage'],
  'numbers': ['one','two','three','four','five','six','seven','eight','nine','ten','number','count','age','how many','how much'],
  'time': ['today','tomorrow','yesterday','morning','afternoon','evening','night','hour','minute','week','month','year','time','o\'clock','now','later'],
  'family': ['mother','father','sister','brother','family','parents','grandmother','grandfather','son','daughter','husband','wife','friend'],
  'emotions': ['happy','sad','angry','tired','excited','scared','love','hate','miss you','worried','nervous','bored','proud','feel'],
  'questions': ['what','where','who','why','how','when','which','can you','do you','is it','are you'],
  'shopping': ['buy','price','money','store','cash','discount','expensive','cheap','pay','receipt','size','clothes'],
  'work & study': ['work','job','study','school','homework','meeting','office','class','test','exam','teacher','student','project']
};

// word-boundary matching, not substring — plain .includes() was matching
// "one" inside "money" and miscategorizing it as numbers instead of shopping
const CATEGORY_PATTERNS = Object.fromEntries(
  Object.entries(CATEGORY_KEYWORDS).map(([cat, words]) => {
    const escaped = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    return [cat, new RegExp('\\b(' + escaped.join('|') + ')\\b', 'gi')];
  })
);

function autoCategorize(meaningText){
  if(!meaningText) return 'other';
  let bestCat = 'other';
  let bestScore = 0;
  for(const [cat, pattern] of Object.entries(CATEGORY_PATTERNS)){
    const matches = meaningText.match(pattern);
    const score = matches ? matches.length : 0;
    if(score > bestScore){
      bestScore = score;
      bestCat = cat;
    }
  }
  return bestCat;
}

/* ===================== translation (best-effort, client-side, no key) ===================== */
async function translate(text, from, to){
  try{
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
    const res = await fetch(url);
    if(!res.ok) return null;
    const data = await res.json();
    const t = data?.responseData?.translatedText;
    if(!t || /invalid|error/i.test(t)) return null;
    return t;
  }catch(e){ return null; }
}

/* ===================== DOM refs ===================== */
const phraseInput   = document.getElementById('phraseInput');
const addBtn         = document.getElementById('addBtn');
const statusHint     = document.getElementById('statusHint');
const manualRow      = document.getElementById('manualRow');
const meaningInput   = document.getElementById('meaningInput');
const koreanInput    = document.getElementById('koreanInput');
const romInput       = document.getElementById('romInput');
const chipsBar       = document.getElementById('categoryChips');
const searchInput    = document.getElementById('searchInput');
const logList        = document.getElementById('logList');
const emptyState     = document.getElementById('emptyState');
const toastEl        = document.getElementById('toast');

let activeCategory = 'all';
let searchTerm = '';
let selectMode = false;
let selectedIds = new Set();

const shareToggleBtn = document.getElementById('shareToggleBtn');
const selectBar       = document.getElementById('selectBar');
const selectAllBtn    = document.getElementById('selectAllBtn');
const selectCount     = document.getElementById('selectCount');
const cancelSelectBtn = document.getElementById('cancelSelectBtn');
const shareSelectedBtn= document.getElementById('shareSelectedBtn');

/* ===================== toast ===================== */
let toastTimer;
function showToast(msg, duration){
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), duration || 2200);
}

/* ===================== chips ===================== */
// the first chip cycles the sort order (fading first is the point of the app); the rest filter
const SORT_CYCLE  = ['fading', 'newest', 'az'];
const SORT_LABELS = { fading: 'fading first', newest: 'newest', oldest: 'oldest', az: '가나다', category: 'by category' };
function renderChips(){
  const counts = {};
  entries.forEach(e => counts[e.category] = (counts[e.category]||0) + 1);
  const cats = ['all', ...CATEGORIES.filter(c => counts[c])];
  chipsBar.innerHTML = '';

  const sortChip = document.createElement('button');
  sortChip.type = 'button';
  sortChip.className = 'chip active';
  sortChip.setAttribute('aria-label', `sorted by ${SORT_LABELS[settings.sort] || settings.sort}, tap to change`);
  sortChip.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M4 7h16M7 12h10M10 17h4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none"/></svg>${escapeHtml(SORT_LABELS[settings.sort] || settings.sort)}`;
  sortChip.addEventListener('click', () => {
    const i = SORT_CYCLE.indexOf(settings.sort);
    settings.sort = SORT_CYCLE[(i + 1) % SORT_CYCLE.length];
    saveSettings();
    renderChips();
    renderLog();
  });
  chipsBar.appendChild(sortChip);

  cats.forEach(cat => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip' + (cat === activeCategory && cat !== 'all' ? ' active' : '');
    chip.setAttribute('aria-pressed', String(cat === activeCategory));
    chip.textContent = cat === 'all' ? `all · ${entries.length}` : `${cat} · ${counts[cat]}`;
    chip.addEventListener('click', () => { activeCategory = cat; renderChips(); renderLog(); });
    chipsBar.appendChild(chip);
  });
}

/* ===================== render log ===================== */
function renderLog(){
  const filtered = entries.filter(e => {
    const matchesCat = activeCategory === 'all' || e.category === activeCategory;
    const s = searchTerm.toLowerCase();
    const matchesSearch = !s || e.korean.toLowerCase().includes(s) || e.romanized.toLowerCase().includes(s) || e.meaning.toLowerCase().includes(s);
    return matchesCat && matchesSearch;
  }).sort((a,b) => {
    switch(settings.sort){
      case 'fading':   return fadingOrder(a, b);
      case 'oldest':   return a.createdAt - b.createdAt;
      case 'az':       return a.korean.localeCompare(b.korean, 'ko');
      case 'category': return a.category.localeCompare(b.category) || (b.createdAt - a.createdAt);
      case 'newest':
      default:         return b.createdAt - a.createdAt;
    }
  });

  logList.innerHTML = '';
  logList.classList.toggle('has-select-bar', selectMode);

  if(entries.length === 0){
    logList.appendChild(emptyState);
    return;
  }
  if(filtered.length === 0){
    const div = document.createElement('div');
    div.className = 'empty-state';
    div.innerHTML = '<p>no matches</p><span>try a different search or category</span>';
    logList.appendChild(div);
    return;
  }

  filtered.forEach(entry => logList.appendChild(buildEntryCard(entry)));
}

/* ===================== memory strength ===================== */
// the box an entry sits in (0–5) is how well you know it; the cards, banner and training
// all show it so the log reads as "what am I about to forget", not just a list
const DAY_MS = 86400000;
function strengthOf(entry){ return entry.srs ? entry.srs.box : 0; }
function hasBeenReviewed(entry){ return !!entry.srs && (entry.srs.correct + entry.srs.wrong) > 0; }
function isDue(entry){ return !!entry.srs && entry.srs.dueAt <= Date.now(); }
// due words first (weakest, then most overdue), then everything else by when it comes back
function fadingOrder(a, b){
  const da = isDue(a), db = isDue(b);
  if(da !== db) return da ? -1 : 1;
  if(da){
    const ra = hasBeenReviewed(a), rb = hasBeenReviewed(b);
    if(ra !== rb) return ra ? -1 : 1;
    return (strengthOf(a) - strengthOf(b)) || (a.srs.dueAt - b.srs.dueAt);
  }
  return a.srs.dueAt - b.srs.dueAt;
}
function daysText(ms, prefix){
  const days = Math.max(1, Math.round(ms / DAY_MS));
  return days === 1 ? `${prefix} tomorrow` : `${prefix} in ${days} days`;
}
// { text, kind } for the little status next to the dots
function statusOf(entry){
  if(!hasBeenReviewed(entry)) return { text: 'new', kind: 'new' };
  if(isDue(entry)) return { text: 'fading', kind: 'fading' };
  return { text: daysText(entry.srs.dueAt - Date.now(), 'back'), kind: 'later' };
}
function strengthDots(entry){
  const n = strengthOf(entry);
  return Array.from({ length: MAX_BOX }, (_, i) => `<i${i < n ? ' class="on"' : ''}></i>`).join('');
}
function strengthLabel(entry){ return `memory strength ${strengthOf(entry)} of ${MAX_BOX}`; }

function buildEntryCard(entry){
  const card = document.createElement('article');
  card.className = 'entry' + (selectMode ? ' select-mode' : '');
  card.dataset.id = entry.id;

  const checkedClass = selectedIds.has(entry.id) ? ' checked' : '';
  const checkboxHtml = selectMode ? `
      <div class="entry-check${checkedClass}" data-check role="checkbox" aria-checked="${selectedIds.has(entry.id)}" tabindex="0" aria-label="select ${escapeHtml(entry.korean)}">
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M4 12l5 5L20 6" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>` : '';
  const status = statusOf(entry);

  card.innerHTML = `
    <div class="entry-top">
      ${checkboxHtml}
      <div class="entry-main">
        <p class="ko-text" lang="ko">${escapeHtml(entry.korean)}</p>
        <p class="rom-text">${escapeHtml(entry.romanized)}</p>
        <p class="meaning-text">${escapeHtml(entry.meaning)}</p>
      </div>
      ${selectMode ? '' : `<button class="listen-btn" type="button" aria-label="listen to ${escapeHtml(entry.korean)}">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>
      </button>`}
    </div>
    <div class="entry-foot">
      <div class="strength" role="img" aria-label="${strengthLabel(entry)}">${strengthDots(entry)}</div>
      <span class="status ${status.kind}">${status.text}</span>
      <span class="cat-text">${escapeHtml(entry.category)}</span>
      ${selectMode ? '' : `<button class="more-btn" type="button" aria-haspopup="menu" aria-expanded="false" aria-label="more actions for ${escapeHtml(entry.korean)}">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>
      </button>`}
    </div>
  `;

  if(selectMode){
    const toggle = () => toggleSelect(entry.id);
    card.querySelector('[data-check]').addEventListener('click', toggle);
    card.querySelector('[data-check]').addEventListener('keydown', (e) => { if(e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); toggle(); } });
    card.querySelector('.entry-main').addEventListener('click', toggle);
  }else{
    const listenBtn = card.querySelector('.listen-btn');
    listenBtn.addEventListener('click', () => speak(entry.korean, listenBtn));
    card.querySelector('.more-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleEntryMenu(card, entry);
    });
  }

  return card;
}

// one small menu at a time; closes on outside tap or Escape
let openMenu = null;
function closeEntryMenu(){
  if(!openMenu) return;
  openMenu.menu.remove();
  openMenu.btn.setAttribute('aria-expanded', 'false');
  openMenu = null;
}
function toggleEntryMenu(card, entry){
  const btn = card.querySelector('.more-btn');
  if(openMenu && openMenu.card === card){ closeEntryMenu(); return; }
  closeEntryMenu();
  const menu = document.createElement('div');
  menu.className = 'entry-menu';
  menu.setAttribute('role', 'menu');
  menu.innerHTML = `
    <button type="button" role="menuitem" class="menu-edit">
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linejoin="round"/></svg>
      edit
    </button>
    <button type="button" role="menuitem" class="menu-del">
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m-8 0l1 13h8l1-13" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
      delete
    </button>`;
  menu.querySelector('.menu-edit').addEventListener('click', () => { closeEntryMenu(); enterEditMode(card, entry); });
  menu.querySelector('.menu-del').addEventListener('click', () => {
    closeEntryMenu();
    card.classList.add('removing');
    card.addEventListener('animationend', () => deleteEntry(entry.id), { once: true });
  });
  card.appendChild(menu);
  btn.setAttribute('aria-expanded', 'true');
  openMenu = { card, menu, btn };
  menu.querySelector('button').focus();
}
document.addEventListener('click', (e) => { if(openMenu && !openMenu.menu.contains(e.target)) closeEntryMenu(); });
document.addEventListener('keydown', (e) => { if(e.key === 'Escape' && openMenu){ const b = openMenu.btn; closeEntryMenu(); b.focus(); } });

function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

/* ===================== edit mode ===================== */
function enterEditMode(card, entry){
  card.classList.add('editing');
  const catOptions = CATEGORIES.map(c => `<option value="${c}" ${c===entry.category?'selected':''}>${c}</option>`).join('');
  card.innerHTML = `
    <input type="text" class="ko" lang="ko" value="${escapeHtml(entry.korean)}" data-field="korean" placeholder="한국어" aria-label="korean">
    <input type="text" value="${escapeHtml(entry.romanized)}" data-field="romanized" placeholder="romanization" aria-label="romanization">
    <input type="text" value="${escapeHtml(entry.meaning)}" data-field="meaning" placeholder="meaning" aria-label="meaning">
    <select class="cat-select" data-field="category" aria-label="category">${catOptions}</select>
    <div class="edit-actions">
      <button class="cancel-btn" type="button">cancel</button>
      <button class="save-btn" type="button">save</button>
    </div>
  `;
  card.querySelector('.cancel-btn').addEventListener('click', () => renderLog());
  card.querySelector('.save-btn').addEventListener('click', () => {
    entry.korean    = card.querySelector('[data-field="korean"]').value.trim() || entry.korean;
    entry.romanized = card.querySelector('[data-field="romanized"]').value.trim();
    entry.meaning   = card.querySelector('[data-field="meaning"]').value.trim();
    entry.category  = card.querySelector('[data-field="category"]').value;
    saveEntries(entries);
    renderChips();
    renderLog();
    showToast('saved');
  });
}

/* ===================== delete ===================== */
function deleteEntry(id){
  entries = entries.filter(e => e.id !== id);
  saveEntries(entries);
  renderChips();
  renderLog();
  updateDueDot();
  showToast('deleted');
}

/* ===================== speech ===================== */
// Three browser quirks shape this:
// - With no Korean voice, an English voice "reads" hangul as silence and reports success,
//   so that case has to be caught up front and explained.
// - Chrome can drop a speak() made right after cancel() and sit on speaking=true forever,
//   so when something is playing we wait a beat, and retry once if it never starts.
// - The utterance must stay referenced or Chrome can garbage-collect it mid-word.
const SPEAK_SETTLE_MS = 150;
const SPEAK_START_TIMEOUT_MS = 3000;
let speakToken = 0;
let activeUtter = null;
let speakingBtn = null;
function setSpeakingBtn(btn){
  if(speakingBtn) speakingBtn.classList.remove('speaking');
  speakingBtn = btn || null;
  if(speakingBtn) speakingBtn.classList.add('speaking');
}
function koreanVoice(voices){
  const lang = v => v.lang.toLowerCase().replace('_', '-');
  return voices.find(v => lang(v) === 'ko-kr') || voices.find(v => lang(v).startsWith('ko'));
}
function speak(text, btn){
  if(!('speechSynthesis' in window)){
    showToast('speech not supported on this device');
    return;
  }
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();
  const koVoice = koreanVoice(voices);
  // an empty list only means voices haven't loaded yet: asking by lang can still work
  if(voices.length && !koVoice){
    showToast('no korean voice here. add one in your device’s speech settings');
    return;
  }

  const token = ++speakToken;
  setSpeakingBtn(btn);
  const wasBusy = synth.speaking || synth.pending;
  synth.cancel();

  const attempt = (isRetry) => {
    if(token !== speakToken) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'ko-KR';
    utter.rate = 0.85;
    if(koVoice) utter.voice = koVoice;
    activeUtter = utter;
    let started = false;
    utter.onstart = () => { started = true; };
    utter.onend = () => { if(token === speakToken) setSpeakingBtn(null); };
    utter.onerror = (e) => {
      started = true; // settled: the watchdog has nothing left to do
      if(token !== speakToken) return;
      setSpeakingBtn(null);
      // interrupted/canceled are just us replacing the word with a newer tap
      if(e.error === 'interrupted' || e.error === 'canceled') return;
      showToast(e.error === 'not-allowed' ? 'tap again to hear it' : 'couldn’t play that. check your connection');
    };
    synth.resume(); // Chrome can leave the queue paused
    synth.speak(utter);
    setTimeout(() => {
      if(started || token !== speakToken) return;
      synth.cancel();
      if(!isRetry){ setTimeout(() => attempt(true), SPEAK_SETTLE_MS); return; }
      setSpeakingBtn(null);
      showToast('the voice isn’t responding. check your connection');
    }, SPEAK_START_TIMEOUT_MS);
  };
  // no timeout when idle: iOS only allows speech directly inside the tap
  if(wasBusy) setTimeout(() => attempt(false), SPEAK_SETTLE_MS);
  else attempt(false);
}
// warm up voice list (some browsers load async)
if('speechSynthesis' in window){
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}

/* ===================== add flow ===================== */
addBtn.addEventListener('click', handleAdd);
phraseInput.addEventListener('keydown', e => { if(e.key === 'Enter') handleAdd(); });

async function handleAdd(){
  const raw = phraseInput.value.trim();
  if(!raw){ flashHint('type something first', true); return; }

  addBtn.disabled = true;
  addBtn.classList.add('loading');
  flashHint('working on it…');

  let korean, romanized, meaning;

  if(hasHangul(raw)){
    korean = raw;
    romanized = romanize(raw);
    meaning = await translate(raw, 'ko', 'en');
    if(!meaning || hasHangul(meaning)){
      meaning = '';
      flashHint('couldn\'t auto-translate — add the meaning below', true);
      openManualRow(korean, romanized, '');
      addBtn.disabled = false;
      addBtn.classList.remove('loading');
      return;
    }
  }else{
    meaning = raw;
    const koTranslated = await translate(raw, 'en', 'ko');
    if(!koTranslated || !hasHangul(koTranslated)){
      flashHint('couldn\'t auto-translate — fill in korean below', true);
      openManualRow('', '', meaning);
      addBtn.disabled = false;
      addBtn.classList.remove('loading');
      return;
    }
    korean = koTranslated;
    romanized = romanize(korean);
  }

  commitEntry(korean, romanized, meaning);
  addBtn.disabled = false;
  addBtn.classList.remove('loading');
}

function openManualRow(korean, rom, meaning){
  manualRow.hidden = false;
  koreanInput.value = korean;
  romInput.value = rom;
  meaningInput.value = meaning;
  const target = korean ? meaningInput : koreanInput;
  target.focus();

  // swap add button to a one-time confirm for manual entry
  addBtn.onclick = () => {
    const k = koreanInput.value.trim();
    const r = romInput.value.trim() || romanize(k);
    const m = meaningInput.value.trim();
    if(!k || !m){ flashHint('need both korean and meaning', true); return; }
    commitEntry(k, r, m);
    manualRow.hidden = true;
    koreanInput.value = ''; romInput.value = ''; meaningInput.value = '';
    addBtn.onclick = handleAdd;
  };
}

function commitEntry(korean, romanized, meaning, originEl){
  const before = captureLogPositions();
  meaning = meaning.trim().replace(/[,，]+$/, ''); // the translator can leave a trailing comma ("Hi,")
  const category = autoCategorize(meaning);
  const entry = {
    id: Date.now() + '-' + Math.random().toString(36).slice(2,7),
    korean, romanized, meaning, category,
    createdAt: Date.now(),
    srs: { box: 0, dueAt: Date.now(), correct: 0, wrong: 0 }
  };
  entries.push(entry);
  saveEntries(entries);
  phraseInput.value = '';
  manualRow.hidden = true;
  flashHint(`added to ${category}`, false, true);
  // the new word has to be visible to land, so a filter or search that would hide it gives way
  if(activeCategory !== 'all' && activeCategory !== category) activeCategory = 'all';
  if(searchTerm){ searchTerm = ''; searchInput.value = ''; }
  renderChips();
  renderLog();
  updateDueDot();
  landEntry(entry, originEl || phraseInput.closest('.field-row'), before);
}

function flashHint(msg, isError, isOk){
  statusHint.textContent = msg;
  statusHint.classList.toggle('error', !!isError);
  statusHint.classList.toggle('ok', !!isOk);
}

/* ===================== search ===================== */
searchInput.addEventListener('input', e => {
  searchTerm = e.target.value;
  renderLog();
});

/* ===================== select & share ===================== */
function toggleSelect(id){
  if(selectedIds.has(id)) selectedIds.delete(id);
  else selectedIds.add(id);
  updateSelectBar();
  renderLog();
}

function updateSelectBar(){
  const n = selectedIds.size;
  selectCount.textContent = `${n} selected`;
  shareSelectedBtn.disabled = n === 0;
  selectAllBtn.textContent = (n === entries.length && n > 0) ? 'deselect all' : 'select all';
}

function enterSelectMode(){
  selectMode = true;
  selectedIds.clear();
  shareToggleBtn.classList.add('active');
  selectBar.hidden = false;
  updateSelectBar();
  renderLog();
}

function exitSelectMode(){
  selectMode = false;
  selectedIds.clear();
  shareToggleBtn.classList.remove('active');
  selectBar.hidden = true;
  renderLog();
}

shareToggleBtn.addEventListener('click', () => {
  if(entries.length === 0){ showToast('nothing to share yet'); return; }
  closeSettings();
  switchTab('log');
  selectMode ? exitSelectMode() : enterSelectMode();
});

cancelSelectBtn.addEventListener('click', exitSelectMode);

selectAllBtn.addEventListener('click', () => {
  if(selectedIds.size === entries.length){
    selectedIds.clear();
  }else{
    entries.forEach(e => selectedIds.add(e.id));
  }
  updateSelectBar();
  renderLog();
});

shareSelectedBtn.addEventListener('click', shareSelected);

function buildExportText(list){
  const lines = list.map(e => `${e.korean}  (${e.romanized})\n${e.meaning}  —  ${e.category}`);
  const header = `단어장 — ${list.length} word${list.length === 1 ? '' : 's'} — ${new Date().toLocaleDateString()}`;
  return `${header}\n\n${lines.join('\n\n')}`;
}

async function shareSelected(){
  const list = entries
    .filter(e => selectedIds.has(e.id))
    .sort((a,b) => a.createdAt - b.createdAt);
  if(list.length === 0) return;

  const text = buildExportText(list);
  const fileName = `korean-words-${new Date().toISOString().slice(0,10)}.txt`;
  const file = new File([text], fileName, {type: 'text/plain'});

  try{
    if(navigator.canShare && navigator.canShare({files: [file]})){
      await navigator.share({files: [file], title: '단어장', text: `${list.length} words from my korean log`});
    }else if(navigator.share){
      await navigator.share({title: '단어장', text});
    }else{
      await navigator.clipboard.writeText(text);
      showToast('share not supported — copied to clipboard instead');
    }
    exitSelectMode();
  }catch(err){
    if(err.name !== 'AbortError'){
      try{
        await navigator.clipboard.writeText(text);
        showToast('share failed — copied to clipboard instead');
      }catch(_){
        showToast('couldn\'t share or copy');
      }
    }
  }
}

/* ===================== refresh for updates ===================== */
// an installed app can keep serving old files from the browser cache, so refetch the page
// and its scripts past the cache, clear any cached copies, then reload. localStorage
// (the words) is left alone
const refreshAppBtn = document.getElementById('refreshAppBtn');

refreshAppBtn.addEventListener('click', async () => {
  refreshAppBtn.disabled = true;
  refreshAppBtn.textContent = 'refreshing…';
  try{
    if('serviceWorker' in navigator){
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
    }
    if('caches' in window){
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }
    const urls = [location.pathname, ...[...document.querySelectorAll('script[src], link[rel="stylesheet"]')]
      .map(el => el.src || el.href).filter(u => u.startsWith(location.origin))];
    await Promise.all(urls.map(u => fetch(u, { cache: 'reload' }).catch(() => {})));
  }catch{}
  location.reload();
});

/* ===================== full backup export / import ===================== */
const exportBackupBtn = document.getElementById('exportBackupBtn');
const importBackupBtn = document.getElementById('importBackupBtn');
const importFileInput = document.getElementById('importFileInput');

exportBackupBtn.addEventListener('click', () => {
  if(entries.length === 0 && !studyHasData()){ showToast('nothing to back up yet'); return; }
  const payload = {
    app: 'koWordLog',
    version: 1,
    exportedAt: new Date().toISOString(),
    entries,
    study: studyBackupData()
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `word-log-backup-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast('backup downloaded — save it somewhere safe');
});

importBackupBtn.addEventListener('click', () => importFileInput.click());

importFileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if(!file) return;
  try{
    const text = await file.text();
    const data = JSON.parse(text);
    const incoming = Array.isArray(data) ? data : data.entries;
    if(!Array.isArray(incoming)) throw new Error('bad format');

    const valid = incoming.filter(x => x && x.korean && x.id);
    if(valid.length === 0 && !data.study) throw new Error('no valid entries');
    if(data.study) mergeStudyBackup(data.study);
    if(valid.length === 0){ showToast('restored your study progress'); return; }

    const existingIds = new Set(entries.map(e => e.id));
    const merged = incoming.some(x => x.id && existingIds.has(x.id)) && entries.length > 0
      ? confirm(`found ${valid.length} entries in this backup. merge with your current ${entries.length}? cancel to replace everything instead.`)
      : true;

    if(merged){
      valid.forEach(v => { if(!existingIds.has(v.id)) entries.push(v); });
    }else{
      entries = valid;
    }

    saveEntries(entries);
    migrateSrs();
    renderChips();
    renderLog();
    updateDueDot();
    showToast(`restored ${valid.length} entries`);
  }catch(err){
    showToast('couldn\'t read that file — is it a word log backup?');
  }finally{
    importFileInput.value = '';
  }
});

/* ===================== settings modal ===================== */
const settingsBtn      = document.getElementById('settingsBtn');
const settingsOverlay  = document.getElementById('settingsOverlay');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const themeSegment     = document.getElementById('themeSegment');
const sortSegment      = document.getElementById('sortSegment');
const goalSegment      = document.getElementById('goalSegment');
const clearAllBtn      = document.getElementById('clearAllBtn');
const gifKeyInput      = document.getElementById('gifKeyInput');
const gifKeyStatus     = document.getElementById('gifKeyStatus');
const krdictKeyInput   = document.getElementById('krdictKeyInput');
const krdictKeyStatus  = document.getElementById('krdictKeyStatus');
const examplesSwitch   = document.getElementById('examplesSwitch');

function renderGifKeyStatus(){
  const key = settings.gifApiKey;
  if(!key){
    gifKeyStatus.innerHTML = 'shows a gif on answers. needs a free <a href="https://klipy.com/developers" target="_blank" rel="noopener">Klipy key</a>';
    gifKeyStatus.classList.remove('warn');
    return;
  }
  // mobile autocorrect/autocapitalize can silently swap characters for
  // similar-looking ones (e.g. Cyrillic В for B) — a real key should be plain ASCII.
  const looksMangled = /[^\x20-\x7E]/.test(key);
  gifKeyStatus.textContent = looksMangled
    ? 'this key has odd characters. your keyboard may have changed it, so re-paste it'
    : 'on. key saved on this device';
  gifKeyStatus.classList.toggle('warn', looksMangled);
}

function renderKrdictKeyStatus(){
  const key = settings.krdictApiKey;
  if(!key){
    krdictKeyStatus.innerHTML = 'from Tatoeba. add a <a href="https://krdict.korean.go.kr/eng/openApi/openApiRegister" target="_blank" rel="noopener">KRDict key</a> as a backup';
    krdictKeyStatus.classList.remove('warn');
    return;
  }
  const looksMangled = /[^\x20-\x7E]/.test(key);
  krdictKeyStatus.textContent = looksMangled
    ? 'this key has odd characters. your keyboard may have changed it, so re-paste it'
    : 'from Tatoeba, with KRDict as a backup';
  krdictKeyStatus.classList.toggle('warn', looksMangled);
}

function openSettings(){
  settingsOverlay.hidden = false;
  settingsBtn.classList.add('active');
  syncSegment(themeSegment, settings.theme);
  syncSegment(sortSegment, settings.sort);
  syncSegment(goalSegment, String(settings.dailyGoal));
  gifKeyInput.value = settings.gifApiKey || '';
  renderGifKeyStatus();
  krdictKeyInput.value = settings.krdictApiKey || '';
  renderKrdictKeyStatus();
  examplesSwitch.setAttribute('aria-checked', String(settings.examples !== false));
}
function closeSettings(){
  settingsOverlay.hidden = true;
  settingsBtn.classList.remove('active');
}
function syncSegment(segEl, value){
  segEl.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.val === value));
}

settingsBtn.addEventListener('click', openSettings);
closeSettingsBtn.addEventListener('click', closeSettings);
settingsOverlay.addEventListener('click', (e) => { if(e.target === settingsOverlay) closeSettings(); });

themeSegment.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-val]');
  if(!btn) return;
  settings.theme = btn.dataset.val;
  saveSettings();
  applyTheme();
  syncSegment(themeSegment, settings.theme);
});

sortSegment.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-val]');
  if(!btn) return;
  settings.sort = btn.dataset.val;
  saveSettings();
  syncSegment(sortSegment, settings.sort);
  renderChips();
  renderLog();
});

goalSegment.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-val]');
  if(!btn) return;
  settings.dailyGoal = parseInt(btn.dataset.val, 10);
  saveSettings();
  syncSegment(goalSegment, String(settings.dailyGoal));
  renderDaily();
});

gifKeyInput.addEventListener('input', () => {
  settings.gifApiKey = gifKeyInput.value.trim();
  saveSettings();
  renderGifKeyStatus();
});

examplesSwitch.addEventListener('click', () => {
  settings.examples = settings.examples === false;
  saveSettings();
  examplesSwitch.setAttribute('aria-checked', String(settings.examples));
});

krdictKeyInput.addEventListener('input', () => {
  settings.krdictApiKey = krdictKeyInput.value.trim();
  saveSettings();
  renderKrdictKeyStatus();
});

clearAllBtn.addEventListener('click', () => {
  if(entries.length === 0){ showToast('already empty'); return; }
  const ok = confirm(`delete all ${entries.length} words? this can't be undone unless you have a backup file.`);
  if(!ok) return;
  entries = [];
  saveEntries(entries);
  renderChips();
  renderLog();
  updateDueDot();
  closeSettings();
  showToast('everything cleared');
});

/* ===================== tabs ===================== */
const tabLogBtn   = document.getElementById('tabLogBtn');
const tabTrainBtn = document.getElementById('tabTrainBtn');
const logView     = document.getElementById('logView');
const trainView   = document.getElementById('trainView');
const dueDot      = document.getElementById('dueDot');
const appEl       = document.getElementById('app');
const fadeBanner  = document.getElementById('fadeBanner');
const fadeTitle   = document.getElementById('fadeTitle');
const fadeSub     = document.getElementById('fadeSub');
const fadeReviewBtn = document.getElementById('fadeReviewBtn');

function switchTab(tab){
  const isLog = tab === 'log';
  leaveStudy();
  logView.hidden = !isLog;
  trainView.hidden = isLog;
  tabLogBtn.classList.toggle('active', isLog);
  tabTrainBtn.classList.toggle('active', !isLog);
  tabLogBtn.setAttribute('aria-current', isLog ? 'page' : 'false');
  tabTrainBtn.setAttribute('aria-current', isLog ? 'false' : 'page');
  appEl.classList.remove('in-session');
  if(!isLog) resetTrainSetupView();
}
tabLogBtn.addEventListener('click', () => switchTab('log'));
tabTrainBtn.addEventListener('click', () => switchTab('train'));

function countDue(){
  const now = Date.now();
  return entries.filter(e => e.srs && e.srs.dueAt <= now).length;
}
function updateDueDot(){
  dueDot.hidden = countDue() === 0;
  renderFadeBanner();
}
// "3 words are fading" with danno curled up and a one-tap review; hidden when nothing's due
function renderFadeBanner(){
  const due = entries.filter(isDue);
  fadeBanner.hidden = due.length === 0;
  if(!due.length) return;
  const fading = due.filter(hasBeenReviewed).length;
  const n = due.length;
  if(fading){
    fadeTitle.textContent = `${n} ${n === 1 ? 'word is' : 'words are'} fading`;
    fadeSub.textContent = 'catch them before they slip';
  }else{
    fadeTitle.textContent = `${n} new ${n === 1 ? 'word' : 'words'} to try`;
    fadeSub.textContent = 'see if they stuck';
  }
  fadeReviewBtn.textContent = `review ${n}`;
}
fadeReviewBtn.addEventListener('click', () => { switchTab('train'); startSession(); });

/* ===================== spaced repetition ===================== */
// grading here is self-reported (you know best whether you got it) rather than
// string-matched — free-form answers have too many valid phrasings to auto-grade fairly.
const BOX_INTERVALS = [0, 86400000, 3*86400000, 7*86400000, 16*86400000, 30*86400000];
const MAX_BOX = BOX_INTERVALS.length - 1;

function applySrsRating(entry, rating){
  entry.srs = entry.srs || { box:0, dueAt: Date.now(), correct:0, wrong:0 };
  const now = Date.now();
  if(rating === 'wrong'){
    entry.srs.box = 0;
    entry.srs.dueAt = now;
    entry.srs.wrong++;
  }else{
    entry.srs.box = Math.min(entry.srs.box + 1, MAX_BOX);
    entry.srs.dueAt = now + BOX_INTERVALS[entry.srs.box];
    entry.srs.correct++;
  }
}

/* ===================== streak ===================== */
const STREAK_KEY = 'koWordLog.streak.v1';
const streakCountEl = document.getElementById('streakCount');
const streakBtn     = document.getElementById('streakBtn');
const dailyRing     = document.getElementById('dailyRing');
const RING_LENGTH   = 2 * Math.PI * 15;
function loadStreak(){
  try{
    const raw = localStorage.getItem(STREAK_KEY);
    return raw ? JSON.parse(raw) : { count: 0, lastDate: null };
  }catch(e){ return { count: 0, lastDate: null }; }
}
function saveStreak(){ localStorage.setItem(STREAK_KEY, JSON.stringify(streak)); }
let streak = loadStreak();

function todayStr(){ return new Date().toISOString().slice(0,10); }
function yesterdayStr(){
  const d = new Date(); d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0,10);
}
function bumpStreak(){
  const today = todayStr();
  if(streak.lastDate === today) return;
  streak.count = (streak.lastDate === yesterdayStr()) ? streak.count + 1 : 1;
  streak.lastDate = today;
  saveStreak();
  renderStreak();
}
function renderStreak(){
  // if the streak's last active day isn't today or yesterday, it's effectively broken — show 0
  const today = todayStr();
  const display = (streak.lastDate === today || streak.lastDate === yesterdayStr()) ? streak.count : 0;
  streakCountEl.textContent = display;
  streakBtn.classList.toggle('cold', display === 0);
  renderStreakLabel();
}
function renderStreakLabel(){
  const goal = settings.dailyGoal || 10;
  streakBtn.setAttribute('aria-label', `${streakCountEl.textContent}-day streak, ${daily.count} of ${goal} reviews today`);
}

/* ===================== daily goal progress ===================== */
const DAILY_KEY = 'koWordLog.daily.v1';
function loadDaily(){
  try{
    const raw = localStorage.getItem(DAILY_KEY);
    const d = raw ? JSON.parse(raw) : { date: todayStr(), count: 0 };
    if(d.date !== todayStr()) return { date: todayStr(), count: 0 };
    return d;
  }catch(e){ return { date: todayStr(), count: 0 }; }
}
function saveDaily(){ localStorage.setItem(DAILY_KEY, JSON.stringify(daily)); }
let daily = loadDaily();
function bumpDaily(){
  if(daily.date !== todayStr()) daily = { date: todayStr(), count: 0 };
  daily.count++;
  saveDaily();
  renderDaily();
}
function renderDaily(){
  const goal = settings.dailyGoal || 10;
  const filled = Math.min(1, daily.count / goal) * RING_LENGTH;
  dailyRing.setAttribute('stroke-dasharray', `${filled.toFixed(2)} ${RING_LENGTH.toFixed(2)}`);
  renderStreakLabel();
}

/* ===================== word gifs (klipy) ===================== */
// Tenor's API was fully shut down by Google on 2026-06-30, so this uses Klipy's
// native GIF Search endpoint (per docs.klipy.com/getting-started):
// api.klipy.com/api/v1/{app_key}/gifs/search?q=&customer_id=&page=&per_page=
// The exact response field names aren't fully confirmed, so instead of hardcoding
// one guessed path, we walk the JSON and grab the first thing that looks like an
// image/video URL — resilient to whatever the real shape turns out to be.
function findMediaUrl(node){
  if(!node) return null;
  if(typeof node === 'string'){
    return /^https?:\/\/\S+\.(gif|webp|mp4)(\?\S*)?$/i.test(node) ? node : null;
  }
  if(Array.isArray(node)){
    for(const item of node){
      const found = findMediaUrl(item);
      if(found) return found;
    }
    return null;
  }
  if(typeof node === 'object'){
    if(typeof node.url === 'string' && findMediaUrl(node.url)) return node.url;
    for(const key of Object.keys(node)){
      const found = findMediaUrl(node[key]);
      if(found) return found;
    }
  }
  return null;
}

function debugGifIssue(msg, detail){
  console.warn(`[word gif] ${msg}`, detail ?? '');
  showToast(`gif debug: ${msg}`, 8000);
}

// a stable per-device id — klipy's docs require customer_id on the search
// endpoint even for a single-user personal app like this one.
function getGifCustomerId(){
  let id = localStorage.getItem('koWordLog.gifCustomerId');
  if(!id){
    id = 'wl-' + Math.random().toString(36).slice(2, 12);
    localStorage.setItem('koWordLog.gifCustomerId', id);
  }
  return id;
}

async function fetchWordGif(query){
  if(!settings.gifApiKey || !query) return null;
  const params = new URLSearchParams({ q: query, page: '1', per_page: '8', customer_id: getGifCustomerId() });
  const url = `https://api.klipy.com/api/v1/${encodeURIComponent(settings.gifApiKey)}/gifs/search?${params}`;
  try{
    const res = await fetch(url);
    if(!res.ok){
      const body = await res.text().catch(() => '');
      debugGifIssue(`${res.status}: ${body.slice(0, 160) || '(empty body)'}`, body);
      return null;
    }
    const data = await res.json();
    const results = data?.data?.data || data?.data || data?.results || [];
    for(const item of Array.isArray(results) ? results : []){
      const found = findMediaUrl(item.media_formats || item.file || item.files || item.media || item);
      if(found) return found;
    }
    debugGifIssue('no usable url found in response', data);
    return null;
  }catch(e){
    debugGifIssue('fetch threw (likely CORS or network)', e.message || e);
    return null;
  }
}

/* ===================== example sentences (tatoeba + krdict) ===================== */
// Tatoeba is tried first: no key needed, and it returns a matched KO/EN pair
// directly (docs.tatoeba.org — the old api_v0 is deprecated, this uses the
// current api.tatoeba.org/unstable/sentences endpoint, CORS-open).
// KRDict is the fallback: its example search only returns Korean text (no
// per-example translation field exists in its schema), so we run that Korean
// sentence through the same translate() helper used for word entries.
async function fetchTatoebaExample(word){
  const params = new URLSearchParams({ lang: 'kor', q: word, sort: 'relevance', limit: '8' });
  params.set('trans:lang', 'eng');
  const url = `https://api.tatoeba.org/unstable/sentences?${params}`;
  try{
    const res = await fetch(url);
    if(!res.ok) return null;
    const data = await res.json();
    const items = Array.isArray(data?.data) ? data.data : [];
    for(const item of items){
      const ko = item?.text;
      if(!ko || findWord(ko, word) === -1) continue;
      const tr = (item.translations || []).find(t => t.lang === 'eng' && t.text);
      if(tr) return { ko, en: tr.text };
    }
    return null;
  }catch(e){
    console.warn('[example] tatoeba fetch failed', e.message || e);
    return null;
  }
}

async function fetchKrdictExample(word){
  if(!settings.krdictApiKey) return null;
  const params = new URLSearchParams({ key: settings.krdictApiKey, q: word, part: 'exam', method: 'exact', num: '5' });
  const url = `https://krdict.korean.go.kr/api/search?${params}`;
  try{
    const res = await fetch(url);
    if(!res.ok) return null;
    const xmlText = await res.text();
    const xml = new DOMParser().parseFromString(xmlText, 'application/xml');
    if(xml.querySelector('parsererror')) return null;
    if(xml.getElementsByTagName('error').length){
      console.warn('[example] krdict error', xml.getElementsByTagName('message')[0]?.textContent);
      return null;
    }
    const exampleEls = xml.getElementsByTagName('example');
    for(const el of exampleEls){
      const ko = el.textContent && el.textContent.trim();
      if(ko){
        const en = await translate(ko, 'ko', 'en');
        return { ko, en: en || '' };
      }
    }
    return null;
  }catch(e){
    console.warn('[example] krdict fetch failed', e.message || e);
    return null;
  }
}

async function fetchExampleSentence(word){
  if(!word || settings.examples === false) return null;
  const fromTatoeba = await fetchTatoebaExample(word);
  if(fromTatoeba) return fromTatoeba;
  return fetchKrdictExample(word);
}

// where `word` appears in a korean sentence as a word of its own, or -1. one- and two-syllable
// words hide inside longer ones (물 in 물러서), so for those the match must start at a word
// boundary and end at one too, optionally after a particle (물을, 물이, 물도...)
const KO_PARTICLES = '을|를|이|가|은|는|도|에|에서|의|로|으로|와|과|만|요|이요|하고|랑|이랑|처럼|보다';
function findWord(text, word){
  const w = (word || '').replace(/[?.!,\s]+$/, '');
  if(!w) return -1;
  if(w.length >= 3) return text.indexOf(w);
  const esc = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(^|[^\uAC00-\uD7A3])${esc}(?=$|[^\uAC00-\uD7A3]|(?:${KO_PARTICLES})(?:$|[^\uAC00-\uD7A3]))`);
  const m = re.exec(text);
  return m ? m.index + m[1].length : -1;
}

function highlightSpan(text, needle){
  if(!needle) return escapeHtml(text || '');
  const idx = findWord(text, needle);
  const len = (needle || '').replace(/[?.!,\s]+$/, '').length;
  if(idx === -1) return escapeHtml(text);
  return escapeHtml(text.slice(0, idx)) + '<mark>' + escapeHtml(text.slice(idx, idx + len)) + '</mark>' + escapeHtml(text.slice(idx + len));
}

function highlightEnglish(text, meaning){
  if(!meaning) return escapeHtml(text || '');
  const lower = text.toLowerCase();
  const meaningLower = meaning.toLowerCase().trim();
  let idx = lower.indexOf(meaningLower);
  let len = meaningLower.length;
  if(idx === -1){
    const firstWord = meaningLower.split(/\s+/)[0].replace(/[^a-z]/g, '');
    idx = firstWord ? lower.indexOf(firstWord) : -1;
    len = firstWord ? firstWord.length : 0;
  }
  if(idx === -1) return escapeHtml(text);
  return escapeHtml(text.slice(0, idx)) + '<mark>' + escapeHtml(text.slice(idx, idx + len)) + '</mark>' + escapeHtml(text.slice(idx + len));
}

/* ===================== training session ===================== */
const trainSetup       = document.getElementById('trainSetup');
const trainSessionEl   = document.getElementById('trainSession');
const trainSummaryEl   = document.getElementById('trainSummary');
const trainLead        = document.getElementById('trainLead');
const trainSub         = document.getElementById('trainSub');
const dirSegment       = document.getElementById('dirSegment');
const sizeSegment      = document.getElementById('sizeSegment');
const startTrainBtn    = document.getElementById('startTrainBtn');
const trainProgressFill= document.getElementById('trainProgressFill');
const trainProgressText= document.getElementById('trainProgressText');
const shuffleBtn       = document.getElementById('shuffleBtn');
const flashCard        = document.getElementById('flashCard');
const flashTag         = document.getElementById('flashTag');
const flashPrompt      = document.getElementById('flashPrompt');
const flashSub         = document.getElementById('flashSub');
const flashReveal      = document.getElementById('flashReveal');
const revealAnswer     = document.getElementById('revealAnswer');
const revealNote       = document.getElementById('revealNote');
const answerGif        = document.getElementById('answerGif');
const answerGifImg     = document.getElementById('answerGifImg');
const answerExample    = document.getElementById('answerExample');
const exampleKo        = document.getElementById('exampleKo');
const exampleEn        = document.getElementById('exampleEn');
const hintBtn          = document.getElementById('hintBtn');
const flashStrength    = document.getElementById('flashStrength');
const revealLabel      = document.getElementById('revealLabel');
const wrongSub         = document.getElementById('wrongSub');
const correctSub       = document.getElementById('correctSub');
const endSessionBtn    = document.getElementById('endSessionBtn');
const trainProgress    = document.getElementById('trainProgress');
const summaryList      = document.getElementById('summaryList');
const trainAnswerForm  = document.getElementById('trainAnswerForm');
const trainAnswerInput = document.getElementById('trainAnswerInput');
const ratingRow        = document.getElementById('ratingRow');
const summaryHeadline  = document.getElementById('summaryHeadline');
const summarySub       = document.getElementById('summarySub');
const backToLogBtn     = document.getElementById('backToLogBtn');
const trainAgainBtn    = document.getElementById('trainAgainBtn');

let trainPrefs = { dir: 'mixed', size: '10', shuffle: false };
let session = null; // { queue:[{id,direction}], index, tally:{correct,wrong}, total, requeued }

function resetTrainSetupView(){
  trainSetup.hidden = false;
  trainSessionEl.hidden = true;
  trainSummaryEl.hidden = true;
  const due = countDue();
  appEl.classList.remove('in-session');
  trainLead.textContent = entries.length === 0 ? 'nothing to train yet' : due ? `${due} ${due === 1 ? 'word' : 'words'} to review` : 'all caught up';
  trainSub.textContent = entries.length === 0
    ? 'add a few words first'
    : due ? `${entries.length} words in your log` : 'nothing is fading. practice anyway?';
  startTrainBtn.disabled = entries.length === 0;
}

dirSegment.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-val]');
  if(!btn) return;
  trainPrefs.dir = btn.dataset.val;
  syncSegment(dirSegment, btn.dataset.val);
});
sizeSegment.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-val]');
  if(!btn) return;
  trainPrefs.size = btn.dataset.val;
  syncSegment(sizeSegment, btn.dataset.val);
});
shuffleBtn.addEventListener('click', () => {
  trainPrefs.shuffle = !trainPrefs.shuffle;
  shuffleBtn.setAttribute('aria-pressed', String(trainPrefs.shuffle));
});
startTrainBtn.addEventListener('click', () => {
  if(entries.length === 0) return;
  startSession();
});

function buildSessionQueue(size){
  const now = Date.now();
  const due  = entries.filter(e => e.srs.dueAt <= now).sort((a,b) => a.srs.dueAt - b.srs.dueAt);
  const rest = entries.filter(e => e.srs.dueAt > now).sort((a,b) => a.srs.dueAt - b.srs.dueAt);
  let pool = due.concat(rest);
  if(size !== 'all') pool = pool.slice(0, Math.min(parseInt(size, 10), pool.length));
  if(trainPrefs.shuffle){
    for(let i = pool.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
  }
  return pool.map(e => ({ id: e.id, direction: pickDirection() }));
}
function pickDirection(){
  if(trainPrefs.dir === 'mixed') return Math.random() < 0.5 ? 'ko-en' : 'en-ko';
  return trainPrefs.dir;
}

function startSession(onlyIds){
  const queue = onlyIds
    ? onlyIds.map(id => ({ id, direction: pickDirection() }))
    : buildSessionQueue(trainPrefs.size);
  if(!queue.length) return;
  clearRateFx();
  // results: per word, its strength when the session started and how the last rating went
  session = { queue, index: 0, tally: {correct:0,wrong:0}, total: queue.length, requeued: {}, results: new Map() };
  appEl.classList.add('in-session');
  scrollTo(0, 0);
  trainSetup.hidden = true;
  trainSummaryEl.hidden = true;
  trainSessionEl.hidden = false;
  showCard();
}

function currentEntry(){
  const item = session.queue[session.index];
  if(!item) return null;
  const entry = entries.find(e => e.id === item.id);
  return entry ? { entry, direction: item.direction } : null;
}

function showCard(){
  flashReveal.hidden = true;
  ratingRow.hidden = true;
  trainAnswerForm.hidden = false;
  trainAnswerInput.value = '';
  trainAnswerInput.disabled = false;
  hintBtn.hidden = false;
  session.rating = false;
  delete ratingRow.dataset.chosen;
  answerGif.hidden = true;
  answerGifImg.src = '';
  answerExample.hidden = true;
  exampleKo.innerHTML = '';
  exampleEn.innerHTML = '';

  const cur = currentEntry();
  if(!cur){ finishSession(); return; }
  const { entry, direction } = cur;

  const pct = Math.round((session.index / session.total) * 100);
  trainProgressFill.style.width = pct + '%';
  trainProgressText.textContent = `${session.index + 1}/${session.total}`;
  trainProgress.setAttribute('aria-valuemax', session.total);
  trainProgress.setAttribute('aria-valuenow', session.index);

  if(direction === 'ko-en'){
    flashTag.textContent = '한국어 → english';
    flashPrompt.classList.remove('is-en');
    flashPrompt.lang = 'ko';
    flashPrompt.textContent = entry.korean;
    flashSub.textContent = entry.romanized || '';
    trainAnswerInput.placeholder = 'type the english meaning';
  }else{
    flashTag.textContent = 'english → 한국어';
    flashPrompt.classList.add('is-en');
    flashPrompt.lang = 'en';
    flashPrompt.textContent = entry.meaning;
    flashSub.textContent = '';
    trainAnswerInput.placeholder = 'type it in korean';
  }
  renderFlashStrength(entry);
  setTimeout(() => trainAnswerInput.focus({ preventScroll: true }), 50);
}
function renderFlashStrength(entry, justRated){
  const status = statusOf(entry);
  // when you last saw it stays as a quiet fact on the card, until you've just seen it
  const lastSeen = justRated ? '' : `<span class="last-seen">${lastSeenText(entry)}</span>`;
  flashStrength.innerHTML = `<div class="strength" role="img" aria-label="${strengthLabel(entry)}">${strengthDots(entry)}</div><span class="status ${status.kind}">${status.text}</span>${lastSeen}`;
}

// reveal the answer without judging it — free-form phrasing has too many valid
// answers to auto-grade reliably, so you decide for yourself with the check/x buttons.
function revealCard(){
  const cur = currentEntry();
  if(!cur) return;
  const { entry, direction } = cur;
  const isKorean = direction === 'en-ko';
  const typed = trainAnswerInput.value.trim();

  bumpDaily();
  bumpStreak();

  revealLabel.textContent = isKorean ? 'in korean' : 'meaning';
  revealAnswer.textContent = isKorean ? `${entry.korean}  ·  ${entry.romanized}` : entry.meaning;
  revealAnswer.lang = isKorean ? 'ko' : 'en';
  revealNote.textContent = typed ? `you wrote “${typed}”` : '';
  flashReveal.hidden = false;

  // say what each choice will do before you pick it
  const key = session.queue[session.index].id;
  wrongSub.textContent = (session.requeued[key] || 0) < 1 ? 'again in this session' : 'back to the start';
  correctSub.textContent = daysText(BOX_INTERVALS[Math.min(strengthOf(entry) + 1, MAX_BOX)], 'next');

  trainAnswerForm.hidden = true;
  hintBtn.hidden = true;
  ratingRow.hidden = false;

  ratingRow.dataset.entryId = entry.id;
  ratingRow.dataset.direction = direction;

  answerGif.hidden = true;
  answerGifImg.src = '';
  const gifQuery = (entry.meaning || entry.korean).split(/[\/,;]/)[0].trim();
  fetchWordGif(gifQuery).then(gifUrl => {
    // the session may have already moved to a different card by the time this resolves
    if(gifUrl && ratingRow.dataset.entryId === entry.id){
      answerGifImg.src = gifUrl;
      answerGifImg.alt = gifQuery;
      answerGif.hidden = false;
    }
  });

  answerExample.hidden = true;
  exampleKo.innerHTML = '';
  exampleEn.innerHTML = '';
  fetchExampleSentence(entry.korean).then(ex => {
    // the session may have already moved to a different card by the time this resolves
    if(ex && ratingRow.dataset.entryId === entry.id){
      exampleKo.innerHTML = highlightSpan(ex.ko, entry.korean);
      exampleEn.innerHTML = ex.en ? highlightEnglish(ex.en, entry.meaning) : '';
      answerExample.hidden = false;
    }
  });
}

trainAnswerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  revealCard();
});
hintBtn.addEventListener('click', revealCard);

function lastSeenText(entry){
  if(!hasBeenReviewed(entry)) return 'first review';
  const last = entry.srs.dueAt - BOX_INTERVALS[entry.srs.box];
  const days = Math.round((Date.now() - last) / DAY_MS);
  if(days <= 0) return 'seen earlier today';
  return days === 1 ? 'seen yesterday' : `seen ${days} days ago`;
}

/* ---------- rating moment ---------- */
// Beat 1: a stamp lands on the card and the memory dots change. Beat 2: a copy of the card
// flies off (right = kept, left = missed) while the real card, already holding the next
// word, rises from behind it. Web Animations rather than GSAP so training still animates if
// the CDN didn't load. Timing lives in setTimeout, not animation events, so a backgrounded
// tab can never strand the session. Final states are set in CSS/inline so the cloned card
// looks identical to the original the moment it takes over.
const RATE_BEAT_MS = { correct: 400, wrong: 440 };
const RATE_REDUCED_HOLD_MS = 450;
const RATE_EXIT_MS = 300;
const EASE_OUT = 'cubic-bezier(.22,1,.36,1)';
const EASE_IN = 'cubic-bezier(.5,0,.9,.4)';
const STAMP_PATHS = {
  correct: '<path pathLength="1" d="M13 25l8 8 15-17"/>',
  wrong: '<path pathLength="1" d="M16 16l16 16"/><path pathLength="1" d="M32 16L16 32"/>'
};
let rateRun = 0;   // bumped to abandon an in-flight rating moment
let rateLayer = null;
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function clearRateFx(){
  rateRun++;
  if(rateLayer){ rateLayer.remove(); rateLayer = null; }
  const fx = flashCard.querySelector('.rate-fx');
  if(fx) fx.remove();
}

function animateStrengthChange(rating, entry, startBox){
  const dots = flashStrength.querySelectorAll('.strength i');
  if(rating === 'correct'){
    const dot = dots[strengthOf(entry) - 1];
    if(dot) dot.animate(
      [{ transform: 'scale(.2)', background: 'var(--gold)' }, { transform: 'scale(1.7)', background: 'var(--gold)', offset: .55 }, { transform: 'scale(1)' }],
      { duration: 420, delay: 120, easing: EASE_OUT, fill: 'backwards' }
    );
    return;
  }
  // the strength you had drains away, right to left
  for(let i = startBox - 1; i >= 0; i--){
    dots[i].animate(
      [{ background: 'var(--dot-on)', transform: 'scale(1)' }, { background: 'var(--danger)', transform: 'scale(1.25)', offset: .4 }, { transform: 'scale(1)' }],
      { duration: 260, delay: 60 + (startBox - 1 - i) * 45, easing: 'ease-out', fill: 'backwards' }
    );
  }
}

function buildRateLayer(cx, cy){
  const layer = document.createElement('div');
  layer.className = 'rate-layer';
  layer.setAttribute('aria-hidden', 'true');
  const ring = document.createElement('div');
  ring.className = 'rate-ring';
  ring.style.left = cx + 'px';
  ring.style.top = cy + 'px';
  layer.appendChild(ring);
  ring.animate(
    [{ transform: 'translate(-50%,-50%) scale(.8)', opacity: .8 }, { transform: 'translate(-50%,-50%) scale(2.1)', opacity: 0 }],
    { duration: 520, delay: 90, easing: EASE_OUT, fill: 'both' }
  );
  const COUNT = 10;
  for(let i = 0; i < COUNT; i++){
    const bit = document.createElement('i');
    bit.className = 'rate-bit' + (i % 2 ? ' alt' : '');
    bit.style.left = cx + 'px';
    bit.style.top = cy + 'px';
    layer.appendChild(bit);
    const angle = (i / COUNT) * Math.PI * 2 + .3;
    const at = (radius) => `translate(calc(-50% + ${Math.cos(angle) * radius}px), calc(-50% + ${Math.sin(angle) * radius}px))`;
    // starts at the stamp's edge, so nothing ever sits on top of the mark
    bit.animate(
      [{ transform: `${at(34)} scale(1)`, opacity: 0 }, { opacity: 1, offset: .08 }, { transform: `${at(58 + (i % 3) * 14)} scale(0)`, opacity: 1 }],
      { duration: 540, delay: 90, easing: EASE_OUT, fill: 'both' }
    );
  }
  return layer;
}

async function playRatingMoment(rating, entry, startBox){
  const run = ++rateRun;
  const good = rating === 'correct';
  const motion = !matchMedia('(prefers-reduced-motion: reduce)').matches;

  renderFlashStrength(entry, true);

  // the top-right corner is empty once the answer is showing, so the stamp hides no text;
  // it follows you down if a tall card is scrolled
  const rect = flashCard.getBoundingClientRect();
  const stampX = rect.width - 50;
  const stampY = Math.max(50, 50 - rect.top);
  const fx = document.createElement('div');
  fx.className = 'rate-fx ' + (good ? 'good' : 'bad');
  fx.setAttribute('aria-hidden', 'true');
  fx.innerHTML = `<div class="rate-wash"></div><div class="rate-stamp" style="left:${stampX}px;top:${stampY}px"><svg viewBox="0 0 48 48" width="46" height="46">${STAMP_PATHS[rating]}</svg></div>`;
  flashCard.appendChild(fx);

  if(!motion){
    // same information, no travel: the stamp and dots stay up for a moment, then the card swaps
    await delay(RATE_REDUCED_HOLD_MS);
    if(run !== rateRun) return;
    fx.remove();
    session.index++;
    scrollTo(0, 0);
    showCard();
    return;
  }

  fx.querySelector('.rate-wash').animate([{ opacity: 0 }, {}], { duration: 200, easing: 'ease-out' });
  fx.querySelector('.rate-stamp').animate(
    [{ transform: 'translate(-50%,-50%) scale(.3)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(1.14)', opacity: 1, offset: .6 }, { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }],
    { duration: 340, easing: EASE_OUT }
  );
  fx.querySelectorAll('path').forEach((path, i) => {
    path.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 220, delay: 90 + i * 70, easing: 'ease-out', fill: 'backwards' });
  });
  animateStrengthChange(rating, entry, startBox);

  // a miss gets no confetti, only the layer the flying card needs
  rateLayer = good
    ? buildRateLayer(rect.left + stampX, rect.top + stampY)
    : Object.assign(document.createElement('div'), { className: 'rate-layer' });
  document.body.appendChild(rateLayer);
  const layer = rateLayer;

  flashCard.animate(
    good
      ? [{ transform: 'scale(1)' }, { transform: 'scale(1.025)', offset: .4 }, { transform: 'scale(1)' }]
      : [{ transform: 'translateX(0)' }, { transform: 'translateX(-7px)', offset: .2 }, { transform: 'translateX(6px)', offset: .4 }, { transform: 'translateX(-4px)', offset: .6 }, { transform: 'translateX(2px)', offset: .8 }, { transform: 'translateX(0)' }],
    { duration: good ? 300 : 380, easing: 'ease-out' }
  );

  await delay(RATE_BEAT_MS[rating]);
  if(run !== rateRun) return;

  // hand the look of this card to a copy, and let the real card move on underneath it
  const from = flashCard.getBoundingClientRect();
  const ghost = flashCard.cloneNode(true);
  ghost.removeAttribute('id');
  ghost.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
  ghost.classList.add('rate-ghost');
  ghost.style.cssText = `left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px;`;
  layer.prepend(ghost);

  fx.remove();
  session.index++;
  scrollTo(0, 0);
  showCard();

  const dir = good ? 1 : -1;
  ghost.animate(
    [{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { opacity: 1, offset: .55 }, { transform: `translate(${dir * Math.max(innerWidth * .7, from.width * 1.1)}px, ${good ? -18 : 14}px) rotate(${dir * 9}deg)`, opacity: 0 }],
    { duration: RATE_EXIT_MS, easing: EASE_IN, fill: 'forwards' }
  );
  if(!trainSessionEl.hidden){
    flashCard.animate(
      [{ transform: 'translateY(20px) scale(.94)', opacity: 0 }, { transform: 'none', opacity: 1 }],
      { duration: 380, delay: 70, easing: EASE_OUT, fill: 'backwards' }
    );
    trainAnswerForm.animate(
      [{ transform: 'translateY(12px)', opacity: 0 }, { transform: 'none', opacity: 1 }],
      { duration: 320, delay: 140, easing: EASE_OUT, fill: 'backwards' }
    );
  }

  await delay(RATE_EXIT_MS + 120);
  if(run !== rateRun) return;
  layer.remove();
  if(rateLayer === layer) rateLayer = null;
}

ratingRow.addEventListener('click', (e) => {
  const btn = e.target.closest('.rating-btn');
  if(!btn || session.rating) return;
  const rating = btn.dataset.rating; // 'correct' | 'wrong'
  const cur = currentEntry();
  if(!cur) return;
  const { entry, direction } = cur;

  session.rating = true; // one rating per card, by mouse, touch or keyboard
  ratingRow.dataset.chosen = rating;
  delete ratingRow.dataset.entryId; // a late GIF or example must not resize the card mid-animation
  const prev = session.results.get(entry.id);
  const startBox = strengthOf(entry);
  session.results.set(entry.id, { startBox: prev ? prev.startBox : startBox, rating });
  applySrsRating(entry, rating);
  saveEntries(entries);
  session.tally[rating]++;

  if(rating === 'wrong'){
    const key = session.queue[session.index].id;
    const timesRequeued = session.requeued[key] || 0;
    if(timesRequeued < 1){
      session.requeued[key] = timesRequeued + 1;
      session.queue.push({ id: entry.id, direction });
      session.total++;
    }
  }

  // progress moves the moment you answer, not when the next card arrives
  trainProgressFill.style.width = Math.round(((session.index + 1) / session.total) * 100) + '%';
  playRatingMoment(rating, entry, startBox);
});

// "8 of 9 kept": each word's last rating decides whether it was kept, and the list shows
// how its strength moved this session
let missedIds = [];
function finishSession(){
  trainSessionEl.hidden = true;
  trainSummaryEl.hidden = false;
  appEl.classList.add('in-session');
  scrollTo(0, 0);

  const rows = [...session.results].map(([id, r]) => ({ entry: entries.find(e => e.id === id), ...r })).filter(r => r.entry);
  const kept = rows.filter(r => r.rating === 'correct');
  const missed = rows.filter(r => r.rating === 'wrong');
  missedIds = missed.map(r => r.entry.id);

  if(!rows.length){
    summaryHeadline.textContent = 'no cards rated';
    summarySub.textContent = 'come back when you’re ready';
  }else{
    summaryHeadline.textContent = `${kept.length} of ${rows.length} kept`;
    summarySub.textContent = !missed.length
      ? 'every word held on'
      : missed.length === 1
        ? `${missed[0].entry.korean} slipped. it’s first in line next time`
        : `${missed.length} slipped. they’re first in line next time`;
  }

  summaryList.hidden = !rows.length;
  summaryList.innerHTML = rows.map(({ entry, startBox, rating }) => {
    const change = rating === 'wrong' ? 'reset' : (strengthOf(entry) > startBox ? '+1' : 'kept');
    return `<li>
      <div class="summary-word">
        <p class="summary-ko" lang="ko">${escapeHtml(entry.korean)}</p>
        <p class="summary-meaning">${escapeHtml(entry.meaning)}</p>
      </div>
      <div class="strength" role="img" aria-label="${strengthLabel(entry)}">${strengthDots(entry)}</div>
      <span class="summary-change${change === 'reset' ? ' reset' : ''}">${change}</span>
    </li>`;
  }).join('');

  trainAgainBtn.textContent = !missed.length
    ? 'train again'
    : missed.length === 1 ? `retry ${missed[0].entry.korean}` : `retry ${missed.length} missed`;
  renderLog();
  updateDueDot();
}

backToLogBtn.addEventListener('click', () => switchTab('log'));
trainAgainBtn.addEventListener('click', () => {
  if(missedIds.length) startSession(missedIds);
  else resetTrainSetupView();
});
// ending early still shows what you did; ending before rating anything just goes back
endSessionBtn.addEventListener('click', () => {
  clearRateFx();
  if(session && session.results.size) finishSession();
  else resetTrainSetupView();
});

/* ===================== init ===================== */
updateDueDot();
renderStreak();
renderDaily();
renderChips();
renderLog();
