import { useMemo, useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import type { AssessmentKind, KicaCat, RubricRow } from '../types';
import { KICA, LEVEL_MARKS, kicaOverall, levelCode, levelFromPercent } from '../lib/grading';
import { addAssessment, useApp } from '../store/store';
import { toast } from '../store/ui';
import { cx } from '../lib/util';

const QUALIFIER: Record<string, string> = {
  R: 'not yet demonstrated',
  '1': 'with limited effectiveness',
  '2': 'with some effectiveness',
  '3': 'with considerable effectiveness',
  '4': 'with a high degree of effectiveness',
};

const BASE_LEVELS = ['R', '1', '2', '3', '4'];

function pctFor(base: string, mod: '' | '+' | '-'): number {
  if (base === 'R') return 40;
  const code = base + mod;
  return LEVEL_MARKS.find((m) => m.code === code)?.pct ?? 75;
}

export default function KicaRubric({
  title,
  kind,
  source,
  rubric,
  suggested,
  onSaved,
}: {
  title: string;
  kind: AssessmentKind;
  source: string;
  rubric?: RubricRow[];
  /** Pre-fill from what a tool measured (0-100 per category). */
  suggested?: Partial<Record<KicaCat, number>>;
  onSaved?: () => void;
}) {
  const { settings } = useApp();
  const [levels, setLevels] = useState<Partial<Record<KicaCat, { base: string; mod: '' | '+' | '-' }>>>(() => {
    const init: Partial<Record<KicaCat, { base: string; mod: '' | '+' | '-' }>> = {};
    if (suggested) {
      for (const k of Object.keys(suggested) as KicaCat[]) {
        const p = suggested[k];
        if (typeof p !== 'number') continue;
        const code = levelCode(p);
        init[k] = code === 'R' ? { base: 'R', mod: '' } : { base: code[0], mod: (code[1] as '+' | '-' | undefined) ?? '' };
      }
    }
    return init;
  });
  const [note, setNote] = useState('');
  const [savedSig, setSavedSig] = useState<string | null>(null);

  const scores = useMemo(() => {
    const out: Partial<Record<KicaCat, number>> = {};
    for (const k of Object.keys(levels) as KicaCat[]) {
      const l = levels[k];
      if (l) out[k] = pctFor(l.base, l.mod);
    }
    return out;
  }, [levels]);
  const overall = kicaOverall(scores, settings.weights);
  const sig = JSON.stringify(scores) + note;
  const saved = savedSig === sig;

  const save = () => {
    addAssessment({ title, kind, source, scores, note: note.trim() || undefined });
    setSavedSig(sig);
    toast('Saved to your gradebook');
    onSaved?.();
  };

  return (
    <div className="card p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="eyebrow">KICA self-assessment · {kind === 'term' ? 'term work (70%)' : kind === 'exam' ? 'final exam' : 'culminating task'}</div>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        {overall !== null && (
          <div className="text-right">
            <div className="num font-display text-3xl font-semibold leading-none">{Math.round(overall)}%</div>
            <div className="text-sm text-muted">{levelFromPercent(overall).label}</div>
          </div>
        )}
      </div>
      <div className="grid gap-4">
        {KICA.map((k) => {
          const row = rubric?.find((r) => r.cat === k.id);
          const cur = levels[k.id];
          return (
            <div key={k.id} className="rounded-lg border border-line p-3">
              <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
                <div className="font-bold">
                  {k.name} <span className="font-normal text-muted">({settings.weights[k.id]}%)</span>
                </div>
                {cur && <span className="num text-sm font-bold">{cur.base === 'R' ? 'R' : cur.base + cur.mod} · {scores[k.id]}%</span>}
              </div>
              <ul className="mb-3 list-disc pl-5 text-[0.9rem] text-muted">
                {(row?.criteria ?? [k.looksFor]).map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <div className="flex flex-wrap items-center gap-1.5">
                {BASE_LEVELS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setLevels((l) => ({ ...l, [k.id]: { base: b, mod: b === 'R' ? '' : l[k.id]?.mod ?? '' } }))}
                    className={cx('min-h-[2.4rem] min-w-[2.6rem] rounded-md border px-2 font-bold', cur?.base === b ? 'border-primary bg-primary text-onprimary' : 'border-line hover:border-primary/50')}
                    aria-pressed={cur?.base === b}
                    title={b === 'R' ? 'Below level 1' : `Level ${b}`}
                  >
                    {b === 'R' ? 'R' : `L${b}`}
                  </button>
                ))}
                <span className="mx-1 h-6 w-px bg-line" aria-hidden />
                {(['-', '', '+'] as const).map((m) => (
                  <button
                    key={m || '='}
                    type="button"
                    disabled={!cur || cur.base === 'R'}
                    onClick={() => cur && setLevels((l) => ({ ...l, [k.id]: { ...cur, mod: m } }))}
                    className={cx('min-h-[2.4rem] min-w-[2.4rem] rounded-md border px-2 font-bold disabled:opacity-40', cur && cur.mod === m && cur.base !== 'R' ? 'border-primary bg-primary/10' : 'border-line')}
                    aria-label={m === '+' ? 'High end of level' : m === '-' ? 'Low end of level' : 'Middle of level'}
                  >
                    {m === '' ? '•' : m === '-' ? '−' : '+'}
                  </button>
                ))}
              </div>
              {cur && <p className="mt-2 text-[0.85rem] text-muted">Demonstrates these skills {QUALIFIER[cur.base]}.</p>}
            </div>
          );
        })}
      </div>
      <label htmlFor={`note-${source}`} className="label mt-4">Note (optional)</label>
      <input id={`note-${source}`} className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="What evidence supports these levels?" />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" className="btn btn-primary" disabled={Object.keys(scores).length === 0 || saved} onClick={save}>
          <ClipboardCheck size={18} />
          {saved ? 'Saved' : 'Save to gradebook'}
        </button>
        <span className="text-sm text-muted">Level 3 (70–79%) is the provincial standard.</span>
      </div>
    </div>
  );
}
