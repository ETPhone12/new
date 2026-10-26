import { useEffect, useMemo, useRef, useState } from 'react';
import { FlipHorizontal, Mic, MonitorPlay, Pause, Play, Plus, Square, Upload, X } from 'lucide-react';
import { analyzePauses, countFillers, deliveryScore, pauseAdvice, rmsTrace, scriptChecks, scriptTiming, transcriptWords, wpm, wpmVerdict, WPM_TARGET, type PauseReport } from '../lib/speech';
import { addSpeechSession, recordToolRun, useApp, useDraft } from '../store/store';
import { requestReflection, toast } from '../store/ui';
import { Callout, CheckList, PageHeader, Segmented } from '../components/ui';
import { cx, formatDate, formatDuration } from '../lib/util';

const EXAMPLE_SCRIPT = `Who skipped breakfast this morning? / Raise your hand. / Look around. // That is a lot of hands.

I think Northview should open a free breakfast counter in the cafeteria, every school day, from 7:45 to 8:15.

Here is why. First, *hungry students cannot focus*. When your stomach is empty, the bell rings, the teacher starts talking, and all you can think about is lunch. / A granola bar and some fruit would change that.

Second, *it costs less than you think*. Many Ontario schools already run breakfast programs with help from local businesses and community groups. / Grocery stores already donate food that would otherwise be thrown away. / We would not be inventing something new. / We would be catching up.

My last reason matters most. *Nobody should have to ask.* / Right now, if you are hungry, you have to go to the office and explain why. // That is embarrassing, so most people just stay hungry. / A counter that is open to everyone means no one has to explain anything.

Some people will say breakfast is a family's job, not a school's. / Families matter, and most families are doing their best. / But mornings are rushed, buses come early, and budgets are tight. / A school's job is to help us learn, and we cannot learn on empty.

So here is what I am asking. / Sign the petition at the front office this week. / Tell your teachers you support it. / And on Friday, come to the student council meeting and stand with us.

Let's make sure that the next time someone asks who skipped breakfast, // nobody raises their hand.`;

/* ---------------- Speech recognition (optional, browser-dependent) ---------------- */

