import { useState } from 'react';
import type { QuizQuestion } from '../types';
import { FloorPlan, ScreenTimeChart, ShirtDonut } from '../components/Graphics';
import { McQuestion } from '../components/Quiz';
import { Callout, PageHeader, ScoreBadge, Segmented } from '../components/ui';
import { recordToolRun, useDraft } from '../store/store';
import { requestReflection, toast } from '../store/ui';
import { cx } from '../lib/util';

const GRAPHICS: { id: string; title: string; kind: string; questions: QuizQuestion[] }[] = [
  {
    id: 'chart',
    title: 'Screen time by grade',
    kind: 'Bar graph',
    questions: [
      { q: 'How much more daily screen time do Grade 12 students report than Grade 9 students?', options: ['About 0.4 hours', 'About 1.2 hours', 'About three times as much', 'About 5.8 hours'], answer: 1, why: '5.8 − 4.6 = 1.2 hours.' },
      { q: 'Why does the Grade 12 bar look about three times taller than the Grade 9 bar?', options: ['Grade 12s use screens three times more', 'The y-axis starts at 4, not 0', 'The bar is a different colour', 'The chart has no title'], answer: 1, why: 'Truncating the axis cuts off the shared 4 hours, exaggerating the gap. Toggle "Start axis at 0" to see it.' },
      { q: 'Is the headline justified by the data?', options: ['Yes, screen time explodes', 'Partly: there is a steady rise of about 26%, but "explodes" exaggerates it', 'No: screen time falls', 'There is no way to tell'], answer: 1, why: '5.8 ÷ 4.6 ≈ 1.26: a real but moderate increase.' },
      { q: 'What does "n = 400" in the source line mean?', options: ['400 hours were measured', '400 students answered the survey', 'The survey was in 2004', 'It is the page number'], answer: 1, why: '"n" is the sample size.' },
    ],
  },
  {
    id: 'plan',
    title: 'Evacuation floor plan',
    kind: 'Schematic / floor plan',
    questions: [
      { q: 'From "You are here," which exit is closest?', options: ['Exit A (west)', 'Exit B (east)', 'The stairwell', 'The library'], answer: 0, why: 'Room 105’s door is 120 px from Exit A and 180 px from Exit B.' },
      { q: 'What does the red square marked "A" stand for?', options: ['Exit A', 'Fire alarm pull station', 'Assembly point', 'Administration'], answer: 1, why: 'Check the legend: red square = fire alarm pull.' },
      { q: 'Using the scale bar, about how far is it from Room 105’s door to Exit A?', options: ['About 5 m', 'About 20 m', 'About 50 m', 'About 100 m'], answer: 1, why: 'The 10 m bar is 60 px, so 6 px = 1 m. 120 px ÷ 6 = 20 m.' },
      { q: 'In which direction is the Science Lab from Room 105?', options: ['Northeast', 'Southwest', 'Due east', 'North'], answer: 1, why: 'North is up. The lab is below (south) and to the left (west).' },
      { q: 'After leaving the building, where should you go?', options: ['The library', 'The north soccer field', 'The parking lot', 'Back to class'], answer: 1, why: 'The dashed green arrow leads to the assembly point.' },
    ],
  },
  {
    id: 'donut',
    title: 'Where your $7 goes',
    kind: 'Infographic',
    questions: [
      { q: 'Which group receives the smallest share?', options: ['Retailer', 'Brand', 'Worker wages', 'Transport & taxes'], answer: 2, why: '1% is the smallest slice.' },
      { q: 'Roughly how much of the $7 goes to the retailer?', options: ['$0.07', '$1.00', '$4.13', '$7.00'], answer: 2, why: '59% × $7 ≈ $4.13.' },
      { q: 'What is the purpose of the "Only 1¢ of every dollar" callout?', options: ['To list the materials', 'To pull the most shocking number out so readers cannot miss it', 'To show the source', 'To explain the colours'], answer: 1, why: 'Callouts emphasize one point. Here it adds an emotional punch (pathos).' },
      { q: 'Why should a careful reader hesitate before sharing this graphic?', options: ['It uses a donut chart', 'It labels itself an estimate and gives no source', 'It is in colour', 'The numbers add to 100%'], answer: 1, why: 'No source means no way to check the numbers, however persuasive they look.' },
    ],
  },
];

