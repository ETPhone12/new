import { useRef, useState, type MouseEvent } from 'react';
import { Copy, ImagePlus, RotateCcw, Trash2 } from 'lucide-react';
import { MEDIA_TAGS, POSTERS, POSTER_BY_ID, TAG_LABEL, type Poster } from '../data/posters';
import { McQuestion } from '../components/Quiz';
import { Callout, PageHeader, ScoreBadge, Segmented } from '../components/ui';
import { recordToolRun, useDraft } from '../store/store';
import { requestReflection, toast } from '../store/ui';
import { deleteImage, fileToDataUrl, putImage, useImage } from '../lib/images';
import { copyText, cx, uid } from '../lib/util';

export default function HotspotAnalyzer({ initial }: { initial?: string }) {
  const [pid, setPid] = useState(initial && (POSTER_BY_ID[initial] || initial === 'custom') ? initial : 'psa');
  return (
    <div>
      <PageHeader
        strand="D"
        eyebrow="D1 Media texts · D2 Forms, conventions, techniques · TVO ILC 3.3"
        title="Ad & PSA Analyzer"
        desc="Tap each numbered hotspot and tag the technique: camera angle, composition, colour and light, text, or message. Then check your tags."
      />
      <div className="mb-5">
        <Segmented label="Text" value={pid} onChange={setPid} options={[...POSTERS.map((p) => ({ value: p.id, label: ({ psa: 'PSA', surge: 'Print ad', glow: 'Social post' } as Record<string, string>)[p.id] ?? p.kind })), { value: 'custom', label: 'Your own ad' }]} />
      </div>
      {pid === 'custom' ? <CustomAnalyzer /> : <PosterAnalyzer key={pid} poster={POSTER_BY_ID[pid]} />}
    </div>
  );
}

interface Draft {
  tags: Record<number, string>;
  checked: boolean;
  answers: Record<number, number>;
}

