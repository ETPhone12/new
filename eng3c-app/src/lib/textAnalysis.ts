import {
  ADJECTIVE_ED,
  CONTRACTIONS,
  HEDGES,
  IRREGULAR_PARTICIPLES,
  PRONOUN_SUBJECTS,
  SLANG,
  SUBORDINATORS,
  WEAK_INTENSIFIERS,
  WORDY,
} from './lexicon.ts';

export type IssueKind =
  | 'wordy'
  | 'slang'
  | 'vague'
  | 'passive'
  | 'splice'
  | 'runon'
  | 'hedge'
  | 'intensifier'
  | 'contraction'
  | 'second-person'
  | 'starter'
  | 'repeat'
  | 'mechanics';

export type Severity = 'error' | 'warn' | 'info';

export interface Issue {
  start: number;
  end: number;
  kind: IssueKind;
  severity: Severity;
  message: string;
  replacement?: string;
  /** Sentence-level issues cover a whole sentence and are listed, not underlined. */
  scope: 'span' | 'sentence';
}

export interface Span {
  text: string;
  start: number;
  end: number;
}

export const KIND_LABEL: Record<IssueKind, string> = {
  wordy: 'Wordy phrase',
  slang: 'Informal / slang',
  vague: 'Vague word',
  passive: 'Passive voice',
  splice: 'Comma splice',
  runon: 'Run-on / overloaded sentence',
  hedge: 'Hedging',
  intensifier: 'Empty intensifier',
  contraction: 'Contraction',
  'second-person': 'Second person ("you")',
  starter: 'Informal sentence opener',
  repeat: 'Repeated word',
  mechanics: 'Mechanics',
};

const ABBREVIATIONS = new Set([
  'mr', 'mrs', 'ms', 'dr', 'prof', 'st', 'ave', 'rd', 'blvd', 'jr', 'sr', 'vs', 'etc', 'e.g', 'i.e', 'a.m', 'p.m', 'no',
  'fig', 'approx', 'dept', 'inc', 'ltd', 'co', 'mt', 'u.s', 'u.k', 'ph.d', 'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug',
  'sep', 'sept', 'oct', 'nov', 'dec', 'p', 'pp', 'vol', 'ed', 'eds', 'al',
]);

export function splitSentences(text: string): Span[] {
  const out: Span[] = [];
  let start = 0;
  const push = (end: number) => {
    let s = start;
    let e = end;
    while (s < e && /\s/.test(text[s])) s++;
    while (e > s && /\s/.test(text[e - 1])) e--;
    if (e > s) out.push({ text: text.slice(s, e), start: s, end: e });
    start = end;
  };
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '\n' && text[i + 1] === '\n') {
      push(i);
      continue;
    }
    if (ch !== '.' && ch !== '!' && ch !== '?') continue;
    // decimals like 3.5
    if (ch === '.' && /\d/.test(text[i - 1] ?? '') && /\d/.test(text[i + 1] ?? '')) continue;
    // run of terminal punctuation and closing quotes/brackets
    let j = i + 1;
    while (j < text.length && /[.!?"'”’)\]]/.test(text[j])) j++;
    if (j < text.length && !/\s/.test(text[j])) continue;
    if (ch === '.') {
      const before = text.slice(start, i);
      const m = before.match(/([A-Za-z][A-Za-z.]*)$/);
      if (m) {
        const word = m[1].toLowerCase();
        if (ABBREVIATIONS.has(word) || /^[a-z]$/i.test(word)) continue;
      }
    }
    push(j);
    i = j - 1;
  }
  push(text.length);
  return out;
}

export function wordSpans(text: string): Span[] {
  const out: Span[] = [];
  const re = /[A-Za-z0-9À-ɏ]+(?:['’-][A-Za-z0-9À-ɏ]+)*/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) out.push({ text: m[0], start: m.index, end: m.index + m[0].length });
  return out;
}

export function countWords(text: string): number {
  return wordSpans(text).length;
}

export function syllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const trimmed = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '');
  const groups = trimmed.match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 1);
}

export interface TextStats {
  words: number;
  sentences: number;
  avgSentence: number;
  longestSentence: number;
  gradeLevel: number;
  readingMinutes: number;
}

