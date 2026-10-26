import { CheckCircle2, Circle, Flag } from 'lucide-react';
import { useApp } from '../store/store';
import { navigate } from '../lib/router';
import { MODULES } from '../data/curriculum';
import { LESSON_BY_ID } from '../data/lessons';
import { milestoneAssessments, moduleProgress } from '../lib/progress';
import { PageHeader, ProgressBar, StrandChip } from '../components/ui';
import { cx } from '../lib/util';

export default function CourseMap() {
  const s = useApp();
  return (
    <div>
      <PageHeader
        eyebrow={`${s.settings.course} · 5 modules · 20 lessons`}
        title="Course map"
        desc="Each module ends with a portfolio task that counts toward your 70% term work. Module 5 builds up to the 30% final evaluation."
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['110 hours', 'One credit, split evenly across the four strands.'],
          ['70 / 30', '70% term work, 30% final evaluation (culminating task + exam).'],
          ['50% to pass', 'The credit needs 50%. Many college programs ask for 60–65% in Grade 11/12 College English.'],
          ['Reflect every strand', 'A3, B4, C4, and D4 ask you to evaluate your own strategies.'],
        ].map(([t, d]) => (
          <div key={t} className="card p-4">
            <div className="font-display text-xl font-semibold">{t}</div>
            <div className="text-sm text-muted">{d}</div>
          </div>
        ))}
      </div>

      <ol className="grid gap-6">
        {MODULES.map((m) => {
          const p = moduleProgress(s, m);
          const assessed = milestoneAssessments(s, m.milestone.id).length > 0;
          return (
            <li key={m.id} className="card overflow-hidden">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line px-5 py-4">
                <div className="min-w-0 max-w-2xl">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="eyebrow">Module {m.number}</span>
                    {m.strands.map((id) => (
                      <StrandChip key={id} id={id} small />
                    ))}
                  </div>
                  <h2 className="text-2xl font-semibold">{m.title}</h2>
                  <p className="mt-1 text-muted">{m.focus}</p>
                </div>
                <div className="w-full sm:w-48">
                  <ProgressBar value={p.done} max={p.total} tone={m.strands[0]} label={`${m.title} progress`} />
                  <div className="num mt-1 text-right text-xs text-muted">{p.done}/{p.total} lessons</div>
                </div>
              </div>
              <ul className="divide-y divide-line">
                {m.lessonIds.map((id) => {
                  const l = LESSON_BY_ID[id];
                  const done = s.lessons[id];
                  return (
                    <li key={id}>
                      <button type="button" onClick={() => navigate('lesson', id)} className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-sunken">
                        {done ? <CheckCircle2 size={20} className="shrink-0 text-good" aria-label="Done" /> : <Circle size={20} className="shrink-0 text-line" aria-label="Not done" />}
                        <span className="num w-8 shrink-0 font-bold text-muted">{m.number}.{l.number}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-bold">{l.title}</span>
                          <span className="block text-xs text-muted">
                            {l.expectations.join(' · ')}
                            {l.tvo && ` · TVO ${l.tvo}`} · {l.minutes} min
                            {done && ` · quiz ${done.quizScore}/${done.quizTotal}`}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
                <li>
                  <button type="button" onClick={() => navigate('task', m.milestone.id)} className={cx('flex w-full items-center gap-3 px-5 py-3.5 text-left', assessed ? 'bg-good/5 hover:bg-good/10' : 'bg-pen/5 hover:bg-pen/10')}>
                    <Flag size={20} className={cx('shrink-0', assessed ? 'text-good' : 'text-pen')} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold">{m.milestone.title}</span>
                      <span className="block text-xs text-muted">{m.milestone.kind === 'term' ? 'Term work (70%)' : 'Final evaluation (30%)'} · {assessed ? 'Self-assessed' : 'Not yet assessed'}</span>
                    </span>
                  </button>
                </li>
              </ul>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
