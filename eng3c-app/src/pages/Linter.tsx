import { useMemo, useState } from 'react';
import { Copy, RotateCcw, Wand2 } from 'lucide-react';
import { KIND_LABEL, applyReplacement, lintText, precisionScore, textStats, type Issue, type IssueKind } from '../lib/textAnalysis';
import { recordToolRun, useDraft } from '../store/store';
import { requestReflection, toast } from '../store/ui';
import { Callout, PageHeader, Segmented } from '../components/ui';
import { copyText, cx } from '../lib/util';

const EXAMPLE = `In my opinion, due to the fact that students are really tired in the morning, school should start later. Basically, a lot of teens stay up late, they cant help it because there body clock is different. The decision was made by the school board without asking students and that was kinda unfair and it is important to note that alot of students have jobs. so we should of been asked. Its time for a change!!`;

const SEV_CLASS: Record<Issue['severity'], string> = { error: 'squiggle-bad', warn: 'squiggle-warn', info: 'squiggle-info' };
const SEV_DOT: Record<Issue['severity'], string> = { error: 'bg-bad', warn: 'bg-warn', info: 'bg-strandB' };

export default function Linter() {
  const [d, setD] = useDraft<{ text: string; formal: boolean }>('linter', { text: EXAMPLE, formal: true });
  const formal = d.formal ?? true;
  const [sel, setSel] = useState<number | null>(null);
  const [filter, setFilter] = useState<IssueKind | 'all'>('all');
  const issues = useMemo(() => lintText(d.text, { formal }), [d.text, formal]);
  const stats = useMemo(() => textStats(d.text), [d.text]);
  const score = precisionScore(issues, stats.words);
  const spans = issues.filter((i) => i.scope === 'span');
  const fixable = spans.filter((i) => i.replacement !== undefined);
  const byKind = issues.reduce<Record<string, number>>((a, i) => ((a[i.kind] = (a[i.kind] ?? 0) + 1), a), {});
  const shown = issues.filter((i) => filter === 'all' || i.kind === filter);
  const selected = sel !== null ? issues[sel] : null;

  const setText = (text: string) => {
    setSel(null);
    setD((prev) => ({ ...prev, text }));
  };

  const fix = (i: Issue) => setText(applyReplacement(d.text, i));
  const fixAll = () => {
    // apply from the end so earlier offsets stay valid
    let t = d.text;
    for (const i of fixable.slice().sort((a, b) => b.start - a.start)) t = applyReplacement(t, i);
    setText(t);
    toast(`Applied ${fixable.length} fixes`);
  };

  const pieces = useMemo(() => {
    const out: { text: string; issue?: number }[] = [];
    let pos = 0;
    issues.forEach((iss, idx) => {
      if (iss.scope !== 'span' || iss.start < pos) return;
      if (iss.start > pos) out.push({ text: d.text.slice(pos, iss.start) });
      out.push({ text: d.text.slice(iss.start, iss.end) || ' ', issue: idx });
      pos = iss.end;
    });
    if (pos < d.text.length) out.push({ text: d.text.slice(pos) });
    return out;
  }, [issues, d.text]);

  return (
    <div>
      <PageHeader
        strand="C"
        eyebrow="C3 Applying conventions · C2 Style"
        title="Precision Linter"
        desc="Paste or write a draft. Red is an error, amber needs tightening, blue is a style note. Tap any underline for the fix."
        actions={
          <Segmented
            label="Register"
            value={formal ? 'formal' : 'casual'}
            onChange={(v) => setD((prev) => ({ ...prev, formal: v === 'formal' }))}
            options={[{ value: 'formal', label: 'Essay / business' }, { value: 'casual', label: 'Speech / blog' }]}
          />
        }
      />

      <div className="mb-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {[
          ['Precision', stats.words ? score : '—', score >= 80 ? 'text-good' : score >= 60 ? 'text-warn' : 'text-bad'],
          ['Words', stats.words, ''],
          ['Sentences', stats.sentences, ''],
          ['Avg length', stats.avgSentence ? stats.avgSentence.toFixed(1) : '—', stats.avgSentence > 22 ? 'text-warn' : ''],
          ['Grade level', stats.words ? stats.gradeLevel : '—', ''],
          ['Issues', issues.length, issues.length ? 'text-warn' : 'text-good'],
        ].map(([label, value, cls]) => (
          <div key={label as string} className="card px-3 py-2">
            <div className="eyebrow">{label}</div>
            <div className={cx('num font-display text-2xl font-semibold', cls as string)}>{value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="grid min-w-0 content-start gap-4">
          <div className="card p-4">
            <label htmlFor="lint-text" className="label">Your draft</label>
            <textarea id="lint-text" className="input min-h-[11rem] font-read text-[1.02rem]" value={d.text} onChange={(e) => setText(e.target.value)} placeholder="Paste a paragraph, essay, memo, or script." />
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="btn btn-primary btn-sm" disabled={!fixable.length} onClick={fixAll}><Wand2 size={15} /> Fix {fixable.length} automatically</button>
              <button type="button" className="btn btn-sm" onClick={async () => toast((await copyText(d.text)) ? 'Copied' : 'Select the text to copy it')}><Copy size={15} /> Copy</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setText(EXAMPLE)}><RotateCcw size={15} /> Example</button>
            </div>
          </div>
          <div className="card p-4 sm:p-5">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold">Marked-up copy</h2>
              <span className="text-xs text-muted">Tap an underline</span>
            </div>
            <p className="whitespace-pre-wrap font-read text-[1.05rem] leading-[1.9]">
              {pieces.map((p, k) =>
                p.issue === undefined ? (
                  <span key={k}>{p.text}</span>
                ) : (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setSel(p.issue!)}
                    className={cx('rounded-sm text-left', SEV_CLASS[issues[p.issue].severity], sel === p.issue && 'bg-hlOpinion/40')}
                  >
                    {p.text}
                  </button>
                ),
              )}
              {!d.text && <span className="text-muted">Nothing to check yet.</span>}
            </p>
            {selected?.scope === 'sentence' && (
              <blockquote className="mt-3 border-l-4 border-warn pl-3 font-read text-[0.95rem]">{d.text.slice(selected.start, selected.end)}</blockquote>
            )}
          </div>
        </div>

        <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start">
          {selected && (
            <div className="card mb-4 border-ink p-4">
              <div className="mb-1 flex items-center gap-2">
                <span className={cx('h-2.5 w-2.5 rounded-full', SEV_DOT[selected.severity])} />
                <span className="font-bold">{KIND_LABEL[selected.kind]}</span>
              </div>
              {selected.scope === 'span' && <p className="font-read text-[0.95rem]">“{d.text.slice(selected.start, selected.end)}”</p>}
              <p className="mt-1 text-[0.93rem] text-muted">{selected.message}</p>
              <div className="mt-3 flex gap-2">
                {selected.replacement !== undefined && (
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => fix(selected)}>
                    {selected.replacement === '' ? 'Cut it' : `Change to “${selected.replacement}”`}
                  </button>
                )}
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSel(null)}>Close</button>
              </div>
            </div>
          )}
          <div className="card p-4">
            <div className="mb-3 flex flex-wrap gap-1.5">
              <button type="button" className={cx('chip', filter === 'all' && 'border-ink bg-ink text-surface')} onClick={() => setFilter('all')}>All {issues.length}</button>
              {Object.entries(byKind).map(([k, n]) => (
                <button key={k} type="button" className={cx('chip font-normal', filter === k && 'border-ink bg-ink font-bold text-surface')} onClick={() => setFilter(k as IssueKind)}>
                  {KIND_LABEL[k as IssueKind]} {n}
                </button>
              ))}
            </div>
            {issues.length === 0 && d.text.trim() ? (
              <Callout tone="good" title="Clean copy">No issues found. Read it aloud once more: the ear catches what the eye misses.</Callout>
            ) : (
              <ul className="grid max-h-[28rem] gap-1 overflow-y-auto">
                {shown.map((i) => {
                  const idx = issues.indexOf(i);
                  return (
                    <li key={`${i.start}-${i.kind}`}>
                      <button type="button" onClick={() => setSel(idx)} className={cx('flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left text-[0.9rem] hover:bg-sunken', sel === idx && 'bg-sunken')}>
                        <span className={cx('mt-1.5 h-2 w-2 shrink-0 rounded-full', SEV_DOT[i.severity])} />
                        <span className="min-w-0">
                          <span className="font-bold">{i.scope === 'span' ? `“${d.text.slice(i.start, i.end).slice(0, 40)}”` : KIND_LABEL[i.kind]}</span>{' '}
                          <span className="text-muted">{i.message}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-3">
              <button type="button" className="btn btn-sm" disabled={!stats.words} onClick={() => { recordToolRun('linter', score); toast(`Precision ${score} logged`); requestReflection({ strand: 'C', task: 'Precision Linter pass' }); }}>
                Log score and reflect
              </button>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">The linter is rule-based. It catches patterns, not meaning, so treat each flag as a question, not a verdict.</p>
        </aside>
      </div>
    </div>
  );
}
