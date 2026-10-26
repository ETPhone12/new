import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Clock, Flag, Play } from 'lucide-react';
import { EXAM_CONVENTIONS, EXAM_MEDIA, EXAM_PROMPTS, EXAM_READING, EXAM_SECTIONS, EXAM_SHORT, EXAM_STORY } from '../data/exam';
import { DRILL_BY_ID } from '../data/drills';
import { ScreenTimeChart } from '../components/Graphics';
import { McQuestion } from '../components/Quiz';
import KicaRubric from '../components/KicaRubric';
import { Callout, ConfirmButton, PageHeader, ScoreBadge, Segmented } from '../components/ui';
import { recordToolRun, saveExam, useApp } from '../store/store';
import { lintText, precisionScore, textStats } from '../lib/textAnalysis';
import { cx, formatDate, formatDuration, uid } from '../lib/util';
import { requestReflection } from '../store/ui';
import type { ExamAttempt } from '../types';

const OBJECTIVE = [...EXAM_READING, ...EXAM_MEDIA, ...EXAM_CONVENTIONS];

function objectiveScore(a: ExamAttempt) {
  const correct = OBJECTIVE.filter((q) => a.answers[q.id] === q.answer).length;
  return { correct, total: OBJECTIVE.length };
}

export default function MockExam() {
  const s = useApp();
  const current = s.exams.find((e) => !e.finishedAt);
  const [viewId, setViewId] = useState<string | null>(null);
  const [duration, setDuration] = useState('120');

  if (current) return <ExamRun attempt={current} onSubmitted={setViewId} />;
  const viewing = viewId ? s.exams.find((e) => e.id === viewId) : null;
  if (viewing) return <ExamResults attempt={viewing} onBack={() => setViewId(null)} />;

  const start = () => {
    saveExam({ id: uid(), startedAt: new Date().toISOString(), durationMin: Number(duration), answers: {}, shortAnswers: {}, shortScores: {}, essay: '' });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Final evaluation practice"
        title="Mock Final Exam"
        desc="A timed simulation: an unseen short story, a graphic text, language conventions, and an essay. Multiple choice marks itself; you self-mark the written parts against models and a KICA rubric."
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="card p-5">
          <h2 className="mb-3 text-lg font-semibold">Sections</h2>
          <ol className="grid gap-2">
            {EXAM_SECTIONS.map((sec) => (
              <li key={sec.id} className="flex items-center justify-between gap-3 rounded-lg bg-sunken px-3 py-2">
                <span className="font-bold">{sec.title}</span>
                <span className="num text-sm text-muted">{sec.marks} marks</span>
              </li>
            ))}
          </ol>
          <h3 className="mb-2 mt-5 font-semibold">Suggested time plan (2 hours)</h3>
          <ul className="grid gap-1 text-sm text-muted">
            <li>0:00–0:10 · Preview everything, pick your essay prompt</li>
            <li>0:10–0:55 · Parts A, B, C</li>
            <li>0:55–1:45 · Essay: 10 min outline, 35 min writing, 5 min edit</li>
            <li>1:45–2:00 · Review flagged answers, proofread</li>
          </ul>
        </div>
        <div className="grid content-start gap-4">
          <div className="card p-5">
            <div className="label">Time limit</div>
            <Segmented label="Time limit" value={duration} onChange={setDuration} options={[{ value: '120', label: '2 hours' }, { value: '90', label: '90 min' }, { value: '60', label: '60 min' }]} />
            <p className="mt-3 text-sm text-muted">The clock keeps running if you leave this page. Answers save as you go. When time runs out, the exam submits itself.</p>
            <button type="button" className="btn btn-primary mt-4 w-full" onClick={start}>
              <Play size={18} /> Start the exam
            </button>
          </div>
          {s.exams.length > 0 && (
            <div className="card p-4">
              <h3 className="mb-2 font-semibold">Past attempts</h3>
              <ul className="divide-y divide-line">
                {s.exams.map((e) => {
                  const o = objectiveScore(e);
                  return (
                    <li key={e.id}>
                      <button type="button" className="flex w-full items-center justify-between gap-2 py-2 text-left hover:text-strandB" onClick={() => setViewId(e.id)}>
                        <span className="text-sm">{formatDate(e.startedAt)} · {e.durationMin} min</span>
                        <ScoreBadge score={(o.correct / o.total) * 100} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function useRemaining(a: ExamAttempt) {
  const end = new Date(a.startedAt).getTime() + a.durationMin * 60_000;
  const [left, setLeft] = useState(() => Math.max(0, (end - Date.now()) / 1000));
  useEffect(() => {
    const t = window.setInterval(() => setLeft(Math.max(0, (end - Date.now()) / 1000)), 1000);
    return () => window.clearInterval(t);
  }, [end]);
  return left;
}

function ExamRun({ attempt, onSubmitted }: { attempt: ExamAttempt; onSubmitted: (id: string) => void }) {
  const [part, setPart] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const left = useRemaining(attempt);
  const update = (patch: Partial<ExamAttempt>) => saveExam({ ...attempt, ...patch });
  const submit = () => {
    const o = objectiveScore(attempt);
    recordToolRun('exam', Math.round((o.correct / o.total) * 100));
    saveExam({ ...attempt, finishedAt: new Date().toISOString(), objectiveScore: o.correct, objectiveTotal: o.total });
    onSubmitted(attempt.id);
  };

  useEffect(() => {
    if (left <= 0) submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left <= 0]);

  const answered = OBJECTIVE.filter((q) => attempt.answers[q.id] !== undefined).length;
  const words = textStats(attempt.essay).words;
  const low = left < 600;

  const mc = (q: (typeof OBJECTIVE)[number], i: number, quote?: string) => (
    <div key={q.id} className="relative">
      <button type="button" className={cx('absolute right-0 top-0 rounded p-1', flags[q.id] ? 'text-pen' : 'text-line hover:text-muted')} onClick={() => setFlags((f) => ({ ...f, [q.id]: !f[q.id] }))} aria-label="Flag for review" aria-pressed={!!flags[q.id]}>
        <Flag size={16} />
      </button>
      <McQuestion q={q} index={i} quote={quote} reveal={false} chosen={attempt.answers[q.id]} onChoose={(c) => update({ answers: { ...attempt.answers, [q.id]: c } })} />
    </div>
  );

  return (
    <div>
      <div className={cx('sticky top-[calc(env(safe-area-inset-top,0px)+3.6rem)] z-20 -mx-1 mb-5 flex flex-wrap items-center gap-3 rounded-lg border p-2 shadow-lift backdrop-blur lg:top-3', low ? 'border-pen bg-pen/10' : 'border-line bg-surface/95')}>
        <span className={cx('num flex items-center gap-1.5 font-display text-2xl font-semibold', low && 'text-pen')}>
          <Clock size={20} /> {formatDuration(left)}
        </span>
        <Segmented label="Part" value={part} onChange={setPart} options={(['A', 'B', 'C', 'D'] as const).map((p) => ({ value: p, label: `Part ${p}` }))} />
        <span className="num text-sm text-muted">{answered}/{OBJECTIVE.length} MC · {words} essay words</span>
        <ConfirmButton label="Submit" confirmLabel="Tap to submit" className="btn-primary btn-sm ml-auto" onConfirm={submit} />
      </div>

      {part === 'A' && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <article className="card p-5 lg:max-h-[78vh] lg:overflow-y-auto">
            <div className="eyebrow">Part A · Sight passage</div>
            <h2 className="mt-1 font-read text-2xl font-semibold">{EXAM_STORY.title}</h2>
            <div className="prose-read mt-3 whitespace-pre-line">{EXAM_STORY.text}</div>
          </article>
          <div className="card grid content-start gap-6 p-5">
            {EXAM_READING.map((q, i) => mc(q, i))}
            {EXAM_SHORT.map((sa) => (
              <div key={sa.id}>
                <label htmlFor={`sa-${sa.id}`} className="mb-2 block font-bold">{sa.q}</label>
                <textarea id={`sa-${sa.id}`} className="input min-h-[7rem] font-read" value={attempt.shortAnswers[sa.id] ?? ''} onChange={(e) => update({ shortAnswers: { ...attempt.shortAnswers, [sa.id]: e.target.value } })} placeholder="Answer → evidence → explanation" />
              </div>
            ))}
          </div>
        </div>
      )}

      {part === 'B' && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="card p-4">
            <div className="eyebrow mb-2">Part B · Graphic text</div>
            <div className="overflow-x-auto"><div className="min-w-[320px]"><ScreenTimeChart fullAxis={false} /></div></div>
          </div>
          <div className="card grid content-start gap-6 p-5">{EXAM_MEDIA.map((q, i) => mc(q, i))}</div>
        </div>
      )}

      {part === 'C' && <div className="card mx-auto grid max-w-2xl gap-6 p-5">{EXAM_CONVENTIONS.map((q, i) => mc(q, i, q.quote))}</div>}

      {part === 'D' && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div className="card p-5">
            <div className="eyebrow mb-2">Part D · Essay (20 marks)</div>
            <div className="mb-4 grid gap-2">
              {EXAM_PROMPTS.map((p) => (
                <label key={p.id} className={cx('flex cursor-pointer gap-3 rounded-lg border p-3', attempt.essayPrompt === p.id ? 'border-ink bg-sunken' : 'border-line')}>
                  <input type="radio" name="prompt" className="mt-1" checked={attempt.essayPrompt === p.id} onChange={() => update({ essayPrompt: p.id })} />
                  <span>
                    <span className="block font-bold">{p.title}</span>
                    <span className="block text-sm text-muted">{p.prompt}</span>
                  </span>
                </label>
              ))}
            </div>
            <label htmlFor="essay" className="label">Your essay</label>
            <textarea id="essay" className="input min-h-[24rem] font-read text-[1.02rem] leading-relaxed" value={attempt.essay} onChange={(e) => update({ essay: e.target.value })} placeholder="Introduction with thesis → body paragraphs (PPE) → conclusion" />
            <div className={cx('num mt-2 text-sm', words >= 400 && words <= 600 ? 'text-good' : 'text-muted')}>{words} words (target 400–600)</div>
          </div>
          <div className="grid content-start gap-4">
            {attempt.essayPrompt === 'compare' && (
              <details className="card p-4" open>
                <summary className="cursor-pointer font-bold">Reference: "Last Ferry"</summary>
                <div className="prose-read mt-3 whitespace-pre-line text-[0.95rem]">{DRILL_BY_ID.narrative.context?.text}</div>
              </details>
            )}
            <Callout title="Plan first">Thesis in one sentence. Three points. One quotation or example for each. Then write.</Callout>
          </div>
        </div>
      )}

      {Object.values(flags).some(Boolean) && (
        <p className="mt-4 flex items-center gap-1.5 text-sm text-pen"><Flag size={14} /> {Object.values(flags).filter(Boolean).length} question(s) flagged for review.</p>
      )}
    </div>
  );
}

function ExamResults({ attempt, onBack }: { attempt: ExamAttempt; onBack: () => void }) {
  const o = objectiveScore(attempt);
  const [shortScores, setShortScores] = useState<Record<string, number>>(attempt.shortScores ?? {});
  const lint = useMemo(() => lintText(attempt.essay, { formal: true }), [attempt.essay]);
  const stats = textStats(attempt.essay);
  const precision = precisionScore(lint, stats.words);
  const readingPct = (EXAM_READING.filter((q) => attempt.answers[q.id] === q.answer).length / EXAM_READING.length) * 100;
  const mediaPct = (EXAM_MEDIA.filter((q) => attempt.answers[q.id] === q.answer).length / EXAM_MEDIA.length) * 100;
  const convPct = (EXAM_CONVENTIONS.filter((q) => attempt.answers[q.id] === q.answer).length / EXAM_CONVENTIONS.length) * 100;
  const shortTotal = EXAM_SHORT.reduce((a, s) => a + s.marks, 0);
  const shortGot = EXAM_SHORT.reduce((a, s) => a + (shortScores[s.id] ?? 0), 0);
  const shortPct = (shortGot / shortTotal) * 100;
  const used = attempt.finishedAt ? (new Date(attempt.finishedAt).getTime() - new Date(attempt.startedAt).getTime()) / 1000 : 0;

  const setShort = (id: string, v: number) => {
    const next = { ...shortScores, [id]: v };
    setShortScores(next);
    saveExam({ ...attempt, shortScores: next });
  };

  return (
    <div>
      <button type="button" className="btn btn-ghost btn-sm mb-3 -ml-2" onClick={onBack}>All attempts</button>
      <PageHeader eyebrow={`Mock exam · ${formatDate(attempt.startedAt)} · ${formatDuration(used)} used`} title="Results" />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ['Reading MC', readingPct],
          ['Graphic text', mediaPct],
          ['Conventions', convPct],
          ['Short answers', shortPct],
        ].map(([l, v]) => (
          <div key={l as string} className="card p-4">
            <div className="eyebrow">{l}</div>
            <div className="num font-display text-3xl font-semibold">{Math.round(v as number)}%</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="grid min-w-0 content-start gap-6">
          <section className="card p-5">
            <h2 className="mb-1 text-lg font-semibold">Multiple choice review</h2>
            <p className="mb-4 text-sm text-muted">{o.correct}/{o.total} correct</p>
            <div className="grid gap-6">
              {OBJECTIVE.map((q, i) => (
                <McQuestion key={q.id} q={q} index={i} quote={'quote' in q ? (q as { quote: string }).quote : undefined} chosen={attempt.answers[q.id] ?? -1} onChoose={() => undefined} />
              ))}
            </div>
          </section>
        </div>
        <div className="grid min-w-0 content-start gap-6">
          <section className="card p-5">
            <h2 className="mb-3 text-lg font-semibold">Mark your short answers</h2>
            {EXAM_SHORT.map((sa) => (
              <div key={sa.id} className="mb-6">
                <p className="font-bold">{sa.q}</p>
                <blockquote className="mt-2 rounded-lg bg-sunken p-3 font-read text-[0.95rem]">{attempt.shortAnswers[sa.id]?.trim() || <span className="text-muted">No answer</span>}</blockquote>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-bold text-strandB">Model answer and what markers look for</summary>
                  <p className="mt-2 font-read text-[0.95rem]">{sa.model}</p>
                  <ul className="mt-2 list-disc pl-5 text-sm text-muted">{sa.lookFor.map((l) => <li key={l}>{l}</li>)}</ul>
                </details>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm">Your mark:</span>
                  {Array.from({ length: sa.marks + 1 }, (_, k) => (
                    <button key={k} type="button" onClick={() => setShort(sa.id, k)} className={cx('num h-9 w-9 rounded-md border font-bold', shortScores[sa.id] === k ? 'border-ink bg-ink text-surface' : 'border-line')}>
                      {k}
                    </button>
                  ))}
                  <span className="text-sm text-muted">/ {sa.marks}</span>
                </div>
              </div>
            ))}
          </section>
          <section className="card p-5">
            <h2 className="mb-2 text-lg font-semibold">Essay check</h2>
            <p className="text-sm text-muted">{stats.words} words · precision {stats.words ? precision : '—'} · {lint.filter((i) => i.severity === 'error').length} errors · {lint.filter((i) => i.kind === 'passive').length} passive</p>
            {stats.words < 300 && (
              <p className="mt-2 flex items-start gap-1.5 text-sm text-warn"><AlertTriangle size={15} className="mt-0.5" /> Under 300 words. Exam essays usually need full development: intro, 2–3 body paragraphs, conclusion.</p>
            )}
            {attempt.essay && <p className="mt-3 line-clamp-[8] whitespace-pre-line rounded-lg bg-sunken p-3 font-read text-[0.93rem]">{attempt.essay}</p>}
          </section>
          <KicaRubric
            title={`Mock final exam (${formatDate(attempt.startedAt)})`}
            kind="exam"
            source={`exam:${attempt.id}`}
            suggested={{
              K: Math.round((readingPct + mediaPct) / 2),
              T: Math.round(shortPct),
              C: Math.round(stats.words ? (convPct + precision) / 2 : convPct),
            }}
            onSaved={() => requestReflection({ strand: 'B', task: 'Mock final exam' })}
          />
        </div>
      </div>
    </div>
  );
}