function PosterAnalyzer({ poster }: { poster: Poster }) {
  const [d, setD] = useDraft<Draft>(`hotspot:${poster.id}`, { tags: {}, checked: false, answers: {} });
  const [sel, setSel] = useState<number>(0);
  const Art = poster.art;
  const tagged = Object.keys(d.tags).length;
  const right = (i: number) => poster.hotspots[i].accept.includes(d.tags[i] ?? '');
  const hsCorrect = poster.hotspots.filter((_, i) => right(i)).length;
  const qCorrect = poster.questions.filter((q, i) => d.answers[i] === q.answer).length;
  const allQ = Object.keys(d.answers).length === poster.questions.length;
  const total = poster.hotspots.length + poster.questions.length;
  const pct = Math.round(((hsCorrect + qCorrect) / total) * 100);
  const h = poster.hotspots[sel];

  const groups = [...new Set(MEDIA_TAGS.map((t) => t.group))];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      <div className="min-w-0">
        <div className="card relative mx-auto max-w-[420px] overflow-hidden p-0">
          <Art />
          {poster.hotspots.map((hs, i) => {
            const t = d.tags[i];
            const state = d.checked ? (right(i) ? 'right' : 'wrong') : t ? 'tagged' : 'open';
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSel(i)}
                aria-label={`Hotspot ${i + 1}${t ? `, tagged ${TAG_LABEL[t]}` : ''}`}
                aria-pressed={sel === i}
                className={cx(
                  'num absolute grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 text-sm font-bold shadow-lift transition-transform',
                  state === 'open' && 'border-surface bg-ink text-surface',
                  state === 'tagged' && 'border-ink bg-hlOpinion text-onhl',
                  state === 'right' && 'border-surface bg-good text-surface',
                  state === 'wrong' && 'border-surface bg-bad text-surface',
                  sel === i && 'scale-125 ring-4 ring-hlOpinion/70',
                )}
                style={{ left: `${(hs.x / 300) * 100}%`, top: `${(hs.y / 400) * 100}%` }}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-center text-xs text-muted">{poster.blurb} Original artwork made for this app; brands are fictional.</p>
      </div>

      <div className="grid min-w-0 content-start gap-4">
        <div className="card p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="font-semibold">Hotspot {sel + 1} of {poster.hotspots.length}</h3>
            <span className="num text-sm text-muted">{tagged}/{poster.hotspots.length} tagged</span>
          </div>
          {d.checked ? (
            <div>
              <p className={cx('font-bold', right(sel) ? 'text-good' : 'text-bad')}>
                {right(sel) ? 'Correct: ' : `You tagged “${TAG_LABEL[d.tags[sel] ?? ''] ?? 'nothing'}”. Key: `}
                {h.accept.map((a) => TAG_LABEL[a]).join(' or ')}
              </p>
              <p className="mt-1 text-[0.95rem] text-muted">{h.explain}</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {groups.map((g) => (
                <div key={g}>
                  <div className="eyebrow mb-1">{g}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {MEDIA_TAGS.filter((t) => t.group === g).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setD((prev) => ({ ...prev, tags: { ...prev.tags, [sel]: t.id } }));
                          const nextOpen = poster.hotspots.findIndex((_, k) => k !== sel && d.tags[k] === undefined);
                          if (nextOpen !== -1) setSel(nextOpen);
                        }}
                        className={cx('chip font-normal', d.tags[sel] === t.id ? 'border-ink bg-ink font-bold text-surface' : 'hover:border-ink/40')}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-3">
            <button type="button" className="btn btn-sm" onClick={() => setSel((s) => (s - 1 + poster.hotspots.length) % poster.hotspots.length)}>Previous</button>
            <button type="button" className="btn btn-sm" onClick={() => setSel((s) => (s + 1) % poster.hotspots.length)}>Next</button>
            {!d.checked ? (
              <button type="button" className="btn btn-primary btn-sm ml-auto" disabled={tagged < poster.hotspots.length} onClick={() => setD((prev) => ({ ...prev, checked: true }))}>
                Check tags
              </button>
            ) : (
              <span className="ml-auto flex items-center gap-2 text-sm font-bold">Hotspots {hsCorrect}/{poster.hotspots.length}</span>
            )}
          </div>
        </div>

        {d.checked && (
          <div className="card grid gap-5 p-4">
            <h3 className="font-semibold">Audience and message</h3>
            {poster.questions.map((q, i) => (
              <McQuestion
                key={i}
                q={q}
                index={i}
                chosen={d.answers[i]}
                onChoose={(c) => {
                  const answers = { ...d.answers, [i]: c };
                  setD((prev) => ({ ...prev, answers }));
                  if (Object.keys(answers).length === poster.questions.length) {
                    const q2 = poster.questions.filter((qq, k) => answers[k] === qq.answer).length;
                    const score = Math.round(((hsCorrect + q2) / total) * 100);
                    recordToolRun(`hotspot:${poster.id}`, score);
                    toast(`Deconstruction score ${score}%`);
                  }
                }}
              />
            ))}
            {allQ && (
              <Callout tone="good" title={<span className="flex items-center gap-2">Deconstruction complete <ScoreBadge score={pct} /></span>}>
                <div className="mt-1 flex flex-wrap gap-2">
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => requestReflection({ strand: 'D', task: `Ad analysis: ${poster.title}` })}>Reflect</button>
                  <button type="button" className="btn btn-sm" onClick={() => setD({ tags: {}, checked: false, answers: {} })}><RotateCcw size={14} /> Try again</button>
                </div>
              </Callout>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface Pin {
  id: string;
  x: number;
  y: number;
  tag: string;
  note: string;
}

const CUSTOM_IMG = 'hotspot:custom:image';

function CustomAnalyzer() {
  const img = useImage(CUSTOM_IMG);
  const [pins, setPins] = useDraft<Pin[]>('hotspot:custom', []);
  const [meta, setMeta] = useDraft('hotspot:custom:meta', { audience: '', overt: '', implied: '' });
  const [sel, setSel] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  const pin = pins.find((p) => p.id === sel);

  const onFile = async (f?: File) => {
    if (!f) return;
    setBusy(true);
    try {
      await putImage(CUSTOM_IMG, await fileToDataUrl(f, 1400));
      setPins([]);
    } catch {
      toast('That image could not be opened. Try a JPG or PNG.');
    } finally {
      setBusy(false);
    }
  };

  const drop = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    const r = frame.current!.getBoundingClientRect();
    const p: Pin = { id: uid(), x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, tag: '', note: '' };
    setPins((ps) => [...ps, p]);
    setSel(p.id);
  };

  const exportText = () =>
    [
      'AD DECONSTRUCTION',
      `Target audience: ${meta.audience}`,
      `Overt message: ${meta.overt}`,
      `Implied message: ${meta.implied}`,
      '',
      ...pins.map((p, i) => `${i + 1}. ${TAG_LABEL[p.tag] ?? 'Untagged'}: ${p.note}`),
    ].join('\n');

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="min-w-0">
        {img ? (
          <div ref={frame} className="card relative cursor-crosshair overflow-hidden p-0" onClick={drop}>
            <img src={img} alt="Your uploaded ad" className="block w-full" draggable={false} />
            {pins.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSel(p.id)}
                className={cx('num absolute grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-surface text-sm font-bold shadow-lift', p.tag ? 'bg-hlOpinion text-onhl' : 'bg-ink text-surface', sel === p.id && 'scale-125 ring-4 ring-hlOpinion/70')}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                aria-label={`Pin ${i + 1}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        ) : (
          <label htmlFor="ad-upload" className="card grid min-h-[18rem] cursor-pointer place-items-center border-dashed p-6 text-center">
            <span>
              <ImagePlus size={36} className="mx-auto text-muted" />
              <span className="mt-2 block font-bold">{busy ? 'Opening…' : 'Upload an ad, PSA, or social post'}</span>
              <span className="block text-sm text-muted">A screenshot or photo works. It stays on this device.</span>
            </span>
          </label>
        )}
        <input id="ad-upload" type="file" accept="image/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
        {img && (
          <div className="mt-3 flex flex-wrap gap-2">
            <label htmlFor="ad-upload" className="btn btn-sm cursor-pointer"><ImagePlus size={15} /> Replace image</label>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { deleteImage(CUSTOM_IMG); setPins([]); }}><Trash2 size={15} /> Remove</button>
            <span className="self-center text-xs text-muted">Tap the image to drop a pin.</span>
          </div>
        )}
      </div>
      <div className="grid min-w-0 content-start gap-4">
        {pin && (
          <div className="card p-4">
            <h3 className="mb-2 font-semibold">Pin {pins.indexOf(pin) + 1}</h3>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {MEDIA_TAGS.map((t) => (
                <button key={t.id} type="button" onClick={() => setPins((ps) => ps.map((p) => (p.id === pin.id ? { ...p, tag: t.id } : p)))} className={cx('chip font-normal', pin.tag === t.id ? 'border-ink bg-ink font-bold text-surface' : 'hover:border-ink/40')}>
                  {t.label}
                </button>
              ))}
            </div>
            <label htmlFor="pin-note" className="label">What does it do to the viewer?</label>
            <textarea id="pin-note" className="input min-h-[4rem]" value={pin.note} onChange={(e) => setPins((ps) => ps.map((p) => (p.id === pin.id ? { ...p, note: e.target.value } : p)))} placeholder="The low angle makes the athlete look powerful, so..." />
            <button type="button" className="btn btn-ghost btn-sm mt-2" onClick={() => { setPins((ps) => ps.filter((p) => p.id !== pin.id)); setSel(null); }}><Trash2 size={14} /> Delete pin</button>
          </div>
        )}
        <div className="card grid gap-3 p-4">
          {(
            [
              ['audience', 'Target audience (with evidence)'],
              ['overt', 'Overt message'],
              ['implied', 'Implied message'],
            ] as const
          ).map(([k, label]) => (
            <div key={k}>
              <label htmlFor={`meta-${k}`} className="label">{label}</label>
              <textarea id={`meta-${k}`} className="input min-h-[3rem]" value={meta[k]} onChange={(e) => setMeta((m) => ({ ...m, [k]: e.target.value }))} />
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-sm" disabled={!pins.length} onClick={async () => toast((await copyText(exportText())) ? 'Analysis copied' : 'Copy failed. Select the text instead.')}><Copy size={15} /> Copy analysis</button>
            <button type="button" className="btn btn-primary btn-sm" disabled={pins.length < 3} onClick={() => requestReflection({ strand: 'D', task: 'Deconstructing my own ad' })}>Reflect</button>
          </div>
        </div>
      </div>
    </div>
  );
}
