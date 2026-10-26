import { FILLERS } from './lexicon.ts';
import { phraseRegex, wordSpans } from './textAnalysis.ts';

export const WPM_TARGET = { min: 130, max: 150 };

export function wpm(words: number, seconds: number): number {
  if (seconds <= 0) return 0;
  return Math.round((words / seconds) * 60);
}

export function wpmVerdict(rate: number): { tone: 'good' | 'warn' | 'bad'; text: string } {
  if (rate === 0) return { tone: 'warn', text: 'No speech measured yet.' };
  if (rate < 110) return { tone: 'bad', text: 'Too slow. Listeners drift. Cut long pauses and keep energy up.' };
  if (rate < WPM_TARGET.min) return { tone: 'warn', text: 'A little slow. Fine for key lines, but pick up the pace between them.' };
  if (rate <= WPM_TARGET.max) return { tone: 'good', text: 'In the target zone (130–150 WPM).' };
  if (rate <= 170) return { tone: 'warn', text: 'A little fast. Add a breath after each key point.' };
  return { tone: 'bad', text: 'Too fast to follow. Slow down and pause at each signpost.' };
}

/** Counts filler words in a transcript. "like" only counts when it is not followed by a noun-ish article ("like a"). */
export function countFillers(transcript: string): { total: number; byWord: Record<string, number> } {
  const byWord: Record<string, number> = {};
  let total = 0;
  const text = transcript.toLowerCase();
  for (const f of FILLERS) {
    let n = 0;
    const re = phraseRegex(f);
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      if (f === 'like') {
        const next = text.slice(m.index + 4, m.index + 12);
        const prev = text.slice(Math.max(0, m.index - 6), m.index);
        if (/^\s+(a|an|the|this|that|my|your|his|her|their|our|to)\b/.test(next) || /\b(i|you|we|they|would|do|don't|feel|looks?|just)\s+$/.test(prev)) continue;
      }
      if (f === 'so' || f === 'right' || f === 'actually') {
        // only a filler when it opens a phrase ("So, um..." / "..., right,")
        const before = text.slice(0, m.index).trimEnd();
        if (before !== '' && !/[.,!?;:]$/.test(before)) continue;
      }
      n++;
    }
    if (n) {
      byWord[f] = n;
      total += n;
    }
  }
  return { total, byWord };
}

export function transcriptWords(transcript: string): number {
  return wordSpans(transcript).length;
}

export interface PauseReport {
  /** Pause lengths in seconds, in order. */
  pauses: number[];
  short: number;
  medium: number;
  long: number;
  speakingSeconds: number;
  totalSeconds: number;
  /** First to last moment of speech. */
  activeSeconds: number;
  threshold: number;
}

function percentile(sorted: number[], p: number): number {
  if (!sorted.length) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.round((sorted.length - 1) * p)));
  return sorted[idx];
}

/**
 * Finds pauses in a loudness trace (RMS values sampled every `stepMs`).
 * The silence threshold adapts to the room: it sits a quarter of the way
 * between the noise floor and typical speech loudness.
 */
export function analyzePauses(levels: number[], stepMs: number, minPauseMs = 350): PauseReport {
  const totalSeconds = (levels.length * stepMs) / 1000;
  const empty: PauseReport = { pauses: [], short: 0, medium: 0, long: 0, speakingSeconds: 0, totalSeconds, activeSeconds: 0, threshold: 0 };
  if (levels.length < 4) return empty;
  const sorted = levels.slice().sort((a, b) => a - b);
  const floor = percentile(sorted, 0.1);
  const loud = percentile(sorted, 0.9);
  if (loud - floor < 0.004) return empty;
  const threshold = floor + (loud - floor) * 0.25;
  const voiced = levels.map((l) => l > threshold);
  const first = voiced.indexOf(true);
  const last = voiced.lastIndexOf(true);
  if (first === -1) return { ...empty, threshold };
  const pauses: number[] = [];
  let run = 0;
  let speaking = 0;
  for (let i = first; i <= last; i++) {
    if (voiced[i]) {
      speaking++;
      if (run * stepMs >= minPauseMs) pauses.push((run * stepMs) / 1000);
      run = 0;
    } else {
      run++;
    }
  }
  const short = pauses.filter((p) => p < 1).length;
  const medium = pauses.filter((p) => p >= 1 && p < 2).length;
  const long = pauses.filter((p) => p >= 2).length;
  return {
    pauses,
    short,
    medium,
    long,
    speakingSeconds: (speaking * stepMs) / 1000,
    totalSeconds,
    activeSeconds: ((last - first + 1) * stepMs) / 1000,
    threshold,
  };
}

