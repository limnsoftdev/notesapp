/* ===================== voice: say a word, confirm it, watch it land ===================== */
// The word log's main action. Tap the mic and speak: your guess appears live while you talk, then
// the app asks "do you mean 핫도그?" and "yes, that's it!" sends the word flying into the log.
// English speech is always added as Korean, using the same add flow as typing (romanize, translate,
// commitEntry). The browser's speech recognition runs one language per session and can't detect it,
// so a remembered 한국어/English switch picks. Without speech recognition (Firefox, for example) the
// mic stays hidden and typing still works. Chrome and Safari may send your voice to their own speech
// service, which the sheet says while listening. Loaded after fx.js and uses its globals.

const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const VOICE_LANGS = {
  'ko-KR': { label: '한국어', glyph: '한', tag: 'ko', name: 'Korean', hint: '한국어로 말해보세요' },
  'en-US': { label: 'English', glyph: 'EN', tag: 'en', name: 'English', hint: 'say it in english' }
};
const SILENCE_STOP_MS = 1500;  // once it has heard something, this much quiet means you're done
const MAX_LISTEN_MS = 12000;   // some browsers never end the session on their own
const YES_BEAT_MS = 420;       // long enough to feel the check before the word leaves
const MAX_OPTIONS = 3;
const MIC_ICON = '<svg viewBox="0 0 24 24" width="46" height="46" aria-hidden="true"><rect x="8.5" y="2.5" width="7" height="12" rx="3.5" fill="currentColor"/><path d="M5 11.5a7 7 0 0 0 14 0M12 18.5v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

const voiceHero = document.getElementById('voiceHero');
const voiceMic = document.getElementById('voiceMic');
const voiceLangBtn = document.getElementById('voiceLangBtn');
const voiceLangGlyph = document.getElementById('voiceLangGlyph');
const voiceTitle = document.getElementById('voiceTitle');
const typeToggle = document.getElementById('typeToggle');
const typeReveal = document.getElementById('typeReveal');
const voiceSheet = document.getElementById('voiceSheet');

let voice = null;     // what the sheet is showing
let activeRec = null;
let silenceTimer = null, maxTimer = null;

const voiceLang = () => (VOICE_LANGS[settings.voiceLang] ? settings.voiceLang : 'ko-KR');
function syncVoiceLang(){
  const lang = VOICE_LANGS[voiceLang()];
  const other = Object.values(VOICE_LANGS).find(option => option !== lang);
  voiceLangGlyph.textContent = lang.glyph;
  voiceLangGlyph.lang = lang.tag;
  voiceLangBtn.setAttribute('aria-label', `speaking ${lang.name}, switch to ${other.name}`);
  voiceTitle.textContent = `say a word in ${lang.label}`;
  voiceSheet.querySelectorAll('[data-voice-lang]').forEach(btn => {
    const on = btn.dataset.voiceLang === voiceLang();
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-pressed', String(on));
  });
  voiceSheet.querySelectorAll('.voice-lang').forEach(el => { el.dataset.lang = voiceLang(); });
}
// typing is one tap away, and closes again if you leave it empty
function setTypeOpen(open, focus){
  typeReveal.classList.toggle('open', open);
  typeToggle.setAttribute('aria-expanded', String(open));
  if(open && focus) phraseInput.focus();
}
const langSwitch = () => `<div class="voice-lang" data-lang="${voiceLang()}" role="group" aria-label="language you’ll speak">
    <i class="voice-lang-thumb" aria-hidden="true"></i>
    ${Object.entries(VOICE_LANGS).map(([id, { label }]) => `<button type="button" data-voice-lang="${id}" class="${id === voiceLang() ? 'active' : ''}" aria-pressed="${id === voiceLang()}">${label}</button>`).join('')}
  </div>`;

