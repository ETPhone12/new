import { useMemo, useState } from 'react';
import { RotateCcw, Search, Shuffle } from 'lucide-react';
import { LESSONS } from '../data/lessons';
import { MODULE_BY_ID } from '../data/curriculum';
import { navigate } from '../lib/router';
import { PageHeader, Segmented, StrandChip } from '../components/ui';
import { useDraft } from '../store/store';
import { cx, shuffle } from '../lib/util';

interface Entry {
  term: string;
  def: string;
  lessonId: string;
  lesson: string;
  strand: (typeof LESSONS)[number]['strands'][number];
}

const ENTRIES: Entry[] = (() => {
  const seen = new Set<string>();
  const out: Entry[] = [];
  for (const l of LESSONS) {
    const m = MODULE_BY_ID[l.moduleId];
    for (const t of l.keyTerms) {
      const k = t.term.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      out.push({ ...t, lessonId: l.id, lesson: `${m.number}.${l.number} ${l.title}`, strand: l.strands[0] });
    }
  }
  return out.sort((a, b) => a.term.localeCompare(b.term));
})();

export default function Glossary() {
  const [mode, setMode] = useState<'list' | 'cards'>('list');
  const [q, setQ] = useState('');
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? ENTRIES.filter((e) => e.term.toLowerCase().includes(s) || e.def.toLowerCase().includes(s)) : ENTRIES;
  }, [q]);

  return (
    <div>
      <PageHeader
        eyebrow={`${ENTRIES.length} terms from all 20 lessons`}
        title="Glossary"
        desc="Knowledge & Understanding marks start with knowing the terms. Search them, or drill them as cards."
        actions={<Segmented label="View" value={mode} onChange={setMode} options={[{ value: 'list', label: 'List' }, { value: 'cards', label: 'Flashcards' }]} />}
      />
      {mode === 'list' ? (
        <>
          <div className="relative mb-5 max-w-md">
            <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <label htmlFor="g-search" className="sr-only">Search terms</label>
            <input id="g-search" className="input pl-10" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search: ethos, rule of thirds, comma splice..." />
          </div>
          <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {shown.map((e) => (
              <div key={e.term} className="card p-4">
                <dt className="flex items-start justify-between gap-2">
                  <span className="font-display text-lg font-semibold">{e.term}</span>
                  <StrandChip id={e.strand} withName={false} small />
                </dt>
                <dd className="mt-1 text-[0.95rem]">{e.def}</dd>
                <dd className="mt-2">
                  <button type="button" className="text-xs font-bold text-strandB hover:underline" onClick={() => navigate('lesson', e.lessonId)}>{e.lesson}</button>
                </dd>
              </div>
            ))}
          </dl>
          {shown.length === 0 && <p className="text-muted">No terms match “{q}”.</p>}
        </>
      ) : (
        <Cards />
      )}
    </div>
  );
}

function Cards() {
  const [known, setKnown] = useDraft<string[]>('glossary:known', []);
  const [order, setOrder] = useState(() => shuffle(ENTRIES.map((e) => e.term)));
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const deck = order.filter((t) => !known.includes(t));
  const term = deck[i % Math.max(1, deck.length)];
  const entry = ENTRIES.find((e) => e.term === term);

  const next = (didKnow: boolean) => {
    if (didKnow && term) setKnown((k) => [...k, term]);
    setFlipped(false);
    setI((x) => (didKnow ? x : x + 1));
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="num text-muted">{known.length}/{ENTRIES.length} known · {deck.length} to go</span>
        <span className="flex gap-1">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setOrder(shuffle(ENTRIES.map((e) => e.term))); setI(0); setFlipped(false); }}><Shuffle size={15} /> Shuffle</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setKnown([]); setI(0); setFlipped(false); }}><RotateCcw size={15} /> Reset</button>
        </span>
      </div>
      {entry ? (
        <>
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            className={cx('card grid min-h-[16rem] w-full place-items-center p-6 text-center transition-colors', flipped && 'bg-sunken')}
            aria-label={flipped ? 'Show term' : 'Show definition'}
          >
            {flipped ? (
              <span>
                <span className="block text-lg">{entry.def}</span>
                <span className="mt-3 block text-xs text-muted">{entry.lesson}</span>
              </span>
            ) : (
              <span>
                <span className="block font-display text-3xl font-semibold">{entry.term}</span>
                <span className="mt-3 block text-sm text-muted">Say the definition out loud, then tap to check.</span>
              </span>
            )}
          </button>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button type="button" className="btn" onClick={() => next(false)}>Again later</button>
            <button type="button" className="btn btn-primary" onClick={() => next(true)}>I knew it</button>
          </div>
        </>
      ) : (
        <div className="card p-6 text-center">
          <p className="font-display text-2xl font-semibold">Deck cleared.</p>
          <p className="mt-1 text-muted">You know all {ENTRIES.length} terms. Reset to go again.</p>
        </div>
      )}
    </div>
  );
}
