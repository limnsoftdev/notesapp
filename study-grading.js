/* ===================== study: grading written answers ===================== */
// Everything that scores a written answer goes through gradeResponse(), so the screens never
// need to know what's doing the grading.
//
// A grader is { label, note, grade(request) } and grade() resolves to:
//   { rows: [{ id, earned: true | false | null, note }] }
// `id` matches a rubric row and `earned: null` means "couldn't tell, you decide".
//
// Adding AI grading later means adding one entry to GRADERS and pointing activeGrader at it.
// buildGradingRequest() already gathers what a model needs: the prompt, sources, rubric and
// answers. Don't put an API key in this app's code, because the code is public. Friends sharing
// one key need a small server that holds it, and grade() would call that server with fetch.
// The screen already waits on grade() and falls back to the auto-check if it fails.
//
// The auto-check is honest about what it is: it looks for key terms and sentence patterns, so it
// can suggest a score but it can't judge an argument. You confirm or change every row.

const RUBRICS = {
  // College Board's AP History LEQ rubric, 6 points
  leq: [
    { id: 'thesis', group: 'Thesis', label: 'Makes a defensible claim with a line of reasoning', detail: 'It can’t just restate the prompt. It must be in one place, in your introduction or conclusion.' },
    { id: 'context', group: 'Context', label: 'Describes broader historical context', detail: 'Events or processes before, during or after the prompt’s dates. A phrase or passing mention won’t earn it.' },
    { id: 'evidence1', group: 'Evidence', label: 'Gives at least two specific examples on the topic', detail: 'Specific historical examples relevant to the prompt.' },
    { id: 'evidence2', group: 'Evidence', needs: 'evidence1', label: 'Uses at least two specific examples to support an argument', detail: 'The examples have to prove your claim, not just appear in your essay.' },
    { id: 'reasoning', group: 'Reasoning', label: 'Uses comparison, causation or continuity and change to structure the argument', detail: 'Your structure should follow the reasoning the prompt asks for.' },
    { id: 'complexity', group: 'Reasoning', needs: 'reasoning', label: 'Shows a complex understanding', detail: 'For example, multiple causes or differences, both similarity and difference, or at least four pieces of evidence supporting a nuanced argument.' }
  ],
  // College Board's AP History DBQ rubric, 7 points
  dbq: [
    { id: 'thesis', group: 'Thesis', label: 'Makes a defensible claim with a line of reasoning', detail: 'It can’t just restate the prompt. It must be in one place, in your introduction or conclusion.' },
    { id: 'context', group: 'Context', label: 'Describes broader historical context', detail: 'Events or processes before, during or after the prompt’s dates. A phrase or passing mention won’t earn it.' },
    { id: 'docs1', group: 'Evidence', label: 'Describes the content of at least three documents', detail: 'Describe them in your own words instead of simply quoting them.' },
    { id: 'docs2', group: 'Evidence', needs: 'docs1', label: 'Uses at least four documents to support an argument', detail: 'Accurately describe them, and use them to support your claim.' },
    { id: 'beyond', group: 'Evidence', label: 'Uses one more specific piece of evidence beyond the documents', detail: 'Describe it, and make it different from what you used for context.' },
    { id: 'sourcing', group: 'Analysis', label: 'For at least two documents, explains why point of view, purpose, situation or audience matters', detail: 'Explain how or why it’s relevant to your argument. Just identifying it isn’t enough.' },
    { id: 'complexity', group: 'Analysis', label: 'Shows a complex understanding', detail: 'For example, explain multiple causes or both sides, use all seven documents effectively, or source at least four.' }
  ]
};