interface SRResult {
  isFinal: boolean;
  0: { transcript: string };
}
interface SREvent {
  resultIndex: number;
  results: ArrayLike<SRResult>;
}
interface SR {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((e: SREvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
}
type SRCtor = new () => SR;

function getSR(): SRCtor | null {
  const w = window as unknown as { SpeechRecognition?: SRCtor; webkitSpeechRecognition?: SRCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/* ---------------- Recorder hook ---------------- */

interface Take {
  url: string;
  seconds: number;
  levels: number[];
  transcript: string;
  method: 'live' | 'upload';
}

function useRecorder() {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [level, setLevel] = useState(0);
  const [live, setLive] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [take, setTake] = useState<Take | null>(null);
  const r = useRef<{
    stream?: MediaStream;
    ctx?: AudioContext;
    timer?: number;
    rec?: MediaRecorder;
    sr?: SR;
    chunks: Blob[];
    levels: number[];
    finals: string;
    startedAt: number;
    active: boolean;
  }>({ chunks: [], levels: [], finals: '', startedAt: 0, active: false });

  const supported = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof window.MediaRecorder !== 'undefined';

  const start = async () => {
    setError(null);
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch {
      setError('Microphone access is blocked here. Allow it in your browser settings, or record with your device’s voice memo app and upload the file.');
      return;
    }
    const s = r.current;
    s.stream = stream;
    s.chunks = [];
    s.levels = [];
    s.finals = '';
    s.active = true;
    s.startedAt = Date.now();
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    s.ctx = ctx;
    const src = ctx.createMediaStreamSource(stream);
    const an = ctx.createAnalyser();
    an.fftSize = 2048;
    src.connect(an);
    const buf = new Float32Array(an.fftSize);
    s.timer = window.setInterval(() => {
      an.getFloatTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
      const rms = Math.sqrt(sum / buf.length);
      s.levels.push(rms);
      setLevel(rms);
      setElapsed((Date.now() - s.startedAt) / 1000);
    }, 50);
    const rec = new MediaRecorder(stream);
    s.rec = rec;
    rec.ondataavailable = (e) => e.data.size && s.chunks.push(e.data);
    rec.onstop = () => {
      const blob = new Blob(s.chunks, { type: rec.mimeType || 'audio/webm' });
      setTake({ url: URL.createObjectURL(blob), seconds: (Date.now() - s.startedAt) / 1000, levels: s.levels.slice(), transcript: s.finals.trim(), method: 'live' });
    };
    rec.start();
    const SRc = getSR();
    if (SRc) {
      try {
        const sr = new SRc();
        sr.continuous = true;
        sr.interimResults = true;
        sr.lang = 'en-CA';
        sr.onresult = (e) => {
          let interim = '';
          for (let i = e.resultIndex; i < e.results.length; i++) {
            const res = e.results[i];
            if (res.isFinal) s.finals += ' ' + res[0].transcript;
            else interim += res[0].transcript;
          }
          setLive((s.finals + ' ' + interim).trim());
        };
        sr.onend = () => {
          if (s.active) {
            try {
              sr.start();
            } catch {
              /* already restarting */
            }
          }
        };
        sr.onerror = () => {
          /* transcript is optional */
        };
        sr.start();
        s.sr = sr;
      } catch {
        s.sr = undefined;
      }
    }
    setLive('');
    setRecording(true);
  };

  const stop = () => {
    const s = r.current;
    s.active = false;
    window.clearInterval(s.timer);
    try {
      s.sr?.stop();
    } catch {
      /* ignore */
    }
    if (s.rec && s.rec.state !== 'inactive') s.rec.stop();
    s.stream?.getTracks().forEach((t) => t.stop());
    s.ctx?.close().catch(() => undefined);
    setRecording(false);
    setLevel(0);
  };

  const loadFile = async (file: File) => {
    setError(null);
    try {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      const audio = await ctx.decodeAudioData(await file.arrayBuffer());
      const levels = rmsTrace(audio.getChannelData(0), audio.sampleRate, 50);
      ctx.close().catch(() => undefined);
      setTake({ url: URL.createObjectURL(file), seconds: audio.duration, levels, transcript: '', method: 'upload' });
    } catch {
      setError('That file could not be read. Try an .m4a, .mp3, .wav, or .webm recording.');
    }
  };

  useEffect(() => () => stop(), []); // eslint-disable-line react-hooks/exhaustive-deps

  return { recording, elapsed, level, live, error, take, setTake, start, stop, loadFile, supported, hasTranscript: !!getSR() };
}

/* ---------------- Page ---------------- */

export default function SpeechStudio() {
  const s = useApp();
  const [script, setScript] = useDraft<string>('speech:script', EXAMPLE_SCRIPT);
  const [title, setTitle] = useDraft<string>('speech:title', 'Free breakfast counter pitch');
  const [mode, setMode] = useState<'live' | 'upload'>('live');
  const [prompter, setPrompter] = useState(false);
  const [manualFillers, setManualFillers] = useState(0);
  const rec = useRecorder();
  const timing = scriptTiming(script.replace(/\/+|\*/g, ''));
  const checks = useMemo(() => scriptChecks(script.replace(/\/+|\*/g, '')), [script]);

  const result = useMemo(() => {
    const t = rec.take;
    if (!t) return null;
    const pauses: PauseReport = analyzePauses(t.levels, 50);
    const tw = transcriptWords(t.transcript);
    const useTranscript = tw >= 15;
    const words = useTranscript ? tw : timing.words;
    const speakSecs = pauses.activeSeconds > 5 ? pauses.activeSeconds : t.seconds;
    const rate = wpm(words, speakSecs);
    const auto = useTranscript ? countFillers(t.transcript) : { total: 0, byWord: {} as Record<string, number> };
    const fillers = auto.total + manualFillers;
    const fpm = fillers / Math.max(speakSecs / 60, 0.25);
    return {
      pauses,
      words,
      rate,
      fillers,
      byWord: auto.byWord,
      fpm,
      speakSecs,
      score: deliveryScore(rate, fpm, pauses),
      method: (useTranscript ? 'live' : t.method === 'upload' ? 'upload' : 'estimate') as 'live' | 'upload' | 'estimate',
      useTranscript,
    };
  }, [rec.take, manualFillers, timing.words]);

  useEffect(() => setManualFillers(0), [rec.take]);

  const save = () => {
    if (!result || !rec.take) return;
    addSpeechSession({
      title: title || 'Speech',
      seconds: Math.round(rec.take.seconds),
      words: result.words,
      wpm: result.rate,
      fillers: result.fillers,
      pauses: result.pauses.pauses.length,
      longPauses: result.pauses.long,
      method: result.method,
    });
    recordToolRun('speech', result.score);
    toast(`Session saved · delivery ${result.score}`);
    requestReflection({ strand: 'A', task: `Speech: ${title || 'recording'}` });
  };

  return (
    <div>
      <PageHeader
        strand="A"
        eyebrow="A2 Speaking to communicate · TVO ILC 2.3–2.5"
        title="Speech Studio"
        desc="Script it for the ear, rehearse it on the teleprompter, then record. You get words per minute (target 130–150), filler words, and how you use pauses."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="grid min-w-0 content-start gap-4">
          <div className="card p-4">
            <label htmlFor="sp-title" className="label">Title</label>
            <input id="sp-title" className="input mb-3" value={title} onChange={(e) => setTitle(e.target.value)} />
            <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
              <label htmlFor="sp-script" className="label !mb-0">Script</label>
              <span className="text-xs text-muted">/ short pause · // long pause · *stress this*</span>
            </div>
            <textarea id="sp-script" className="input min-h-[18rem] font-read text-[1.02rem] leading-relaxed" value={script} onChange={(e) => setScript(e.target.value)} />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="chip num">{timing.words} words</span>
              <span className={cx('chip num border-transparent', timing.seconds >= 105 && timing.seconds <= 135 ? 'bg-good/15 text-good' : 'bg-warn/15 text-warn')}>≈ {formatDuration(timing.seconds)} at 140 WPM</span>
              <button type="button" className="btn btn-primary btn-sm ml-auto" onClick={() => setPrompter(true)}>
                <MonitorPlay size={16} /> Teleprompter
              </button>
            </div>
          </div>
          <div className="card p-4">
            <h3 className="mb-2 font-semibold">Written for the ear?</h3>
            <CheckList checks={checks} />
          </div>
        </div>

        <aside className="grid min-w-0 content-start gap-4 lg:sticky lg:top-6 lg:self-start">
          <div className="card p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">Record</h3>
              <Segmented label="Recording source" value={mode} onChange={setMode} options={[{ value: 'live', label: 'Microphone' }, { value: 'upload', label: 'Upload file' }]} />
            </div>
            {mode === 'live' ? (
              rec.supported ? (
                <div>
                  <div className="flex items-center gap-4">
                    {rec.recording ? (
                      <button type="button" className="btn btn-pen h-14 w-14 !rounded-full !p-0" onClick={rec.stop} aria-label="Stop recording"><Square size={22} /></button>
                    ) : (
                      <button type="button" className="btn btn-primary h-14 w-14 !rounded-full !p-0" onClick={rec.start} aria-label="Start recording"><Mic size={24} /></button>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="num font-display text-3xl font-semibold">{formatDuration(rec.elapsed)}</div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-sunken">
                        <div className="h-full rounded-full bg-strandA transition-[width] duration-75" style={{ width: `${Math.min(100, rec.level * 900)}%` }} />
                      </div>
                    </div>
                  </div>
                  {rec.recording && rec.live && <p className="mt-3 line-clamp-3 rounded-lg bg-sunken p-2 text-sm text-muted">{rec.live}</p>}
                  <p className="mt-3 text-xs text-muted">
                    {rec.hasTranscript
                      ? 'Live transcripts use your browser’s speech service, which may send audio online. Filler words are counted from it.'
                      : 'This browser has no live transcript, so WPM uses your script’s word count. Count fillers by tapping +1 during playback.'}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted">Recording is not supported in this browser. Switch to Upload.</p>
              )
            ) : (
              <div>
                <label htmlFor="sp-file" className="btn w-full cursor-pointer">
                  <Upload size={17} /> Choose an audio file
                </label>
                <input id="sp-file" type="file" accept="audio/*,.m4a,.mp3,.wav,.webm" className="sr-only" onChange={(e) => e.target.files?.[0] && rec.loadFile(e.target.files[0])} />
                <p className="mt-2 text-xs text-muted">Record with your phone’s voice memo app, then upload it. WPM is estimated from your script, so read it as written.</p>
              </div>
            )}
            {rec.error && <div className="mt-3"><Callout tone="warn">{rec.error}</Callout></div>}
          </div>

          {rec.take && result && (
            <div className="card fade-in p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <div className="eyebrow">Delivery score</div>
                  <div className={cx('num font-display text-5xl font-semibold', result.score >= 80 ? 'text-good' : result.score >= 60 ? 'text-warn' : 'text-bad')}>{result.score}</div>
                </div>
                <div className="text-right text-sm text-muted">
                  {formatDuration(rec.take.seconds)} recorded
                  <br />
                  {result.useTranscript ? 'from live transcript' : 'WPM from script'}
                </div>
              </div>
              <audio controls src={rec.take.url} className="mb-3 w-full" />
              <WpmGauge rate={result.rate} />
              <p className={cx('mt-1 text-sm', wpmVerdict(result.rate).tone === 'good' ? 'text-good' : 'text-warn')}>{wpmVerdict(result.rate).text}</p>
              {!result.useTranscript && (result.rate > 260 || result.rate < 60) && (
                <div className="mt-2">
                  <Callout tone="warn">This recording is {result.rate > 260 ? 'much shorter' : 'much longer'} than your script. Without a live transcript, WPM assumes you read the whole script as written.</Callout>
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-3">
                <div>
                  <div className="eyebrow">Fillers</div>
                  <div className="num font-display text-2xl font-semibold">{result.fillers}</div>
                  <div className="num text-xs text-muted">{result.fpm.toFixed(1)} per minute</div>
                  {Object.keys(result.byWord).length > 0 && <div className="mt-1 text-xs text-muted">{Object.entries(result.byWord).map(([w, n]) => `${w} ×${n}`).join(', ')}</div>}
                  <button type="button" className="btn btn-sm mt-2" onClick={() => setManualFillers((n) => n + 1)}><Plus size={14} /> Heard one</button>
                </div>
                <div>
                  <div className="eyebrow">Pauses</div>
                  <div className="num font-display text-2xl font-semibold">{result.pauses.pauses.length}</div>
                  <PauseBars r={result.pauses} />
                </div>
              </div>
              <p className="mt-3 text-sm text-muted">{pauseAdvice(result.pauses)}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className="btn btn-primary btn-sm" onClick={save}>Save session and reflect</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => rec.setTake(null)}>Discard</button>
              </div>
            </div>
          )}

          {s.speech.length > 0 && (
            <div className="card p-4">
              <h3 className="mb-2 font-semibold">Past sessions</h3>
              <ul className="divide-y divide-line">
                {s.speech.slice(0, 8).map((x) => (
                  <li key={x.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                    <span className="min-w-0">
                      <span className="block truncate font-bold">{x.title}</span>
                      <span className="text-xs text-muted">{formatDate(x.at)} · {formatDuration(x.seconds)}</span>
                    </span>
                    <span className="num shrink-0 text-right">
                      <span className={cx('font-bold', x.wpm >= WPM_TARGET.min && x.wpm <= WPM_TARGET.max ? 'text-good' : 'text-warn')}>{x.wpm} WPM</span>
                      <span className="block text-xs text-muted">{x.fillers} fillers · {x.pauses} pauses</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      {prompter && <Teleprompter script={script} onClose={() => setPrompter(false)} recorder={rec} />}
    </div>
  );
}

function WpmGauge({ rate }: { rate: number }) {
  const min = 80;
  const max = 200;
  const pos = (v: number) => `${((Math.min(max, Math.max(min, v)) - min) / (max - min)) * 100}%`;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="eyebrow">Words per minute</span>
        <span className="num font-display text-2xl font-semibold">{rate}</span>
      </div>
      <div className="relative mt-1 h-3 rounded-full bg-sunken">
        <div className="absolute top-0 h-full rounded-full bg-good/30" style={{ left: pos(WPM_TARGET.min), width: `calc(${pos(WPM_TARGET.max)} - ${pos(WPM_TARGET.min)})` }} />
        <div className="absolute -top-1 h-5 w-1.5 -translate-x-1/2 rounded-full bg-ink" style={{ left: pos(rate) }} />
      </div>
      <div className="num mt-1 flex justify-between text-[0.7rem] text-muted">
        <span>{min}</span>
        <span>130–150 target</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

function PauseBars({ r }: { r: PauseReport }) {
  const rows = [
    ['Short <1s', r.short],
    ['1–2s', r.medium],
    ['Long 2s+', r.long],
  ] as const;
  const top = Math.max(1, r.short, r.medium, r.long);
  return (
    <div className="mt-1 grid gap-1">
      {rows.map(([label, n]) => (
        <div key={label} className="grid grid-cols-[4.2rem_1fr_1.5rem] items-center gap-1.5 text-[0.7rem]">
          <span className="text-muted">{label}</span>
          <span className="h-2 rounded-full bg-sunken">
            <span className={cx('block h-full rounded-full', label.startsWith('Long') ? 'bg-warn' : 'bg-strandA')} style={{ width: `${(n / top) * 100}%` }} />
          </span>
          <span className="num text-right font-bold">{n}</span>
        </div>
      ))}
    </div>
  );
}

function renderMarked(script: string) {
  return script.split(/\n\s*\n/).map((para, pi) => (
    <p key={pi} className="mb-[1.2em]">
      {para.split(/(\/\/|\/|\*[^*]+\*)/).map((part, k) => {
        if (part === '//') return <span key={k} className="mx-1 inline-block font-bold text-pen">‖</span>;
        if (part === '/') return <span key={k} className="mx-1 inline-block font-bold text-pen/80">|</span>;
        if (/^\*[^*]+\*$/.test(part)) return <strong key={k} className="underline decoration-pen decoration-2 underline-offset-4">{part.slice(1, -1)}</strong>;
        return <span key={k}>{part}</span>;
      })}
    </p>
  ));
}

function Teleprompter({ script, onClose, recorder }: { script: string; onClose: () => void; recorder: ReturnType<typeof useRecorder> }) {
  const [running, setRunning] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [speed, setSpeed] = useState(140);
  const [size, setSize] = useState(34);
  const [mirror, setMirror] = useState(false);
  const [withRec, setWithRec] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const recRef = useRef(recorder);
  recRef.current = recorder;
  const words = scriptTiming(script.replace(/\/+|\*/g, '')).words;

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    let acc = box.current?.scrollTop ?? 0;
    const tick = (now: number) => {
      const el = box.current;
      if (!el) return;
      const dt = (now - last) / 1000;
      last = now;
      const content = el.scrollHeight - el.clientHeight * 0.4;
      const pxPerWord = content / Math.max(1, words);
      acc += (speed / 60) * pxPerWord * dt;
      el.scrollTop = acc;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 2) {
        setRunning(false);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, speed, words]);

  useEffect(() => {
    if (count === null) return;
    if (count === 0) {
      setCount(null);
      setRunning(true);
      if (withRec && !recRef.current.recording) void recRef.current.start();
      return;
    }
    const t = window.setTimeout(() => setCount(count - 1), 800);
    return () => window.clearTimeout(t);
  }, [count, withRec]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === ' ') {
        e.preventDefault();
        setRunning((r) => !r);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-stage text-onstage" role="dialog" aria-modal="true" aria-label="Teleprompter" style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex flex-wrap items-center gap-2 border-b border-onstage/15 py-2" style={{ paddingLeft: 'max(12px, env(safe-area-inset-left, 0px))', paddingRight: 'max(12px, env(safe-area-inset-right, 0px))' }}>
        <button type="button" className="btn btn-pen btn-sm" onClick={() => (running ? setRunning(false) : setCount(3))}>
          {running ? <Pause size={16} /> : <Play size={16} />} {running ? 'Pause' : 'Start'}
        </button>
        <label className="flex items-center gap-2 text-sm">
          <span className="num w-16">{speed} WPM</span>
          <input type="range" min={100} max={180} step={5} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} aria-label="Scroll speed in words per minute" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span>Size</span>
          <input type="range" min={22} max={56} value={size} onChange={(e) => setSize(Number(e.target.value))} aria-label="Text size" />
        </label>
        <button type="button" className={cx('btn btn-sm border-onstage/30 bg-transparent text-onstage shadow-none hover:bg-onstage/10', mirror && 'bg-onstage/20')} onClick={() => setMirror((m) => !m)} aria-pressed={mirror}>
          <FlipHorizontal size={15} /> Mirror
        </button>
        {recorder.supported && (
          <label className="flex items-center gap-1.5 text-sm">
            <input type="checkbox" checked={withRec} onChange={(e) => setWithRec(e.target.checked)} /> Record too
          </label>
        )}
        {recorder.recording && (
          <button type="button" className="btn btn-sm border-onstage/30 bg-transparent text-onstage shadow-none" onClick={recorder.stop}>
            <Square size={14} /> Stop rec {formatDuration(recorder.elapsed)}
          </button>
        )}
        <button type="button" className="btn btn-sm ml-auto border-onstage/30 bg-transparent text-onstage shadow-none hover:bg-onstage/10" onClick={() => { setRunning(false); if (recorder.recording) recorder.stop(); onClose(); }} aria-label="Close teleprompter">
          <X size={16} />
        </button>
      </div>
      <div className="relative min-h-0 flex-1">
        <div className="pointer-events-none absolute inset-x-0 top-[30%] z-10 h-[3.2em] border-y-2 border-pen/50" style={{ fontSize: size }} aria-hidden />
        <div ref={box} className="h-full overflow-y-auto" style={{ paddingLeft: 'max(24px, env(safe-area-inset-left, 0px))', paddingRight: 'max(24px, env(safe-area-inset-right, 0px))' }}>
          <div className="mx-auto max-w-3xl py-[30vh] font-sans font-bold leading-[1.45]" style={{ fontSize: size, transform: mirror ? 'scaleX(-1)' : undefined }}>
            {renderMarked(script)}
            <p className="text-onstage/40">— end —</p>
          </div>
        </div>
        {count !== null && <div className="num absolute inset-0 grid place-items-center bg-stage/70 font-display text-[8rem] font-semibold">{count}</div>}
      </div>
    </div>
  );
}
