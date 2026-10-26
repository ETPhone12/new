import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { addAssessment, deleteAssessment, updateSettings, useApp } from '../store/store';
import { KICA, KICA_IDS, kicaOverall, levelCode, levelFromPercent, summarize } from '../lib/grading';
import { ConfirmButton, PageHeader, ProgressBar, Segmented, Stat } from '../components/ui';
import { cx, formatDate } from '../lib/util';
import { toast } from '../store/ui';
import type { AssessmentKind, KicaCat, TermMethod } from '../types';

const KIND_LABEL: Record<AssessmentKind, string> = { term: 'Term work', culminating: 'Culminating', exam: 'Final exam' };

export default function Gradebook() {
  const s = useApp();
  const st = s.settings;
  const g = summarize(s.assessments, st.weights, st.finalSplit, st.termMethod, st.target);
  const weightSum = KICA_IDS.reduce((a, k) => a + (st.weights[k] || 0), 0);
  const cats = KICA_IDS.map((k) => ({ k, v: g.categoryAverages[k] })).filter((x) => x.v !== null) as { k: KicaCat; v: number }[];
  const weakest = cats.length ? cats.reduce((a, b) => (b.v < a.v ? b : a)) : null;
  const termWeight = 100 - st.finalSplit.culminating - st.finalSplit.exam;

  return (
    <div>
      <PageHeader
        eyebrow="Growing Success · 70% term / 30% final"
        title="KICA Gradebook"
        desc="Every task is marked on Knowledge, Thinking, Communication, and Application. Add your self-assessments or your real marks to project your final grade."
      />

      <div className="card mb-6 grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Current grade" value={g.current === null ? '—' : `${Math.round(g.current)}%`} sub={g.current === null ? 'No marks yet' : `${levelFromPercent(g.current).label}`} tone={g.current === null ? undefined : g.current >= st.target ? 'good' : g.current >= 50 ? 'warn' : 'bad'} />
        <Stat label={`Term work (${termWeight}%)`} value={g.term === null ? '—' : `${Math.round(g.term)}%`} sub={st.termMethod === 'recent' ? 'Recent work weighted more' : st.termMethod === 'median' ? 'Most consistent level' : 'Plain average'} />
        <Stat label={`Culminating (${st.finalSplit.culminating}%)`} value={g.culminating === null ? '—' : `${Math.round(g.culminating)}%`} sub="Project or essay package" />
        <Stat label={`Final exam (${st.finalSplit.exam}%)`} value={g.exam === null ? '—' : `${Math.round(g.exam)}%`} sub="Use the mock exam to practise" />
        <div className="sm:col-span-2 lg:col-span-4">
          <div className="mb-1 flex flex-wrap justify-between gap-2 text-sm">
            <span className="font-bold">Marks recorded for {Math.round(g.coverage)}% of the final grade</span>
            <span className="text-muted">
              Target {st.target}%
              {g.neededForTarget !== null &&
                (g.neededForTarget > 100
                  ? ' · not reachable on the remaining work alone'
                  : g.current !== null
                    ? ` · need ${Math.max(0, Math.round(g.neededForTarget))}% on the rest`
                    : '')}
            </span>
          </div>
          <ProgressBar value={g.coverage} tone="ink" label="Share of final grade with marks" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="grid min-w-0 content-start gap-6">
          <section className="card p-5">
            <h2 className="mb-3 text-lg font-semibold">KICA profile</h2>
            <div className="grid gap-3">
              {KICA.map((k) => {
                const v = g.categoryAverages[k.id];
                return (
                  <div key={k.id}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-bold">{k.name} <span className="font-normal text-muted">· weight {st.weights[k.id]}%</span></span>
                      <span className="num font-bold">{v === null ? '—' : `${Math.round(v)}% · ${levelCode(v)}`}</span>
                    </div>
                    <ProgressBar value={v ?? 0} tone={v === null ? 'ink' : v >= 70 ? 'good' : v >= 60 ? 'warn' : 'bad'} label={k.name} />
                  </div>
                );
              })}
            </div>
            {weakest && (
              <p className="mt-4 rounded-lg bg-sunken p-3 text-sm">
                <strong>Focus next: {KICA.find((k) => k.id === weakest.k)!.name}.</strong> <span className="text-muted">{KICA.find((k) => k.id === weakest.k)!.looksFor}</span>
              </p>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">Assessments</h2>
            {s.assessments.length === 0 ? (
              <div className="card p-5 text-sm text-muted">Nothing yet. Self-assess a portfolio task from the course map, or add a mark from your real course below.</div>
            ) : (
              <ul className="card divide-y divide-line">
                {s.assessments
                  .slice()
                  .reverse()
                  .map((a) => {
                    const o = kicaOverall(a.scores, st.weights);
                    return (
                      <li key={a.id} className="grid gap-2 px-4 py-3 sm:grid-cols-[1fr_auto]">
                        <div className="min-w-0">
                          <div className="font-bold">{a.title}</div>
                          <div className="text-xs text-muted">
                            {formatDate(a.at)} · {KIND_LABEL[a.kind]}
                            {a.note && ` · ${a.note}`}
                          </div>
                          <div className="num mt-1 flex flex-wrap gap-1.5 text-xs">
                            {KICA_IDS.map((k) => (
                              <span key={k} className="chip font-normal">
                                {k} {a.scores[k] ?? '—'}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                          {o !== null && <span className="num font-display text-2xl font-semibold">{Math.round(o)}%</span>}
                          <ConfirmButton label={<Trash2 size={14} />} confirmLabel="Delete?" className="btn-ghost btn-sm" onConfirm={() => deleteAssessment(a.id)} />
                        </div>
                      </li>
                    );
                  })}
              </ul>
            )}
          </section>
        </div>

        <div className="grid min-w-0 content-start gap-6">
          <AddMark />
          <section className="card p-5">
            <h2 className="mb-3 text-lg font-semibold">Match your teacher’s setup</h2>
            <div className="label">KICA weights (sum {weightSum}%)</div>
            <div className="grid grid-cols-4 gap-2">
              {KICA_IDS.map((k) => (
                <div key={k}>
                  <label htmlFor={`w-${k}`} className="block text-center text-xs font-bold">{k}</label>
                  <input
                    id={`w-${k}`}
                    type="number"
                    min={0}
                    max={100}
                    inputMode="numeric"
                    className={cx('input text-center', weightSum !== 100 && 'border-warn')}
                    value={st.weights[k]}
                    onChange={(e) => updateSettings({ weights: { ...st.weights, [k]: Number(e.target.value) || 0 } })}
                  />
                </div>
              ))}
            </div>
            {weightSum !== 100 && <p className="mt-1 text-xs text-warn">Weights add to {weightSum}%. They are rescaled automatically, but 100 is easier to read.</p>}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="w-cul" className="label">Culminating %</label>
                <input id="w-cul" type="number" min={0} max={30} className="input" value={st.finalSplit.culminating} onChange={(e) => updateSettings({ finalSplit: { ...st.finalSplit, culminating: Math.max(0, Math.min(30, Number(e.target.value) || 0)) } })} />
              </div>
              <div>
                <label htmlFor="w-exam" className="label">Exam %</label>
                <input id="w-exam" type="number" min={0} max={30} className="input" value={st.finalSplit.exam} onChange={(e) => updateSettings({ finalSplit: { ...st.finalSplit, exam: Math.max(0, Math.min(30, Number(e.target.value) || 0)) } })} />
              </div>
            </div>
            <p className="mt-1 text-xs text-muted">Some schools use 15% + 15%; others use one 25–30% proctored exam (set culminating to 0).</p>
            <div className="mt-4">
              <div className="label">How term work is combined</div>
              <Segmented<TermMethod>
                label="Term method"
                value={st.termMethod}
                onChange={(v) => updateSettings({ termMethod: v })}
                options={[
                  { value: 'recent', label: 'Recent weighted' },
                  { value: 'median', label: 'Most consistent' },
                  { value: 'average', label: 'Average' },
                ]}
              />
              <p className="mt-1 text-xs text-muted">Growing Success asks teachers to weigh the most consistent level of achievement, with special attention to more recent work.</p>
            </div>
            <div className="mt-4">
              <label htmlFor="target" className="label">Target grade</label>
              <input id="target" type="number" min={50} max={100} className="input w-28" value={st.target} onChange={(e) => updateSettings({ target: Math.max(50, Math.min(100, Number(e.target.value) || 50)) })} />
              <p className="mt-1 text-xs text-muted">The credit needs 50%. Many college programs look for 60–65% or higher in Grade 11/12 College English.</p>
            </div>
          </section>
          <section className="card p-5">
            <h2 className="mb-2 text-lg font-semibold">Achievement levels</h2>
            <table className="w-full text-sm">
              <tbody>
                {[
                  ['Level 4', '80–100%', 'High degree of effectiveness'],
                  ['Level 3', '70–79%', 'Considerable effectiveness (provincial standard)'],
                  ['Level 2', '60–69%', 'Some effectiveness'],
                  ['Level 1', '50–59%', 'Limited effectiveness'],
                  ['R', 'Below 50%', 'Not yet; credit at risk'],
                ].map(([l, r, d]) => (
                  <tr key={l} className="border-t border-line">
                    <td className="py-1.5 pr-2 font-bold">{l}</td>
                    <td className="num py-1.5 pr-2">{r}</td>
                    <td className="py-1.5 text-muted">{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </div>
  );
}

function AddMark() {
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<AssessmentKind>('term');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [split, setSplit] = useState(true);
  const [single, setSingle] = useState('');
  const [scores, setScores] = useState<Record<KicaCat, string>>({ K: '', T: '', C: '', A: '' });

  const parsed: Partial<Record<KicaCat, number>> = {};
  if (split) {
    KICA_IDS.forEach((k) => {
      const v = Number(scores[k]);
      if (scores[k] !== '' && Number.isFinite(v)) parsed[k] = Math.max(0, Math.min(100, v));
    });
  } else if (single !== '' && Number.isFinite(Number(single))) {
    KICA_IDS.forEach((k) => (parsed[k] = Math.max(0, Math.min(100, Number(single)))));
  }
  const ok = title.trim() && Object.keys(parsed).length > 0;

  const add = () => {
    addAssessment({ title: title.trim(), kind, source: 'manual', scores: parsed, at: new Date(date + 'T12:00:00').toISOString() });
    toast('Mark added');
    setTitle('');
    setSingle('');
    setScores({ K: '', T: '', C: '', A: '' });
  };

  return (
    <section className="card p-5">
      <h2 className="mb-3 text-lg font-semibold">Add a mark</h2>
      <div className="grid gap-3">
        <div>
          <label htmlFor="am-title" className="label">Task</label>
          <input id="am-title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Unit 1 opinion paragraph" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="am-kind" className="label">Counts as</label>
            <select id="am-kind" className="input" value={kind} onChange={(e) => setKind(e.target.value as AssessmentKind)}>
              <option value="term">Term work</option>
              <option value="culminating">Culminating</option>
              <option value="exam">Final exam</option>
            </select>
          </div>
          <div>
            <label htmlFor="am-date" className="label">Date</label>
            <input id="am-date" type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
        <Segmented label="Mark format" value={split ? 'kica' : 'single'} onChange={(v) => setSplit(v === 'kica')} options={[{ value: 'kica', label: 'K / T / C / A' }, { value: 'single', label: 'One overall %' }]} />
        {split ? (
          <div className="grid grid-cols-4 gap-2">
            {KICA_IDS.map((k) => (
              <div key={k}>
                <label htmlFor={`am-${k}`} className="block text-center text-xs font-bold">{k} %</label>
                <input id={`am-${k}`} type="number" inputMode="decimal" min={0} max={100} className="input text-center" value={scores[k]} onChange={(e) => setScores((s) => ({ ...s, [k]: e.target.value }))} />
              </div>
            ))}
          </div>
        ) : (
          <div>
            <label htmlFor="am-single" className="label">Overall %</label>
            <input id="am-single" type="number" inputMode="decimal" min={0} max={100} className="input w-32" value={single} onChange={(e) => setSingle(e.target.value)} />
          </div>
        )}
        <button type="button" className="btn btn-primary justify-self-start" disabled={!ok} onClick={add}>
          <Plus size={16} /> Add mark
        </button>
      </div>
    </section>
  );
}
