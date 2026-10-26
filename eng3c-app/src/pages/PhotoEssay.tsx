import { useMemo, useRef, useState, type PointerEvent } from 'react';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, GripVertical, ImagePlus, Play, Plus, Trash2, X } from 'lucide-react';
import { checkCaption, type Check } from '../lib/writingChecks';
import { deleteImage, fileToDataUrl, putImage, useImage } from '../lib/images';
import { recordToolRun, useDraft } from '../store/store';
import { requestReflection, toast } from '../store/ui';
import { Callout, CheckList, PageHeader, ScoreBadge } from '../components/ui';
import { cx, uid } from '../lib/util';

const SHOTS = ['Establishing / wide', 'Medium', 'Close-up', 'Detail', 'Portrait', 'Action'];
const ANGLES = ['Eye level', 'Low angle', 'High angle', 'Bird’s-eye'];
const ROLES = ['Opening: set the scene', 'Build: introduce people', 'Build: show the work or tension', 'Turning point', 'Resolution', 'Closing image'];

interface Frame {
  id: string;
  shot: string;
  angle: string;
  caption: string;
  hasImage: boolean;
  /** Colour block used when there is no photo yet. */
  hue: number;
}

interface Essay {
  title: string;
  theme: string;
  frames: Frame[];
  example?: boolean;
}

const EXAMPLE: Essay = {
  title: 'Before the First Bell',
  theme: 'The bus loop at 7 a.m. is where our school wakes up, one small job at a time.',
  frames: [
    { id: 'f1', shot: 'Establishing / wide', angle: 'High angle', caption: 'Seven buses idle in the loop at 7:05 a.m. Most students have no idea who arrived first.', hasImage: false, hue: 210 },
    { id: 'f2', shot: 'Portrait', angle: 'Eye level', caption: 'Custodian Dev Patel unlocks the north doors at 6:30. He has opened them for nineteen years.', hasImage: false, hue: 30 },
    { id: 'f3', shot: 'Detail', angle: 'Eye level', caption: 'A ring of 42 keys hangs from his belt. He knows each one by touch.', hasImage: false, hue: 45 },
    { id: 'f4', shot: 'Action', angle: 'Low angle', caption: 'Breakfast volunteers stack 120 muffins before the doors open.', hasImage: false, hue: 140 },
    { id: 'f5', shot: 'Close-up', angle: 'Eye level', caption: 'Grade 9 student Ana finds her bus number on the board. Her shoulders drop as she relaxes.', hasImage: false, hue: 280 },
    { id: 'f6', shot: 'Establishing / wide', angle: 'Low angle', caption: 'The first bell rings at 8:15. The loop empties in under four minutes.', hasImage: false, hue: 190 },
  ],
  example: true,
};

const blankFrame = (i: number): Frame => ({ id: uid(), shot: '', angle: '', caption: '', hasImage: false, hue: (i * 57) % 360 });

