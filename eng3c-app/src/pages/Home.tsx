import { ArrowRight, CheckCircle2, Circle, NotebookPen } from 'lucide-react';
import { useApp } from '../store/store';
import { navigate } from '../lib/router';
import { MODULES, STRANDS, STRAND_STYLE, TOOLS } from '../data/curriculum';
import { LESSON_BY_ID, LESSONS } from '../data/lessons';
import { lessonsDone, milestoneAssessments, moduleProgress, nextLesson, reflectionCounts } from '../lib/progress';
import { summarize, levelFromPercent } from '../lib/grading';
import { ProgressBar, Stat, StrandChip } from '../components/ui';
import { cx, formatDate } from '../lib/util';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export default function Home() {
  const s = useApp();
  const next = nextLesson(s);
  const done = lessonsDone(s);
  const g = summarize(s.assessments, s.settings.weights, s.settings.finalSplit, s.settings.termMethod, s.settings.target);
  const counts = reflectionCounts(s);
  const nextModule = next ? MODULES.find((m) => m.id === next.moduleId)! : null;
  const quickTools = TOOLS.filter((t) => ['reader', 'ppe', 'linter', 'speech', 'hotspot', 'drills'].includes(t.id));

  const activity = [
    ...Object.entries(s.lessons).map(([id, p]) => ({ at: p.at, text: `Finished lesson: ${LESSON_BY_ID[id]?.title ?? id}` })),
    ...s.reflections.map((r) => ({ at: r.at, text: `Reflected (${r.strand}): ${r.task}` })),
    ...s.assessments.map((a) => ({ at: a.at, text: `Self-assessed: ${a.title}` })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 5);

  return (
    <div>
      <header className="mb-6">
        <div className="eyebrow">{s.settings.course} · {new Date().toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
        <h1 className="mt-1 text-[1.9rem] font-semibold sm:text-4xl">
          {greeting()}
          {s.settings.name ? `, ${s.settings.name}` : ''}.
        </h1>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <section className="card relative overflow-hidden p-5 sm:p-6">
          {next && nextModule ? (
            <>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="eyebrow">Up next · Module {nextModule.number}, lesson {next.number}</span>
                {next.strands.map((id) => (
                  <StrandChip key={id} id={id} small />
                ))}
              </div>
              <h2 className="text-2xl font-semibold sm:text-3xl">{next.title}</h2>
              <p className="mt-2 max-w-xl text-muted">{next.hook}</p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button type="button" className="btn btn-primary" onClick={() => navigate('lesson', next.id)}>
                  Start lesson <ArrowRight size={18} />
                </button>
                <span className="text-sm text-muted">About {next.minutes} min · {next.expectations.join(', ')}</span>
              </div>
            </>
          ) : (
            <>
              <span className="eyebrow">All 20 lessons complete</span>
              <h2 className="mt-1 text-2xl font-semibold">Time for the final evaluation.</h2>
              <p className="mt-2 text-muted">Sit the timed mock exam, then self-assess your compare-and-contrast essay.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button type="button" className="btn btn-primary" onClick={() => navigate('exam')}>Start mock exam</button>
                <button type="button" className="btn" onClick={() => navigate('task', 'final')}>Final evaluation</button>
              </div>
            </>
          )}
          <div className="mt-6 border-t border-line pt-4">
            <div className="mb-2 flex items-baseline justify-between text-sm">
              <span className="font-bold">Course progress</span>
              <span className="num text-muted">{done} of {LESSONS.length} lessons</span>
            </div>
            <ProgressBar value={done} max={LESSONS.length} tone="pen" label="Course progress" />
          </div>
        </section>

        <section className="card p-5 sm:p-6">
          <div className="mb-4 flex items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold">Grade snapshot</h2>
            <button type="button" className="text-sm font-bold text-strandB hover:underline" onClick={() => navigate('grades')}>Gradebook</button>
          </div>
          {g.current === null ? (
            <p className="text-muted">
              No marks yet. Finish a portfolio task and self-assess it on the four KICA categories, or add marks from your real course.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Stat label="Current" value={`${Math.round(g.current)}%`} sub={levelFromPercent(g.current).label} tone={g.current >= s.settings.target ? 'good' : g.current >= 50 ? 'warn' : 'bad'} />
              <Stat label="Term work" value={g.term === null ? '—' : `${Math.round(g.term)}%`} sub="70% of final" />
              <div className="col-span-2 text-sm text-muted">
                {g.neededForTarget !== null
                  ? g.neededForTarget > 100
                    ? `Reaching ${s.settings.target}% would need over 100% on what is left. Raise your term work first.`
                    : `You need ${Math.max(0, Math.round(g.neededForTarget))}% on the remaining work to finish at ${s.settings.target}%.`
                  : `Final mark ${Math.round(g.current)}%.`}
              </div>
            </div>
          )}
          <div className="mt-5 border-t border-line pt-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-sm font-bold">Reflections by strand</span>
              <button type="button" className="text-sm font-bold text-strandB hover:underline" onClick={() => navigate('reflections')}>Log</button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {STRANDS.map((st) => (
                <div key={st.id} className={cx('rounded-lg px-2 py-2 text-center', STRAND_STYLE[st.id].soft)}>
                  <div className={cx('text-xs font-bold', STRAND_STYLE[st.id].text)}>{st.reflection}</div>
                  <div className="num font-display text-xl font-semibold">{counts[st.id]}</div>
                </div>
              ))}
            </div>
            {STRANDS.some((st) => counts[st.id] === 0) && (
              <p className="mt-2 flex items-start gap-1.5 text-[0.85rem] text-muted">
                <NotebookPen size={15} className="mt-0.5 shrink-0" />
                Every strand has a reflection expectation. Students often lose easy marks by skipping them.
              </p>
            )}
          </div>
        </section>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-semibold">Modules</h2>
        <div className="card divide-y divide-line overflow-hidden">
          {MODULES.map((m) => {
            const p = moduleProgress(s, m);
            const assessed = milestoneAssessments(s, m.milestone.id).length > 0;
            return (
              <button key={m.id} type="button" onClick={() => navigate('course')} className="grid w-full grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 px-4 py-3 text-left hover:bg-sunken sm:grid-cols-[auto_1fr_180px_auto]">
                <span className="num grid h-9 w-9 place-items-center rounded-lg bg-sunken font-display text-lg font-semibold">{m.number}</span>
                <span className="min-w-0">
                  <span className="block font-bold">{m.title}</span>
                  <span className="flex flex-wrap gap-1 pt-0.5">
                    {m.strands.map((id) => (
                      <StrandChip key={id} id={id} withName={false} small />
                    ))}
                  </span>
                </span>
                <span className="col-span-2 sm:col-span-1">
                  <ProgressBar value={p.done} max={p.total} tone={m.strands[0]} label={`${m.title} progress`} />
                  <span className="num mt-1 block text-xs text-muted">{p.done}/{p.total} lessons</span>
                </span>
                <span className="col-span-2 flex items-center gap-1.5 text-sm sm:col-span-1">
                  {assessed ? <CheckCircle2 size={16} className="text-good" /> : <Circle size={16} className="text-muted" />}
                  <span className={assessed ? 'text-good' : 'text-muted'}>{m.milestone.kind === 'term' ? 'Portfolio task' : 'Final'}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <h2 className="mb-3 text-xl font-semibold">Jump into a tool</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {quickTools.map((t) => (
              <button key={t.id} type="button" onClick={() => navigate(t.id)} className="card flex items-start gap-3 p-4 text-left transition-colors hover:border-ink/30">
                {t.strand !== 'all' && <StrandChip id={t.strand} withName={false} small />}
                <span className="min-w-0">
                  <span className="block font-bold">{t.name}</span>
                  <span className="block text-sm text-muted">{t.blurb}</span>
                </span>
              </button>
            ))}
          </div>
        </section>
        <section>
          <h2 className="mb-3 text-xl font-semibold">Recent activity</h2>
          <div className="card p-4">
            {activity.length === 0 ? (
              <p className="text-muted">Your finished lessons, reflections, and self-assessments will show up here.</p>
            ) : (
              <ul className="grid gap-3">
                {activity.map((a, i) => (
                  <li key={i} className="text-[0.93rem]">
                    <span className="block">{a.text}</span>
                    <span className="text-xs text-muted">{formatDate(a.at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