const DECODE = ['Title and subtitle', 'Source and date', 'Legend / key', 'Axis labels, units, scale', 'Biggest, smallest, trend', 'Does the takeaway match?'];

interface Draft {
  answers: Record<string, Record<number, number>>;
  decode: Record<string, boolean[]>;
}

export default function GraphicLab() {
  const [gid, setGid] = useState('chart');
  const [fullAxis, setFullAxis] = useState(false);
  const [d, setD] = useDraft<Draft>('graphic', { answers: {}, decode: {} });
  const g = GRAPHICS.find((x) => x.id === gid)!;
  const answers = d.answers[gid] ?? {};
  const decode = d.decode[gid] ?? DECODE.map(() => false);
  const done = Object.keys(answers).length === g.questions.length;
  const score = g.questions.reduce((a, q, i) => a + (answers[i] === q.answer ? 1 : 0), 0);

  const choose = (i: number, c: number) => {
    const next = { ...answers, [i]: c };
    setD((prev) => ({ ...prev, answers: { ...prev.answers, [gid]: next } }));
    if (Object.keys(next).length === g.questions.length) {
      const s = g.questions.reduce((a, q, k) => a + (next[k] === q.answer ? 1 : 0), 0);
      recordToolRun(`graphic:${gid}`, Math.round((s / g.questions.length) * 100));
      toast(`${s}/${g.questions.length} on the ${g.kind.toLowerCase()}`);
    }
  };

  return (
    <div>
      <PageHeader
        strand="B"
        eyebrow="B1 · B2 · B3 Graphic and informational texts"
        title="Graphic Text Lab"
        desc="Read each graphic in order: title, source, legend, axes, data, takeaway. Then answer the questions."
      />
      <div className="mb-5">
        <Segmented label="Graphic" value={gid} onChange={setGid} options={GRAPHICS.map((x) => ({ value: x.id, label: x.kind.split(' /')[0] }))} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <div className="card p-3 sm:p-5">
            <div className="overflow-x-auto">
              <div className="min-w-[320px]">{gid === 'chart' ? <ScreenTimeChart fullAxis={fullAxis} /> : gid === 'plan' ? <FloorPlan /> : <ShirtDonut />}</div>
            </div>
            {gid === 'chart' && (
              <label className="mt-3 flex items-center gap-2 text-sm font-bold">
                <input type="checkbox" checked={fullAxis} onChange={(e) => setFullAxis(e.target.checked)} className="h-5 w-5 accent-current" id="full-axis" />
                Start axis at 0 (the honest version)
              </label>
            )}
          </div>
          <div className="card mt-4 p-4">
            <h3 className="mb-2 font-semibold">Decode checklist</h3>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {DECODE.map((label, i) => (
                <label key={label} className="flex items-center gap-2 text-[0.93rem]">
                  <input
                    type="checkbox"
                    id={`decode-${gid}-${i}`}
                    className="h-5 w-5"
                    checked={decode[i]}
                    onChange={(e) => {
                      const next = decode.slice();
                      next[i] = e.target.checked;
                      setD((prev) => ({ ...prev, decode: { ...prev.decode, [gid]: next } }));
                    }}
                  />
                  <span className={cx(decode[i] && 'text-muted line-through')}>{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="card grid content-start gap-6 p-4 sm:p-5">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-lg font-semibold">{g.title}</h3>
            {done && <ScoreBadge score={(score / g.questions.length) * 100} />}
          </div>
          {g.questions.map((q, i) => (
            <McQuestion key={`${gid}-${i}`} q={q} index={i} chosen={answers[i]} onChoose={(c) => choose(i, c)} />
          ))}
          {done && (
            <Callout tone="good" title="Graphic decoded">
              <div className="mt-1 flex flex-wrap gap-2">
                <button type="button" className="btn btn-sm" onClick={() => setD((prev) => ({ ...prev, answers: { ...prev.answers, [gid]: {} } }))}>Try again</button>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => requestReflection({ strand: 'B', task: `Graphic Text Lab: ${g.title}` })}>Reflect</button>
              </div>
            </Callout>
          )}
        </div>
      </div>
    </div>
  );
}