/* ---------- reading an answer ---------- */
const normalizeAnswer = (text) => (text || '').toLowerCase().replace(/[’‘`]/g, "'");
// plain terms match whole words, and a trailing * also matches any ending (janissar* = janissaries)
function termPattern(term){
  const clean = normalizeAnswer(term);
  const stem = clean.endsWith('*');
  const body = (stem ? clean.slice(0, -1) : clean).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  return new RegExp(`(?:^|[^\\p{L}\\p{N}])(${body}${stem ? '[\\p{L}\\p{N}]*' : ''})(?![\\p{L}\\p{N}])`, 'u');
}
const hasTerm = (text, term) => termPattern(term).test(text);
// the words as you actually wrote them, without repeats
const termsFound = (text, terms) => [...new Set(terms.flatMap(term => {
  const match = text.match(termPattern(term));
  return match ? [match[1]] : [];
}))];
const wordCount = (text) => ((text || '').trim().match(/\S+/g) || []).length;
const splitSentences = (text) => normalizeAnswer(text).split(/(?<=[.!?])\s+/).filter(Boolean);

// a document counts as mentioned by number ("Doc 3", "document 3") or by its own key terms
function docsMentioned(def, text){
  const found = new Set();
  (text.match(/\bdoc(?:ument)?s?\.?\s*#?\s*\d(?:\s*(?:,|and|&)\s*\d)*/g) || []).forEach(match => {
    (match.match(/\d/g) || []).forEach(n => { if(Number(n) >= 1 && Number(n) <= def.sources.length) found.add(Number(n)); });
  });
  def.docTerms.forEach((terms, index) => { if(termsFound(text, terms).length) found.add(index + 1); });
  return [...found].sort((a, b) => a - b);
}
function docsSourced(def, essay){
  const found = new Set();
  splitSentences(essay).forEach(sentence => {
    if(!termsFound(sentence, def.sourcingTerms).length) return;
    docsMentioned(def, sentence).forEach(n => found.add(n));
  });
  return [...found].sort((a, b) => a - b);
}
const listTerms = (terms) => terms.slice(0, 5).join(', ');

/* ---------- the auto-check ---------- */
function autoCheckEssay(def, essay){
  const text = normalizeAnswer(essay);
  const words = wordCount(essay);
  if(words < 25) return Object.fromEntries((RUBRICS[def.rubric] || []).map(row => [row.id, { earned: false, note: 'There’s not enough writing here to check yet.' }]));
  const paragraphs = text.split(/\n+/).filter(Boolean);
  const edges = paragraphs.length > 1 ? [paragraphs[0], paragraphs[paragraphs.length - 1]] : [text];
  const hasThesis = edges.some(part => termsFound(part, def.reasoningTerms).length && termsFound(part, def.topicTerms).length);
  const context = termsFound(text, def.contextTerms);
  const evidence = termsFound(text, def.evidenceTerms);
  const reasoning = termsFound(text, def.reasoningTerms);
  const checks = {
    thesis: hasThesis
      ? { earned: true, note: 'Your opening or closing has the topic and reasoning words. Compare it with the model thesis to be sure.' }
      : { earned: false, note: 'I didn’t find the topic and a reason (like “because” or “although”) together in your opening or closing.' },
    context: context.length
      ? { earned: true, note: `Found: ${listTerms(context)}. It needs to be described in a few sentences, so check that it isn’t only a mention.` }
      : { earned: false, note: 'I didn’t find a broader development, such as the Mongols or the spread of gunpowder.' },
    reasoning: reasoning.length >= 2
      ? { earned: true, note: `You use reasoning words such as: ${listTerms(reasoning)}. Check that they organize your whole argument.` }
      : { earned: false, note: 'I found few signs of reasoning, like “because,” “whereas” or “led to.”' },
    complexity: { earned: null, note: 'Only a reader can judge this. Be honest: does your essay explain both sides or several causes?' }
  };
  if(def.rubric === 'leq'){
    checks.evidence1 = evidence.length >= 2
      ? { earned: true, note: `Found: ${listTerms(evidence)}.` }
      : { earned: false, note: evidence.length ? `I only found one specific term: ${listTerms(evidence)}. You need at least two.` : 'I didn’t find specific examples I recognize. If you used others, change this.' };
    checks.evidence2 = evidence.length >= 2 && reasoning.length >= 2
      ? { earned: true, note: 'You have evidence near reasoning words. Check that each example actually proves your claim.' }
      : { earned: false, note: 'This needs at least two examples tied directly to your argument.' };
  }else{
    const docs = docsMentioned(def, text);
    const sourced = docsSourced(def, essay);
    const named = docs.length ? `You seem to use Doc ${docs.join(', ')}.` : 'I didn’t see any documents referenced. Citing “Doc 3” helps you keep track.';
    const beyond = termsFound(text, def.evidenceTerms);
    checks.docs1 = { earned: docs.length >= 3, note: named };
    checks.docs2 = { earned: docs.length >= 4 && reasoning.length >= 2, note: docs.length >= 4 ? `${named} Check that they support your argument and aren’t only summarized.` : named };
    checks.beyond = beyond.length
      ? { earned: true, note: `Found outside evidence: ${listTerms(beyond)}. Be sure you described it.` }
      : { earned: false, note: 'I didn’t find evidence from outside the documents.' };
    checks.sourcing = sourced.length >= 2
      ? { earned: true, note: `Doc ${sourced.join(', ')} appear alongside sourcing language. Check that you explained why it matters.` }
      : { earned: false, note: sourced.length ? `Only Doc ${sourced[0]} seems to be sourced, and you need two.` : 'I didn’t find point of view, purpose, situation or audience tied to a document.' };
  }
  return checks;
}
function autoCheckSaq(def, answers){
  const checks = {};
  def.parts.forEach(part => part.points.forEach(point => {
    const raw = answers[point.rule.part] || '';
    const text = normalizeAnswer(raw);
    if(wordCount(raw) < 3){ checks[point.id] = { earned: false, note: 'This part is blank or too short.' }; return; }
    const found = termsFound(text, point.rule.terms);
    checks[point.id] = found.length >= point.rule.min
      ? { earned: true, note: `Found: ${listTerms(found)}. Compare with the model answer to be sure.` }
      : { earned: null, note: 'I didn’t find a term I expected. You may have used something else, so compare with the model answer.' };
  }));
  return checks;
}

const GRADERS = {
  auto: {
    label: 'auto-check',
    note: 'The auto-check looks for key terms, so it can’t judge your argument. Fix anything it got wrong, then save.',
    grade: async (request) => {
      const checks = request.def.type === 'saq'
        ? autoCheckSaq(request.def, request.answers)
        : autoCheckEssay(request.def, request.answers.essay);
      return { rows: request.rubric.map(row => ({ id: row.id, ...(checks[row.id] || { earned: null, note: '' }) })) };
    }
  }
};
const activeGrader = () => GRADERS.auto;

/* ---------- what any grader receives ---------- */
function rubricFor(def){
  if(def.type === 'saq') return def.parts.flatMap(part => part.points.map(point => ({ ...point, group: `Part ${part.label}`, part: part.id })));
  return RUBRICS[def.rubric];
}
function buildGradingRequest(course, def, answers){
  return {
    def,
    answers,
    rubric: rubricFor(def),
    // plain text a model could read directly
    prompt: def.type === 'saq' ? def.parts.map(part => `(${part.label}) ${part.prompt}`).join('\n') : def.prompt,
    sources: (def.sources || []).map(id => {
      const source = course.sources[id];
      return source.kind === 'image' ? { type: 'image', describe: course.images[source.img].alt, cite: source.cite } : { type: 'text', text: source.text, cite: source.cite };
    })
  };
}
async function gradeResponse(course, def, answers){
  const request = buildGradingRequest(course, def, answers);
  const grader = activeGrader();
  try{
    return { ...(await grader.grade(request)), note: grader.note, by: grader.label };
  }catch(err){
    return { ...(await GRADERS.auto.grade(request)), note: `${grader.label} isn’t available right now, so this used the auto-check.`, by: GRADERS.auto.label };
  }
}
