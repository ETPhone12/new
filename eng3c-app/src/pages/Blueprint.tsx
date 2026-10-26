import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { MODULES, STRANDS, STRAND_STYLE, TOOLS, TVO_UNITS } from '../data/curriculum';
import { LESSONS } from '../data/lessons';
import { KICA } from '../lib/grading';
import { navigate } from '../lib/router';
import { useApp } from '../store/store';
import { PageHeader } from '../components/ui';
import { cx } from '../lib/util';
import type { StrandId } from '../types';

type Col = 'strand' | 'unit' | 'module' | 'tool' | 'kica';

interface Node {
  id: string;
  col: Col;
  label: string;
  sub: string;
  detail: string;
  strand?: StrandId;
  open?: () => void;
}

const COLS: { id: Col; title: string; note: string }[] = [
  { id: 'strand', title: 'Ministry strands', note: 'Ontario Curriculum, Grades 11 and 12: English (2007)' },
  { id: 'unit', title: 'TVO ILC units', note: 'The "Power" thematic flow' },
  { id: 'module', title: 'App modules', note: '5 modules · 20 lessons' },
  { id: 'tool', title: 'Practice tools', note: 'Interactive, not flashcards' },
  { id: 'kica', title: 'KICA categories', note: 'Achievement chart' },
];

function buildGraph() {
  const nodes: Node[] = [];
  const edges = new Set<string>();
  const link = (a: string, b: string) => {
    if (a === b) return;
    edges.add(a < b ? `${a}|${b}` : `${b}|${a}`);
  };

  for (const s of STRANDS) {
    nodes.push({
      id: `s:${s.id}`,
      col: 'strand',
      label: `${s.id}. ${s.name}`,
      sub: s.expectations.map((e) => e.code).join(' · '),
      detail: `${s.does} Overall expectations: ${s.expectations.map((e) => `${e.code} ${e.name}`).join('; ')}.`,
      strand: s.id,
    });
  }
  nodes.push({
    id: 's:R',
    col: 'strand',
    label: 'Metacognition',
    sub: 'A3 · B4 · C4 · D4',
    detail: 'Every strand ends with a "Reflecting on Skills and Strategies" expectation. Students evaluate which strategies worked, what got in the way, and what they will change.',
    open: () => navigate('reflections'),
  });
  for (const s of STRANDS) link('s:R', `s:${s.id}`);

  for (const u of TVO_UNITS) {
    nodes.push({
      id: `u:${u.id}`,
      col: 'unit',
      label: `Unit ${u.id.slice(1)}: ${u.title}`,
      sub: `Lessons ${u.lessons[0].code}–${u.lessons[u.lessons.length - 1].code}`,
      detail: u.lessons.map((l) => `${l.code} ${l.title}`).join(' · '),
    });
    u.strands.forEach((s) => link(`u:${u.id}`, `s:${s}`));
    u.modules.forEach((m) => link(`u:${u.id}`, `m:${m}`));
  }

  for (const m of MODULES) {
    nodes.push({
      id: `m:${m.id}`,
      col: 'module',
      label: `${m.number}. ${m.title}`,
      sub: m.milestone.kind === 'term' ? 'Portfolio task · term 70%' : 'Final evaluation · 30%',
      detail: `${m.focus} Milestone: ${m.milestone.title}.`,
      strand: m.strands[0],
      open: () => navigate('task', m.milestone.id),
    });
    m.strands.forEach((s) => link(`m:${m.id}`, `s:${s}`));
    const tools = new Set<string>();
    for (const lid of m.lessonIds) LESSONS.find((l) => l.id === lid)?.practice.forEach((p) => tools.add(p.tool));
    m.milestone.steps.forEach((st) => tools.add(st.tool));
    tools.forEach((t) => TOOLS.some((x) => x.id === t) && link(`m:${m.id}`, `t:${t}`));
  }

  for (const t of TOOLS) {
    nodes.push({
      id: `t:${t.id}`,
      col: 'tool',
      label: t.name,
      sub: t.strand === 'all' ? 'All strands' : `Strand ${t.strand}`,
      detail: t.blurb,
      strand: t.strand === 'all' ? undefined : t.strand,
      open: () => navigate(t.id),
    });
    if (t.strand === 'all') STRANDS.forEach((s) => link(`t:${t.id}`, `s:${s.id}`));
    else link(`t:${t.id}`, `s:${t.strand}`);
    t.kica.forEach((k) => link(`t:${t.id}`, `k:${k}`));
  }
  link('t:reflections', 's:R');

  for (const k of KICA) {
    nodes.push({ id: `k:${k.id}`, col: 'kica', label: `${k.short} · ${k.name}`, sub: '', detail: k.looksFor, open: () => navigate('grades') });
  }

  const adj = new Map<string, Set<string>>();
  for (const e of edges) {
    const [a, b] = e.split('|');
    if (!adj.has(a)) adj.set(a, new Set());
    if (!adj.has(b)) adj.set(b, new Set());
    adj.get(a)!.add(b);
    adj.get(b)!.add(a);
  }
  return { nodes, adj };
}

