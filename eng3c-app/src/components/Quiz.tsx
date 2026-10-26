import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { QuizQuestion } from '../types';
import { cx } from '../lib/util';

export function McQuestion({
  q,
  index,
  chosen,
  onChoose,
  reveal = true,
  quote,
}: {
  q: QuizQuestion;
  index?: number;
  chosen: number | undefined;
  onChoose: (i: number) => void;
  /** Show right/wrong and the explanation once answered. */
  reveal?: boolean;
  quote?: string;
}) {
  const answered = chosen !== undefined;
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2.5 text-[1.02rem] font-extrabold leading-snug">
        {index !== undefined && <span className="num mr-1.5 text-primary">{index + 1}.</span>}
        {q.q}
      </legend>
      {quote && <blockquote className="mb-3 rounded-r-xl border-l-4 border-sun bg-sun/10 py-2 pl-3 pr-2 font-read italic text-ink/90">{quote}</blockquote>}
      <div className="grid gap-2">
        {q.options.map((opt, i) => {
          const isChosen = chosen === i;
          const isAnswer = q.answer === i;
          const state = !answered || !reveal ? (isChosen ? 'chosen' : 'idle') : isAnswer ? 'right' : isChosen ? 'wrong' : 'idle';
          return (
            <button
              key={i}
              type="button"
              disabled={answered && reveal}
              onClick={() => onChoose(i)}
              aria-pressed={isChosen}
              className={cx(
                'flex min-h-[3rem] items-center gap-3 rounded-xl border-2 px-3 py-2 text-left text-[0.98rem] font-semibold transition-colors',
                state === 'idle' && 'border-line bg-surface hover:border-primary/50 hover:bg-primary/5',
                state === 'chosen' && 'border-primary bg-primary/10',
                state === 'right' && 'border-good bg-good/10',
                state === 'wrong' && 'border-bad bg-bad/10',
                answered && reveal && 'cursor-default',
              )}
            >
              <span
                className={cx(
                  'num grid h-7 w-7 shrink-0 place-items-center rounded-full text-[0.8rem] font-black',
                  state === 'right' ? 'bg-good text-surface' : state === 'wrong' ? 'bg-bad text-surface' : state === 'chosen' ? 'bg-primary text-onprimary' : 'bg-sunken text-muted',
                )}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span className="min-w-0 flex-1">{opt}</span>
              {state === 'right' && <CheckCircle2 size={20} className="shrink-0 text-good" aria-label="Correct" />}
              {state === 'wrong' && <XCircle size={20} className="shrink-0 text-bad" aria-label="Incorrect" />}
            </button>
          );
        })}
      </div>
      {answered && reveal && (
        <p className={cx('mt-2 text-[0.92rem]', chosen === q.answer ? 'text-good' : 'text-ink')}>
          <strong>{chosen === q.answer ? 'Correct. ' : `Answer: ${String.fromCharCode(65 + q.answer)}. `}</strong>
          <span className="text-muted">{q.why}</span>
        </p>
      )}
    </fieldset>
  );
}

export function Quiz({ questions, onComplete, title = 'Quick check' }: { questions: QuizQuestion[]; onComplete?: (score: number, total: number) => void; title?: string }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const done = Object.keys(answers).length === questions.length;
  const score = questions.reduce((a, q, i) => a + (answers[i] === q.answer ? 1 : 0), 0);

  useEffect(() => {
    if (done) onComplete?.(score, questions.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  return (
    <div className="grid gap-6">
      <div className="flex items-baseline justify-between gap-2">
        {title ? <h3 className="text-lg font-extrabold">{title}</h3> : <span />}
        <span className="num chip border-transparent bg-sunken">
          {Object.keys(answers).length}/{questions.length} answered{done && ` · ${score} correct`}
        </span>
      </div>
      {questions.map((q, i) => (
        <McQuestion key={i} q={q} index={i} chosen={answers[i]} onChoose={(c) => setAnswers((a) => ({ ...a, [i]: c }))} />
      ))}
      {done && (
        <button type="button" className="btn btn-sm justify-self-start" onClick={() => setAnswers({})}>
          Try again
        </button>
      )}
    </div>
  );
}