export function pauseAdvice(r: PauseReport): string {
  if (!r.pauses.length) return 'No clear pauses found. Pause for a breath after each main point so listeners can keep up.';
  const perMin = r.pauses.length / Math.max(r.activeSeconds / 60, 0.25);
  if (r.long > 2) return `${r.long} pauses longer than 2 seconds. Long gaps read as lost place. Rehearse the transitions.`;
  if (perMin < 4) return 'Few pauses. Add a deliberate pause after your hook and before your call to action.';
  if (perMin > 20) return 'Very choppy delivery. Group words into phrases and pause at punctuation only.';
  return 'Healthy pause pattern: short breaths between phrases with a few longer, deliberate pauses.';
}

/** Words in a script, and how long it should take at the middle of the target range. */
export function scriptTiming(script: string): { words: number; seconds: number } {
  const words = wordSpans(script).length;
  return { words, seconds: Math.round((words / 140) * 60) };
}

/** 0-100 delivery score: pace (40), fillers (30), pauses (30). */
export function deliveryScore(rate: number, fillersPerMin: number, r: PauseReport | null): number {
  let pace = 0;
  if (rate > 0) {
    const dist = rate < WPM_TARGET.min ? WPM_TARGET.min - rate : rate > WPM_TARGET.max ? rate - WPM_TARGET.max : 0;
    pace = Math.max(0, 40 - dist * 1.2);
  }
  const fill = Math.max(0, 30 - fillersPerMin * 6);
  let pause = 15;
  if (r && r.activeSeconds > 0) {
    const perMin = r.pauses.length / Math.max(r.activeSeconds / 60, 0.25);
    pause = 30;
    if (perMin < 4) pause -= 12;
    if (perMin > 20) pause -= 12;
    pause -= Math.min(15, r.long * 5);
  }
  return Math.round(Math.max(0, Math.min(100, pace + fill + Math.max(0, pause))));
}

/** RMS loudness every `stepMs` from raw samples (mono). */
export function rmsTrace(samples: Float32Array, sampleRate: number, stepMs = 50): number[] {
  const win = Math.max(1, Math.floor((sampleRate * stepMs) / 1000));
  const out: number[] = [];
  for (let i = 0; i + win <= samples.length; i += win) {
    let sum = 0;
    for (let j = i; j < i + win; j++) sum += samples[j] * samples[j];
    out.push(Math.sqrt(sum / win));
  }
  return out;
}

/** Simple structure checks for a persuasive speech script. */
export function scriptChecks(script: string): { id: string; level: 'pass' | 'warn' | 'fail'; label: string; tip?: string }[] {
  const t = script.trim();
  const { words } = scriptTiming(t);
  const sentences = t.split(/(?<=[.!?])\s+/).filter(Boolean);
  const avg = sentences.length ? words / sentences.length : 0;
  const long = sentences.filter((s) => wordSpans(s).length > 22).length;
  const signposts = (t.match(/\b(first|second|third|next|finally|my (first|second|last|final) (reason|point)|here is|so what|in short|the bottom line)\b/gi) ?? []).length;
  const question = /\?/.test(t);
  const lastPart = sentences.slice(-3).join(' ');
  const cta = /\b(vote|sign|join|ask|start|stop|choose|put|text|call|tell|share|come|bring|pledge|try|let's|let us|take|support)\b/i.test(lastPart);
  return [
    {
      id: 'length',
      level: words >= 240 && words <= 320 ? 'pass' : words === 0 ? 'fail' : 'warn',
      label: words >= 240 && words <= 320 ? `${words} words: about 2 minutes` : `${words} words. A 2-minute speech is about 260–300.`,
    },
    { id: 'avg', level: avg > 0 && avg <= 18 ? 'pass' : 'warn', label: avg ? `Average sentence ${avg.toFixed(1)} words${avg > 18 ? ' (long for listeners)' : ''}` : 'Write your script', tip: 'Listeners cannot reread. Aim for under 18 words.' },
    { id: 'long', level: long === 0 ? 'pass' : 'warn', label: long === 0 ? 'No overloaded sentences' : `${long} sentence(s) over 22 words. Split them.` },
    { id: 'signpost', level: signposts >= 2 ? 'pass' : 'warn', label: signposts >= 2 ? `${signposts} signposts` : 'Add signposts: "First...", "My second reason...", "Finally..."' },
    { id: 'question', level: question ? 'pass' : 'warn', label: question ? 'Uses a question to engage listeners' : 'Try a rhetorical question in your hook' },
    { id: 'cta', level: cta ? 'pass' : 'warn', label: cta ? 'Ends with a call to action' : 'End by telling listeners exactly what to do' },
  ];
}
