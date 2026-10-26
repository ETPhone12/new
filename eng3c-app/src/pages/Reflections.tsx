import { useMemo, useState } from 'react';
import { Copy, Download, Plus, Trash2 } from 'lucide-react';
import { deleteReflection, useApp } from '../store/store';
import { requestReflection, toast } from '../store/ui';
import { STRANDS, STRAND_BY_ID, STRAND_STYLE } from '../data/curriculum';
import { ConfirmButton, PageHeader, Segmented, StrandChip } from '../components/ui';
import { copyText, cx, downloadText, formatDate, isEmbedded } from '../lib/util';
import type { StrandId } from '../types';

export default function Reflections() {
  const s = useApp();
  const [filter, setFilter] = useState<StrandId | 'all'>('all');
  const list = s.reflections.filter((r) => filter === 'all' || r.strand === filter);

  const counts = useMemo(() => {
    const c: Record<StrandId, number> = { A: 0, B: 0, C: 0, D: 0 };
    s.reflections.forEach((r) => c[r.strand]++);
    return c;
  }, [s.reflections]);

  const topTripped = useMemo(() => {
    const m = new Map<string, number>();
    s.reflections.forEach((r) => m.set(r.trippedUp, (m.get(r.trippedUp) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).filter(([, n]) => n > 1).slice(0, 3);
  }, [s.reflections]);

  const exportText = () => {
    const lines: string[] = [`Reflection log${s.settings.name ? ` — ${s.settings.name}` : ''} (${s.settings.course})`, ''];
    for (const st of STRANDS) {
      const rs = s.reflections.filter((r) => r.strand === st.id);
      lines.push(`${st.reflection}: Reflecting on ${st.name} (${rs.length})`);
      rs.slice()
        .reverse()
        .forEach((r) => {
          lines.push(`  ${formatDate(r.at)} · ${r.task}`);
          lines.push(`    Strategy that worked: ${r.worked}`);
          lines.push(`    What tripped me up: ${r.trippedUp}`);
          lines.push(`    Next time: ${r.adjustment}`);
        });
      lines.push('');
    }
    return lines.join('\n');
  };

  return (
    <div>
      <PageHeader
        eyebrow="A3 · B4 · C4 · D4 metacognition"
        title="Reflection Log"
        desc="Every strand ends with a reflection expectation. Sixty seconds after each task: what worked, what tripped you up, and one concrete change."
        actions={
          <button type="button" className="btn btn-primary" onClick={() => requestReflection({ strand: filter === 'all' ? 'C' : filter, task: 'Free reflection' })}>
            <Plus size={17} /> New reflection
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STRANDS.map((st) => (
          <div key={st.id} className={cx('card p-4', counts[st.id] === 0 && 'border-dashed')}>
            <div className={cx('text-sm font-bold', STRAND_STYLE[st.id].text)}>{st.reflection} · {st.short}</div>
            <div className="num font-display text-3xl font-semibold">{counts[st.id]}</div>
            <div className="text-xs text-muted">{counts[st.id] === 0 ? 'No entries yet' : `entr${counts[st.id] === 1 ? 'y' : 'ies'}`}</div>
          </div>
        ))}
      </div>

      {topTripped.length > 0 && (
        <div className="card mb-6 p-4">
          <h2 className="mb-1 font-semibold">Patterns</h2>
          <p className="text-sm text-muted">What keeps tripping you up: {topTripped.map(([t, n]) => `${t} (${n}×)`).join(', ')}. Pick one and plan a strategy for it before your next task.</p>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Segmented label="Filter by strand" value={filter} onChange={setFilter} options={[{ value: 'all', label: 'All' }, ...STRANDS.map((st) => ({ value: st.id, label: st.reflection }))]} />
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-sm" disabled={!s.reflections.length} onClick={async () => toast((await copyText(exportText())) ? 'Log copied. Paste it into your submission.' : 'Copy failed')}>
            <Copy size={15} /> Copy log
          </button>
          {!isEmbedded() && (
            <button type="button" className="btn btn-sm" disabled={!s.reflections.length} onClick={() => downloadText('reflection-log.txt', exportText())}>
              <Download size={15} /> Download
            </button>
          )}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="font-bold">No reflections {filter === 'all' ? 'yet' : `for ${STRAND_BY_ID[filter].reflection} yet`}.</p>
          <p className="mt-1 text-sm text-muted">They are logged after each lesson and tool. You can also add one now.</p>
        </div>
      ) : (
        <ul className="grid gap-3">
          {list.map((r) => (
            <li key={r.id} className="card p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <StrandChip id={r.strand} small />
                  <span className="font-bold">{r.task}</span>
                </div>
                <span className="text-xs text-muted">{formatDate(r.at)} · {r.seconds}s</span>
              </div>
              <dl className="grid gap-2 text-[0.93rem] sm:grid-cols-3">
                <div>
                  <dt className="eyebrow">Worked</dt>
                  <dd>{r.worked}</dd>
                </div>
                <div>
                  <dt className="eyebrow">Tripped me up</dt>
                  <dd>{r.trippedUp}</dd>
                </div>
                <div>
                  <dt className="eyebrow">Next time</dt>
                  <dd>{r.adjustment}</dd>
                </div>
              </dl>
              <div className="mt-2 flex justify-end">
                <ConfirmButton label={<><Trash2 size={14} /> Delete</>} confirmLabel="Tap to delete" className="btn-ghost btn-sm" onConfirm={() => deleteReflection(r.id)} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
