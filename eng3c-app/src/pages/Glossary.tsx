import { useMemo, useState } from 'react';
import { RotateCcw, Search, Shuffle } from 'lucide-react';
import { LESSONS } from '../data/lessons';
import { MODULE_BY_ID } from '../data/curriculum';
import { navigate } from '../lib/router';
import { PageHeader, ProgressBar, Segmented } from '../components/ui';
import { useDraft } from '../store/store';
import { cx, shuffle } from '../lib/util';
import type { StrandId } from '../types';

interface Entry {
  term: string;
  def: string;
  lessonId: string;
  lesson: string;
  strand: StrandId;
}

const ACCENT: Record<StrandId, string> = { A: '--strand-a', B: '--strand-b', C: '--strand-c', D: '--strand-d' };

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
  const [mode, setMode] = useState<'wall' | 'cards'>('wall');
  const [q, setQ] = useState('');
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? ENTRIES.filter((e) => e.term.toLowerCase().includes(s) || e.def.toLowerCase().includes(s)) : ENTRIES;
  }, [q]);
  const byLetter = useMemo(() => {
    const m = new Map<string, Entry[]>();
    for (const e of shown) {
      const L = e.term[0].toUpperCase();
      if (!m.has(L)) m.set(L, []);
      m.get(L)!.push(e);
    }
    return [...m.entries()];
  }, [shown]);

  return (
    <div>
      <PageHeader
        eyebrow={`${ENTRIES.length} terms from all 20 lessons`}
        title="Word Wall"
        desc="Knowledge & Understanding marks start with the vocabulary. Browse the wall, or drill the terms as flashcards."
        actions={<Segmented label="View" value={mode} onChange={setMode} options={[{ value: 'wall', label: 'Word wall' }, { value: 'cards', label: 'Flashcards' }]} />}
      />
      {mode === 'wall' ? (
        <>
          <div className="sticky top-[calc(env(safe-area-inset-top,0px)+4.5rem)] z-20 mb-6 grid gap-3 rounded-2xl border-[1.5px] border-line bg-surface/95 p-3 backdrop-blur lg:top-4">
            <div className="relative">
              <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <label htmlFor="g-search" className="sr-only">Search terms</label>
              <input id="g-search" className="input pl-10" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search: ethos, rule of thirds, comma splice..." />
            </div>
            <div className="flex flex-wrap gap-1">
              {byLetter.map(([L]) => (
                <button key={L} type="button" className="num grid h-8 w-8 place-items-center rounded-lg bg-sunken text-sm font-black hover:bg-primary hover:text-onprimary" onClick={() => document.getElementById(`letter-${L}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                  {L}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-8">
            {byLetter.map(([L, list]) => (
              <section key={L} id={`letter-${L}`} className="scroll-mt-40">
                <div className="mb-3 flex items-center gap-3">
                  <span className="hand grid h-12 w-12 rotate-[-6deg] place-items-center rounded-xl bg-sun text-[2rem] leading-none text-onhl shadow-[0_3px_0_rgb(var(--shadow)/0.15)]">{L}</span>
                  <span className="h-[2px] flex-1 rounded bg-line" aria-hidden />
                </div>
                <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {list.map((e, i) => (
                    <div key={e.term} className="index-card" style={{ ['--accent' as string]: `var(${ACCENT[e.strand]})`, transform: `rotate(${i % 3 === 0 ? -0.6 : i % 3 === 1 ? 0.5 : 0}deg)` }}>
                      <dt className="font-display text-lg font-black leading-tight">{e.term}</dt>
                      <dd className="mt-1.5 text-[0.93rem] leading-[26px] text-ink/85">{e.def}</dd>
                      <dd className="mt-2">
                        <button type="button" className="text-xs font-extrabold text-primary hover:underline" onClick={() => navigate('lesson', e.lessonId)}>
                          Lesson {e.lesson}
                        </button>
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
            {shown.length === 0 && <p className="text-muted">No terms match “{q}”.</p>}
          </div>
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
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="num font-extrabold">{known.length}/{ENTRIES.length} known</span>
        <span className="flex gap-1">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setOrder(shuffle(ENTRIES.map((e) => e.term))); setI(0); setFlipped(false); }}><Shuffle size={15} /> Shuffle</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setKnown([]); setI(0); setFlipped(false); }}><RotateCcw size={15} /> Reset</button>
        </span>
      </div>
      <div className="mb-5">
        <ProgressBar value={known.length} max={ENTRIES.length} tone="good" label="Terms known" />
      </div>
      {entry ? (
        <>
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            className={cx('index-card grid min-h-[17rem] w-full place-items-center !px-6 !py-8 text-center transition-transform', flipped ? 'rotate-[0.6deg]' : 'rotate-[-0.6deg]')}
            style={{ ['--accent' as string]: `var(${ACCENT[entry.strand]})` }}
            aria-label={flipped ? 'Show term' : 'Show definition'}
          >
            {flipped ? (
              <span>
                <span className="block text-lg font-semibold leading-[26px]">{entry.def}</span>
                <span className="mt-4 block text-xs font-bold text-muted">Lesson {entry.lesson}</span>
              </span>
            ) : (
              <span>
                <span className="block font-display text-[2.1rem] font-black leading-tight">{entry.term}</span>
                <span className="hand mt-3 block text-xl text-muted">say it out loud, then tap to flip</span>
              </span>
            )}
          </button>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button type="button" className="btn" onClick={() => next(false)}>Again later</button>
            <button type="button" className="btn btn-primary" onClick={() => next(true)}>I knew it!</button>
          </div>
        </>
      ) : (
        <div className="card p-6 text-center">
          <p className="font-display text-2xl font-black">Deck cleared!</p>
          <p className="mt-1 text-muted">You know all {ENTRIES.length} terms. Reset to go again.</p>
        </div>
      )}
    </div>
  );
}