export default function PhotoEssay() {
  const [e, setE] = useDraft<Essay>('photo', EXAMPLE);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [show, setShow] = useState<number | null>(null);
  const list = useRef<HTMLOListElement>(null);

  const set = (patch: Partial<Essay>) => setE((prev) => ({ ...prev, ...patch, example: false }));
  const setFrame = (id: string, patch: Partial<Frame>) => set({ frames: e.frames.map((f) => (f.id === id ? { ...f, ...patch } : f)) });
  const move = (from: number, to: number) => {
    if (from === to || to < 0 || to >= e.frames.length) return;
    const frames = e.frames.slice();
    const [f] = frames.splice(from, 1);
    frames.splice(to, 0, f);
    set({ frames });
  };

  const onPointerDown = (i: number) => (ev: PointerEvent<HTMLButtonElement>) => {
    ev.currentTarget.setPointerCapture(ev.pointerId);
    setDragIdx(i);
    setOverIdx(i);
  };
  const onPointerMove = (ev: PointerEvent<HTMLButtonElement>) => {
    if (dragIdx === null) return;
    const el = document.elementFromPoint(ev.clientX, ev.clientY)?.closest('[data-frame-index]') as HTMLElement | null;
    if (el) setOverIdx(Number(el.dataset.frameIndex));
  };
  const onPointerUp = () => {
    if (dragIdx !== null && overIdx !== null) move(dragIdx, overIdx);
    setDragIdx(null);
    setOverIdx(null);
  };

  const checks: Check[] = useMemo(() => {
    const n = e.frames.length;
    const shots = new Set(e.frames.map((f) => f.shot).filter(Boolean));
    const angles = new Set(e.frames.map((f) => f.angle).filter(Boolean));
    const captionsOk = e.frames.filter((f) => checkCaption(f.caption).every((c) => c.level !== 'fail')).length;
    return [
      { id: 'count', required: true, level: n >= 5 && n <= 6 ? 'pass' : 'fail', label: n >= 5 && n <= 6 ? `${n} frames` : 'Use 5 or 6 frames' },
      { id: 'theme', required: true, level: e.theme.trim().split(/\s+/).length >= 8 ? 'pass' : 'fail', label: 'One-sentence theme statement', tip: 'What should viewers understand after the last frame?' },
      { id: 'open', level: e.frames[0]?.shot === 'Establishing / wide' ? 'pass' : 'warn', label: 'Opens with an establishing shot', tip: 'Orient viewers before you zoom in.' },
      { id: 'shots', level: shots.size >= 3 ? 'pass' : 'warn', label: `${shots.size} different shot sizes (aim for 3+)` },
      { id: 'angles', level: angles.size >= 2 ? 'pass' : 'warn', label: `${angles.size} camera angles (aim for 2+)` },
      { id: 'captions', required: true, level: captionsOk === n ? 'pass' : captionsOk >= n - 1 ? 'warn' : 'fail', label: `${captionsOk}/${n} captions pass` },
    ] as Check[];
  }, [e]);
  const score = Math.round((checks.filter((c) => c.level === 'pass').length / checks.length) * 100);

  return (
    <div>
      <PageHeader
        strand="D"
        eyebrow="D3 Creating media texts · TVO ILC 3.4"
        title="Photo Essay Storyboard"
        desc="Sequence 5–6 photos around one theme. Drag the handle to reorder. Captions: two sentences at most, active verbs, and the context the photo cannot show."
        actions={
          <button type="button" className="btn btn-primary" onClick={() => setShow(0)}>
            <Play size={17} /> Preview
          </button>
        }
      />
      {e.example && (
        <div className="mb-5">
          <Callout title="Example storyboard">
            Colour blocks stand in for photos. Add your own pictures to any frame, or{' '}
            <button type="button" className="font-bold text-strandB underline" onClick={() => setE({ title: '', theme: '', frames: [0, 1, 2, 3, 4].map(blankFrame) })}>start a blank storyboard</button>.
          </Callout>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <div className="card mb-4 grid gap-3 p-4 sm:grid-cols-[1fr_2fr]">
            <div>
              <label htmlFor="pe-title" className="label">Title</label>
              <input id="pe-title" className="input" value={e.title} onChange={(ev) => set({ title: ev.target.value })} />
            </div>
            <div>
              <label htmlFor="pe-theme" className="label">Theme statement</label>
              <input id="pe-theme" className="input" value={e.theme} onChange={(ev) => set({ theme: ev.target.value })} placeholder="One sentence: what this sequence shows" />
            </div>
          </div>

          <ol ref={list} className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {e.frames.map((f, i) => (
              <FrameCard
                key={f.id}
                frame={f}
                index={i}
                count={e.frames.length}
                dragging={dragIdx === i}
                over={overIdx === i && dragIdx !== null && dragIdx !== i}
                onChange={(patch) => setFrame(f.id, patch)}
                onMove={(d) => move(i, i + d)}
                onRemove={() => {
                  deleteImage(`photo:${f.id}`);
                  set({ frames: e.frames.filter((x) => x.id !== f.id) });
                }}
                handle={{ onPointerDown: onPointerDown(i), onPointerMove, onPointerUp, onPointerCancel: onPointerUp }}
              />
            ))}
          </ol>
          <button type="button" className="btn mt-4" disabled={e.frames.length >= 6} onClick={() => set({ frames: [...e.frames, blankFrame(e.frames.length)] })}>
            <Plus size={16} /> Add frame
          </button>
        </div>

        <aside className="min-w-0 xl:sticky xl:top-6 xl:self-start">
          <div className="card p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold">Storyboard check</h3>
              <ScoreBadge score={score} />
            </div>
            <CheckList checks={checks} />
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className="btn btn-primary btn-sm" onClick={() => { recordToolRun('photo', score); toast(`Storyboard score ${score} logged`); requestReflection({ strand: 'D', task: `Photo essay: ${e.title || 'storyboard'}` }); }}>
                Log score and reflect
              </button>
            </div>
          </div>
          <div className="card mt-4 p-4 text-sm">
            <h3 className="mb-1 font-semibold">Suggested sequence</h3>
            <ol className="list-decimal pl-5 text-muted">
              {ROLES.map((r) => <li key={r}>{r}</li>)}
            </ol>
            <p className="mt-2 text-muted">Ask permission before photographing people. If you staged a shot, say so.</p>
          </div>
        </aside>
      </div>

      {show !== null && e.frames[show] && <Slideshow essay={e} index={show} onIndex={setShow} onClose={() => setShow(null)} />}
    </div>
  );
}

function FrameCard({
  frame: f,
  index: i,
  count,
  dragging,
  over,
  onChange,
  onMove,
  onRemove,
  handle,
}: {
  frame: Frame;
  index: number;
  count: number;
  dragging: boolean;
  over: boolean;
  onChange: (p: Partial<Frame>) => void;
  onMove: (d: number) => void;
  onRemove: () => void;
  handle: {
    onPointerDown: (e: PointerEvent<HTMLButtonElement>) => void;
    onPointerMove: (e: PointerEvent<HTMLButtonElement>) => void;
    onPointerUp: () => void;
    onPointerCancel: () => void;
  };
}) {
  const img = useImage(f.hasImage ? `photo:${f.id}` : null);
  const checks = checkCaption(f.caption);
  const [busy, setBusy] = useState(false);
  const inputId = `photo-${f.id}`;

  const onFile = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      await putImage(`photo:${f.id}`, await fileToDataUrl(file));
      onChange({ hasImage: true });
    } catch {
      toast('That image could not be opened. Try a JPG or PNG.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <li data-frame-index={i} className={cx('card overflow-hidden transition-all', dragging && 'scale-[0.98] opacity-60', over && 'ring-2 ring-pen')}>
      <div className="flex items-center gap-1 border-b border-line px-2 py-1.5">
        <button type="button" className="btn btn-ghost btn-sm cursor-grab touch-none !px-1.5 active:cursor-grabbing" aria-label={`Drag frame ${i + 1}`} {...handle}>
          <GripVertical size={18} />
        </button>
        <span className="num font-display text-lg font-semibold">{i + 1}</span>
        <span className="truncate text-xs text-muted">{ROLES[Math.min(i, ROLES.length - 1)]}</span>
        <span className="ml-auto flex">
          <button type="button" className="btn btn-ghost btn-sm !px-1.5" disabled={i === 0} onClick={() => onMove(-1)} aria-label="Move earlier"><ArrowUp size={15} /></button>
          <button type="button" className="btn btn-ghost btn-sm !px-1.5" disabled={i === count - 1} onClick={() => onMove(1)} aria-label="Move later"><ArrowDown size={15} /></button>
          <button type="button" className="btn btn-ghost btn-sm !px-1.5" onClick={onRemove} aria-label="Remove frame"><Trash2 size={15} /></button>
        </span>
      </div>
      <label htmlFor={inputId} className="relative block aspect-[4/3] max-w-full cursor-pointer overflow-hidden">
        {img ? (
          <img src={img} alt={f.caption || `Frame ${i + 1}`} className="h-full w-full object-cover" />
        ) : (
          <span className="grid h-full w-full place-items-center text-center" style={{ background: `linear-gradient(135deg, hsl(${f.hue} 45% 62% / 0.55), hsl(${(f.hue + 40) % 360} 45% 45% / 0.55))` }}>
            <span className="rounded-md bg-surface/85 px-2 py-1 text-sm font-bold">
              <ImagePlus size={16} className="mr-1 inline" />
              {busy ? 'Opening…' : 'Add photo'}
            </span>
          </span>
        )}
        {f.shot && <span className="chip absolute bottom-2 left-2 border-transparent bg-surface/90 text-[0.7rem]">{f.shot}{f.angle ? ` · ${f.angle}` : ''}</span>}
      </label>
      <input id={inputId} type="file" accept="image/*" className="sr-only" onChange={(ev) => onFile(ev.target.files?.[0])} />
      <div className="grid gap-2 p-3">
        <div className="grid grid-cols-2 gap-2">
          <select aria-label="Shot size" className="input !py-1.5 text-sm" value={f.shot} onChange={(ev) => onChange({ shot: ev.target.value })}>
            <option value="">Shot size…</option>
            {SHOTS.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select aria-label="Camera angle" className="input !py-1.5 text-sm" value={f.angle} onChange={(ev) => onChange({ angle: ev.target.value })}>
            <option value="">Angle…</option>
            {ANGLES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <textarea aria-label={`Caption for frame ${i + 1}`} className="input min-h-[4.2rem] font-read text-[0.93rem]" value={f.caption} onChange={(ev) => onChange({ caption: ev.target.value })} placeholder="Who, doing what, when, and why it matters." />
        {f.caption.trim() && <CheckList checks={checks.filter((c) => c.level !== 'pass')} compact />}
      </div>
    </li>
  );
}

function Slideshow({ essay, index, onIndex, onClose }: { essay: Essay; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const f = essay.frames[index];
  const img = useImage(f.hasImage ? `photo:${f.id}` : null);
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink text-surface" role="dialog" aria-modal="true" aria-label="Photo essay preview" style={{ padding: 'env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px)' }}>
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <div className="truncate font-display text-lg font-semibold">{essay.title || 'Untitled photo essay'}</div>
          <div className="truncate text-sm text-surface/70">{essay.theme}</div>
        </div>
        <button type="button" className="btn btn-sm border-surface/30 bg-transparent text-surface hover:bg-surface/10" onClick={onClose} aria-label="Close preview"><X size={18} /></button>
      </div>
      <div className="grid min-h-0 flex-1 place-items-center px-4">
        {img ? (
          <img src={img} alt={f.caption} className="max-h-full max-w-full rounded-md object-contain" />
        ) : (
          <div className="aspect-[4/3] w-full max-w-2xl rounded-md" style={{ background: `linear-gradient(135deg, hsl(${f.hue} 45% 55%), hsl(${(f.hue + 40) % 360} 45% 35%))` }} />
        )}
      </div>
      <div className="mx-auto w-full max-w-2xl px-4 py-4">
        <p className="font-read text-lg">{f.caption}</p>
        <div className="mt-3 flex items-center justify-between">
          <button type="button" className="btn btn-sm border-surface/30 bg-transparent text-surface hover:bg-surface/10" disabled={index === 0} onClick={() => onIndex(index - 1)}><ChevronLeft size={16} /> Back</button>
          <span className="num text-sm text-surface/70">{index + 1} / {essay.frames.length}</span>
          <button type="button" className="btn btn-sm border-surface/30 bg-transparent text-surface hover:bg-surface/10" disabled={index === essay.frames.length - 1} onClick={() => onIndex(index + 1)}>Next <ChevronRight size={16} /></button>
        </div>
      </div>
    </div>
  );
}
