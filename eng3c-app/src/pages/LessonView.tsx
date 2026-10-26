import { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, RotateCcw } from 'lucide-react';
import { LESSON_BY_ID, LESSONS } from '../data/lessons';
import { MODULE_BY_ID, TOOL_BY_ID } from '../data/curriculum';
import { completeLesson, uncompleteLesson, useApp } from '../store/store';
import { requestReflection, toast } from '../store/ui';
import { navigate } from '../lib/router';
import { Quiz } from '../components/Quiz';
import { Callout, PageHeader, StrandChip } from '../components/ui';

export default function LessonView({ id }: { id: string }) {
  const s = useApp();
  const lesson = LESSON_BY_ID[id];
  const [quiz, setQuiz] = useState<{ score: number; total: number } | null>(null);
  if (!lesson) {
    return (
      <div>
        <PageHeader title="Lesson not found" />
        <button type="button" className="btn" onClick={() => navigate('course')}>Back to the course map</button>
      </div>
    );
  }
  const m = MODULE_BY_ID[lesson.moduleId];
  const idx = LESSONS.findIndex((l) => l.id === id);
  const prev = LESSONS[idx - 1];
  const next = LESSONS[idx + 1];
  const done = s.lessons[id];

  const finish = () => {
    const result = quiz ?? { score: 0, total: lesson.quiz.length };
    completeLesson(id, { quizScore: result.score, quizTotal: result.total });
    toast('Lesson complete');
    requestReflection({ strand: lesson.strands[0], task: `Lesson ${m.number}.${lesson.number}: ${lesson.title}` });
  };

  return (
    <article>
      <button type="button" className="btn btn-ghost btn-sm mb-3 -ml-2" onClick={() => navigate('course')}>
        <ArrowLeft size={16} /> Course map
      </button>
      <PageHeader
        eyebrow={`Module ${m.number} · Lesson ${lesson.number}`}
        title={lesson.title}
        desc={lesson.hook}
      />
      <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
        {lesson.strands.map((sid) => (
          <StrandChip key={sid} id={sid} />
        ))}
        <span className="chip font-normal">Expectations {lesson.expectations.join(', ')}</span>
        {lesson.tvo && <span className="chip font-normal">TVO ILC {lesson.tvo}</span>}
        <span className="chip font-normal"><Clock size={13} /> {lesson.minutes} min</span>
        {done && <span className="chip border-transparent bg-good/15 text-good"><CheckCircle2 size={13} /> Complete</span>}
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          {lesson.sections.map((sec) => (
            <section key={sec.heading} className="mb-7">
              <h2 className="mb-2 text-xl font-semibold">{sec.heading}</h2>
              {sec.body.length === 1 ? (
                <p className="max-w-[68ch] text-[1.02rem]">{sec.body[0]}</p>
              ) : (
                <ul className="grid max-w-[68ch] gap-2">
                  {sec.body.map((b) => (
                    <li key={b} className="flex gap-2.5 text-[1.02rem]">
                      <span className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-pen" aria-hidden />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {lesson.example && (
            <section className="mb-7">
              <Callout title={lesson.example.label}>
                <p className="whitespace-pre-line font-read">{lesson.example.text}</p>
              </Callout>
            </section>
          )}

          <section className="card mb-7 p-5">
            <Quiz questions={lesson.quiz} onComplete={(score, total) => setQuiz({ score, total })} />
          </section>

          <section className="mb-4">
            <h2 className="mb-3 text-xl font-semibold">Practise it</h2>
            <div className="flex flex-wrap gap-2">
              {lesson.practice.map((p) => (
                <button key={p.label} type="button" className="btn" onClick={() => navigate(p.tool, p.param)}>
                  {p.label} <span className="text-xs font-normal text-muted">· {TOOL_BY_ID[p.tool]?.name}</span>
                </button>
              ))}
            </div>
          </section>

          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-line pt-5">
            {done ? (
              <>
                <span className="flex items-center gap-1.5 font-bold text-good"><CheckCircle2 size={18} /> Completed · quiz {done.quizScore}/{done.quizTotal}</span>
                <button type="button" className="btn btn-sm btn-ghost" onClick={() => uncompleteLesson(id)}><RotateCcw size={14} /> Mark not done</button>
              </>
            ) : (
              <>
                <button type="button" className="btn btn-primary" onClick={finish} disabled={!quiz}>
                  <CheckCircle2 size={18} /> Mark complete and reflect
                </button>
                {!quiz && <span className="text-sm text-muted">Answer the quick check first.</span>}
              </>
            )}
          </div>
          <div className="mt-6 flex flex-wrap justify-between gap-3">
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
          <div className="card p-4">
            <h2 className="mb-3 text-lg font-semibold">Key terms</h2>
            <dl className="grid gap-3">
              {lesson.keyTerms.map((t) => (
                <div key={t.term}>
                  <dt className="font-bold">{t.term}</dt>
                  <dd className="text-[0.9rem] text-muted">{t.def}</dd>
                </div>
              ))}
            </dl>
          </div>
          <button type="button" className="btn mt-3 w-full" onClick={() => navigate('task', m.milestone.id)}>
            Module {m.number} task: {m.milestone.kind === 'term' ? 'portfolio' : 'final'}
          </button>
        </aside>
      </div>
    </article>
  );
}
