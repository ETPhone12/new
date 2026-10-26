import { useMemo } from 'react';
import { Copy, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { recordToolRun, useDraft } from '../store/store';
import { requestReflection, toast } from '../store/ui';
import type { Check } from '../lib/writingChecks';
import { Callout, CheckList, PageHeader, ScoreBadge, Segmented } from '../components/ui';
import { copyText, cx } from '../lib/util';

interface Row {
  id: string;
  criterion: string;
  a: string;
  b: string;
}

interface Matrix {
  a: string;
  b: string;
  hook: string;
  thesis: string;
  insight: string;
  rows: Row[];
  example?: boolean;
}

const EXAMPLE: Matrix = {
  a: 'Theo ("The Night Shift")',
  b: 'Mara ("Last Ferry")',
  hook: 'Some teenagers carry responsibilities that most adults never see.',
  thesis:
    'Although both Theo and Mara take on adult responsibilities for family members, Theo endures his quietly until others step in, while Mara acts alone to keep her promise, which suggests that young people need both courage and community.',
  insight: 'Neither character can carry the weight alone forever; the stories suggest that responsibility is safest when it is shared.',
  rows: [
    { id: 'r1', criterion: 'The responsibility they carry', a: 'Works 3 a.m. bakery shifts because "rent did not care what time it was."', b: 'Promised to visit her lonely grandfather every Friday and "had never once broken a promise."' },
    { id: 'r2', criterion: 'How others respond', a: 'Mr. Haddad and Ms. Okonkwo notice and arrange a study block.', b: 'The man in the vest laughs at her; no one helps.' },
    { id: 'r3', criterion: 'What their final choice reveals', a: 'Accepts help: "did not feel like the night was something he had to survive alone."', b: 'Rejects the risky boat and calls instead: responsibility without recklessness.' },
  ],
  example: true,
};

const BLANK: Matrix = { a: '', b: '', hook: '', thesis: '', insight: '', rows: [
  { id: 'r1', criterion: '', a: '', b: '' },
  { id: 'r2', criterion: '', a: '', b: '' },
  { id: 'r3', criterion: '', a: '', b: '' },
] };

const SAME = ['Similarly,', 'Likewise,', 'Both', 'In the same way,'];
const DIFF = ['In contrast,', 'However,', 'Whereas', 'On the other hand,', 'Unlike'];

type Mode = 'block' | 'point';

export default function CompareMatrix() {
  const [m, setM] = useDraft<Matrix>('compare', EXAMPLE);
  const [mode, setMode] = useDraft<Mode>('compare:mode', 'point');
  const A = m.a.trim() || 'Subject A';
  const B = m.b.trim() || 'Subject B';
  const rows = m.rows.filter((r) => r.criterion.trim() || r.a.trim() || r.b.trim());

  const set = (patch: Partial<Matrix>) => setM((prev) => ({ ...prev, ...patch, example: false }));
  const setRow = (id: string, patch: Partial<Row>) => set({ rows: m.rows.map((r) => (r.id === id ? { ...r, ...patch } : r)) });

  const checks: Check[] = useMemo(() => {
    const t = m.thesis.toLowerCase();
    const firstWord = (s: string) => s.trim().split(/[\s("]+/)[0]?.toLowerCase() ?? '';
    const mentions = m.a.trim() && m.b.trim() && t.includes(firstWord(m.a)) && t.includes(firstWord(m.b));
    const compareWord = /\b(both|while|whereas|although|unlike|similarly|likewise|but|however|in contrast|differ|same)\b/.test(t);
    const complete = rows.length >= 2 && rows.every((r) => r.criterion.trim() && r.a.trim() && r.b.trim());
    return [
      { id: 'subjects', required: true, level: m.a.trim() && m.b.trim() ? 'pass' : 'fail', label: m.a.trim() && m.b.trim() ? 'Two subjects named' : 'Name both subjects' },
      { id: 'criteria', required: true, level: complete ? 'pass' : 'fail', label: complete ? `${rows.length} complete criteria` : 'Fill at least 2 criteria with details for both subjects' },
      { id: 'thesis-both', level: mentions ? 'pass' : 'warn', label: mentions ? 'Thesis names both subjects' : 'Name both subjects in the thesis' },
      { id: 'thesis-relation', level: compareWord ? 'pass' : 'warn', label: compareWord ? 'Thesis states a relationship (both / while / whereas...)' : 'Use a comparison word in the thesis: both, while, whereas, unlike' },
      { id: 'thesis-why', level: /\b(suggest|reveal|show|which|because|so that|means)\w*/.test(t) ? 'pass' : 'warn', label: 'Thesis says what the comparison reveals', tip: 'Add "...which suggests..." or "...because..." to give it a point.' },
      { id: 'insight', level: m.insight.trim() ? 'pass' : 'warn', label: m.insight.trim() ? 'Conclusion insight ready' : 'Add the big insight for your conclusion' },
    ] as Check[];
  }, [m, rows]);
  const score = Math.round((checks.filter((c) => c.level === 'pass').length / checks.length) * 100);

  const outline = useMemo(() => buildOutline(mode, A, B, m, rows), [mode, A, B, m, rows]);

  const copyOutline = async () => {
    const text = outline.map((p) => `${p.title}\n${p.lines.map((l) => `  - ${l}`).join('\n')}`).join('\n\n');
    toast((await copyText(text)) ? 'Outline copied' : 'Select the text to copy it');
    recordToolRun('compare', score);
  };

  return (
    <div>
      <PageHeader
        strand="C"
        eyebrow="C1 Organizing content · TVO ILC 4.1"
        title="Compare & Contrast Matrix"
        desc="Enter your criteria once. Flip between Block and Point-by-Point to see your essay skeleton rearrange itself."
        actions={<Segmented label="Structure" value={mode} onChange={setMode} options={[{ value: 'block', label: 'Block' }, { value: 'point', label: 'Point-by-point' }]} />}
      />
      {m.example && (
        <div className="mb-5">
          <Callout title="Example loaded">
            Two original short stories from this app, compared on three criteria.{' '}
            <button type="button" className="font-bold text-strandB underline" onClick={() => setM(BLANK)}>Start a blank matrix.</button>
          </Callout>
        </div>
      )}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="grid min-w-0 content-start gap-4">
          <div className="card grid gap-3 p-4 sm:grid-cols-2">
            <div>
              <label htmlFor="cm-a" className="label">Subject A</label>
              <input id="cm-a" className="input" value={m.a} onChange={(e) => set({ a: e.target.value })} placeholder="A character, text, ad, or idea" />
            </div>
            <div>
              <label htmlFor="cm-b" className="label">Subject B</label>
              <input id="cm-b" className="input" value={m.b} onChange={(e) => set({ b: e.target.value })} placeholder="The thing you compare it with" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="cm-hook" className="label">Hook</label>
              <input id="cm-hook" className="input" value={m.hook} onChange={(e) => set({ hook: e.target.value })} placeholder="An opening line that earns attention" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="cm-thesis" className="label">Comparative thesis</label>
              <textarea id="cm-thesis" className="input min-h-[4.5rem]" value={m.thesis} onChange={(e) => set({ thesis: e.target.value })} placeholder="Although both A and B..., A... while B..., which suggests..." />
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="hidden grid-cols-[1fr_1fr_1fr_auto] gap-2 border-b border-line bg-sunken px-3 py-2 text-xs font-bold uppercase tracking-wide text-muted md:grid">
              <span>Criterion</span>
              <span>{A}</span>
              <span>{B}</span>
              <span className="w-8" />
            </div>
            <div className="divide-y divide-line">
              {m.rows.map((r, i) => (
                <div key={r.id} className="grid gap-2 p-3 md:grid-cols-[1fr_1fr_1fr_auto]">
                  <textarea aria-label={`Criterion ${i + 1}`} className="input min-h-[3.2rem] text-[0.93rem] font-bold" value={r.criterion} onChange={(e) => setRow(r.id, { criterion: e.target.value })} placeholder={`Criterion ${i + 1}`} />
                  <textarea aria-label={`${A}: criterion ${i + 1}`} className="input min-h-[3.2rem] text-[0.93rem]" value={r.a} onChange={(e) => setRow(r.id, { a: e.target.value })} placeholder={`${A}: detail or quote`} />
                  <textarea aria-label={`${B}: criterion ${i + 1}`} className="input min-h-[3.2rem] text-[0.93rem]" value={r.b} onChange={(e) => setRow(r.id, { b: e.target.value })} placeholder={`${B}: detail or quote`} />
                  <button type="button" className="btn btn-ghost btn-sm self-start" disabled={m.rows.length <= 2} onClick={() => set({ rows: m.rows.filter((x) => x.id !== r.id) })} aria-label={`Remove criterion ${i + 1}`}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="border-t border-line p-3">
              <button type="button" className="btn btn-sm" disabled={m.rows.length >= 4} onClick={() => set({ rows: [...m.rows, { id: 'r' + Date.now(), criterion: '', a: '', b: '' }] })}>
                <Plus size={15} /> Add criterion
              </button>
            </div>
          </div>
          <div className="card p-4">
            <label htmlFor="cm-insight" className="label">Conclusion: what does the comparison reveal?</label>
            <textarea id="cm-insight" className="input min-h-[3.5rem]" value={m.insight} onChange={(e) => set({ insight: e.target.value })} placeholder="The bigger idea a reader should leave with" />
          </div>
          <div className="card p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold">Outline check</h3>
              <ScoreBadge score={score} />
            </div>
            <CheckList checks={checks} />
          </div>
        </div>

        <div className="min-w-0 xl:sticky xl:top-6 xl:self-start">
          <div className="card p-4 sm:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">{mode === 'block' ? 'Block method' : 'Point-by-point method'} skeleton</h2>
              <span className="num text-sm text-muted">{outline.length} paragraphs</span>
            </div>
            <p className="mb-4 text-sm text-muted">
              {mode === 'block'
                ? 'All of A, then all of B. In the B section, call back to A explicitly so readers can compare.'
                : 'Each body paragraph takes one criterion and moves A → B. Best for tight, detailed comparison.'}
            </p>
            <ol className="grid gap-3">
              {outline.map((para, i) => (
                <li key={`${mode}-${i}`} className={cx('fade-in rounded-lg border p-3', para.kind === 'body-a' ? 'border-strandB/40 bg-strandB/5' : para.kind === 'body-b' ? 'border-strandD/40 bg-strandD/5' : para.kind === 'body-ab' ? 'border-strandC/40 bg-strandC/5' : 'border-line bg-sunken/60')}>
                  <div className="mb-1 text-sm font-bold">{para.title}</div>
                  <ul className="grid gap-1 text-[0.9rem]">
                    {para.lines.map((l, k) => (
                      <li key={k} className="flex gap-2">
                        <span className="mt-[0.55rem] h-1 w-1 shrink-0 rounded-full bg-muted" />
                        <span className="min-w-0">{l}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className="btn btn-primary btn-sm" onClick={copyOutline}><Copy size={15} /> Copy outline</button>
              <button type="button" className="btn btn-sm" onClick={() => { recordToolRun('compare', score); requestReflection({ strand: 'C', task: 'Compare & contrast outline' }); }}>Reflect</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setM(EXAMPLE)}><RotateCcw size={15} /> Example</button>
            </div>
            <div className="mt-4 border-t border-line pt-3 text-sm">
              <div className="mb-1 font-bold">Transitions</div>
              <div className="flex flex-wrap gap-1.5">
                {SAME.map((t) => <span key={t} className="chip border-transparent bg-strandC/10 font-normal">{t}</span>)}
                {DIFF.map((t) => <span key={t} className="chip border-transparent bg-strandD/10 font-normal">{t}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface Para {
  title: string;
  kind: 'intro' | 'body-a' | 'body-b' | 'body-ab' | 'conclusion';
  lines: string[];
}

function buildOutline(mode: Mode, A: string, B: string, m: Matrix, rows: Row[]): Para[] {
  const crit = (r: Row, i: number) => r.criterion.trim() || `Criterion ${i + 1}`;
  const intro: Para = {
    title: 'Introduction',
    kind: 'intro',
    lines: [m.hook.trim() || 'Hook: an anecdote, a fact, or a question.', `Context: introduce ${A} and ${B}.`, `Thesis: ${m.thesis.trim() || '(write your comparative thesis)'}`],
  };
  const conclusion: Para = {
    title: 'Conclusion',
    kind: 'conclusion',
    lines: [
      `Restate the thesis in new words.`,
      `Sum up: ${rows.map((r, i) => crit(r, i).toLowerCase()).join('; ') || 'your criteria'}.`,
      m.insight.trim() || 'Insight: what the comparison reveals about the bigger theme.',
    ],
  };
  if (mode === 'block') {
    return [
      intro,
      {
        title: `Body block 1: ${A}`,
        kind: 'body-a',
        lines: [`Topic sentence: introduce ${A} and preview ${rows.length} criteria.`, ...rows.map((r, i) => `${crit(r, i)}: ${r.a.trim() || '(detail)'}`), 'Explain how each detail supports the thesis.'],
      },
      {
        title: `Body block 2: ${B}`,
        kind: 'body-b',
        lines: [
          `Topic sentence with a transition: "In contrast, ${B}..." or "Like ${A}, ${B}..."`,
          ...rows.map((r, i) => `${crit(r, i)}: ${r.b.trim() || '(detail)'} (call back: unlike / similarly to ${A})`),
          'Explain the difference or similarity, not just the detail.',
        ],
      },
      conclusion,
    ];
  }
  return [
    intro,
    ...rows.map(
      (r, i): Para => ({
        title: `Body ${i + 1}: ${crit(r, i)}`,
        kind: 'body-ab',
        lines: [
          `Point: how ${A} and ${B} compare on ${crit(r, i).toLowerCase()}.`,
          `${A}: ${r.a.trim() || '(detail or quote)'}`,
          `Transition (${i % 2 === 0 ? 'In contrast,' : 'Similarly,'} / whereas) → ${B}: ${r.b.trim() || '(detail or quote)'}`,
          'Explain what this similarity or difference shows.',
        ],
      }),
    ),
    conclusion,
  ];
}
