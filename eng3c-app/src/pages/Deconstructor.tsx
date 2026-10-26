import { useState } from 'react';
import { Check, Eraser, RotateCcw, X } from 'lucide-react';
import { HL_INFO, PASSAGES, PASSAGE_BY_ID, type HlLabel, type Passage } from '../data/readings';
import { recordToolRun, useDraft } from '../store/store';
import { requestReflection, toast } from '../store/ui';
import { McQuestion } from '../components/Quiz';
import { Callout, PageHeader, ScoreBadge, Segmented } from '../components/ui';
import { cx } from '../lib/util';

interface Draft {
  labels: Record<number, HlLabel>;
  notes: Record<number, string>;
  checked: boolean;
  answers: Record<number, number>;
}

const EMPTY: Draft = { labels: {}, notes: {}, checked: false, answers: {} };
const ORDER: HlLabel[] = ['thesis', 'fact', 'opinion', 'inference'];

function isRight(p: Passage, i: number, label: HlLabel | undefined) {
  if (!label) return false;
  const seg = p.segments[i];
  return seg.label === label || (seg.accept ?? []).includes(label);
}

export default function Deconstructor({ initial }: { initial?: string }) {
  const [pid, setPid] = useState(initial && PASSAGE_BY_ID[initial] ? initial : PASSAGES[0].id);
  return (
    <div>
      <PageHeader
        strand="B"
        eyebrow="B1 Reading for meaning · D1 Media texts"
        title="Text Deconstructor"
        desc="Pick a highlighter, then tap sentences. Blue for the thesis, green for verifiable facts, yellow for opinions and loaded language, purple where you must read between the lines."
      />
      <div className="mb-5">
        <Segmented label="Passage" value={pid} onChange={setPid} options={PASSAGES.map((p) => ({ value: p.id, label: p.kind.split(' ')[0] }))} />
      </div>
      <Reader key={pid} passage={PASSAGE_BY_ID[pid]} />
    </div>
  );
}