export function textStats(text: string): TextStats {
  const sents = splitSentences(text);
  const words = wordSpans(text);
  const sentenceLens = sents.map((s) => countWords(s.text));
  const syl = words.reduce((a, w) => a + syllables(w.text), 0);
  const n = Math.max(1, words.length);
  const sc = Math.max(1, sents.length);
  const grade = words.length ? 0.39 * (n / sc) + 11.8 * (syl / n) - 15.59 : 0;
  return {
    words: words.length,
    sentences: sents.length,
    avgSentence: words.length ? n / sc : 0,
    longestSentence: sentenceLens.length ? Math.max(...sentenceLens) : 0,
    gradeLevel: Math.max(0, Math.round(grade * 10) / 10),
    readingMinutes: words.length / 230,
  };
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function phraseRegex(phrase: string): RegExp {
  const startB = /^\w/.test(phrase) ? '\\b' : '';
  const endB = /\w$/.test(phrase) ? '\\b' : '';
  const body = escapeRe(phrase).replace(/'/g, "['’]").replace(/ /g, '\\s+');
  return new RegExp(startB + body + endB, 'gi');
}

function findAll(text: string, re: RegExp, cb: (m: RegExpExecArray) => void) {
  re.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    cb(m);
    if (m[0].length === 0) re.lastIndex++;
  }
}

/** Keeps the case of the original's first letter on an automatic replacement. */
export function matchCase(original: string, replacement: string): string {
  if (/^[A-Z]/.test(original) && /^[a-z]/.test(replacement)) return replacement[0].toUpperCase() + replacement.slice(1);
  return replacement;
}

/** Common apostrophe and homophone slips: [pattern capturing the wrong word, fix, message]. */
const CONFUSIONS: [RegExp, string, string][] = [
  [/\b(its)(?=\s+(?:going|been|not|a|an|the|time|important|hard|easy|true|clear|ok|okay|so|very|really|about|too|only|just|never|always)\b)/gi, "it's", '“Its” is possessive. For “it is”, write “it’s”.'],
  [/\b(there)(?=\s+(?:own|body|bodies|car|cars|house|home|parents|friends|homework|teacher|teachers|school|phone|phones|class|team|job|jobs|lives|life|work|money|way|textbooks?|books?|clothes|names?|family|families)\b)/gi, 'their', 'Use “their” to show ownership.'],
  [/\b(your)(?=\s+(?:welcome|going|right|wrong|not|being|so|very|the best|gonna)\b)/gi, "you're", 'For “you are”, write “you’re”.'],
  [/(?<=\b(?:more|less|better|worse|rather|bigger|smaller|faster|slower|later|earlier|higher|lower|older|younger|other)\s+)(then)\b/gi, 'than', 'Comparisons use “than”, not “then”.'],
  [/\b(cant)\b/gi, "can't", 'Missing apostrophe: “can’t” (or “cannot” in formal writing).'],
  [/\b(dont)\b/gi, "don't", 'Missing apostrophe: “don’t”.'],
  [/\b(doesnt)\b/gi, "doesn't", 'Missing apostrophe: “doesn’t”.'],
  [/\b(didnt)\b/gi, "didn't", 'Missing apostrophe: “didn’t”.'],
  [/\b(isnt)\b/gi, "isn't", 'Missing apostrophe: “isn’t”.'],
  [/\b(im)\b/g, "I'm", 'Write “I’m” (or “I am”).'],
  [/\b(alot)\b/gi, 'a lot', '“alot” is not a word. Write “a lot”, or better, “many” or “much”.'],
];

const VAGUE_ONLY = new Set(['stuff', 'things', 'thing', 'get', 'got', 'huge', 'ok', 'okay', 'kids', 'a lot', 'a lot of', 'lots of']);
const AUTO_SLANG = new Set(['gonna', 'wanna', 'kinda', 'sorta', 'u', 'ur', 'idk', 'yeah', 'nope']);

const PASSIVE_RE = new RegExp(
  `\\b(am|is|are|was|were|be|been|being)\\s+(?:(?:not|also|often|always|never|then|still|usually|quickly|easily|being|already|just|recently|later|currently|carefully|widely|commonly)\\s+)?([a-z]+ed|${IRREGULAR_PARTICIPLES.join('|')})\\b(\\s+by\\b)?`,
  'gi',
);

