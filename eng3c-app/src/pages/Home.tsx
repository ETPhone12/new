import { ArrowRight, Camera, Check, ClipboardList, Flame, Megaphone, Mic, Scale, Sparkles, type LucideIcon } from 'lucide-react';
import { useApp } from '../store/store';
import { navigate } from '../lib/router';
import { requestReflection } from '../store/ui';
import { MODULES, MODULE_STYLE, STRANDS, STRAND_STYLE, TOOL_BY_ID, TOOLS } from '../data/curriculum';
import { LESSON_BY_ID, LESSONS } from '../data/lessons';
import { isToday, lessonsDone, milestoneAssessments, moduleProgress, nextLesson, reflectionCounts, streak } from '../lib/progress';
import { summarize, levelFromPercent } from '../lib/grading';
import { STICKERS, earnedStickers } from '../lib/stickers';
import { ProgressBar, ProgressRing, StickerBadge, StrandChip } from '../components/ui';
import { DeskScene } from '../components/Illustrations';
import { ROUTE_META, TILE } from '../components/nav';
import { cx } from '../lib/util';

const MODULE_ICON: Record<string, LucideIcon> = { ClipboardList, Megaphone, Mic, Camera, Scale };

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export default function Home() {
  const s = useApp();
  const next = nextLesson(s);
  const done = lessonsDone(s);
  const st = streak(s);
  const g = summarize(s.assessments, s.settings.weights, s.settings.finalSplit, s.settings.termMethod, s.settings.target);
  const counts = reflectionCounts(s);
  const earned = earnedStickers(s);
  const nextModule = next ? MODULES.find((m) => m.id === next.moduleId)! : null;

  // Today's agenda: the lesson finished today (if any), otherwise the next one.
  const doneToday = Object.entries(s.lessons).filter(([, p]) => isToday(p.at)).sort((a, b) => b[1].at.localeCompare(a[1].at))[0];
  const agendaLesson = doneToday ? LESSON_BY_ID[doneToday[0]] : next;
  const practice = agendaLesson?.practice[0];
  const lessonTools = agendaLesson?.practice.map((p) => p.tool) ?? [];
  const practicedToday = Object.entries(s.toolRuns).some(
    ([k, t]) => isToday(t.at) && (lessonTools.length === 0 || lessonTools.some((tool) => k === tool || k.startsWith(tool + ':'))),
  );
  const reflectedToday = s.reflections.some((r) => isToday(r.at));
  const agenda = [
    {
      key: 'lesson',
      label: agendaLesson ? `Lesson ${MODULES.find((m) => m.id === agendaLesson.moduleId)!.number}.${agendaLesson.number}: ${agendaLesson.title}` : 'Sit the mock final exam',
      sub: agendaLesson ? `Minds On, Action, Exit ticket · ${agendaLesson.minutes} min` : 'All lessons done',
      done: Boolean(doneToday),
      action: () => (agendaLesson ? navigate('lesson', agendaLesson.id) : navigate('exam')),
      cta: doneToday ? 'Review' : 'Start',
    },
    {
      key: 'practice',
      label: practice ? `Practise: ${TOOL_BY_ID[practice.tool]?.name ?? practice.label}` : 'Practise with any tool',
      sub: practice?.label ?? 'Pick a tool from the Tools tab',
      done: practicedToday,
      action: () => (practice ? navigate(practice.tool, practice.param) : navigate('tools')),
      cta: 'Open',
    },
    {
      key: 'reflect',
      label: '60-second reflection',
      sub: 'What worked, what tripped you up, one change',
      done: reflectedToday,
      action: () => requestReflection({ strand: agendaLesson?.strands[0] ?? 'C', task: agendaLesson ? `Lesson: ${agendaLesson.title}` : 'Free reflection' }),
      cta: 'Reflect',
    },
  ];
  const agendaDone = agenda.filter((a) => a.done).length;

  const quick = TOOLS.filter((t) => ['reader', 'ppe', 'linter', 'speech', 'hotspot', 'drills'].includes(t.id));

  return (
    <div className="grid gap-7">
      {/* Welcome banner */}
      <section className="card relative overflow-hidden !border-primary/25 bg-gradient-to-br from-primary/10 via-surface to-sun/10 p-5 sm:p-7">
        <div className="grid items-center gap-4 md:grid-cols-[1fr_280px]">
          <div className="min-w-0">
            <div className="eyebrow">{s.settings.course} · {new Date().toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
            <h1 className="mt-1 text-[2.1rem] font-black leading-tight sm:text-[2.7rem]">
              {greeting()}
              {s.settings.name ? `, ${s.settings.name}` : ''}!
            </h1>
            <p className="hand mt-1 text-[1.7rem] leading-tight text-primary">
              {next && nextModule ? `Up next: lesson ${nextModule.number}.${next.number}` : 'Every lesson done. Exam time!'}
            </p>
            {next && nextModule ? (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button type="button" className="btn btn-primary !min-h-[3rem] !px-5 text-base" onClick={() => navigate('lesson', next.id)}>
                  {next.title} <ArrowRight size={18} />
                </button>
                <span className="flex flex-wrap gap-1.5">
                  {next.strands.map((id) => (
                    <StrandChip key={id} id={id} small />
                  ))}
                </span>
              </div>
            ) : (
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" className="btn btn-primary" onClick={() => navigate('exam')}>Start the mock exam</button>
                <button type="button" className="btn" onClick={() => navigate('task', 'final')}>Final evaluation</button>
              </div>
            )}
          </div>
          <DeskScene className="mx-auto hidden h-auto w-full max-w-[280px] sm:block" />
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-3">
        <button type="button" onClick={() => navigate('course')} className="card flex items-center gap-4 p-4 text-left">
          <ProgressRing value={done} max={LESSONS.length} size={72} stroke={9} label={`${done} of ${LESSONS.length} lessons done`}>
            <span className="num text-base font-black">{Math.round((done / LESSONS.length) * 100)}%</span>
          </ProgressRing>
          <span>
            <span className="eyebrow block">Course progress</span>
            <span className="num block font-display text-2xl font-black">{done}<span className="text-base font-bold text-muted">/{LESSONS.length} lessons</span></span>
          </span>
        </button>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Learning streak</span>
            <span className={cx('flex items-center gap-1 font-display text-2xl font-black', st.count ? 'text-strandA' : 'text-muted')}>
              <Flame size={22} className={st.count ? 'fill-strandA/30' : ''} /> {st.count}
            </span>
          </div>
          <div className="mt-3 flex justify-between gap-1">
            {st.week.map((d, i) => (
              <span key={i} className="grid flex-1 place-items-center gap-1">
                <span className={cx('grid h-7 w-7 place-items-center rounded-full text-[0.7rem] font-black', d.active ? 'bg-strandA text-surface' : d.today ? 'border-2 border-dashed border-strandA/60 text-strandA' : 'bg-sunken text-muted')}>
                  {d.active ? <Check size={14} strokeWidth={3} /> : ''}
                </span>
                <span className={cx('text-[0.7rem] font-bold', d.today ? 'text-ink' : 'text-muted')}>{d.label}</span>
              </span>
            ))}
          </div>
        </div>
        <a href="#stickers" onClick={(e) => { e.preventDefault(); document.getElementById('stickers')?.scrollIntoView({ behavior: 'smooth' }); }} className="card flex items-center gap-4 p-4">
          <span className="flex -space-x-4">
            {(earned.length ? earned.slice(-3) : STICKERS.slice(0, 3)).map((x) => (
              <StickerBadge key={x.id} sticker={x} earned={earned.length > 0} size={46} />
            ))}
          </span>
          <span>
            <span className="eyebrow block">Sticker chart</span>
            <span className="num block font-display text-2xl font-black">{earned.length}<span className="text-base font-bold text-muted">/{STICKERS.length} earned</span></span>
          </span>
        </a>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        {/* Agenda */}
        <section className="card relative overflow-hidden p-5 sm:p-6">
          <div className="mb-4 flex items-end justify-between gap-2">
            <h2 className="hand text-[2.1rem] leading-none text-primary">Today’s agenda</h2>
            <span className="num chip border-transparent bg-sunken">{agendaDone}/3 done</span>
          </div>
          <ol className="grid gap-3">
            {agenda.map((a, i) => (
              <li key={a.key} className={cx('flex items-center gap-3 rounded-2xl border-[1.5px] p-3 transition-colors', a.done ? 'border-good/40 bg-good/5' : 'border-line')}>
                <span className={cx('num grid h-10 w-10 shrink-0 place-items-center rounded-full text-base font-black', a.done ? 'bg-good text-surface' : 'bg-sunken text-ink')}>
                  {a.done ? <Check size={20} strokeWidth={3} /> : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cx('block font-extrabold leading-snug', a.done && 'text-muted line-through decoration-2')}>{a.label}</span>
                  <span className="block text-[0.85rem] text-muted">{a.sub}</span>
                </span>
                <button type="button" className={cx('btn btn-sm shrink-0', !a.done && i === agendaDone && 'btn-primary')} onClick={a.action}>
                  {a.cta}
                </button>
              </li>
            ))}
          </ol>
          {agendaDone === 3 && (
            <p className="mt-4 flex items-center gap-2 font-extrabold text-good">
              <Sparkles size={18} /> Agenda complete. Nice work today.
            </p>
          )}
        </section>

        {/* Marks + reflections */}
        <section className="grid content-start gap-4">
          <button type="button" onClick={() => navigate('grades')} className="card p-5 text-left">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-extrabold">Grade snapshot</h2>
              <span className="text-sm font-extrabold text-primary">Gradebook</span>
            </div>
            {g.current === null ? (
              <p className="text-muted">No marks yet. Self-assess a portfolio task on the four KICA categories, or add marks from your real course.</p>
            ) : (
              <div className="flex items-center gap-4">
                <ProgressRing value={g.current} size={68} stroke={8} className={g.current >= s.settings.target ? 'stroke-good' : g.current >= 50 ? 'stroke-warn' : 'stroke-bad'}>
                  <span className="num text-sm font-black">{Math.round(g.current)}%</span>
                </ProgressRing>
                <div className="text-[0.92rem]">
                  <div className="font-extrabold">{levelFromPercent(g.current).label}</div>
                  <div className="text-muted">
                    {g.neededForTarget !== null
                      ? g.neededForTarget > 100
                        ? `${s.settings.target}% is out of reach on the remaining work alone.`
                        : `Need ${Math.max(0, Math.round(g.neededForTarget))}% on what is left for ${s.settings.target}%.`
                      : 'Final mark recorded.'}
                  </div>
                </div>
              </div>
            )}
          </button>
          <div className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-extrabold">Reflections by strand</h2>
              <button type="button" className="text-sm font-extrabold text-primary" onClick={() => navigate('reflections')}>Log</button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {STRANDS.map((x) => (
                <div key={x.id} className={cx('rounded-2xl px-2 py-2.5 text-center', STRAND_STYLE[x.id].tint)}>
                  <div className={cx('text-xs font-black', STRAND_STYLE[x.id].text)}>{x.reflection}</div>
                  <div className="num font-display text-2xl font-black">{counts[x.id]}</div>
                </div>
              ))}
            </div>
            {STRANDS.some((x) => counts[x.id] === 0) && <p className="mt-2 text-[0.85rem] text-muted">Every strand has a reflection expectation. These are easy marks to keep.</p>}
          </div>
        </section>
      </div>

      {/* Modules */}
      <section>
        <div className="mb-3 flex items-end justify-between gap-2">
          <h2 className="text-2xl font-black">Your modules</h2>
          <button type="button" className="text-sm font-extrabold text-primary" onClick={() => navigate('course')}>See the learning path</button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {MODULES.map((m) => {
            const p = moduleProgress(s, m);
            const ms = MODULE_STYLE[m.id];
            const Icon = MODULE_ICON[ms.icon];
            const assessed = milestoneAssessments(s, m.milestone.id).length > 0;
            const complete = p.done === p.total;
            return (
              <button key={m.id} type="button" onClick={() => navigate('course')} className="card group overflow-hidden text-left">
                <span className={cx('relative flex items-center gap-3 px-4 py-4', ms.bg)}>
                  <span className="icon-tile h-12 w-12 rotate-[-5deg] bg-surface/25 text-surface">
                    <Icon size={26} strokeWidth={2.3} />
                  </span>
                  <span className="min-w-0 text-surface">
                    <span className="block text-xs font-black uppercase tracking-[0.08em] opacity-90">Module {m.number}</span>
                    <span className="block font-display text-lg font-black leading-tight">{m.title}</span>
                  </span>
                  {complete && (
                    <span className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-surface text-good">
                      <Check size={17} strokeWidth={3} />
                    </span>
                  )}
                </span>
                <span className="block p-4">
                  <span className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-extrabold">{p.done}/{p.total} lessons</span>
                    <span className={cx('font-bold', assessed ? 'text-good' : 'text-muted')}>{assessed ? 'Task assessed' : m.milestone.kind === 'term' ? 'Portfolio task' : 'Final evaluation'}</span>
                  </span>
                  <ProgressBar value={p.done} max={p.total} tone={m.strands[0]} label={`${m.title} progress`} />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Quick practice */}
      <section>
        <h2 className="mb-3 text-2xl font-black">Quick practice</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {quick.map((t) => {
            const Icon = ROUTE_META[t.id]?.icon;
            const tile = TILE[t.strand === 'all' ? 'primary' : t.strand];
            return (
              <button key={t.id} type="button" onClick={() => navigate(t.id)} className="card flex flex-col items-center gap-2 p-4 text-center transition-transform hover:-translate-y-0.5">
                {Icon && (
                  <span className={cx('icon-tile h-12 w-12', tile.soft, tile.text)}>
                    <Icon size={24} strokeWidth={2.3} />
                  </span>
                )}
                <span className="text-sm font-extrabold leading-tight">{t.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Sticker chart */}
      <section id="stickers" className="card scroll-mt-24 p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-black">Sticker chart</h2>
            <p className="text-sm text-muted">Earn stickers by finishing lessons, reflecting, and hitting targets in the tools.</p>
          </div>
          <span className="num chip border-transparent bg-sun/25">{earned.length} / {STICKERS.length}</span>
        </div>
        <ul className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 md:grid-cols-6">
          {STICKERS.map((x) => {
            const has = earned.some((e) => e.id === x.id);
            return (
              <li key={x.id} className="grid justify-items-center gap-1.5 text-center">
                <StickerBadge sticker={x} earned={has} size={64} />
                <span className={cx('text-[0.8rem] font-extrabold leading-tight', !has && 'text-muted')}>{x.title}</span>
                <span className="text-[0.72rem] leading-tight text-muted">{x.how}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
