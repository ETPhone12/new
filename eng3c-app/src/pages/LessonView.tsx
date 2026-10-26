import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Camera,
  Check,
  CheckCircle2,
  Circle,
  ClipboardList,
  Clock,
  Lightbulb,
  Megaphone,
  Mic,
  PartyPopper,
  RotateCcw,
  Scale,
  Target,
  Ticket,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import { LESSON_BY_ID, LESSONS } from '../data/lessons';
import { LEARNING_GOALS } from '../data/learningGoals';
import { MODULE_BY_ID, MODULE_STYLE, STRAND_STYLE, TOOL_BY_ID } from '../data/curriculum';
import { completeLesson, uncompleteLesson, useApp, useDraft } from '../store/store';
import { celebrate, requestReflection, toast } from '../store/ui';
import { navigate } from '../lib/router';
import { Quiz } from '../components/Quiz';
import { PageHeader, StickyNote, StrandChip } from '../components/ui';
import { ROUTE_META, TILE } from '../components/nav';
import { toolBest } from '../lib/progress';
import { cx } from '../lib/util';
import type { StrandId } from '../types';

const MODULE_ICON: Record<string, LucideIcon> = { ClipboardList, Megaphone, Mic, Camera, Scale };
const CARD_ACCENTS = ['--strand-b', '--strand-c', '--strand-a', '--strand-d', '--mod-1', '--mod-2'];

function PartHeader({ n, title, time, color }: { n: number; title: string; time: string; color: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className={cx('num grid h-11 w-11 shrink-0 rotate-[-6deg] place-items-center rounded-xl font-display text-xl font-black text-surface shadow-[0_3px_0_rgb(var(--shadow)/0.18)]', color)}>{n}</span>
      <div>
        <h2 className="text-[1.6rem] font-black leading-none">{title}</h2>
        <div className="mt-1 text-[0.8rem] font-bold text-muted">{time}</div>
      </div>
    </div>
  );
}

