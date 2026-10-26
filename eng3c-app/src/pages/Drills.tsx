import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ArrowLeft, Flame, Timer } from 'lucide-react';
import { DRILL_BY_ID, DRILL_SETS, FEATURE_PROMPTS, type DrillItem, type DrillSet, type TapItem } from '../data/drills';
import { McQuestion } from '../components/Quiz';
import { Callout, PageHeader, ScoreBadge, StrandChip } from '../components/ui';
import { recordToolRun, useApp } from '../store/store';
import { requestReflection, toast } from '../store/ui';
import { navigate } from '../lib/router';
import { cx } from '../lib/util';
import { toolBest } from '../lib/progress';

export default function Drills({ initial }: { initial?: string }) {
  const s = useApp();
  const set = initial ? DRILL_BY_ID[initial] : undefined;
  if (initial === 'features') return <FeaturesDrill />;
  if (set) return <DrillRunner key={set.id} set={set} />;
  return (
    <div>
      <PageHeader
        strand="B"
        eyebrow="Quick-fire practice"
        title="Drills"
        desc="Short, fast rounds. Each answer shows why, so a wrong answer still teaches you something."
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[...DRILL_SETS, { id: 'features', title: 'Text Features Hunt', strand: 'B' as const, blurb: 'Tap the subheading, caption, callout, and more on a workplace bulletin.', items: [] }].map((d) => {
          const best = toolBest(s, `drills:${d.id}`);
          return (
            <button key={d.id} type="button" className="card flex flex-col items-start gap-1.5 p-4 text-left hover:border-primary/40" onClick={() => navigate('drills', d.id)}>
              <span className="flex w-full items-start justify-between gap-2">
                <StrandChip id={d.strand} small />
                {best !== undefined && <ScoreBadge score={best} />}
              </span>
              <span className="font-bold">{d.title}</span>
              <span className="text-sm text-muted">{d.blurb}</span>
              {d.items.length > 0 && <span className="text-xs font-bold text-muted">{d.items.length} items</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DrillRunner({ set }: { set: DrillSet }) {
  const [i, setI] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [start] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  const finished = results.length === set.items.length;

  useEffect(() => {
    if (finished) return;
    const t = window.setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => window.clearInterval(t);
  }, [finished, start]);

  const record = (ok: boolean) => {
    const next = [...results, ok];
    setResults(next);
    const n = ok ? streak + 1 : 0;
    setStreak(n);
    setBest((b) => Math.max(b, n));
    if (next.length === set.items.length) {
      const pct = Math.round((next.filter(Boolean).length / next.length) * 100);
      recordToolRun(`drills:${set.id}`, pct);
      toast(`${set.title}: ${pct}%`);
    }
  };

  const correct = results.filter(Boolean).length;
  const item = set.items[i];

  return (
    <div>
      <button type="button" className="btn btn-ghost btn-sm mb-3 -ml-2" onClick={() => navigate('drills')}>
        <ArrowLeft size={16} /> All drills
      </button>
      <PageHeader strand={set.strand} eyebrow="Drill" title={set.title} desc={set.blurb} />
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
        <span className="chip num"><Timer size={13} /> {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}</span>
        <span className="chip num"><Flame size={13} className={streak >= 3 ? 'text-pen' : ''} /> Streak {streak}</span>
        <span className="num text-muted">{Math.min(results.length + (finished ? 0 : 1), set.items.length)} / {set.items.length}</span>
        <div className="flex flex-1 gap-1">
          {set.items.map((_, k) => (
            <span key={k} className={cx('h-1.5 flex-1 rounded-full', k < results.length ? (results[k] ? 'bg-good' : 'bg-bad') : k === i ? 'bg-ink/40' : 'bg-sunken')} />
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {set.context && (
          <article className="card max-h-[70vh] overflow-y-auto p-5 lg:order-2">
            <div className="eyebrow">Read first</div>
            <h2 className="mt-1 font-read text-xl font-semibold">{set.context.title}</h2>
            <div className="prose-read mt-3 whitespace-pre-line text-[1rem]">{set.context.text}</div>
          </article>
        )}
        <div className={cx('card p-5', !set.context && 'lg:col-span-2 lg:max-w-2xl')}>
          {finished ? (
            <div>
              <div className="eyebrow">Round complete</div>
              <div className="num mt-1 font-display text-5xl font-semibold">{correct}/{set.items.length}</div>
              <p className="mt-1 text-muted">Best streak {best} · {Math.floor(elapsed / 60)}m {elapsed % 60}s</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className="btn btn-primary" onClick={() => requestReflection({ strand: set.strand, task: `Drill: ${set.title}` })}>Reflect</button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setI(0);
                    setResults([]);
                    setStreak(0);
                  }}
                >
                  Run it again
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => navigate('drills')}>Other drills</button>
              </div>
            </div>
          ) : (
            <ItemView key={i} item={item} onResult={record} onNext={() => setI((k) => Math.min(k + 1, set.items.length - 1))} isLast={i === set.items.length - 1} />
          )}
        </div>
      </div>
    </div>
  );
}

function ItemView({ item, onResult, onNext, isLast }: { item: DrillItem; onResult: (ok: boolean) => void; onNext: () => void; isLast: boolean }) {
  const [answered, setAnswered] = useState(false);
  const finish = (ok: boolean) => {
    setAnswered(true);
    onResult(ok);
  };
  return (
    <div>
      {item.type === 'mc' ? <McItemView item={item} onAnswer={finish} /> : <TapItemView item={item} onAnswer={finish} />}
      {answered && !isLast && (
        <button type="button" className="btn btn-primary mt-5" onClick={onNext} autoFocus>
          Next
        </button>
      )}
    </div>
  );
}

function McItemView({ item, onAnswer }: { item: Extract<DrillItem, { type: 'mc' }>; onAnswer: (ok: boolean) => void }) {
  const [chosen, setChosen] = useState<number | undefined>();
  return (
    <McQuestion
      q={{ q: item.prompt, options: item.options, answer: item.answer, why: item.why }}
      quote={item.quote}
      chosen={chosen}
      onChoose={(c) => {
        if (chosen !== undefined) return;
        setChosen(c);
        onAnswer(c === item.answer);
      }}
    />
  );
}

function TapItemView({ item, onAnswer }: { item: TapItem; onAnswer: (ok: boolean) => void }) {
  const tokens = useMemo(() => tokenize(item.sentence, item.target), [item]);
  const [tapped, setTapped] = useState<number | null>(null);
  const [fn, setFn] = useState<number | undefined>();
  const tapRight = tapped !== null && tokens[tapped].target;

  return (
    <div>
      <div className="mb-3 font-bold">{item.prompt}</div>
      <p className="font-read text-[1.2rem] leading-[2.2]">
        {tokens.map((t, k) =>
          t.space ? (
            <span key={k}> </span>
          ) : (
            <button
              key={k}
              type="button"
              disabled={tapped !== null}
              onClick={() => {
                setTapped(k);
                if (!t.target) onAnswer(false);
              }}
              className={cx(
                'rounded px-0.5 transition-colors',
                tapped === null && 'hover:bg-hlOpinion/40',
                tapped !== null && t.target && 'hl-thesis',
                tapped === k && !t.target && 'bg-bad/20 line-through',
              )}
            >
              {t.text}
            </button>
          ),
        )}
      </p>
      {tapped !== null && !tapRight && <p className="mt-2 text-[0.92rem]"><strong className="text-bad">Not quite.</strong> <span className="text-muted">The transition is “{item.target}”. {item.why}</span></p>}
      {tapRight && (
        <div className="mt-4">
          <McQuestion
            q={{ q: item.followUp.q, options: item.followUp.options, answer: item.followUp.answer, why: item.why }}
            chosen={fn}
            onChoose={(c) => {
              if (fn !== undefined) return;
              setFn(c);
              onAnswer(c === item.followUp.answer);
            }}
          />
        </div>
      )}
    </div>
  );
}

function tokenize(sentence: string, target: string) {
  const start = sentence.indexOf(target);
  const end = start + target.length;
  const out: { text: string; target: boolean; space?: boolean }[] = [];
  const re = /(\s+)|([^\s]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sentence))) {
    if (m[1]) {
      out.push({ text: m[1], target: false, space: true });
      continue;
    }
    const s = m.index;
    const e = s + m[0].length;
    out.push({ text: m[0], target: start >= 0 && s < end && e > start });
  }
  return out;
}

function FeaturesDrill() {
  const [k, setK] = useState(0);
  const [miss, setMiss] = useState<string | null>(null);
  const [score, setScore] = useState<boolean[]>([]);
  const done = score.length === FEATURE_PROMPTS.length;
  const prompt = FEATURE_PROMPTS[Math.min(k, FEATURE_PROMPTS.length - 1)];
  const [found, setFound] = useState<string | null>(null);

  const tap = (id: string) => {
    if (done || found) return;
    if (id === prompt.id) {
      setFound(id);
      const next = [...score, miss === null];
      setScore(next);
      if (next.length === FEATURE_PROMPTS.length) recordToolRun('drills:features', Math.round((next.filter(Boolean).length / next.length) * 100));
    } else setMiss(id);
  };
  const next = () => {
    setFound(null);
    setMiss(null);
    setK((x) => x + 1);
  };
  const Zone = ({ id, children, className, inline }: { id: string; children: ReactNode; className?: string; inline?: boolean }) => {
    const Tag = inline ? 'span' : 'div';
    return (
    <Tag
      role="button"
      tabIndex={0}
      onClick={() => tap(id)}
      onKeyDown={(e) => e.key === 'Enter' && tap(id)}
      className={cx('cursor-pointer rounded-md outline-offset-2 transition-colors hover:outline hover:outline-2 hover:outline-ink/20', found === id && 'outline outline-2 outline-good', miss === id && 'outline outline-2 outline-bad', className)}
    >
      {children}
    </Tag>
    );
  };

  return (
    <div>
      <button type="button" className="btn btn-ghost btn-sm mb-3 -ml-2" onClick={() => navigate('drills')}>
        <ArrowLeft size={16} /> All drills
      </button>
      <PageHeader strand="B" eyebrow="B2 Form and style" title="Text Features Hunt" desc="Text features help readers find and understand information fast. Tap the one named in the prompt." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="card p-5 font-sans">
          <Zone id="title"><h2 className="text-2xl font-semibold">Lifting Without Injury</h2></Zone>
          <p className="mt-1 text-sm text-muted">Safety Bulletin #14 · Warehouse and stockroom staff</p>
          <Zone id="subheading" className="mt-4"><h3 className="text-lg font-semibold">Before you lift</h3></Zone>
          <p className="mt-1 text-[0.97rem]">
            Back injuries are the most common reason for lost shifts. Most are caused by <Zone id="bold" inline><strong>twisting</strong></Zone> while holding a load.
          </p>
          <Zone id="list" className="mt-2">
            <ul className="list-disc pl-5 text-[0.97rem]">
              <li>Test the weight by tipping one corner.</li>
              <li>Clear a path to where the box will go.</li>
              <li>Use a cart for anything over 23 kg.</li>
            </ul>
          </Zone>
          <Zone id="callout" className="mt-4">
            <div className="rounded-lg border-2 border-warn bg-warn/10 p-3 text-[0.95rem] font-bold">WARNING: Never lift above shoulder height. Use the step stool.</div>
          </Zone>
          <div className="mt-4 grid gap-1">
            <div className="grid h-28 place-items-center rounded-md bg-sunken text-sm text-muted" aria-hidden>[ photo: worker lifting with bent knees ]</div>
            <Zone id="caption"><p className="text-sm italic text-muted">Bend at the knees and keep the box close to your body.</p></Zone>
          </div>
          <Zone id="source" className="mt-4"><p className="text-xs text-muted">Source: Company health and safety committee, 2026. Adapted from workplace safety guidelines.</p></Zone>
        </div>
        <div className="card p-5">
          {done ? (
            <div>
              <div className="eyebrow">Hunt complete</div>
              <div className="num mt-1 font-display text-5xl font-semibold">{score.filter(Boolean).length}/{FEATURE_PROMPTS.length}</div>
              <p className="text-muted">First-try finds</p>
              <button type="button" className="btn btn-primary mt-4" onClick={() => requestReflection({ strand: 'B', task: 'Text Features Hunt' })}>Reflect</button>
            </div>
          ) : (
            <div>
              <div className="eyebrow num">Find {k + 1} of {FEATURE_PROMPTS.length}</div>
              <p className="mt-1 text-xl font-semibold">Tap {prompt.label}.</p>
              {miss && !found && <p className="mt-2 text-bad">Not that one. Try again.</p>}
              {found && (
                <Callout tone="good" title="Found it">
                  {prompt.purpose}
                  <div>
                    <button type="button" className="btn btn-primary btn-sm mt-2" onClick={next}>Next</button>
                  </div>
                </Callout>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