/* ---------- listening ---------- */
const cleanHeard = (text) => (text || '').trim().replace(/[.?!。]+$/, '').trim();
function stopTimers(){
  clearTimeout(silenceTimer);
  clearTimeout(maxTimer);
}
function abortRecognition(){
  stopTimers();
  if(!activeRec) return;
  const rec = activeRec;
  activeRec = null; // its late events are ignored from here on
  try{ rec.abort(); }catch(e){ /* it had already ended */ }
}
// has to run directly inside the tap: browsers refuse to open the mic otherwise
function startListening(){
  abortRecognition();
  voice = { phase: 'listening', heard: '', alts: [], error: null };
  renderVoice();
  const rec = activeRec = new Recognition();
  rec.lang = voiceLang();
  rec.interimResults = true;
  rec.continuous = false;
  rec.maxAlternatives = MAX_OPTIONS + 1;
  rec.onresult = (e) => {
    if(rec !== activeRec) return;
    const results = [...e.results];
    const heard = cleanHeard(results.map(result => result[0].transcript).join(''));
    const last = results[results.length - 1];
    if(last.isFinal && results.length === 1){
      voice.alts = [...last].map(alt => cleanHeard(alt.transcript)).filter(Boolean);
    }
    if(heard) showGuess(heard);
    clearTimeout(silenceTimer);
    silenceTimer = setTimeout(() => { if(rec === activeRec) rec.stop(); }, SILENCE_STOP_MS);
  };
  rec.onerror = (e) => {
    if(rec === activeRec) voice.error = e.error;
  };
  rec.onend = () => {
    if(rec !== activeRec) return;
    stopTimers();
    activeRec = null;
    if(voice.heard) askAbout(voice.heard);
    else showVoiceError(voice.error);
  };
  try{
    rec.start();
  }catch(e){
    activeRec = null;
    showVoiceError('audio-capture');
    return;
  }
  maxTimer = setTimeout(() => { if(rec === activeRec) rec.stop(); }, MAX_LISTEN_MS);
}
// only what's new animates, so the guess feels like it's forming instead of flickering
function showGuess(heard){
  const previous = voice.heard;
  voice.heard = heard;
  const el = document.getElementById('voiceGuess');
  if(!el) return;
  let same = 0;
  while(same < previous.length && same < heard.length && previous[same] === heard[same]) same++;
  el.classList.remove('empty');
  el.textContent = heard.slice(0, same);
  const fresh = document.createElement('span');
  fresh.className = 'guess-new';
  fresh.textContent = heard.slice(same);
  el.appendChild(fresh);
  if(!motionAllowed()) return;
  popEl(voiceSheet.querySelector('.voice-stop'), 1.08);
  const danno = voiceSheet.querySelector('.voice-danno');
  if(danno) danno.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-7px)', offset: .4 }, { transform: 'translateY(0)' }], { duration: 240, easing: 'ease-out' });
}
function showVoiceError(code){
  const blocked = code === 'not-allowed' || code === 'service-not-allowed';
  const message = blocked ? 'your mic is blocked. allow it in your browser settings, or type your word instead'
    : code === 'network' ? 'speech needs a connection. check yours and try again, or type your word instead'
    : code === 'audio-capture' ? 'couldn’t find a mic on this device. you can type your word instead'
    : 'didn’t catch that. tap the mic and try again';
  voice = { phase: 'error', message, blocked };
  renderVoice();
}