export default function LessonView({ id }: { id: string }) {
  const s = useApp();
  const lesson = LESSON_BY_ID[id];
  const [quiz, setQuiz] = useState<{ score: number; total: number } | null>(null);
  const [checks, setChecks] = useDraft<boolean[]>(`criteria:${id}`, [false, false, false]);
  if (!lesson) {
    return (
      <div>
        <PageHeader title="Lesson not found" />
        <button type="button" className="btn" onClick={() => navigate('course')}>Back to the learning path</button>
      </div>
    );
  }
  const m = MODULE_BY_ID[lesson.moduleId];
  const ms = MODULE_STYLE[m.id];
  const MIcon = MODULE_ICON[ms.icon];
  const goals = LEARNING_GOALS[id];
  const idx = LESSONS.findIndex((l) => l.id === id);
  const prev = LESSONS[idx - 1];
  const next = LESSONS[idx + 1];
  const done = s.lessons[id];
  const ticketDone = Boolean(quiz) || Boolean(done);
  const practiced = lesson.practice.some((p) => toolBest(s, p.param ? `${p.tool}:${p.param}` : p.tool) !== undefined || toolBest(s, p.tool) !== undefined);
  const reflected = s.reflections.some((r) => r.task.includes(lesson.title));
  const ticked = checks.filter(Boolean).length;

  const finish = () => {
    const result = quiz ?? { score: 0, total: lesson.quiz.length };
    completeLesson(id, { quizScore: result.score, quizTotal: result.total });
    celebrate();
    toast(`Lesson ${m.number}.${lesson.number} complete!`);
    window.setTimeout(() => requestReflection({ strand: lesson.strands[0], task: `Lesson ${m.number}.${lesson.number}: ${lesson.title}` }), 700);
  };

  const jump = (target: string) => document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const checklist = [
    { label: `Success criteria (${ticked}/3)`, ok: ticked === 3 },
    { label: done ? `Exit ticket ${done.quizScore}/${done.quizTotal}` : quiz ? `Exit ticket ${quiz.score}/${quiz.total}` : 'Exit ticket', ok: ticketDone },
    { label: 'Practice tool', ok: practiced },
    { label: 'Lesson complete', ok: Boolean(done) },
    { label: '60-second reflection', ok: reflected },
  ];

  return (
    <article>
      <button type="button" className="btn btn-ghost btn-sm mb-3 -ml-2" onClick={() => navigate('course')}>
        <ArrowLeft size={16} /> Learning path
      </button>

      {/* Banner */}
      <header className={cx('relative overflow-hidden rounded-3xl p-5 text-surface shadow-[0_4px_0_rgb(var(--shadow)/0.15)] sm:p-7', ms.bg)}>
        <span className="pointer-events-none absolute -right-8 -top-10 h-44 w-44 rounded-full bg-surface/10" aria-hidden />
        <span className="pointer-events-none absolute bottom-[-3rem] right-24 h-28 w-28 rounded-full bg-surface/10" aria-hidden />
        <div className="relative flex items-start gap-4">
          <span className="icon-tile hidden h-16 w-16 rotate-[-6deg] bg-surface/25 sm:grid">
            <MIcon size={34} strokeWidth={2.3} />
          </span>
          <div className="min-w-0">
            <div className="text-xs font-black uppercase tracking-[0.1em] opacity-90">Module {m.number} · Lesson {lesson.number}</div>
            <h1 className="mt-1 font-display text-[2rem] font-black leading-tight sm:text-[2.5rem]">{lesson.title}</h1>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {lesson.strands.map((sid) => (
                <span key={sid} className="chip border-transparent bg-surface/90 text-ink">
                  <span className={cx('h-2 w-2 rounded-full', STRAND_STYLE[sid].dot)} /> {sid}
                </span>
              ))}
              <span className="chip border-transparent bg-surface/20 text-surface">Expectations {lesson.expectations.join(', ')}</span>
              {lesson.tvo && <span className="chip border-transparent bg-surface/20 text-surface">TVO ILC {lesson.tvo}</span>}
              <span className="chip border-transparent bg-surface/20 text-surface"><Clock size={13} /> {lesson.minutes} min</span>
              {done && <span className="chip border-transparent bg-surface text-good"><CheckCircle2 size={13} /> Complete</span>}
            </div>
          </div>
        </div>
      </header>

      {/* 3-part stepper */}
      <nav aria-label="Lesson parts" className="relative z-10 mx-auto -mt-5 mb-8 grid max-w-xl grid-cols-3 gap-2 px-2">
        {(
          [
            ['minds-on', 'Minds On', ticked > 0],
            ['action', 'Action', ticked > 0 && ticketDone],
            ['consolidation', 'Consolidation', Boolean(done)],
          ] as const
        ).map(([target, label, ok], i) => (
          <button key={target} type="button" onClick={() => jump(target)} className="card flex flex-col items-center justify-center gap-1 !rounded-2xl px-1.5 py-2 text-[0.74rem] font-extrabold shadow-lift sm:flex-row sm:gap-2 sm:px-2 sm:py-2.5 sm:text-sm">
            <span className={cx('num grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-black', ok ? 'bg-good text-surface' : 'bg-sunken')}>{ok ? <Check size={14} strokeWidth={3} /> : i + 1}</span>
            <span className="text-center leading-tight">{label}</span>
          </button>
        ))}
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_290px]">
        <div className="grid min-w-0 gap-12">
          {/* Part 1 */}
          <section id="minds-on" className="scroll-mt-24">
            <PartHeader n={1} title="Minds On" time="Get ready · about 5 min" color="bg-strandB" />
            <div className="grid gap-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <StickyNote title="Think about it" className="self-start">
                <p className="text-[1.05rem] font-semibold leading-relaxed">{lesson.hook}</p>
              </StickyNote>
              {goals && (
                <div className="card p-5">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="icon-tile h-8 w-8 !rounded-lg bg-pen/15 text-pen"><Target size={18} strokeWidth={2.4} /></span>
                    <span className="eyebrow">Learning goal</span>
                  </div>
                  <p className="text-[1.08rem] font-extrabold leading-snug">{goals.goal}</p>
                  <div className="eyebrow mb-2 mt-4">Success criteria</div>
                  <ul className="grid gap-2">
                    {goals.criteria.map((c, i) => (
                      <li key={c}>
                        <label className={cx('flex cursor-pointer items-start gap-3 rounded-xl border-[1.5px] p-2.5 transition-colors', checks[i] ? 'border-good/40 bg-good/5' : 'border-line hover:bg-sunken')}>
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={!!checks[i]}
                            onChange={(e) => setChecks((prev) => prev.map((v, k) => (k === i ? e.target.checked : v)))}
                          />
                          <span className={cx('mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg border-2', checks[i] ? 'border-good bg-good text-surface' : 'border-line')} aria-hidden>
                            {checks[i] && <Check size={15} strokeWidth={3.2} />}
                          </span>
                          <span className="text-[0.95rem] font-semibold">{c}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-[0.8rem] text-muted">Tick each one when you can honestly say it. Come back after the exit ticket.</p>
                </div>
              )}
            </div>
          </section>

          {/* Part 2 */}
          <section id="action" className="scroll-mt-24">
            <PartHeader n={2} title="Action" time="Learn it · about 15 min" color="bg-strandC" />
            <div className="grid gap-4">
              {lesson.sections.map((sec, si) => (
                <div key={sec.heading} className="card p-5">
                  <h3 className="mb-3 flex items-center gap-2.5 text-xl font-black">
                    <span className={cx('num grid h-7 w-7 place-items-center rounded-lg text-sm font-black', ms.soft, ms.text)}>{String.fromCharCode(97 + si)}</span>
                    {sec.heading}
                  </h3>
                  {sec.body.length === 1 ? (
                    <p className="max-w-[68ch] text-[1.02rem]">{sec.body[0]}</p>
                  ) : (
                    <ul className="grid max-w-[68ch] gap-2.5">
                      {sec.body.map((b) => (
                        <li key={b} className="flex gap-3 text-[1.02rem]">
                          <span className={cx('mt-[0.55rem] h-2 w-2 shrink-0 rounded-full', ms.bg)} aria-hidden />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              {lesson.example && (
                <div className="chalkboard p-5 sm:p-6">
                  <div className="hand mb-2 text-[1.7rem] leading-none text-sun">Teacher model: {lesson.example.label}</div>
                  <p className="whitespace-pre-line font-read text-[1.04rem] leading-relaxed">{lesson.example.text}</p>
                </div>
              )}

              <div>
                <h3 className="mb-3 mt-4 flex items-center gap-2 text-xl font-black">
                  <Lightbulb size={20} className="text-sun" /> Word wall
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {lesson.keyTerms.map((t, i) => (
                    <div
                      key={t.term}
                      className="index-card"
                      style={{ ['--accent' as string]: `var(${CARD_ACCENTS[i % CARD_ACCENTS.length]})`, transform: `rotate(${i % 2 ? 0.6 : -0.6}deg)` }}
                    >
                      <div className="font-display text-lg font-black leading-tight">{t.term}</div>
                      <div className="mt-1.5 text-[0.92rem] leading-[26px] text-ink/85">{t.def}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Part 3 */}
          <section id="consolidation" className="scroll-mt-24">
            <PartHeader n={3} title="Consolidation" time="Show what you know · about 10 min" color="bg-strandA" />
            <div className="ticket">
              <div className="flex items-center justify-between gap-3 px-5 pb-4 pt-5">
                <div className="flex items-center gap-3">
                  <span className="icon-tile h-11 w-11 rotate-[-6deg] bg-sun text-onhl"><Ticket size={24} strokeWidth={2.3} /></span>
                  <div>
                    <div className="font-display text-2xl font-black leading-none">Exit ticket</div>
                    <div className="text-[0.82rem] font-bold text-muted">Three questions before you head out</div>
                  </div>
                </div>
                <span className="hand hidden text-2xl text-muted sm:block">Admit one</span>
              </div>
              <div className="ticket-tear" />
              <div className="p-5">
                <Quiz questions={lesson.quiz} onComplete={(score, total) => setQuiz({ score, total })} title="" />
              </div>
            </div>

            <h3 className="mb-3 mt-8 text-xl font-black">Practise it</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {lesson.practice.map((p) => {
                const tool = TOOL_BY_ID[p.tool];
                const Icon = ROUTE_META[p.tool]?.icon;
                const tileKey: StrandId | 'primary' = !tool || tool.strand === 'all' ? 'primary' : tool.strand;
                const tile = TILE[tileKey];
                return (
                  <button key={p.label} type="button" className="card flex items-center gap-3 p-4 text-left transition-transform hover:-translate-y-0.5" onClick={() => navigate(p.tool, p.param)}>
                    {Icon && (
                      <span className={cx('icon-tile h-12 w-12', tile.soft, tile.text)}>
                        <Icon size={24} strokeWidth={2.3} />
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block font-extrabold leading-snug">{p.label}</span>
                      <span className="block text-[0.82rem] text-muted">{tool?.name}</span>
                    </span>
                    <ArrowRight size={18} className="text-muted" />
                  </button>
                );
              })}
            </div>

            <div className={cx('mt-8 rounded-3xl border-[1.5px] p-5 text-center sm:p-6', done ? 'border-good/40 bg-good/5' : 'border-dashed border-line')}>
              {done ? (
                <>
                  <div className="flex items-center justify-center gap-2 font-display text-2xl font-black text-good">
                    <PartyPopper size={24} /> Lesson complete
                  </div>
                  <p className="mt-1 text-muted">Exit ticket {done.quizScore}/{done.quizTotal}</p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {!reflected && (
                      <button type="button" className="btn btn-primary" onClick={() => requestReflection({ strand: lesson.strands[0], task: `Lesson ${m.number}.${lesson.number}: ${lesson.title}` })}>
                        Log my reflection
                      </button>
                    )}
                    {next && (
                      <button type="button" className={cx('btn', reflected && 'btn-primary')} onClick={() => navigate('lesson', next.id)}>
                        Next lesson <ArrowRight size={16} />
                      </button>
                    )}
                    <button type="button" className="btn btn-ghost btn-sm self-center" onClick={() => uncompleteLesson(id)}><RotateCcw size={14} /> Mark not done</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="font-display text-2xl font-black">Finished the exit ticket?</div>
                  <p className="mt-1 text-muted">{quiz ? 'Mark the lesson complete, then take 60 seconds to reflect.' : 'Answer all three exit ticket questions first.'}</p>
                  <button type="button" className="btn btn-primary mt-4 !min-h-[3.1rem] !px-6 text-base" onClick={finish} disabled={!quiz}>
                    <CheckCircle2 size={20} /> I’m done! Mark complete
                  </button>
                </>
              )}
            </div>
          </section>

          <div className="flex flex-wrap justify-between gap-3">
            {prev ? (
              <button type="button" className="btn btn-ghost" onClick={() => navigate('lesson', prev.id)}><ArrowLeft size={16} /> {prev.title}</button>
            ) : <span />}
            {next ? (
              <button type="button" className="btn btn-ghost" onClick={() => navigate('lesson', next.id)}>{next.title} <ArrowRight size={16} /></button>
            ) : (
              <button type="button" className="btn btn-ghost" onClick={() => navigate('task', 'final')}>Final evaluation <ArrowRight size={16} /></button>
            )}
          </div>
        </div>

        <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start">
          <div className="card p-5">
            <h2 className="hand mb-3 text-[1.8rem] leading-none text-primary">Lesson checklist</h2>
            <ul className="grid gap-2.5">
              {checklist.map((c) => (
                <li key={c.label} className="flex items-center gap-2.5 text-[0.95rem] font-bold">
                  {c.ok ? <CheckCircle2 size={20} className="shrink-0 text-good" /> : <Circle size={20} className="shrink-0 text-line" />}
                  <span className={cx(c.ok && 'text-muted line-through decoration-2')}>{c.label}</span>
                </li>
              ))}
            </ul>
          </div>
          <button type="button" className="card mt-4 flex w-full items-center gap-3 p-4 text-left" onClick={() => navigate('task', m.milestone.id)}>
            <span className="icon-tile h-11 w-11 rotate-[-4deg] bg-sun text-onhl"><Trophy size={22} strokeWidth={2.3} /></span>
            <span className="min-w-0">
              <span className="eyebrow block">Module {m.number} {m.milestone.kind === 'term' ? 'portfolio task' : 'final'}</span>
              <span className="block text-[0.9rem] font-extrabold leading-snug">{m.milestone.title.replace(/^[^:]+:\s*/, '')}</span>
            </span>
          </button>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {lesson.strands.map((sid) => (
              <StrandChip key={sid} id={sid} />
            ))}
          </div>
          <button type="button" className="btn btn-ghost btn-sm mt-3" onClick={() => navigate('glossary')}>
            <BookOpen size={15} /> Full word wall
          </button>
        </aside>
      </div>
    </article>
  );
}
