import { useMemo, useState } from 'react';
import { Copy, Lock, RotateCcw, Save, Sparkles, Trash2, Unlock } from 'lucide-react';
import { checkExplanation, checkLink, checkPoint, checkProof, stitchParagraph, type Check, type PpeInput } from '../lib/writingChecks';
import { lintText, precisionScore, textStats } from '../lib/textAnalysis';
import { recordToolRun, setDraft, useDraft } from '../store/store';
import { requestReflection, toast } from '../store/ui';
import { navigate } from '../lib/router';
import { Callout, CheckList, PageHeader, ScoreBadge, Segmented } from '../components/ui';
import { copyText, cx, formatDate, uid } from '../lib/util';

const EXAMPLE: PpeInput = {
  thesis: 'Ontario high schools should start classes no earlier than 9:00 a.m.',
  point: 'Later start times would improve learning because teenagers are wired to fall asleep and wake up later than adults.',
  proof: 'A 2025 survey of 400 Northview students found that “61% sleep fewer than seven hours on school nights” (Northview Wellness Council 4).',
  explanation:
    'This shows that most students begin the school day already short on sleep. Because tired students struggle to focus and remember new material, a 9:00 a.m. start would give them the rest they need to learn during first period instead of just surviving it.',
  link: 'Clearly, a later start is a simple change that would let students arrive ready to learn.',
};

const BLANK: PpeInput = { thesis: '', point: '', proof: '', explanation: '', link: '' };

const SLOTS = [
  { key: 'point', name: 'Point', hint: 'One arguable claim in one sentence. Name the topic and your position.', starters: ['One reason', 'The strongest evidence that', 'Unlike'], tone: 'hl-thesis' },
  { key: 'proof', name: 'Proof', hint: 'A quotation in quotation marks or a number, with its source.', starters: ['According to', 'As ___ notes, "', 'A 2025 study found that'], tone: 'hl-fact' },
  { key: 'explanation', name: 'Explanation', hint: 'Two or three sentences: what the proof shows, and why it matters for your point.', starters: ['This shows that', 'This matters because', 'In other words,', 'As a result,'], tone: 'hl-opinion' },
  { key: 'link', name: 'Link', hint: 'Connect back to the thesis or forward to the next paragraph.', starters: ['Clearly,', 'This is why', 'Ultimately,'], tone: 'hl-inference' },
] as const;

type SlotKey = (typeof SLOTS)[number]['key'];

interface Saved {
  id: string;
  at: string;
  text: string;
}