export default function Blueprint() {
  const { settings } = useApp();
  const { nodes, adj } = useMemo(buildGraph, []);
  const [sel, setSel] = useState('s:B');
  const wrap = useRef<HTMLDivElement>(null);
  const detail = useRef<HTMLDivElement>(null);
  const els = useRef(new Map<string, HTMLButtonElement>());
  const [paths, setPaths] = useState<{ d: string; key: string }[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });

  const neighbours = adj.get(sel) ?? new Set<string>();
  const selected = nodes.find((n) => n.id === sel)!;
  const colIndex = (c: Col) => COLS.findIndex((x) => x.id === c);

  const measure = useCallback(() => {
    const box = wrap.current;
    if (!box) return;
    const wide = window.matchMedia('(min-width: 1024px)').matches;
    const br = box.getBoundingClientRect();
    setSize({ w: br.width, h: br.height });
    if (!wide) {
      setPaths([]);
      return;
    }
    const from = els.current.get(sel);
    if (!from) return;
    const fr = from.getBoundingClientRect();
    const out: { d: string; key: string }[] = [];
    const selCol = colIndex(selected.col);
    neighbours.forEach((nid) => {
      const el = els.current.get(nid);
      const n = nodes.find((x) => x.id === nid);
      if (!el || !n) return;
      const r = el.getBoundingClientRect();
      const nCol = colIndex(n.col);
      let d: string;
      if (nCol === selCol) {
        const x = fr.right - br.left;
        const y1 = fr.top + fr.height / 2 - br.top;
        const y2 = r.top + r.height / 2 - br.top;
        d = `M${x},${y1} C${x + 28},${y1} ${x + 28},${y2} ${x},${y2}`;
      } else {
        const right = nCol > selCol;
        const x1 = (right ? fr.right : fr.left) - br.left;
        const x2 = (right ? r.left : r.right) - br.left;
        const y1 = fr.top + fr.height / 2 - br.top;
        const y2 = r.top + r.height / 2 - br.top;
        const mid = (x1 + x2) / 2;
        d = `M${x1},${y1} C${mid},${y1} ${mid},${y2} ${x2},${y2}`;
      }
      out.push({ d, key: nid });
    });
    setPaths(out);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel, nodes]);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(() => measure());
    if (wrap.current) ro.observe(wrap.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  const grouped = COLS.map((c) => ({ ...c, nodes: nodes.filter((n) => n.col === c.id) }));
  const strokeVar = selected.strand ? `rgb(var(--strand-${selected.strand.toLowerCase()}))` : 'rgb(var(--pen))';

  return (
    <div>
      <PageHeader
        eyebrow="Interactive blueprint"
        title="How the course fits together"
        desc="Tap any box to trace its links: curriculum strands to TVO ILC units, to this app's modules, to the practice tools, to the KICA categories they build."
      />

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_300px]">
        <div ref={wrap} className="relative min-w-0">
          <svg className="pointer-events-none absolute inset-0 hidden lg:block" width={size.w} height={size.h} aria-hidden>
            {paths.map((p) => (
              <path key={p.key} d={p.d} fill="none" style={{ stroke: strokeVar }} strokeWidth={1.6} strokeOpacity={0.55} />
            ))}
          </svg>
          <div className="relative grid gap-5 lg:grid-cols-5 lg:gap-7">
            {grouped.map((c) => (
              <div key={c.id} className="min-w-0">
                <div className="mb-2">
                  <div className="font-display text-base font-semibold">{c.title}</div>
                  <div className="text-xs text-muted">{c.note}</div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  {c.nodes.map((n) => {
                    const on = n.id === sel;
                    const near = neighbours.has(n.id);
                    return (
                      <button
                        key={n.id}
                        ref={(el) => {
                          if (el) els.current.set(n.id, el);
                          else els.current.delete(n.id);
                        }}
                        type="button"
                        onClick={() => {
                          setSel(n.id);
                          if (!window.matchMedia('(min-width: 1024px)').matches) detail.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        aria-pressed={on}
                        className={cx(
                          'relative rounded-lg border bg-surface px-3 py-2 text-left transition-all',
                          on ? 'border-primary shadow-lift ring-2 ring-primary/70' : near ? 'border-primary/40' : 'border-line opacity-55 hover:opacity-100',
                        )}
                      >
                        {n.strand && <span className={cx('absolute left-0 top-2 bottom-2 w-[3px] rounded-full', STRAND_STYLE[n.strand].bg)} aria-hidden />}
                        <span className="block text-[0.88rem] font-bold leading-snug [overflow-wrap:anywhere]">{n.label}</span>
                        {n.sub && <span className="block text-[0.74rem] text-muted">{n.sub}</span>}
                        {n.col === 'kica' && (
                          <span className="num mt-1 block text-[0.74rem] font-bold text-muted">Weight {settings.weights[n.id.slice(2) as 'K']}%</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="order-first grid min-w-0 gap-4 md:grid-cols-2 lg:order-none 2xl:sticky 2xl:top-6 2xl:grid-cols-1 2xl:self-start">
          <div ref={detail} className="card scroll-mt-20 p-4">
            <div className="eyebrow">{COLS.find((c) => c.id === selected.col)?.title}</div>
            <h2 className="mt-1 text-xl font-semibold">{selected.label}</h2>
            <p className="mt-2 text-[0.93rem] text-muted">{selected.detail}</p>
            {selected.open && (
              <button type="button" className="btn btn-primary btn-sm mt-3" onClick={selected.open}>
                Open <ArrowRight size={15} />
              </button>
            )}
            <div className="mt-4 grid gap-3 border-t border-line pt-3">
              {COLS.map((c) => {
                const list = nodes.filter((n) => n.col === c.id && neighbours.has(n.id));
                if (!list.length) return null;
                return (
                  <div key={c.id}>
                    <div className="eyebrow mb-1">{c.title}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {list.map((n) => (
                        <button key={n.id} type="button" className="chip font-normal hover:border-primary/50" onClick={() => setSel(n.id)}>
                          {n.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="card self-start p-4">
            <div className="eyebrow mb-2">Your KICA weights</div>
            <div className="flex h-7 overflow-hidden rounded-md">
              {KICA.map((k, i) => (
                <div
                  key={k.id}
                  className={cx('num grid place-items-center text-xs font-bold text-surface', ['bg-strandB', 'bg-strandD', 'bg-strandC', 'bg-strandA'][i])}
                  style={{ width: `${settings.weights[k.id]}%` }}
                  title={k.name}
                >
                  {k.id} {settings.weights[k.id]}
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">Typical ranges: K/U 20–25%, T/I 25–30%, C 25–30%, A 20–25%. Change them in the gradebook to match your teacher.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