function Reader({ passage: p }: { passage: Passage }) {
  const [d, setD] = useDraft<Draft>(`reader:${p.id}`, EMPTY);
  const [pen, setPen] = useState<HlLabel | 'erase'>('thesis');

  const tap = (i: number) => {
    if (d.checked) return;
    setD((prev) => {
      const labels = { ...prev.labels };
      if (pen === 'erase' || labels[i] === pen) delete labels[i];
      else labels[i] = pen;
      return { ...prev, labels };
    });
  };

  const total = p.segments.length;
  const correct = p.segments.reduce((a, _s, i) => a + (isRight(p, i, d.labels[i]) ? 1 : 0), 0);
  const pct = Math.round((correct / total) * 100);
  const labelled = Object.keys(d.labels).length;
  const inferenceNotesMissing = Object.entries(d.labels).filter(([i, l]) => l === 'inference' && !(d.notes[Number(i)] ?? '').trim()).length;

  const check = () => {
    setD((prev) => ({ ...prev, checked: true }));
    recordToolRun(`reader:${p.id}`, pct);
    toast(`${correct} of ${total} sentences labelled correctly`);
  };

  const reset = () => setD(EMPTY);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
      <div className="min-w-0">
        <div className="sticky top-[calc(env(safe-area-inset-top,0px)+4.25rem)] z-20 -mx-1 mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-line bg-surface/95 p-2 backdrop-blur lg:top-4">
          {ORDER.map((l) => (
            <button
              key={l}
              type="button"
              disabled={d.checked}
              onClick={() => setPen(l)}
              aria-pressed={pen === l}
              className={cx('flex min-h-[2.4rem] items-center gap-2 rounded-md border px-2.5 text-sm font-bold', pen === l ? 'border-ink bg-sunken' : 'border-transparent hover:bg-sunken')}
            >
              <span className={cx('h-4 w-4 rounded-sm', HL_INFO[l].swatch)} aria-hidden />
              {HL_INFO[l].name.split(' /')[0]}
            </button>
          ))}
          <button type="button" disabled={d.checked} onClick={() => setPen('erase')} aria-pressed={pen === 'erase'} className={cx('flex min-h-[2.4rem] items-center gap-1.5 rounded-md border px-2.5 text-sm font-bold', pen === 'erase' ? 'border-ink bg-sunken' : 'border-transparent hover:bg-sunken')}>
            <Eraser size={16} /> Erase
          </button>
        </div>

        <article className="card p-5 sm:p-7">
          <div className="eyebrow">{p.kind}</div>
          <h2 className="mt-1 font-read text-2xl font-semibold">{p.title}</h2>
          <div className="mt-1 text-sm text-muted">{p.byline}</div>
          <div className="prose-read mt-5">
            {splitParas(p).map((para, pi) => (
              <p key={pi} className="mb-4">
                {para.map((i) => {
                  const seg = p.segments[i];
                  const label = d.labels[i];
                  const right = d.checked ? isRight(p, i, label) : null;
                  return (
                    <span key={i}>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={() => tap(i)}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), tap(i))}
                        className={cx('cursor-pointer rounded-sm transition-colors', label ? HL_INFO[label].cls : 'hover:bg-sunken', d.checked && 'cursor-default')}
                        aria-label={label ? `${seg.text} (marked ${HL_INFO[label].name})` : seg.text}
                      >
                        {seg.text}
                      </span>
                      {right !== null && (
                        <sup className={cx('ml-0.5 font-sans text-xs font-bold', right ? 'text-good' : 'text-bad')}>
                          {right ? <Check size={12} className="inline" /> : <X size={12} className="inline" />}
                        </sup>
                      )}{' '}
                    </span>
                  );
                })}
              </p>
            ))}
          </div>
        </article>
      </div>

      <aside className="min-w-0">
        <div className="card p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold">Annotation layer</h3>
            <span className="num text-sm text-muted">{labelled}/{total} marked</span>
          </div>
          <p className="mb-3 text-sm text-muted">{p.intro}</p>
          {labelled === 0 && <p className="rounded-lg bg-sunken p-3 text-sm text-muted">Your highlights appear here. For each purple one, write what the sentence implies.</p>}
          <ol className="grid gap-3">
            {p.segments.map((seg, i) => {
              const label = d.labels[i];
              if (!label && !d.checked) return null;
              const right = isRight(p, i, label);
              return (
                <li key={i} className={cx('rounded-lg border p-3', d.checked ? (right ? 'border-good/40' : 'border-bad/40') : 'border-line')}>
                  <div className="mb-1 flex items-center gap-2 text-xs font-bold">
                    {label ? <span className={cx('h-3 w-3 rounded-sm', HL_INFO[label].swatch)} /> : <span className="h-3 w-3 rounded-sm border border-line" />}
                    <span>{label ? HL_INFO[label].name : 'Not marked'}</span>
                    {d.checked && !right && <span className="text-bad">· key: {HL_INFO[seg.label].name}</span>}
                  </div>
                  <p className="line-clamp-2 font-read text-[0.9rem]">{seg.text}</p>
                  {(label === 'inference' || (d.checked && seg.inference)) && (
                    <>
                      <label htmlFor={`note-${p.id}-${i}`} className="label mt-2">What is implied?</label>
                      <textarea
                        id={`note-${p.id}-${i}`}
                        className="input min-h-[3.5rem] text-[0.92rem]"
                        value={d.notes[i] ?? ''}
                        onChange={(e) => setD((prev) => ({ ...prev, notes: { ...prev.notes, [i]: e.target.value } }))}
                        placeholder="Reading between the lines, this suggests..."
                      />
                    </>
                  )}
                  {d.checked && (
                    <p className="mt-2 text-[0.85rem] text-muted">
                      {seg.note}
                      {seg.inference && (
                        <span className="mt-1 block text-ink">
                          <strong>Model inference:</strong> {seg.inference}
                        </span>
                      )}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {!d.checked ? (
              <button type="button" className="btn btn-primary" onClick={check} disabled={labelled < Math.ceil(total / 2)}>
                Check against the key
              </button>
            ) : (
              <span className="flex items-center gap-2 font-bold">
                Score <ScoreBadge score={pct} />
              </span>
            )}
            <button type="button" className="btn btn-ghost" onClick={reset}>
              <RotateCcw size={16} /> Reset
            </button>
          </div>
          {!d.checked && labelled < Math.ceil(total / 2) && <p className="mt-2 text-xs text-muted">Mark at least half the sentences to check.</p>}
          {!d.checked && inferenceNotesMissing > 0 && <p className="mt-2 text-xs text-warn">{inferenceNotesMissing} purple highlight(s) still need an inference note.</p>}
        </div>

        {d.checked && (
          <div className="card mt-4 grid gap-5 p-4">
            <h3 className="text-lg font-semibold">Comprehension</h3>
            {p.questions.map((q, i) => (
              <McQuestion key={i} q={q} index={i} chosen={d.answers[i]} onChoose={(c) => setD((prev) => ({ ...prev, answers: { ...prev.answers, [i]: c } }))} />
            ))}
            {Object.keys(d.answers).length === p.questions.length && (
              <Callout tone="good" title="Passage done">
                <button type="button" className="btn btn-primary btn-sm mt-2" onClick={() => requestReflection({ strand: 'B', task: `Text Deconstructor: ${p.title}` })}>
                  Log a 60-second reflection
                </button>
              </Callout>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}

function splitParas(p: Passage): number[][] {
  const paras: number[][] = [];
  p.segments.forEach((s, i) => {
    if (s.para || paras.length === 0) paras.push([]);
    paras[paras.length - 1].push(i);
  });
  return paras;
}
