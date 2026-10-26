import { ArrowLeft, CheckCircle2, Circle, ExternalLink } from 'lucide-react';
import { MODULES, TOOL_BY_ID } from '../data/curriculum';
import { useApp } from '../store/store';
import { navigate } from '../lib/router';
import { milestoneAssessments, suggestedScores, toolBest } from '../lib/progress';
import { kicaOverall, levelFromPercent } from '../lib/grading';
import KicaRubric from '../components/KicaRubric';
import { PageHeader, ScoreBadge, StrandChip } from '../components/ui';
import { formatDate } from '../lib/util';
import { requestReflection } from '../store/ui';

export default function MilestoneView({ id }: { id: string }) {
  const s = useApp();
  const m = MODULES.find((x) => x.milestone.id === id);
  if (!m) return <PageHeader title="Task not found" />;
  const ms = m.milestone;
  const past = milestoneAssessments(s, ms.id);
  const suggested = suggestedScores(s, ms.id);

  return (
    <div>
      <button type="button" className="btn btn-ghost btn-sm mb-3 -ml-2" onClick={() => navigate('course')}>
        <ArrowLeft size={16} /> Learning path
      </button>
      <PageHeader eyebrow={`Module ${m.number} · ${ms.kind === 'term' ? 'Term work (70%)' : 'Final evaluation (30%)'}`} title={ms.title} desc={ms.summary} />
      <div className="mb-6 flex flex-wrap gap-2">
        {m.strands.map((sid) => (
          <StrandChip key={sid} id={sid} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="min-w-0">
          <h2 className="mb-3 text-xl font-semibold">Steps</h2>
          <ol className="card divide-y divide-line overflow-hidden">
            {ms.steps.map((st, i) => {
              const key = st.param ? `${st.tool}:${st.param}` : st.tool;
              const best = st.tool === 'reflections' ? undefined : toolBest(s, key) ?? (st.param ? undefined : toolBest(s, st.tool));
              const reflected = st.tool === 'reflections' && s.reflections.some((r) => m.strands.includes(r.strand));
              const done = best !== undefined || reflected;
              return (
                <li key={i}>
                  <button type="button" className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-sunken" onClick={() => navigate(st.tool, st.param)}>
                    {done ? <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-good" /> : <Circle size={20} className="mt-0.5 shrink-0 text-line" />}
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold">{st.label}</span>
                      <span className="block text-xs text-muted">{TOOL_BY_ID[st.tool]?.name}</span>
                    </span>
                    {best !== undefined && <ScoreBadge score={best} />}
                    <ExternalLink size={16} className="mt-1 shrink-0 text-muted" />
                  </button>
                </li>
              );
            })}
          </ol>
          <button
            type="button"
            className="btn mt-3"
            onClick={() => requestReflection({ strand: m.strands[0], task: ms.title })}
          >
            Log a reflection for this task
          </button>

          {past.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 text-xl font-semibold">Previous self-assessments</h2>
              <ul className="card divide-y divide-line">
                {past.map((a) => {
                  const o = kicaOverall(a.scores, s.settings.weights);
                  return (
                    <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                      <span>
                        <span className="block font-bold">{formatDate(a.at)}</span>
                        <span className="num text-sm text-muted">
                          K {a.scores.K ?? '—'} · T {a.scores.T ?? '—'} · C {a.scores.C ?? '—'} · A {a.scores.A ?? '—'}
                        </span>
                      </span>
                      {o !== null && (
                        <span className="text-right">
                          <ScoreBadge score={o} />
                          <span className="block text-xs text-muted">{levelFromPercent(o).label}</span>
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>

        <section className="min-w-0">
          <h2 className="mb-3 text-xl font-semibold">Assess it on KICA</h2>
          {Object.keys(suggested).length > 0 && (
            <p className="mb-3 text-sm text-muted">Levels are pre-filled from your best practice scores. Adjust them to match the work you will hand in.</p>
          )}
          <KicaRubric title={ms.title} kind={ms.kind} source={ms.id} rubric={ms.rubric} suggested={suggested} />
        </section>
      </div>
    </div>
  );
}
