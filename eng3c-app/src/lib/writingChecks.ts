import {
  ANALYSIS_WORDS,
  HAZARD_WORDS,
  IMPERATIVE_VERBS,
  MATERIAL_NOUNS,
  MEASURE_VERBS,
  SOURCE_CUES,
  STOPWORDS,
  VAGUE_INSTRUCTION,
} from './lexicon.ts';
import { countWords, findPassive, keywords, lintText, phraseRegex, splitSentences } from './textAnalysis.ts';

export type CheckLevel = 'pass' | 'warn' | 'fail';

export interface Check {
  id: string;
  level: CheckLevel;
  label: string;
  tip?: string;
  /** Required checks must pass before the tool lets the user move on. */
  required?: boolean;
}

const has = (text: string, list: string[]) => list.some((w) => phraseRegex(w).test(text));

/* ------------------------------------------------------------------ */
/* PPE / PEEL paragraph                                                */
/* ------------------------------------------------------------------ */

export interface PpeInput {
  point: string;
  proof: string;
  explanation: string;
  link: string;
  thesis?: string;
}

export function checkPoint(point: string): Check[] {
  const t = point.trim();
  const words = countWords(t);
  const sentences = splitSentences(t).length;
  const checks: Check[] = [];
  checks.push({
    id: 'point-length',
    required: true,
    level: words >= 8 ? 'pass' : 'fail',
    label: words >= 8 ? 'States a full claim' : 'Write a full topic sentence (8+ words)',
    tip: 'A topic sentence names the topic and your position on it.',
  });
  checks.push({
    id: 'point-one',
    level: sentences <= 1 ? 'pass' : 'warn',
    label: sentences <= 1 ? 'One sentence' : 'Keep the point to one sentence',
  });
  const announce = /^(in this paragraph|this paragraph|i will|i am going to|i'm going to|today i)/i.test(t);
  checks.push({
    id: 'point-announce',
    level: announce ? 'fail' : 'pass',
    required: true,
    label: announce ? 'Cut the announcement ("In this paragraph I will...")' : 'Makes the claim directly',
  });
  checks.push({
    id: 'point-question',
    level: /\?\s*$/.test(t) ? 'warn' : 'pass',
    label: /\?\s*$/.test(t) ? 'A question is not a claim. Answer it instead.' : 'Not phrased as a question',
  });
  return checks;
}

export function checkProof(proof: string): Check[] {
  const t = proof.trim();
  const quoted = /["“][^"”]{3,}["”]/.test(t);
  const numeric = /\d/.test(t);
  const cited = /\([^)]*(\d|[A-Z][a-z]+)[^)]*\)/.test(t) || has(t, SOURCE_CUES);
  const quoteText = t.match(/["“]([^"”]+)["”]/)?.[1] ?? '';
  const checks: Check[] = [
    {
      id: 'proof-evidence',
      required: true,
      level: quoted || numeric ? 'pass' : 'fail',
      label: quoted || numeric ? 'Contains a quote or data point' : 'Add a direct quote (in quotation marks) or a number',
      tip: 'Proof is something the reader can check: a quotation, a statistic, a date, a measurement.',
    },
    {
      id: 'proof-source',
      required: true,
      level: cited ? 'pass' : 'fail',
      label: cited ? 'Names its source' : 'Say where it comes from: (Author page) or "According to..."',
    },
    {
      id: 'proof-length',
      level: countWords(quoteText) > 40 ? 'warn' : 'pass',
      label: countWords(quoteText) > 40 ? 'Trim the quote to the words you will discuss' : 'Quote is a usable length',
    },
  ];
  if (quoted && !/(according to|states|says|writes|explains|argues|notes|reports|claims|found|shows|,|:)\s*["“]/i.test(t) && /^["“]/.test(t)) {
    checks.push({
      id: 'proof-dropped',
      level: 'warn',
      label: 'Avoid a "dropped quote": introduce it with a signal phrase',
      tip: 'Example: As the report notes, "..."',
    });
  }
  return checks;
}

export function checkExplanation(explanation: string, point: string, proof: string): Check[] {
  const t = explanation.trim();
  const sentences = splitSentences(t).length;
  const words = countWords(t);
  const analysis = has(t, ANALYSIS_WORDS);
  const pk = keywords(point, STOPWORDS);
  const ek = keywords(t, STOPWORDS);
  const prk = keywords(proof, STOPWORDS);
  const ties = [...ek].some((w) => pk.has(w));
  const overlapWithProof = ek.size ? [...ek].filter((w) => prk.has(w)).length / ek.size : 0;
  return [
    {
      id: 'exp-length',
      required: true,
      level: sentences >= 2 && words >= 25 ? 'pass' : 'fail',
      label: sentences >= 2 && words >= 25 ? 'Develops the analysis (2+ sentences)' : 'Explain in at least 2 sentences (25+ words)',
    },
    {
      id: 'exp-analysis',
      level: analysis ? 'pass' : 'warn',
      label: analysis ? 'Uses analysis language' : 'Say what the proof shows: "This suggests...", "because..."',
    },
    {
      id: 'exp-tie',
      level: ties ? 'pass' : 'warn',
      label: ties ? 'Ties back to your point' : 'Connect back to a key word from your point',
    },
    {
      id: 'exp-summary',
      level: overlapWithProof > 0.6 ? 'warn' : 'pass',
      label: overlapWithProof > 0.6 ? 'This mostly repeats the proof. Explain why it matters.' : 'Goes beyond summary',
    },
  ];
}

export function checkLink(link: string, thesis: string): Check[] {
  const t = link.trim();
  if (!t) return [{ id: 'link-empty', level: 'warn', label: 'Add a link sentence back to your thesis' }];
  const tk = keywords(thesis, STOPWORDS);
  const ties = thesis.trim() ? [...keywords(t, STOPWORDS)].some((w) => tk.has(w)) : true;
  return [
    { id: 'link-one', level: splitSentences(t).length <= 2 ? 'pass' : 'warn', label: 'Short wrap-up (1–2 sentences)' },
    { id: 'link-thesis', level: ties ? 'pass' : 'warn', label: ties ? 'Echoes the thesis' : 'Reuse a key word from your thesis' },
  ];
}

export function stitchParagraph(p: PpeInput, peel: boolean): string {
  const parts = [p.point, p.proof, p.explanation, peel ? p.link : ''].map((s) => s.trim()).filter(Boolean);
  return parts.map((s) => (/[.!?"”)]$/.test(s) ? s : s + '.')).join(' ');
}

/* ------------------------------------------------------------------ */
/* Procedures ("How-To" / SOP)                                         */
/* ------------------------------------------------------------------ */

export interface ProcedureInput {
  title: string;
  audience: string;
  materials: string;
  steps: string[];
  warnings: string;
  result: string;
}

export interface StepReport {
  index: number;
  text: string;
  checks: Check[];
}

export interface ProcedureReport {
  doc: Check[];
  steps: StepReport[];
  score: number;
}

const SEQUENCE_PREFIX = /^(?:(?:first|second|third|next|then|now|finally|lastly|after that|afterwards|step \d+)[,:]?\s+)/i;
const CONDITION_PREFIX = /^(?:(?:if|when|once|after|before|while|as soon as|unless)\b[^,]{1,80},\s*)/i;
const NUMBER_WORDS = /\b(one|two|three|four|five|six|seven|eight|nine|ten|twelve|fifteen|twenty|thirty|half|quarter|dozen|once|twice)\b/i;

function mainClause(step: string): string {
  let s = step.trim().replace(/^\d+[.)]\s*/, '');
  s = s.replace(SEQUENCE_PREFIX, '');
  s = s.replace(CONDITION_PREFIX, '');
  s = s.replace(/^(?:carefully|gently|slowly|quickly|firmly|always|never|then)\s+/i, '');
  return s;
}

function firstWord(s: string): string {
  return (s.match(/^[^A-Za-z]*([A-Za-z'-]+)/)?.[1] ?? '').toLowerCase();
}

export function checkStep(step: string, materials: string): Check[] {
  const checks: Check[] = [];
  const t = step.trim();
  const main = mainClause(t);
  const fw = firstWord(main);
  const imperative = IMPERATIVE_VERBS.includes(fw) || fw === 'do' || fw === "don't" || fw === 'never';
  const youShould = /\b(you\s+(should|need to|have to|must|will|can|want to|might))\b/i.test(t);
  if (youShould) {
    checks.push({ id: 'you-should', level: 'fail', label: 'Cut "you should / you need to". Start with the verb.', tip: 'Not "You should unplug the toaster." Write "Unplug the toaster."' });
  } else if (!imperative) {
    checks.push({ id: 'imperative', level: 'warn', label: `Start with a command verb (not “${fw || '...'}”)`, tip: 'Instructions use the imperative mood: Press, Remove, Wait, Turn.' });
  } else {
    checks.push({ id: 'imperative', level: 'pass', label: 'Starts with a command verb' });
  }

  for (const [re, tip] of VAGUE_INSTRUCTION) {
    const m = t.match(re);
    if (m) checks.push({ id: 'vague-' + m[0].toLowerCase(), level: 'warn', label: `Vague: “${m[0]}”`, tip });
  }

  const passive = findPassive(t);
  if (passive.length) {
    checks.push({ id: 'passive', level: 'warn', label: `Passive voice: “${t.slice(passive[0].start, passive[0].end)}”`, tip: 'Tell the reader to do it: "The lid is removed" becomes "Remove the lid".' });
  }

  const words = countWords(t);
  if (words > 25) checks.push({ id: 'long', level: 'warn', label: `Long step (${words} words). Aim for 25 or fewer.` });

  const actionJoins = t.match(new RegExp(`\\b(?:and|then|;)\\s+(?:then\\s+)?(${IMPERATIVE_VERBS.join('|')})\\b`, 'gi')) ?? [];
  const semis = (t.match(/;/g) ?? []).length;
  if (actionJoins.length > 0 || semis > 0 || /\band then\b/i.test(t)) {
    checks.push({ id: 'multi', level: 'warn', label: 'More than one action. Split this into separate steps.', tip: 'One step = one action, so readers do not skip half of it.' });
  }

  if (MEASURE_VERBS.includes(fw) && !/\d/.test(t) && !NUMBER_WORDS.test(t) && !/\buntil\b/i.test(t)) {
    checks.push({ id: 'measure', level: 'warn', label: 'Add a measurement: how much, how long, how far, or what setting?' });
  }

  const mat = materials.toLowerCase();
  const missing = MATERIAL_NOUNS.filter((n) => {
    if (!phraseRegex(n).test(t)) return false;
    const singular = n.replace(/s$/, '');
    return !mat.includes(singular);
  });
  const unique = [...new Set(missing.map((m) => m.replace(/s$/, '')))];
  if (unique.length) {
    checks.push({ id: 'prereq', level: 'fail', label: `Missing from materials: ${unique.join(', ')}`, tip: 'Readers gather everything before they start. List it up front.' });
  }

  if (/\b(it|this|that|them)\b/i.test(main.split(/\s+/).slice(0, 3).join(' ')) && words < 6) {
    checks.push({ id: 'pronoun', level: 'warn', label: 'Unclear “it/this”. Name the object.' });
  }

  return checks;
}

export function analyzeProcedure(p: ProcedureInput): ProcedureReport {
  const steps = p.steps.map((s) => s.trim()).filter(Boolean);
  const doc: Check[] = [];
  doc.push({
    id: 'title',
    level: /^how to\b/i.test(p.title.trim()) || /\b(procedure|instructions|guide|sop)\b/i.test(p.title) ? 'pass' : 'warn',
    label: p.title.trim() ? 'Title names the task' : 'Add a title ("How to...")',
    tip: 'A clear title starts with "How to" or names the procedure.',
  });
  doc.push({
    id: 'audience',
    level: p.audience.trim().length >= 10 ? 'pass' : 'warn',
    label: p.audience.trim().length >= 10 ? 'Purpose and reader are stated' : 'State who this is for and what they will achieve',
  });
  doc.push({
    id: 'materials',
    required: true,
    level: p.materials.trim() ? 'pass' : 'fail',
    label: p.materials.trim() ? 'Lists materials and prerequisites' : 'List the materials, tools, and prerequisites',
  });
  doc.push({
    id: 'count',
    level: steps.length >= 3 && steps.length <= 15 ? 'pass' : 'warn',
    label:
      steps.length < 3
        ? 'Most procedures need at least 3 steps'
        : steps.length > 15
          ? 'Over 15 steps: group them into sections with subheadings'
          : `${steps.length} steps`,
  });
  const allText = [p.title, p.materials, ...steps].join(' ').toLowerCase();
  const hazards = HAZARD_WORDS.filter((h) => new RegExp('\\b' + h, 'i').test(allText));
  if (hazards.length) {
    doc.push({
      id: 'safety',
      required: true,
      level: p.warnings.trim() ? 'pass' : 'fail',
      label: p.warnings.trim() ? 'Safety warning included' : `Add a safety warning (mentions: ${hazards.slice(0, 3).join(', ')})`,
      tip: 'Put warnings before the step where the danger happens, not at the end.',
    });
  }
  doc.push({
    id: 'result',
    level: p.result.trim() ? 'pass' : 'warn',
    label: p.result.trim() ? 'Describes the finished result' : 'Tell readers how they know they succeeded',
  });
  const tone = lintText([p.audience, p.warnings, p.result].join('\n'), { formal: false }).filter((i) => i.kind === 'slang');
  if (tone.length) doc.push({ id: 'tone', level: 'warn', label: 'Informal words in the intro or notes' });

  const reports = steps.map((s, i) => ({ index: i, text: s, checks: checkStep(s, p.materials) }));
  const stepIssues = reports.reduce((a, r) => a + r.checks.filter((c) => c.level === 'fail').length * 2 + r.checks.filter((c) => c.level === 'warn').length, 0);
  const docIssues = doc.filter((c) => c.level === 'fail').length * 3 + doc.filter((c) => c.level === 'warn').length;
  const denom = Math.max(4, steps.length);
  const score = Math.max(0, Math.round(100 - (stepIssues / denom) * 18 - docIssues * 5));
  return { doc, steps: reports, score: steps.length ? score : 0 };
}

/* ------------------------------------------------------------------ */
/* Business memo                                                      */
/* ------------------------------------------------------------------ */

export interface MemoInput {
  to: string;
  from: string;
  date: string;
  subject: string;
  body: string;
}

const VAGUE_SUBJECTS = /^(update|info|information|hi|hello|meeting|question|important|memo|fyi|news|reminder|stuff|note)\.?$/i;

export function analyzeMemo(m: MemoInput): { checks: Check[]; score: number } {
  const checks: Check[] = [];
  for (const [key, label] of [
    ['to', 'TO'],
    ['from', 'FROM'],
    ['date', 'DATE'],
    ['subject', 'SUBJECT'],
  ] as const) {
    checks.push({ id: 'h-' + key, required: true, level: m[key].trim() ? 'pass' : 'fail', label: m[key].trim() ? `${label} line filled` : `Fill in the ${label} line` });
  }
  const subjWords = countWords(m.subject);
  checks.push({
    id: 'subject-specific',
    level: subjWords >= 4 && !VAGUE_SUBJECTS.test(m.subject.trim()) ? 'pass' : 'warn',
    label: subjWords >= 4 && !VAGUE_SUBJECTS.test(m.subject.trim()) ? 'Subject line is specific' : 'Make the subject specific (4+ words: what, and by when)',
    tip: 'Not "Update". Try "New Locker Cleanout Date: June 20".',
  });
  const paras = m.body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const first = splitSentences(m.body)[0]?.text ?? '';
  const purpose = /\b(purpose|to inform|to request|to propose|to announce|to remind|to confirm|to update|to ask|to share|this memo|i am writing|please|we will|starting|effective|beginning)\b/i.test(first);
  checks.push({
    id: 'purpose',
    level: purpose ? 'pass' : 'warn',
    label: purpose ? 'Opens with the purpose' : 'State the purpose in the first sentence',
    tip: 'Busy readers decide from line one whether to keep reading.',
  });
  const action = /\b(please|by\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|\w+ \d{1,2}|\d)|deadline|no later than|before\s+\w+\s+\d|contact|reply|submit|sign up|register|let me know)\b/i.test(m.body);
  checks.push({
    id: 'action',
    level: action ? 'pass' : 'warn',
    label: action ? 'Includes an action or deadline' : 'Tell readers what to do and by when',
  });
  const longPara = paras.some((p) => splitSentences(p).length > 5);
  checks.push({ id: 'paras', level: longPara ? 'warn' : 'pass', label: longPara ? 'Break long paragraphs (5+ sentences) apart' : 'Paragraphs are short and scannable' });
  const greeting = /^(dear|hi|hello|hey)\b/i.test(m.body.trim());
  if (greeting) checks.push({ id: 'greeting', level: 'warn', label: 'Memos skip "Dear/Hi". The TO line does that job.' });
  const signoff = /\n\s*(love|cheers|xoxo|thanks!+|later)\b/i.test(m.body);
  if (signoff) checks.push({ id: 'signoff', level: 'warn', label: 'Use a professional close (or none) in a memo' });
  const words = countWords(m.body);
  checks.push({
    id: 'length',
    level: words >= 60 && words <= 350 ? 'pass' : 'warn',
    label: words < 60 ? `Short (${words} words). Add the details readers need.` : words > 350 ? `Long (${words} words). Cut to one screen.` : `${words} words: one screen`,
  });
  const lint = lintText(m.body, { formal: true });
  const slang = lint.filter((i) => i.kind === 'slang' || i.kind === 'splice' || i.kind === 'mechanics').length;
  checks.push({ id: 'tone', level: slang ? 'warn' : 'pass', label: slang ? `${slang} tone or mechanics issue(s). Run it through the linter.` : 'Professional tone' });
  const fails = checks.filter((c) => c.level === 'fail').length;
  const warns = checks.filter((c) => c.level === 'warn').length;
  return { checks, score: Math.max(0, 100 - fails * 12 - warns * 7) };
}

/* ------------------------------------------------------------------ */
/* Photo essay captions                                                */
/* ------------------------------------------------------------------ */

export function checkCaption(caption: string): Check[] {
  const t = caption.trim();
  if (!t) return [{ id: 'empty', level: 'fail', label: 'Write a caption' }];
  const sentences = splitSentences(t).length;
  const words = countWords(t);
  const passive = findPassive(t).length > 0;
  const lazy = /^(this is|here is|here's|this picture|this photo|in this (picture|photo|image)|a picture of|a photo of)/i.test(t);
  return [
    { id: 'sentences', level: sentences <= 2 ? 'pass' : 'fail', label: sentences <= 2 ? `${sentences} sentence${sentences === 1 ? '' : 's'}` : 'Cut to 2 sentences or fewer' },
    { id: 'words', level: words <= 35 ? 'pass' : 'warn', label: words <= 35 ? `${words} words` : `${words} words. Tighten to 35 or fewer.` },
    { id: 'lazy', level: lazy ? 'fail' : 'pass', label: lazy ? 'Cut "This is a picture of..." and start with the subject doing something' : 'Starts with substance' },
    { id: 'active', level: passive ? 'warn' : 'pass', label: passive ? 'Passive voice. Use an active verb.' : 'Active voice' },
  ];
}