/* ---------- asking "do you mean?" ---------- */
// spacing and capitals don't make a different word: "hotdog" isn't a real alternative to "hot dog"
const sameWord = (a, b) => a.toLowerCase().replace(/\s+/g, '') === b.toLowerCase().replace(/\s+/g, '');
// the best translation, plus others only for this exact text: MyMemory's partial matches can be
// translations of part of it, and "hot dog" shouldn't offer 개 (dog)
async function translationOptions(text, from, to, accept){
  try{
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`);
    const data = await res.json();
    const exact = (data.matches || []).filter(m => Number(m.match) >= .85 && sameWord(cleanHeard(m.segment), text));
    const all = [data.responseData && data.responseData.translatedText, ...exact.map(m => m.translation)];
    const seen = new Set();
    return all.map(option => cleanHeard(option)).filter(option => {
      const key = option.toLowerCase();
      if(!option || option.length > 40 || !accept(option) || seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, MAX_OPTIONS);
  }catch(e){
    return [];
  }
}
async function askAbout(heard){
  const fromKorean = hasHangul(heard);
  const token = {};
  const alts = [];
  (voice.alts || []).forEach(alt => { if(!sameWord(alt, heard) && !alts.some(kept => sameWord(kept, alt))) alts.push(alt); });
  alts.length = Math.min(alts.length, 2);
  voice = {
    phase: 'ask', token, fromKorean, heard, alts, loading: true, editing: false,
    korean: fromKorean ? heard : '', meaning: fromKorean ? '' : heard, options: []
  };
  renderVoice();
  const options = fromKorean
    ? await translationOptions(heard, 'ko', 'en', option => !hasHangul(option))
    : await translationOptions(heard, 'en', 'ko', hasHangul);
  if(!voice || voice.token !== token) return; // you've moved on since asking
  voice.loading = false;
  voice.options = options;
  if(options.length){
    if(fromKorean) voice.meaning = options[0];
    else voice.korean = options[0];
  }else{
    voice.editing = true; // no translation came back, so fill in the blank instead of losing the word
  }
  renderVoice();
  const card = voiceSheet.querySelector('.voice-card');
  if(card) popEl(card, 1.03);
}

/* ---------- the sheet ---------- */
const isDuplicate = (korean) => entries.some(entry => entry.korean === korean);
function renderVoice(){
  if(!voice) return;
  const top = `<div class="voice-top">
      <button class="icon-btn" type="button" data-voice="close" aria-label="close">${ICON.close}</button>
      ${langSwitch()}
    </div>`;
  let body = '';
  if(voice.phase === 'listening'){
    body = `<div class="voice-listen">
        <img class="voice-danno" src="danno/peek.png" width="300" height="500" alt="">
        <p class="voice-guess empty" id="voiceGuess" aria-live="polite" lang="${voiceLang().slice(0, 2)}">${escapeHtml(VOICE_LANGS[voiceLang()].hint)}</p>
        <button class="voice-mic voice-stop listening" type="button" data-voice="stop" aria-label="done talking">${MIC_ICON}</button>
        <p class="voice-note">your browser’s speech service hears this while you talk</p>
      </div>`;
  }else if(voice.phase === 'error'){
    body = `<div class="voice-listen">
        <img class="voice-danno" src="danno/knees.png" width="300" height="500" alt="">
        <p class="voice-guess small" role="status">${escapeHtml(voice.message)}</p>
        <button class="voice-mic" type="button" data-voice="again" aria-label="try again">${MIC_ICON}</button>
        <button class="study-link" type="button" data-voice="type">type it instead</button>
      </div>`;
  }else{
    const { fromKorean, heard, korean, meaning, loading, editing, options, alts, confirmed } = voice;
    const shown = fromKorean ? meaning : korean;
    const ready = korean.trim() && meaning.trim();
    const others = options.filter(option => option !== shown);
    body = `<div class="voice-ask">
        <img class="voice-danno${confirmed ? ' happy' : ''}" src="danno/${confirmed ? 'stand' : 'peek'}.png" width="300" height="500" alt="">
        <p class="voice-question">${confirmed ? 'got it!' : loading ? 'hmm, let me think…' : editing ? 'help me out here' : fromKorean ? 'did you say' : 'do you mean'}</p>
        <div class="voice-card${confirmed ? ' confirmed' : ''}${loading ? ' loading' : ''}">
          ${confirmed ? `<span class="voice-check" aria-hidden="true">${ICON.check}</span>` : ''}
          ${editing ? `
            <label class="voice-field"><span>한국어</span><input id="voiceKorean" lang="ko" type="text" value="${escapeHtml(korean)}" autocomplete="off" spellcheck="false"></label>
            <label class="voice-field"><span>meaning</span><input id="voiceMeaning" type="text" value="${escapeHtml(meaning)}" autocomplete="off"></label>
          ` : `
            <p class="voice-korean" lang="ko">${loading && !korean ? '<span class="voice-dots"><i></i><i></i><i></i></span>' : `${escapeHtml(korean)}${confirmed ? '' : '?'}`}</p>
            ${korean ? `<p class="voice-rom">${escapeHtml(romanize(korean))}</p>` : ''}
            <p class="voice-meaning">${loading && !meaning ? 'finding the meaning…' : escapeHtml(meaning)}</p>
          `}
        </div>
        ${!confirmed && !editing && !loading && !fromKorean ? `<p class="voice-heard">you said “${escapeHtml(heard)}”</p>` : ''}
        ${!confirmed && isDuplicate(korean) ? '<p class="voice-heard">this one’s already in your log</p>' : ''}
        ${!confirmed && !editing && (others.length || alts.length) ? `<div class="voice-others">
          ${others.length ? `<div class="voice-other-row"><span>or maybe</span>${others.map(option => `<button type="button" class="voice-chip" data-voice="option" data-value="${escapeHtml(option)}">${escapeHtml(option)}</button>`).join('')}</div>` : ''}
          ${alts.length ? `<div class="voice-other-row"><span>or did you say</span>${alts.map(alt => `<button type="button" class="voice-chip" data-voice="alt" data-value="${escapeHtml(alt)}">${escapeHtml(alt)}</button>`).join('')}</div>` : ''}
        </div>` : ''}
        <div class="voice-actions${confirmed ? ' gone' : ''}">
          <button class="study-btn gold wide voice-yes" type="button" data-voice="yes"${ready && !loading ? '' : ' disabled'}>${editing ? 'add it' : 'yes, that’s it!'}</button>
          <div class="voice-secondary">
            <button class="study-link" type="button" data-voice="again">say it again</button>
            ${editing ? '' : '<button class="study-link" type="button" data-voice="edit">let me fix it</button>'}
          </div>
        </div>
      </div>`;
  }
  voiceSheet.innerHTML = top + body;
}
function openVoiceSheet(){
  const rect = voiceMic.getBoundingClientRect();
  voiceSheet.hidden = false;
  document.body.classList.add('voice-open');
  startListening();
  if(motionAllowed()){
    const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
    voiceSheet.animate(
      [{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${Math.hypot(innerWidth, innerHeight)}px at ${x}px ${y}px)` }],
      { duration: 380, easing: 'cubic-bezier(.4,0,.2,1)' }
    );
  }
}
function closeVoiceSheet(afterAdd){
  abortRecognition();
  voice = null;
  document.body.classList.remove('voice-open');
  if(!motionAllowed() || !afterAdd && voiceSheet.hidden){
    voiceSheet.hidden = true;
    voiceSheet.innerHTML = '';
    return;
  }
  const done = () => { voiceSheet.hidden = true; voiceSheet.innerHTML = ''; };
  voiceSheet.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: 'ease-out', fill: 'forwards' }).onfinish = (e) => { e.target.cancel(); done(); };
  voiceSheet.style.pointerEvents = 'none';
  setTimeout(() => { voiceSheet.style.pointerEvents = ''; }, 240);
}
// the moment of being right: a check lands on the card, Danno's delighted, then the word leaves
function confirmWord(){
  if(voice.confirmed) return;
  const korean = voice.korean.trim(), meaning = voice.meaning.trim();
  if(!korean || !meaning) return;
  voice.editing = false;
  voice.korean = korean;
  voice.meaning = meaning;
  voice.confirmed = true;
  renderVoice();
  if(navigator.vibrate) navigator.vibrate(14);
  const card = voiceSheet.querySelector('.voice-card');
  const finish = () => {
    if(!voice || !voice.confirmed) return;
    commitEntry(korean, romanize(korean), meaning, voiceSheet.querySelector('.voice-card'));
    closeVoiceSheet(true);
  };
  if(!motionAllowed()){ finish(); return; }
  popEl(card, 1.05);
  burstAt(voiceSheet.querySelector('.voice-check'));
  hopDanno(voiceSheet.querySelector('.voice-danno'), 2);
  const check = voiceSheet.querySelector('.voice-check');
  if(check) check.animate([{ transform: 'scale(2.2) rotate(-16deg)', opacity: 0 }, { transform: 'scale(.9) rotate(-8deg)', opacity: 1, offset: .6 }, { transform: 'scale(1) rotate(-8deg)', opacity: 1 }], { duration: 260, easing: 'ease-out' });
  setTimeout(finish, YES_BEAT_MS);
}