export default function PpeBuilder() {
  const [p, setP] = useDraft<PpeInput & { example?: boolean }>('ppe', { ...EXAMPLE, example: true });
  const [mode, setMode] = useDraft<'ppe' | 'peel'>('ppe:mode', 'peel');
  const [saved, setSaved] = useDraft<Saved[]>('ppe:saved', []);
  const [stitched, setStitched] = useState(false);
  const peel = mode === 'peel';

  const checks: Record<SlotKey, Check[]> = useMemo(
    () => ({
      point: checkPoint(p.point),
      proof: checkProof(p.proof),
      explanation: checkExplanation(p.explanation, p.point, p.proof),
      link: checkLink(p.link, p.thesis ?? ''),
    }),
    [p],
  );
  const slotOk = (k: SlotKey) => checks[k].filter((c) => c.required).every((c) => c.level === 'pass') && (k !== 'link' || p.link.trim().length > 0);
  const active = SLOTS.filter((s) => peel || s.key !== 'link');
  const unlocked = (idx: number) => active.slice(0, idx).every((s) => slotOk(s.key));
  const allOk = active.every((s) => slotOk(s.key));

  const paragraph = stitchParagraph(p, peel);
  const lint = useMemo(() => lintText(paragraph, { formal: true }), [paragraph]);
  const stats = textStats(paragraph);
  const precision = precisionScore(lint, stats.words);
  const allChecks = active.flatMap((s) => checks[s.key]);
  const structure = Math.round((allChecks.filter((c) => c.level === 'pass').length / Math.max(1, allChecks.length)) * 100);
  const score = Math.round(structure * 0.6 + precision * 0.4);

  const update = (k: keyof PpeInput, v: string) => {
    setStitched(false);
    setP((prev) => ({ ...prev, [k]: v, example: false }));
  };

  const stitch = () => {
    setStitched(true);
    recordToolRun('ppe', score);
    toast(`Paragraph stitched · ${score}%`);
  };

  return (
    <div>
      <PageHeader
        strand="C"
        eyebrow="C1 Developing content · C2 Form and style"
        title="PPE Paragraph Builder"
        desc="No walls of text. Fill each slot in order; the next one unlocks when the last one works. Then stitch them into a paragraph."
        actions={
          <>
            <Segmented label="Structure" value={mode} onChange={(v) => { setMode(v); setStitched(false); }} options={[{ value: 'ppe', label: 'PPE' }, { value: 'peel', label: 'PEEL (+ Link)' }]} />
          </>
        }
      />

      {p.example && (
        <div className="mb-5">
          <Callout title="Example loaded">
            This is a model paragraph so you can see how the slots work.{' '}
            <button type="button" className="font-bold text-strandB underline" onClick={() => { setP({ ...BLANK }); setStitched(false); }}>Clear it and write your own.</button>
          </Callout>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="grid min-w-0 content-start gap-4">
          <div className="card p-4">
            <label htmlFor="ppe-thesis" className="label">Your thesis (optional, used to check the link)</label>
            <input id="ppe-thesis" className="input" value={p.thesis ?? ''} onChange={(e) => update('thesis', e.target.value)} placeholder="Ontario high schools should..." />
          </div>
          {active.map((slot, idx) => {
            const open = unlocked(idx);
            const ok = slotOk(slot.key);
            return (
              <div key={slot.key} className={cx('card p-4 transition-opacity', !open && 'opacity-60')}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <label htmlFor={`ppe-${slot.key}`} className="flex items-center gap-2 font-display text-lg font-semibold">
                    <span className={cx('num grid h-7 w-7 place-items-center rounded-md text-sm', slot.tone)}>{idx + 1}</span>
                    {slot.name}
                  </label>
                  {open ? ok ? <span className="chip border-transparent bg-good/15 text-good">Ready</span> : <Unlock size={16} className="text-muted" /> : <span className="flex items-center gap-1 text-xs font-bold text-muted"><Lock size={14} /> Finish the slot above</span>}
                </div>
                <p className="mb-2 text-sm text-muted">{slot.hint}</p>
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {slot.starters.map((st) => (
                    <button key={st} type="button" disabled={!open} className="chip font-normal hover:border-ink/40 disabled:opacity-50" onClick={() => update(slot.key, (p[slot.key] ? p[slot.key].trimEnd() + ' ' : '') + st + ' ')}>
                      + {st}
                    </button>
                  ))}
                </div>
                <textarea
                  id={`ppe-${slot.key}`}
                  disabled={!open}
                  className="input min-h-[5.5rem] font-read"
                  value={p[slot.key]}
                  onChange={(e) => update(slot.key, e.target.value)}
                  placeholder={open ? `Write your ${slot.name.toLowerCase()}...` : 'Locked'}
                />
                {open && p[slot.key].trim() && (
                  <div className="mt-3">
                    <CheckList checks={checks[slot.key]} compact />
                  </div>
                )}
              </div>
            );
          })}
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary" disabled={!allOk} onClick={stitch}>
              <Sparkles size={18} /> Stitch paragraph
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => { setP({ ...EXAMPLE, example: true }); setStitched(false); }}>
              <RotateCcw size={16} /> Load example
            </button>
          </div>
          {!allOk && <p className="text-sm text-muted">Every required check (red) must pass before the paragraph can be stitched.</p>}
        </div>

        <div className="min-w-0 lg:sticky lg:top-6 lg:self-start">
          <div className="card p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">{stitched ? 'Your paragraph' : 'Live preview'}</h2>
              {stitched && <ScoreBadge score={score} />}
            </div>
            <p className="font-read text-[1.05rem] leading-[1.8]">
              {active.map((slot) =>
                p[slot.key].trim() ? (
                  <span key={slot.key}>
                    <span className={cx('rounded-sm px-0.5', stitched ? '' : slot.tone)}>{stitchParagraph({ ...BLANK, [slot.key]: p[slot.key] } as PpeInput, slot.key === 'link')}</span>{' '}
                  </span>
                ) : null,
              )}
              {!paragraph && <span className="text-muted">Start typing in the slots. Each part is colour-coded here.</span>}
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-3 text-center">
              <div>
                <div className="eyebrow">Words</div>
                <div className="num font-display text-xl font-semibold">{stats.words}</div>
              </div>
              <div>
                <div className="eyebrow">Structure</div>
                <div className="num font-display text-xl font-semibold">{structure}%</div>
              </div>
              <div>
                <div className="eyebrow">Precision</div>
                <div className="num font-display text-xl font-semibold">{stats.words ? precision : '—'}</div>
              </div>
            </div>
            {lint.length > 0 && (
              <p className="mt-3 text-sm text-muted">
                The linter found {lint.length} thing{lint.length === 1 ? '' : 's'} to tighten.{' '}
                <button type="button" className="font-bold text-strandB underline" onClick={() => { setDraft('linter', { text: paragraph }); navigate('linter'); }}>Open in the linter</button>
              </p>
            )}
            {stitched && (
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className="btn btn-sm" onClick={async () => toast((await copyText(paragraph)) ? 'Copied' : 'Select the text to copy it')}>
                  <Copy size={15} /> Copy
                </button>
                <button type="button" className="btn btn-sm" onClick={() => { setSaved((s) => [{ id: uid(), at: new Date().toISOString(), text: paragraph }, ...s].slice(0, 30)); toast('Saved to your paragraph bank'); }}>
                  <Save size={15} /> Save
                </button>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => requestReflection({ strand: 'C', task: 'PPE paragraph' })}>Reflect</button>
              </div>
            )}
          </div>

          {saved.length > 0 && (
            <div className="card mt-4 p-4">
              <h3 className="mb-2 font-semibold">Paragraph bank</h3>
              <ul className="grid gap-3">
                {saved.map((sv) => (
                  <li key={sv.id} className="rounded-lg border border-line p-3">
                    <p className="line-clamp-3 font-read text-[0.93rem]">{sv.text}</p>
                    <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted">
                      <span>{formatDate(sv.at)}</span>
                      <span className="flex gap-1">
                        <button type="button" className="btn btn-ghost btn-sm" onClick={async () => toast((await copyText(sv.text)) ? 'Copied' : 'Select the text to copy it')} aria-label="Copy paragraph"><Copy size={14} /></button>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSaved((s) => s.filter((x) => x.id !== sv.id))} aria-label="Delete paragraph"><Trash2 size={14} /></button>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
