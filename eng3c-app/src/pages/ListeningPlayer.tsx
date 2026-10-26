import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Pause, Play, RotateCcw, SkipForward, Volume2 } from 'lucide-react';
import { LISTEN_BY_ID, LISTEN_PIECES, type ListenPiece } from '../data/listening';
import { splitSentences } from '../lib/textAnalysis';
import { McQuestion } from '../components/Quiz';
import { Callout, PageHeader, ScoreBadge } from '../components/ui';
import { recordToolRun, useApp, useDraft } from '../store/store';
import { requestReflection, toast } from '../store/ui';
import { navigate } from '../lib/router';
import { cx } from '../lib/util';
import { toolBest } from '../lib/progress';

export default function ListeningPlayer({ initial }: { initial?: string }) {
  const s = useApp();
  const piece = initial ? LISTEN_BY_ID[initial] : undefined;
  if (piece) return <Player key={piece.id} piece={piece} />;
  return (
    <div>
      <PageHeader
        strand="A"
        eyebrow="A1 Listening to understand"
        title="Active Listening Player"
        desc="Each piece is read aloud by your device's voice and pauses at checkpoints to ask about tone, audience, or a rhetorical move. Take notes as you go; the transcript stays hidden until you finish."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {LISTEN_PIECES.map((p) => {
          const best = toolBest(s, `listening:${p.id}`);
          const words = p.segments.reduce((a, x) => a + x.text.split(/\s+/).length, 0);
          return (
            <button key={p.id} type="button" className="card flex flex-col items-start gap-1 p-4 text-left hover:border-primary/40" onClick={() => navigate('listening', p.id)}>
              <span className="flex w-full items-start justify-between gap-2">
                <span className="eyebrow">{p.kind}</span>
                {best !== undefined && <ScoreBadge score={best} />}
              </span>
              <span className="font-display text-xl font-semibold">{p.title}</span>
              <span className="text-sm text-muted">{p.summary}</span>
              <span className="num text-xs font-bold text-muted">
                About {Math.max(1, Math.round(words / 150))} min · {p.segments.filter((x) => x.checkpoint).length} checkpoints
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

type Phase = 'ready' | 'playing' | 'paused' | 'question' | 'done';

interface Notes {
  cues: string;
  notes: string;
  summary: string;
}

function Player({ piece }: { piece: ListenPiece }) {
  const synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useDraft<string>('listening:voice', '');
  const [rate, setRate] = useDraft<number>('listening:rate', 1);
  const [phase, setPhase] = useState<Phase>('ready');
  const [seg, setSeg] = useState(0);
  const [sentence, setSentence] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [reveal, setReveal] = useState(false);
  const [notes, setNotes] = useDraft<Notes>(`listening:notes:${piece.id}`, { cues: '', notes: '', summary: '' });
  const run = useRef(0);
  const [textMode, setTextMode] = useState(!synth);

  const sentences = useMemo(() => piece.segments.map((x) => splitSentences(x.text).map((s) => s.text)), [piece]);
  const checkpoints = piece.segments.map((x, i) => ({ i, c: x.checkpoint })).filter((x) => x.c);
  const correct = checkpoints.filter((x) => answers[x.i] === x.c!.answer).length;

  useEffect(() => {
    if (!synth) return;
    const load = () => setVoices(synth.getVoices().filter((v) => v.lang.toLowerCase().startsWith('en')));
    load();
    synth.addEventListener?.('voiceschanged', load);
    return () => {
      synth.removeEventListener?.('voiceschanged', load);
      synth.cancel();
    };
  }, [synth]);

  const voice = voices.find((v) => v.voiceURI === voiceURI) ?? voices.find((v) => /en-CA/i.test(v.lang)) ?? voices.find((v) => /en-US|en-GB/i.test(v.lang)) ?? voices[0];

  const endSegment = (i: number) => {
    if (piece.segments[i].checkpoint) {
      setPhase('question');
      return;
    }
    if (i + 1 >= piece.segments.length) {
      setPhase('done');
      return;
    }
    setSeg(i + 1);
    setSentence(0);
    speakFrom(i + 1, 0);
  };

  const speakFrom = (i: number, k: number) => {
    if (!synth || textMode) {
      setPhase('playing');
      return;
    }
    const token = ++run.current;
    synth.cancel();
    setPhase('playing');
    const list = sentences[i];
    const speak = (j: number) => {
      if (token !== run.current) return;
      if (j >= list.length) {
        endSegment(i);
        return;
      }
      setSentence(j);
      const u = new SpeechSynthesisUtterance(list[j]);
      if (voice) {
        u.voice = voice;
        u.lang = voice.lang;
      } else u.lang = 'en-CA';
      u.rate = rate;
      u.onend = () => speak(j + 1);
      u.onerror = (e) => {
        if (e.error === 'interrupted' || e.error === 'canceled') return;
        setTextMode(true);
        setPhase('playing');
        toast('Your device could not play speech. Switched to text mode.');
      };
      synth.speak(u);
    };
    speak(k);
  };

  const play = () => {
    if (phase === 'done') return;
    speakFrom(seg, phase === 'paused' ? sentence : 0);
  };
  const pause = () => {
    run.current++;
    synth?.cancel();
    setPhase('paused');
  };
  const restart = () => {
    run.current++;
    synth?.cancel();
    setSeg(0);
    setSentence(0);
    setAnswers({});
    setPhase('ready');
  };
  const continueAfterQuestion = () => {
    if (seg + 1 >= piece.segments.length) {
      setPhase('done');
      const pct = Math.round((correct / Math.max(1, checkpoints.length)) * 100);
      recordToolRun(`listening:${piece.id}`, pct);
      toast(`${correct}/${checkpoints.length} checkpoints correct`);
      return;
    }
    setSeg(seg + 1);
    setSentence(0);
    speakFrom(seg + 1, 0);
  };

  useEffect(() => {
    if (phase === 'done' && piece.segments[piece.segments.length - 1].checkpoint === undefined) {
      const pct = Math.round((correct / Math.max(1, checkpoints.length)) * 100);
      recordToolRun(`listening:${piece.id}`, pct);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const cp = piece.segments[seg]?.checkpoint;

  return (
    <div>
      <button type="button" className="btn btn-ghost btn-sm mb-3 -ml-2" onClick={() => { run.current++; synth?.cancel(); navigate('listening'); }}>
        <ArrowLeft size={16} /> All pieces
      </button>
      <PageHeader strand="A" eyebrow={piece.kind} title={piece.title} desc={piece.summary} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="grid min-w-0 content-start gap-4">
          <div className="card p-5">
            <div className="flex flex-wrap items-center gap-4">
              {phase === 'playing' ? (
                <button type="button" className="btn btn-primary h-14 w-14 !rounded-full !p-0" onClick={pause} aria-label="Pause"><Pause size={24} /></button>
              ) : (
                <button type="button" className="btn btn-primary h-14 w-14 !rounded-full !p-0" onClick={play} disabled={phase === 'question' || phase === 'done'} aria-label="Play"><Play size={24} /></button>
              )}
              <div className="min-w-0 flex-1">
                <div className="font-bold">
                  {phase === 'ready' && 'Press play and listen. Notes on the right.'}
                  {phase === 'playing' && (textMode ? 'Text mode: read the segment, then continue' : `Playing part ${seg + 1} of ${piece.segments.length}`)}
                  {phase === 'paused' && 'Paused'}
                  {phase === 'question' && 'Checkpoint: answer to continue'}
                  {phase === 'done' && 'Finished'}
                </div>
                <div className="mt-2 flex gap-1">
                  {piece.segments.map((x, i) => (
                    <span key={i} className={cx('h-1.5 flex-1 rounded-full', i < seg || phase === 'done' ? 'bg-strandA' : i === seg && phase !== 'ready' ? 'bg-strandA/50' : 'bg-sunken', x.checkpoint && 'ring-1 ring-strandA/60 ring-offset-1 ring-offset-surface')} />
                  ))}
                </div>
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={restart} aria-label="Restart"><RotateCcw size={16} /></button>
            </div>

            {textMode && phase === 'playing' && (
              <div className="mt-4 rounded-lg bg-sunken p-4">
                <p className="font-read text-[1.05rem]">{piece.segments[seg].text}</p>
                <button type="button" className="btn btn-sm mt-3" onClick={() => endSegment(seg)}><SkipForward size={15} /> Continue</button>
              </div>
            )}

            <div className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
              {synth && !textMode ? (
                <>
                  <div>
                    <label htmlFor="voice" className="label flex items-center gap-1"><Volume2 size={13} /> Voice</label>
                    <select id="voice" className="input" value={voice?.voiceURI ?? ''} onChange={(e) => setVoiceURI(e.target.value)}>
                      {voices.length === 0 && <option value="">Default voice</option>}
                      {voices.map((v) => (
                        <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="rate" className="label">Speed {rate.toFixed(2)}×</label>
                    <input id="rate" type="range" min={0.75} max={1.3} step={0.05} value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full accent-current" />
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted sm:col-span-2">Speech playback is not available on this device, so the piece is shown one part at a time. Read it as if you were hearing it once.</p>
              )}
            </div>
          </div>

          {phase === 'question' && cp && (
            <div className="card fade-in border-strandA p-5">
              <div className="eyebrow mb-2 text-strandA">Checkpoint · {cp.skill}</div>
              <McQuestion q={cp} chosen={answers[seg]} onChoose={(c) => setAnswers((a) => ({ ...a, [seg]: c }))} />
              {answers[seg] !== undefined && (
                <button type="button" className="btn btn-primary mt-4" onClick={continueAfterQuestion} autoFocus>
                  {seg + 1 >= piece.segments.length ? 'Finish' : 'Keep listening'}
                </button>
              )}
            </div>
          )}

          {phase === 'done' && (
            <Callout tone="good" title={`Done · ${correct}/${checkpoints.length} checkpoints`}>
              Write a two-sentence summary in your notes, then reveal the transcript to check what you missed.
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" className="btn btn-primary btn-sm" onClick={() => requestReflection({ strand: 'A', task: `Listening: ${piece.title}` })}>Reflect</button>
                <button type="button" className="btn btn-sm" onClick={restart}>Listen again</button>
              </div>
            </Callout>
          )}

          <div className="card p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold">Transcript</h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setReveal((r) => !r)}>
                {reveal ? <EyeOff size={15} /> : <Eye size={15} />} {reveal ? 'Hide' : 'Reveal'}
              </button>
            </div>
            {reveal ? (
              <div className="grid gap-3 font-read text-[1rem]">
                {piece.segments.map((_, i) => (
                  <p key={i} className={cx(i === seg && phase === 'playing' && 'rounded bg-strandA/10')}>
                    {sentences[i].map((t, k) => (
                      <span key={k} className={cx(i === seg && k === sentence && phase === 'playing' && 'hl-opinion')}>{t} </span>
                    ))}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">Hidden so you practise listening, not reading. Reveal it after you finish.</p>
            )}
          </div>
        </div>

        <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start">
          <div className="card overflow-hidden">
            <div className="border-b border-line px-4 py-3">
              <h3 className="font-semibold">Cornell notes</h3>
              <p className="text-xs text-muted">Main ideas and evidence on the right, questions and keywords on the left.</p>
            </div>
            <div className="grid grid-cols-[38%_62%]">
              <div className="border-r border-line">
                <label htmlFor="cue" className="label px-3 pt-3">Cues</label>
                <textarea id="cue" className="ruled min-h-[16rem] w-full resize-y bg-transparent px-3 pb-3 text-[0.92rem] outline-none" value={notes.cues} onChange={(e) => setNotes((n) => ({ ...n, cues: e.target.value }))} placeholder="Who is the audience? What is the tone?" />
              </div>
              <div>
                <label htmlFor="notes" className="label px-3 pt-3">Notes</label>
                <textarea id="notes" className="ruled min-h-[16rem] w-full resize-y bg-transparent px-3 pb-3 text-[0.92rem] outline-none" value={notes.notes} onChange={(e) => setNotes((n) => ({ ...n, notes: e.target.value }))} placeholder="Main point → evidence → device" />
              </div>
            </div>
            <div className="border-t border-line">
              <label htmlFor="summary" className="label px-3 pt-3">Summary (2 sentences)</label>
              <textarea id="summary" className="min-h-[5rem] w-full resize-y bg-transparent px-3 pb-3 text-[0.92rem] outline-none" value={notes.summary} onChange={(e) => setNotes((n) => ({ ...n, summary: e.target.value }))} placeholder="The speaker argues that... using..." />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
