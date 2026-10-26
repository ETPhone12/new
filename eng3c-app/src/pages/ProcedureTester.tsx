import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Eye, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { analyzeMemo, analyzeProcedure, type MemoInput, type ProcedureInput } from '../lib/writingChecks';
import { recordToolRun, useDraft } from '../store/store';
import { requestReflection, toast } from '../store/ui';
import { Callout, CheckList, PageHeader, ScoreBadge, Segmented } from '../components/ui';
import { cx } from '../lib/util';

const EXAMPLE_PROC: ProcedureInput & { example?: boolean } = {
  title: 'Instant noodles',
  audience: '',
  materials: 'noodles',
  steps: [
    'You should boil some water in the kettle.',
    'The noodles are put in a bowl and the flavour packet is added.',
    'Pour the water on and wait a while until ready.',
    'Make sure it is mixed properly.',
  ],
  warnings: '',
  result: '',
  example: true,
};

const BLANK_PROC: ProcedureInput = { title: '', audience: '', materials: '', steps: ['', '', ''], warnings: '', result: '' };

const EXAMPLE_MEMO: MemoInput & { example?: boolean } = {
  to: 'All stockroom staff',
  from: 'Jordan Lee, Shift Supervisor',
  date: '',
  subject: 'Update',
  body: 'Hi everyone,\n\nSo basically there is gonna be some changes to the schedule and stuff. The inventory count was moved by head office. Its important that everyone shows up.\n\nThanks!!',
  example: true,
};

const BLANK_MEMO: MemoInput = { to: '', from: '', date: '', subject: '', body: '' };

export default function ProcedureTester({ initial }: { initial?: string }) {
  const [tab, setTab] = useState<'howto' | 'memo'>(initial === 'memo' ? 'memo' : 'howto');
  return (
    <div>
      <PageHeader
        strand="C"
        eyebrow="C1 · C2 · C3 Practical and workplace writing"
        title="How-To Stress Tester"
        desc="Write it so a stranger could follow it with no questions. The checker flags vague verbs, passive voice, missing materials, and safety gaps."
        actions={<Segmented label="Document type" value={tab} onChange={setTab} options={[{ value: 'howto', label: 'Instructions / SOP' }, { value: 'memo', label: 'Business memo' }]} />}
      />
      {tab === 'howto' ? <HowTo /> : <Memo />}
    </div>
  );
}