/* ---------- the word landing in the log ---------- */
// the new card flies from where it came from to its real place, and the others make room
function captureLogPositions(){
  const positions = new Map();
  logList.querySelectorAll('.entry').forEach(card => positions.set(card.dataset.id, card.getBoundingClientRect().top + scrollY));
  return positions;
}
function landEntry(entry, originEl, before){
  const card = logList.querySelector(`.entry[data-id="${CSS.escape(entry.id)}"]`);
  if(!card) return;
  const origin = originEl && originEl.getBoundingClientRect();
  let rect = card.getBoundingClientRect();
  if(rect.top < 0 || rect.bottom > innerHeight){
    card.scrollIntoView({ block: 'center' });
    rect = card.getBoundingClientRect();
  }
  if(!motionAllowed() || !origin) return;
  logList.querySelectorAll('.entry').forEach(other => {
    if(other === card || !before.has(other.dataset.id)) return;
    const moved = before.get(other.dataset.id) - (other.getBoundingClientRect().top + scrollY);
    if(Math.abs(moved) > 1) other.animate([{ transform: `translateY(${moved}px)` }, { transform: 'none' }], { duration: 380, delay: 160, easing: FX_SPRING, fill: 'backwards' });
  });
  const flyer = card.cloneNode(true);
  flyer.classList.add('entry-flying');
  flyer.setAttribute('aria-hidden', 'true');
  Object.assign(flyer.style, { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px` });
  document.body.appendChild(flyer);
  card.style.opacity = '0';
  const dx = origin.left + origin.width / 2 - (rect.left + rect.width / 2);
  const dy = origin.top + origin.height / 2 - (rect.top + rect.height / 2);
  const scale = Math.min(Math.max(origin.width / rect.width, .7), 1.1);
  flyer.animate([
    { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, opacity: .85 },
    { transform: `translate(${dx * .3}px, ${dy * .3 - 22}px) scale(1.05) rotate(-1.5deg)`, opacity: 1, offset: .62 },
    { transform: 'translate(0, -5px) scale(1.03)', opacity: 1, offset: .86 },
    { transform: 'none', opacity: 1 }
  ], { duration: 560, easing: 'cubic-bezier(.3,.7,.3,1)', fill: 'forwards' });
  setTimeout(() => {
    flyer.remove();
    card.style.opacity = '';
    if(!card.isConnected) return;
    card.classList.add('just-added');
    setTimeout(() => card.classList.remove('just-added'), 1100);
    card.animate([{ transform: 'scale(1.03,.95)' }, { transform: 'scale(.99,1.02)', offset: .5 }, { transform: 'none' }], { duration: 300, easing: 'ease-out' });
    burstAt(card.querySelector('.ko-text'), 800);
    confetti(26);
  }, 560);
}

/* ---------- input ---------- */
voiceMic.addEventListener('click', openVoiceSheet);
voiceLangBtn.addEventListener('click', () => {
  settings.voiceLang = voiceLang() === 'ko-KR' ? 'en-US' : 'ko-KR';
  saveSettings();
  syncVoiceLang();
  if(!motionAllowed()) return;
  voiceLangGlyph.animate([{ opacity: 0, transform: 'scale(.25)', filter: 'blur(4px)' }, { opacity: 1, transform: 'scale(1)', filter: 'blur(0)' }], { duration: 220, easing: 'cubic-bezier(.2,0,0,1)' });
  voiceTitle.animate([{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 200, easing: 'ease-out' });
});
typeToggle.addEventListener('click', () => setTypeOpen(!typeReveal.classList.contains('open'), true));
phraseInput.addEventListener('blur', () => {
  // the check waits a beat so tapping + or the toggle itself doesn't count as leaving
  setTimeout(() => {
    if(!Recognition || phraseInput.value.trim() || !manualRow.hidden) return;
    if(typeReveal.contains(document.activeElement) || document.activeElement === typeToggle) return;
    setTypeOpen(false);
  }, 120);
});
voiceSheet.addEventListener('click', (e) => {
  const langBtn = e.target.closest('[data-voice-lang]');
  if(langBtn){
    settings.voiceLang = langBtn.dataset.voiceLang;
    saveSettings();
    syncVoiceLang();
    startListening(); // the other language needs a fresh session
    return;
  }
  const el = e.target.closest('[data-voice]');
  if(!el || el.disabled || !voice) return;
  switch(el.dataset.voice){
    case 'close': closeVoiceSheet(false); break;
    case 'stop': if(activeRec){ try{ activeRec.stop(); }catch(err){ /* it had already ended */ } } break;
    case 'again': startListening(); break;
    case 'type':
      closeVoiceSheet(false);
      setTypeOpen(true, true);
      break;
    case 'edit':
      voice.editing = true;
      renderVoice();
      slideIn(voiceSheet.querySelector('.voice-card'), 0);
      document.getElementById('voiceKorean').focus();
      break;
    case 'option':
      if(voice.fromKorean) voice.meaning = el.dataset.value;
      else voice.korean = el.dataset.value;
      renderVoice();
      popEl(voiceSheet.querySelector('.voice-card'), 1.04);
      break;
    case 'alt': askAbout(el.dataset.value); break;
    case 'yes': confirmWord(); break;
  }
});
// typing in the fix-it fields updates in place, because a redraw would close the keyboard
voiceSheet.addEventListener('input', (e) => {
  if(!voice) return;
  if(e.target.id === 'voiceKorean') voice.korean = e.target.value;
  else if(e.target.id === 'voiceMeaning') voice.meaning = e.target.value;
  else return;
  const yes = voiceSheet.querySelector('.voice-yes');
  if(yes) yes.disabled = !(voice.korean.trim() && voice.meaning.trim());
});
voiceSheet.addEventListener('keydown', (e) => {
  if(e.key === 'Enter' && e.target.tagName === 'INPUT' && voice && voice.korean.trim() && voice.meaning.trim()) confirmWord();
});
document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape' && voice) closeVoiceSheet(false);
});
// the mic shouldn't keep listening once you've left the app
document.addEventListener('visibilitychange', () => {
  if(document.hidden && voice && voice.phase === 'listening') closeVoiceSheet(false);
});

if(Recognition){
  voiceHero.hidden = false;
  phraseInput.placeholder = '한국어 or english';
  setTypeOpen(false);
  syncVoiceLang();
}
