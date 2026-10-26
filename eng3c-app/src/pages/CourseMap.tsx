import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { BookOpen, Camera, Check, ClipboardList, Clock, Megaphone, Mic, NotebookPen, PenLine, PieChart, Scale, Timer, Trophy, GraduationCap, type LucideIcon } from 'lucide-react';
import { useApp } from '../store/store';
import { navigate } from '../lib/router';
import { MODULES, MODULE_STYLE } from '../data/curriculum';
import { LESSON_BY_ID } from '../data/lessons';
import { milestoneAssessments, moduleProgress, nextLesson } from '../lib/progress';
import { PageHeader, ProgressRing, StrandChip } from '../components/ui';
import { cx } from '../lib/util';
import type { AppState, CourseModule, Lesson, StrandId } from '../types';

const MODULE_ICON: Record<string, LucideIcon> = { ClipboardList, Megaphone, Mic, Camera, Scale };
const STRAND_ICON: Record<StrandId, LucideIcon> = { A: Mic, B: BookOpen, C: PenLine, D: Camera };
/** Zig-zag offsets for the stops along the path, as multiples of one step. */
const ZIG = [0, 1, 2, 1, 0, 1];

function lessonIcon(l: Lesson): LucideIcon {
  if (l.id === '5-4') return Timer;
  return STRAND_ICON[l.strands[0]];
}