function HowTo() {
  const [p, setP] = useDraft<ProcedureInput & { example?: boolean }>('procedure', EXAMPLE_PROC);
  const [preview, setPreview] = useState(false);
  const report = useMemo(() => analyzeProcedure(p), [p]);
  const set = (patch: Partial<ProcedureInput>) => setP((prev) => ({ ...prev, ...patch, example: false }));
  const setStep = (i: number, v: string) => set({ steps: p.steps.map((s, k) => (k === i ? v : s)) });
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= p.steps.length) return;
    const steps = p.steps.slice();
    [steps[i], steps[j]] = [steps[j], steps[i]];
    set({ steps });
  };
  const fails = report.doc.filter((c) => c.level === 'fail').length + report.steps.reduce((a, s) => a + s.checks.filter((c) => c.level === 'fail').length, 0);
  const warns = report.doc.filter((c) => c.level === 'warn').length + report.steps.reduce((a, s) => a + s.checks.filter((c) => c.level === 'warn').length, 0);
  const stepsFilled = p.steps.map((s, i) => ({ s, i })).filter((x) => x.s.trim());

  return (
    <>
      {p.example && (
        <div className="mb-5">
          <Callout tone="warn" title="Example with mistakes">
            These instructions break almost every rule. Fix them until the score passes 85.{' '}
            <button type="button" className="font-bold text-strandB underline" onClick={() => setP(BLANK_PROC)}>Or start blank.</button>
          </Callout>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <div className="grid min-w-0 content-start gap-4">
          <div className="flex justify-end">
            <Segmented label="View" value={preview ? 'preview' : 'edit'} onChange={(v) => setPreview(v === 'preview')} options={[{ value: 'edit', label: <span className="flex items-center gap-1.5"><Pencil size={14} /> Edit</span> }, { value: 'preview', label: <span className="flex items-center gap-1.5"><Eye size={14} /> Reader view</span> }]} />
          </div>
          {preview ? (
            <article className="card p-5 sm:p-7">
              <h2 className="text-2xl font-semibold">{p.title || 'Untitled procedure'}</h2>
              {p.audience && <p className="mt-1 text-muted">{p.audience}</p>}
              {p.materials && (
                <>
                  <h3 className="mt-5 font-semibold">You will need</h3>
                  <ul className="mt-1 list-disc pl-5">
                    {p.materials.split(/[,\n]/).map((x) => x.trim()).filter(Boolean).map((x) => <li key={x}>{x}</li>)}
                  </ul>
                </>
              )}
              {p.warnings && <div className="mt-4 rounded-lg border-2 border-warn bg-warn/10 p-3 font-bold">⚠ {p.warnings}</div>}
              <h3 className="mt-5 font-semibold">Steps</h3>
              <ol className="mt-2 grid gap-2">
                {stepsFilled.map((x, k) => (
                  <li key={x.i} className="flex gap-3">
                    <span className="num grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-sm font-bold text-surface">{k + 1}</span>
                    <span className="pt-0.5">{x.s}</span>
                  </li>
                ))}
              </ol>
              {p.result && <p className="mt-5 rounded-lg bg-good/10 p-3"><strong>Result:</strong> {p.result}</p>}
            </article>
          ) : (
            <>
              <div className="card grid gap-3 p-4">
                <div>
                  <label htmlFor="pr-title" className="label">Title</label>
                  <input id="pr-title" className="input" value={p.title} onChange={(e) => set({ title: e.target.value })} placeholder="How to..." />
                </div>
                <div>
                  <label htmlFor="pr-aud" className="label">Purpose and audience</label>
                  <input id="pr-aud" className="input" value={p.audience} onChange={(e) => set({ audience: e.target.value })} placeholder="For first-time ___ who need to ___" />
                </div>
                <div>
                  <label htmlFor="pr-mat" className="label">Materials and prerequisites (comma or line separated)</label>
                  <textarea id="pr-mat" className="input min-h-[3.5rem]" value={p.materials} onChange={(e) => set({ materials: e.target.value })} placeholder="kettle, 500 mL water, bowl, fork..." />
                </div>
                <div>
                  <label htmlFor="pr-warn" className="label">Safety warning</label>
                  <input id="pr-warn" className="input" value={p.warnings} onChange={(e) => set({ warnings: e.target.value })} placeholder="CAUTION: Boiling water can scald. Keep the handle turned away from you." />
                </div>
              </div>
              <div className="card p-4">
                <h3 className="mb-3 font-semibold">Steps</h3>
                <ol className="grid gap-3">
                  {p.steps.map((st, i) => {
                    const r = report.steps.find((x) => x.text === st.trim() && st.trim());
                    const bad = r?.checks.some((c) => c.level !== 'pass');
                    return (
                      <li key={i} className={cx('rounded-lg border p-3', !st.trim() ? 'border-line' : bad ? 'border-warn/50' : 'border-good/50')}>
                        <div className="flex items-start gap-2">
                          <span className="num mt-2 w-6 shrink-0 text-center font-bold text-muted">{i + 1}</span>
                          <textarea aria-label={`Step ${i + 1}`} className="input min-h-[2.8rem] flex-1" value={st} onChange={(e) => setStep(i, e.target.value)} placeholder="Start with a verb: Press, Remove, Wait..." />
                          <div className="flex flex-col">
                            <button type="button" className="btn btn-ghost btn-sm !min-h-[1.8rem] !px-1.5" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move step up"><ArrowUp size={15} /></button>
                            <button type="button" className="btn btn-ghost btn-sm !min-h-[1.8rem] !px-1.5" onClick={() => move(i, 1)} disabled={i === p.steps.length - 1} aria-label="Move step down"><ArrowDown size={15} /></button>
                            <button type="button" className="btn btn-ghost btn-sm !min-h-[1.8rem] !px-1.5" onClick={() => set({ steps: p.steps.filter((_, k) => k !== i) })} disabled={p.steps.length <= 1} aria-label="Delete step"><Trash2 size={15} /></button>
                          </div>
                        </div>
                        {r && r.checks.some((c) => c.level !== 'pass') && (
                          <div className="mt-2 pl-8">
                            <CheckList checks={r.checks.filter((c) => c.level !== 'pass')} compact />
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ol>
                <button type="button" className="btn btn-sm mt-3" onClick={() => set({ steps: [...p.steps, ''] })}><Plus size={15} /> Add step</button>
              </div>
              <div className="card p-4">
                <label htmlFor="pr-res" className="label">Expected result / troubleshooting</label>
                <textarea id="pr-res" className="input min-h-[3rem]" value={p.result} onChange={(e) => set({ result: e.target.value })} placeholder="The noodles are soft and the broth is golden. If the noodles are still hard, cover the bowl for 1 more minute." />
              </div>
            </>
          )}
        </div>

        <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start">
          <div className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="eyebrow">Zero-ambiguity score</div>
                <div className={cx('num font-display text-5xl font-semibold', report.score >= 85 ? 'text-good' : report.score >= 60 ? 'text-warn' : 'text-bad')}>{report.score}</div>
              </div>
              <div className="text-right text-sm">
                <div><span className="num font-bold text-bad">{fails}</span> to fix</div>
                <div><span className="num font-bold text-warn">{warns}</span> to tighten</div>
              </div>
            </div>
            <div className="mt-4 border-t border-line pt-3">
              <h3 className="mb-2 font-semibold">Document checks</h3>
              <CheckList checks={report.doc} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className="btn btn-primary btn-sm" onClick={() => { recordToolRun('procedure', report.score); toast(`Score logged: ${report.score}`); requestReflection({ strand: 'C', task: `How-to: ${p.title || 'procedure'}` }); }}>
                Log score and reflect
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setP(EXAMPLE_PROC)}><RotateCcw size={15} /> Example</button>
            </div>
          </div>
          <div className="card mt-4 p-4 text-sm">
            <h3 className="mb-1 font-semibold">The final test</h3>
            <p className="text-muted">Hand your reader view to someone who has never done the task. Stay silent. Every time they hesitate or ask a question, that step needs rewriting.</p>
          </div>
        </aside>
      </div>
    </>
  );
}

function Memo() {
  const [m, setM] = useDraft<MemoInput & { example?: boolean }>('memo', EXAMPLE_MEMO);
  const report = useMemo(() => analyzeMemo(m), [m]);
  const set = (patch: Partial<MemoInput>) => setM((prev) => ({ ...prev, ...patch, example: false }));
  return (
    <>
      {m.example && (
        <div className="mb-5">
          <Callout tone="warn" title="Example with mistakes">
            A memo that would confuse every reader. Rewrite it until it scores 85+.{' '}
            <button type="button" className="font-bold text-strandB underline" onClick={() => setM(BLANK_MEMO)}>Or start blank.</button>
          </Callout>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <div className="card min-w-0 p-4 sm:p-6">
          <div className="mb-4 font-display text-2xl font-semibold tracking-wide">MEMO</div>
          <div className="grid gap-2">
            {(
              [
                ['to', 'TO', 'All staff / a department'],
                ['from', 'FROM', 'Your name and title'],
                ['date', 'DATE', 'May 2, 2026'],
                ['subject', 'SUBJECT', 'Specific: what, and by when'],
              ] as const
            ).map(([k, label, ph]) => (
              <div key={k} className="grid grid-cols-[5.5rem_1fr] items-center gap-2">
                <label htmlFor={`memo-${k}`} className="text-sm font-bold">{label}:</label>
                <input id={`memo-${k}`} className="input" value={m[k]} onChange={(e) => set({ [k]: e.target.value })} placeholder={ph} />
              </div>
            ))}
          </div>
          <hr className="my-4 border-t-2 border-ink" />
          <label htmlFor="memo-body" className="sr-only">Memo body</label>
          <textarea id="memo-body" className="input min-h-[14rem] font-read" value={m.body} onChange={(e) => set({ body: e.target.value })} placeholder="First sentence: the purpose. Then the details. End with the action and the deadline." />
        </div>
        <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start">
          <div className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Memo check</h3>
              <ScoreBadge score={report.score} />
            </div>
            <CheckList checks={report.checks} />
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className="btn btn-primary btn-sm" onClick={() => { recordToolRun('procedure:memo', report.score); toast(`Score logged: ${report.score}`); requestReflection({ strand: 'C', task: 'Business memo' }); }}>
                Log score and reflect
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setM(EXAMPLE_MEMO)}><RotateCcw size={15} /> Example</button>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