export function findPassive(text: string): { start: number; end: number; byAgent: boolean }[] {
  const out: { start: number; end: number; byAgent: boolean }[] = [];
  const adjectives = new Set(ADJECTIVE_ED);
  findAll(text, PASSIVE_RE, (m) => {
    const participle = m[2].toLowerCase();
    if (adjectives.has(participle) && !m[3]) return;
    if (participle.length < 4 && participle.endsWith('ed') && !IRREGULAR_PARTICIPLES.includes(participle)) return;
    out.push({ start: m.index, end: m.index + m[0].length, byAgent: Boolean(m[3]) });
  });
  return out;
}

export interface LintOptions {
  /** Formal academic or business register: flags contractions, "you", hedges. */
  formal?: boolean;
}

export function lintText(text: string, opts: LintOptions = {}): Issue[] {
  const formal = opts.formal ?? true;
  const issues: Issue[] = [];
  const add = (i: Omit<Issue, 'scope'> & { scope?: Issue['scope'] }) => issues.push({ scope: 'span', ...i });

  for (const [phrase, rep] of WORDY) {
    findAll(text, phraseRegex(phrase), (m) => {
      const auto = !rep.startsWith('(') && !rep.includes('/') && !rep.includes(' or ');
      add({
        start: m.index,
        end: m.index + m[0].length,
        kind: 'wordy',
        severity: 'warn',
        message: `Wordy: try “${rep}”.`,
        replacement: auto ? matchCase(m[0], rep) : rep === '(cut it)' ? '' : undefined,
      });
    });
  }

  for (const [word, rep] of SLANG) {
    findAll(text, phraseRegex(word), (m) => {
      const vague = VAGUE_ONLY.has(word);
      const isAlot = word === 'alot';
      const len = m[0].length - (word.endsWith(',') ? 1 : 0);
      add({
        start: m.index,
        end: m.index + len,
        kind: vague ? 'vague' : isAlot ? 'mechanics' : 'slang',
        severity: vague ? 'info' : isAlot ? 'error' : 'warn',
        message: vague
          ? `Vague: replace with ${rep}.`
          : isAlot
            ? '“alot” is not a word. Write “a lot”, or better, “many” or “much”.'
            : rep.startsWith('(')
              ? `Informal: ${rep.slice(1, -1)}.`
              : `Informal: use “${rep}”.`,
        replacement: AUTO_SLANG.has(word) ? matchCase(m[0], rep) : undefined,
      });
    });
  }

  for (const w of WEAK_INTENSIFIERS) {
    findAll(text, phraseRegex(w), (m) => {
      add({
        start: m.index,
        end: m.index + m[0].length,
        kind: 'intensifier',
        severity: 'info',
        message: `“${m[0]}” adds little. Cut it or use one stronger, precise word.`,
      });
    });
  }

  if (formal) {
    for (const h of HEDGES) {
      findAll(text, phraseRegex(h), (m) => {
        add({
          start: m.index,
          end: m.index + m[0].length,
          kind: 'hedge',
          severity: 'warn',
          message: 'Hedge: state the claim directly and back it with evidence.',
        });
      });
    }
    findAll(text, new RegExp(CONTRACTIONS.source, 'gi'), (m) => {
      add({
        start: m.index,
        end: m.index + m[0].length,
        kind: 'contraction',
        severity: 'info',
        message: 'Formal writing usually spells out contractions.',
        replacement: expandContraction(m[0]),
      });
    });
    findAll(text, /\byou(?:r|rs|rself|'re|’re)?\b/gi, (m) => {
      add({
        start: m.index,
        end: m.index + m[0].length,
        kind: 'second-person',
        severity: 'info',
        message: 'Formal essays avoid “you”. Name who you mean (students, readers, drivers).',
      });
    });
  }

  for (const p of findPassive(text)) {
    add({
      start: p.start,
      end: p.end,
      kind: 'passive',
      severity: 'warn',
      message: p.byAgent
        ? 'Passive voice: move the “by ___” doer to the front as the subject.'
        : 'Possible passive voice: who does the action? Make them the subject.',
    });
  }

  findAll(text, /\b(\w+)\s+\1\b/gi, (m) => {
    if (/^\d+$/.test(m[1])) return;
    const w = m[1].toLowerCase();
    if (w === 'that' || w === 'had') return;
    add({ start: m.index, end: m.index + m[0].length, kind: 'repeat', severity: 'error', message: `Repeated word “${m[1]}”.`, replacement: m[1] });
  });

  findAll(text, /\b(could|should|would|must|might)\s+of\b/gi, (m) => {
    add({ start: m.index, end: m.index + m[0].length, kind: 'mechanics', severity: 'error', message: `Write “${m[1]} have”, not “${m[1]} of”.`, replacement: `${m[1]} have` });
  });
  findAll(text, /(^|[\s(“"])i(?=[\s,.!?;:'’]|$)/g, (m) => {
    const s = m.index + m[1].length;
    add({ start: s, end: s + 1, kind: 'mechanics', severity: 'error', message: 'Capitalize the pronoun “I”.', replacement: 'I' });
  });
  for (const [re, fixWord, msg] of CONFUSIONS) {
    findAll(text, re, (m) => {
      const word = m[1];
      add({
        start: m.index,
        end: m.index + word.length,
        kind: 'mechanics',
        severity: 'error',
        message: msg,
        replacement: matchCase(word, fixWord),
      });
    });
  }
  findAll(text, /[!?]{2,}/g, (m) => {
    add({ start: m.index, end: m.index + m[0].length, kind: 'mechanics', severity: 'warn', message: 'Use one end mark in formal writing.', replacement: m[0][0] });
  });

  const subordinators = new Set(SUBORDINATORS);
  const pronouns = PRONOUN_SUBJECTS.join('|');
  const spliceAfter = new RegExp(`^\\s+(${pronouns})\\s+([a-z'’]+)`, 'i');
  const dialogueTags = new Set(['said', 'says', 'asked', 'asks', 'replied', 'added', 'explained', 'shouted', 'whispered', 'told', 'yelled', 'wrote', 'noted', 'answered', 'continued', 'admitted', 'argued', 'claimed', 'stated']);
  for (const s of splitSentences(text)) {
    const words = countWords(s.text);
    const first = s.text.match(/^["“'‘(]*([A-Za-z]+)/);
    if (first && /^[a-z]/.test(first[1]) && first[1] !== 'i' && !/^(e\.g|i\.e)/i.test(s.text)) {
      const at = s.start + s.text.indexOf(first[1]);
      add({ start: at, end: at + 1, kind: 'mechanics', severity: 'warn', message: 'Start the sentence with a capital letter.', replacement: first[1][0].toUpperCase() });
    }
    if (first && /^(and|but|so|also|plus|or)$/i.test(first[1])) {
      const at = s.start + s.text.indexOf(first[1]);
      add({ start: at, end: at + first[1].length, kind: 'starter', severity: 'info', message: `Opening with “${first[1]}” reads as casual. Join it to the previous sentence or use a transition (However, Also, Therefore).` });
    }
    if (words > 40) {
      add({ start: s.start, end: s.end, scope: 'sentence', kind: 'runon', severity: 'warn', message: `Long sentence (${words} words). Split it so each sentence makes one point.` });
    } else if (words > 28 && !/[,;:—–]/.test(s.text)) {
      add({ start: s.start, end: s.end, scope: 'sentence', kind: 'runon', severity: 'warn', message: `Possible run-on: ${words} words with no internal punctuation.` });
    }
    const ands = (s.text.match(/\band\b/gi) ?? []).length;
    if (ands >= 3) {
      add({ start: s.start, end: s.end, scope: 'sentence', kind: 'runon', severity: 'info', message: `${ands} “and”s chained together. Break the list or subordinate some ideas.` });
    }
    // comma splice: an independent clause, a comma, then a new subject + verb
    let ci = s.text.indexOf(',');
    while (ci !== -1) {
      const before = s.text.slice(0, ci);
      const after = s.text.slice(ci + 1);
      const m = after.match(spliceAfter);
      const beforeWords = before.trim().split(/\s+/);
      const firstWord = beforeWords[0]?.replace(/[^a-z]/gi, '').toLowerCase() ?? '';
      const prevChar = s.text[ci - 1] ?? '';
      if (
        m &&
        beforeWords.length >= 3 &&
        !subordinators.has(firstWord) &&
        !dialogueTags.has(m[2].toLowerCase()) &&
        !/["”'’]/.test(prevChar) &&
        !/[“"]/.test(before) &&
        !/\b(and|or|but)\s*$/i.test(before) &&
        !/^(and|or|but|so|yet|nor|which|who)$/i.test(m[2])
      ) {
        const at = s.start + ci;
        add({
          start: at,
          end: at + 1 + m[0].length,
          kind: 'splice',
          severity: 'error',
          message: 'Comma splice: two complete sentences joined by a comma. Use a period, a semicolon, or add “and/but/so”.',
        });
        break;
      }
      ci = s.text.indexOf(',', ci + 1);
    }
  }

  return dedupe(issues);
}

const SEV_RANK: Record<Severity, number> = { error: 0, warn: 1, info: 2 };

function dedupe(issues: Issue[]): Issue[] {
  const spans = issues
    .filter((i) => i.scope === 'span')
    .sort((a, b) => SEV_RANK[a.severity] - SEV_RANK[b.severity] || a.start - b.start || b.end - a.end);
  const kept: Issue[] = [];
  for (const i of spans) {
    if (kept.some((k) => i.start < k.end && k.start < i.end)) continue;
    kept.push(i);
  }
  const sentences = issues.filter((i) => i.scope === 'sentence');
  return [...kept, ...sentences].sort((a, b) => a.start - b.start || SEV_RANK[a.severity] - SEV_RANK[b.severity]);
}

const CONTRACTION_MAP: Record<string, string> = {
  "can't": 'cannot', "won't": 'will not', "don't": 'do not', "doesn't": 'does not', "didn't": 'did not', "isn't": 'is not',
  "aren't": 'are not', "wasn't": 'was not', "weren't": 'were not', "haven't": 'have not', "hasn't": 'has not', "hadn't": 'had not',
  "shouldn't": 'should not', "wouldn't": 'would not', "couldn't": 'could not', "mustn't": 'must not', "i'm": 'I am', "it's": 'it is',
  "that's": 'that is', "there's": 'there is', "what's": 'what is', "let's": 'let us', "here's": 'here is', "who's": 'who is',
  "they're": 'they are', "we're": 'we are', "you're": 'you are', "they've": 'they have', "we've": 'we have', "i've": 'I have',
  "you've": 'you have', "they'll": 'they will', "we'll": 'we will', "i'll": 'I will', "you'll": 'you will', "it'll": 'it will',
  "i'd": 'I would', "they'd": 'they would', "we'd": 'we would', "you'd": 'you would', "he's": 'he is', "she's": 'she is',
};

export function expandContraction(word: string): string | undefined {
  const key = word.toLowerCase().replace(/’/g, "'");
  const rep = CONTRACTION_MAP[key];
  return rep ? matchCase(word, rep) : undefined;
}

/** 0-100. Errors cost more than warnings; scaled per 100 words so long texts are not punished for length. */
export function precisionScore(issues: Issue[], words: number): number {
  if (words === 0) return 0;
  const pts = issues.reduce((a, i) => a + (i.severity === 'error' ? 6 : i.severity === 'warn' ? 3 : 1), 0);
  const per100 = (pts * 100) / Math.max(words, 60);
  // smooth decay: a few slips still score in the 90s, a draft full of problems lands in the 30s
  return Math.max(0, Math.min(100, Math.round(100 * Math.exp(-per100 / 60))));
}

export function applyReplacement(text: string, issue: Issue): string {
  if (issue.replacement === undefined) return text;
  if (issue.replacement === '') {
    // cutting a phrase: tidy the doubled space and comma left behind
    const before = text.slice(0, issue.start).replace(/[ \t]+$/, '');
    let after = text.slice(issue.end).replace(/^,?[ \t]*/, '');
    const atSentenceStart = before === '' || /[.!?]["”’]?\s*$/.test(before) || /\n\s*$/.test(before);
    if (atSentenceStart && after) after = after[0].toUpperCase() + after.slice(1);
    if (!before) return after;
    if (/^[.,;:!?]/.test(after)) return before + after;
    return before + (after ? ' ' + after : '');
  }
  return text.slice(0, issue.start) + issue.replacement + text.slice(issue.end);
}

export function keywords(text: string, stop: Set<string>): Set<string> {
  return new Set(
    wordSpans(text)
      .map((w) => w.text.toLowerCase())
      .filter((w) => w.length > 3 && !stop.has(w))
      .map((w) => w.replace(/(ing|ed|es|s)$/, '')),
  );
}