export default function CourseMap() {
  const s = useApp();
  const next = nextLesson(s);
  return (
    <div>
      <PageHeader
        eyebrow={`${s.settings.course} · 5 modules · 20 lessons`}
        title="Learning path"
        desc="Follow the trail one stop at a time. Each module ends with a portfolio task for your term mark (70%), and Module 5 builds up to the final evaluation (30%)."
      />

      <div className="mb-9 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {(
          [
            [Clock, '110 hours', 'One credit, split across four strands', 'bg-strandB/15 text-strandB'],
            [PieChart, '70 / 30', 'Term work / final evaluation', 'bg-strandD/15 text-strandD'],
            [GraduationCap, '50% to pass', 'Many colleges look for 60–65%+', 'bg-strandC/15 text-strandC'],
            [NotebookPen, 'Reflect often', 'A3, B4, C4, D4 in every strand', 'bg-strandA/15 text-strandA'],
          ] as const
        ).map(([Icon, t, d, cls]) => (
          <div key={t} className="card flex items-start gap-3 p-3.5">
            <span className={cx('icon-tile h-10 w-10', cls)}>
              <Icon size={20} strokeWidth={2.3} />
            </span>
            <span className="min-w-0">
              <span className="block font-display text-lg font-black leading-tight">{t}</span>
              <span className="block text-[0.8rem] leading-snug text-muted">{d}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="grid gap-12">
        {MODULES.map((m) => (
          <ModulePath key={m.id} m={m} s={s} nextId={next?.id} />
        ))}
      </div>
    </div>
  );
}

function ModulePath({ m, s, nextId }: { m: CourseModule; s: AppState; nextId?: string }) {
  const ms = MODULE_STYLE[m.id];
  const Icon = MODULE_ICON[ms.icon];
  const p = moduleProgress(s, m);
  const assessed = milestoneAssessments(s, m.milestone.id).length > 0;
  const wrap = useRef<HTMLDivElement>(null);
  const nodes = useRef<(HTMLSpanElement | null)[]>([]);
  const [geo, setGeo] = useState<{ w: number; h: number; pts: { x: number; y: number }[] }>({ w: 0, h: 0, pts: [] });

  const stops = [...m.lessonIds.map((id) => ({ kind: 'lesson' as const, id })), { kind: 'task' as const, id: m.milestone.id }];
  const doneAt = (i: number) => (stops[i].kind === 'lesson' ? Boolean(s.lessons[stops[i].id]) : assessed);

  const measure = useCallback(() => {
    const box = wrap.current;
    if (!box) return;
    const br = box.getBoundingClientRect();
    const pts = nodes.current.filter(Boolean).map((el) => {
      const r = el!.getBoundingClientRect();
      return { x: r.left + r.width / 2 - br.left, y: r.top + r.height / 2 - br.top };
    });
    setGeo({ w: br.width, h: br.height, pts });
  }, []);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (wrap.current) ro.observe(wrap.current);
    return () => ro.disconnect();
  }, [measure, s.lessons]);

  const seg = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const my = (a.y + b.y) / 2;
    return `M${a.x},${a.y} C${a.x},${my} ${b.x},${my} ${b.x},${b.y}`;
  };

  return (
    <section aria-labelledby={`mod-${m.id}`}>
      <header className={cx('relative overflow-hidden rounded-3xl p-5 text-surface shadow-[0_4px_0_rgb(var(--shadow)/0.15)] sm:p-6', ms.bg)}>
        <span className="pointer-events-none absolute -right-6 -top-8 h-36 w-36 rounded-full bg-surface/10" aria-hidden />
        <span className="pointer-events-none absolute -bottom-10 right-16 h-24 w-24 rounded-full bg-surface/10" aria-hidden />
        <div className="relative flex flex-wrap items-center gap-4">
          <span className="icon-tile h-14 w-14 rotate-[-6deg] bg-surface/25">
            <Icon size={30} strokeWidth={2.3} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-black uppercase tracking-[0.1em] opacity-90">Module {m.number}</div>
            <h2 id={`mod-${m.id}`} className="font-display text-2xl font-black leading-tight sm:text-[1.7rem]">{m.title}</h2>
            <p className="mt-1 max-w-2xl text-[0.95rem] font-semibold opacity-90">{m.focus}</p>
          </div>
          <ProgressRing value={p.done} max={p.total} size={64} stroke={8} className="stroke-surface" label={`${p.done} of ${p.total} lessons`}>
            <span className="num text-sm font-black">{p.done}/{p.total}</span>
          </ProgressRing>
        </div>
      </header>

      <div ref={wrap} className="relative mt-5">
        <svg className="pointer-events-none absolute inset-0" width={geo.w} height={geo.h} aria-hidden>
          {geo.pts.slice(1).map((b, i) => {
            const a = geo.pts[i];
            const on = doneAt(i);
            return (
              <g key={i}>
                <path d={seg(a, b)} fill="none" strokeWidth={6} strokeLinecap="round" strokeDasharray="0.1 13" className="stroke-line" />
                {on && <path d={seg(a, b)} fill="none" strokeWidth={6} strokeLinecap="round" className={ms.stroke} strokeOpacity={0.55} />}
              </g>
            );
          })}
        </svg>
        <ol className="relative grid gap-4">
          {stops.map((stop, i) => {
            const step = `calc(${ZIG[i % ZIG.length]} * clamp(12px, 6.5vw, 68px))`;
            if (stop.kind === 'task') {
              return (
                <li key={stop.id} style={{ paddingLeft: step }}>
                  <button type="button" onClick={() => navigate('task', m.milestone.id)} className="group flex w-full max-w-xl items-center gap-4 text-left">
                    <span
                      ref={(el) => (nodes.current[i] = el)}
                      className={cx(
                        'grid h-[70px] w-[70px] shrink-0 rotate-[-4deg] place-items-center rounded-2xl transition-transform group-hover:scale-105',
                        assessed ? 'bg-sun text-onhl shadow-[0_4px_0_rgb(var(--shadow)/0.2)]' : 'border-[3px] border-dashed border-sun bg-surface text-sun',
                      )}
                    >
                      <Trophy size={32} strokeWidth={2.3} />
                    </span>
                    <span className={cx('card min-w-0 flex-1 px-4 py-3', assessed && '!border-sun/60')}>
                      <span className="eyebrow block">{m.milestone.kind === 'term' ? 'Portfolio task · term 70%' : 'Final evaluation · 30%'}</span>
                      <span className="block font-extrabold leading-snug">{m.milestone.title.replace(/^[^:]+:\s*/, '')}</span>
                      <span className={cx('mt-0.5 block text-[0.82rem] font-bold', assessed ? 'text-good' : 'text-muted')}>{assessed ? 'Self-assessed ✓' : 'Not assessed yet'}</span>
                    </span>
                  </button>
                </li>
              );
            }
            const l = LESSON_BY_ID[stop.id];
            const done = s.lessons[l.id];
            const current = l.id === nextId;
            const LIcon = lessonIcon(l);
            return (
              <li key={l.id} style={{ paddingLeft: step }}>
                <button type="button" onClick={() => navigate('lesson', l.id)} className="group flex w-full max-w-xl items-center gap-4 text-left">
                  <span className="relative shrink-0">
                    {current && (
                      <span className={cx('bob absolute -top-9 left-1/2 z-10 whitespace-nowrap rounded-xl px-2.5 py-1 text-[0.72rem] font-black uppercase tracking-wide text-surface shadow-lift', ms.bg)}>
                        Start here
                        <span className={cx('absolute -bottom-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45', ms.bg)} aria-hidden />
                      </span>
                    )}
                    <span
                      ref={(el) => (nodes.current[i] = el)}
                      className={cx(
                        'grid h-[70px] w-[70px] place-items-center rounded-full transition-transform group-hover:scale-105',
                        done && cx(ms.bg, 'text-surface shadow-[0_4px_0_rgb(var(--shadow)/0.2)]'),
                        current && cx('pulse-ring border-[4px] bg-surface shadow-[0_4px_0_rgb(var(--line))]', ms.border, ms.text),
                        !done && !current && 'border-[3px] border-line bg-surface text-muted shadow-[0_3px_0_rgb(var(--line))]',
                      )}
                    >
                      {done ? <Check size={32} strokeWidth={3.2} /> : <LIcon size={28} strokeWidth={2.3} />}
                    </span>
                  </span>
                  <span className={cx('card min-w-0 flex-1 px-4 py-3 transition-colors', current && cx('ring-2 ring-offset-0', ms.ring))}>
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span className={cx('text-xs font-black uppercase tracking-[0.08em]', done || current ? ms.text : 'text-muted')}>Lesson {m.number}.{l.number}</span>
                      {l.strands.map((id) => (
                        <StrandChip key={id} id={id} withName={false} small />
                      ))}
                    </span>
                    <span className="block font-extrabold leading-snug">{l.title}</span>
                    <span className="block text-[0.8rem] text-muted">
                      {l.minutes} min
                      {l.tvo && ` · TVO ${l.tvo}`}
                      {done && ` · exit ticket ${done.quizScore}/${done.quizTotal}`}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
