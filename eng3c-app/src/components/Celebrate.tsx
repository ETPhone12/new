import { useEffect, useMemo, useRef, useState } from 'react';
import { PartyPopper } from 'lucide-react';
import { shiftSticker, queueStickers, useUi } from '../store/ui';
import { getState, setDraft, useApp } from '../store/store';
import { STICKERS, earnedStickers } from '../lib/stickers';
import { Modal, StickerBadge } from './ui';

const COLORS = ['bg-strandA', 'bg-strandB', 'bg-strandC', 'bg-strandD', 'bg-sun', 'bg-primary', 'bg-pen'];

/** Falling paper confetti. Skipped entirely when the viewer prefers reduced motion. */
export function Confetti() {
  const { confetti } = useUi();
  const [bursts, setBursts] = useState<number[]>([]);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    let reduce = false;
    try {
      reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      /* ignore */
    }
    if (reduce) return;
    setBursts((b) => [...b, confetti]);
    const t = window.setTimeout(() => setBursts((b) => b.filter((x) => x !== confetti)), 2600);
    return () => window.clearTimeout(t);
  }, [confetti]);

  return (
    <>
      {bursts.map((id) => (
        <Burst key={id} seed={id} />
      ))}
    </>
  );
}

function Burst({ seed }: { seed: number }) {
  const pieces = useMemo(() => {
    let x = seed * 9301 + 49297;
    const rand = () => {
      x = (x * 9301 + 49297) % 233280;
      return x / 233280;
    };
    return Array.from({ length: 44 }, (_, i) => ({
      left: rand() * 100,
      delay: rand() * 0.35,
      dur: 1.3 + rand() * 0.9,
      drift: (rand() - 0.5) * 160,
      spin: (rand() > 0.5 ? 1 : -1) * (360 + rand() * 540),
      color: COLORS[i % COLORS.length],
      round: rand() > 0.7,
    }));
  }, [seed]);
  return (
    <div className="pointer-events-none fixed inset-0 z-[70] overflow-hidden" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          className={`confetti-piece ${p.color} ${p.round ? '!h-2.5 !w-2.5 !rounded-full' : ''}`}
          style={{ left: `${p.left}%`, ['--delay' as string]: `${p.delay}s`, ['--dur' as string]: `${p.dur}s`, ['--drift' as string]: `${p.drift}px`, ['--spin' as string]: `${p.spin}deg` }}
        />
      ))}
    </div>
  );
}

const SEEN_KEY = 'stickers:seen';

/** Watches progress and shows a pop-up the first time each sticker is earned. */
export function StickerWatcher() {
  const s = useApp();
  const { stickerQueue } = useUi();
  const earnedIds = earnedStickers(s).map((x) => x.id).join(',');

  useEffect(() => {
    const now = earnedIds ? earnedIds.split(',') : [];
    const seen = getState().drafts[SEEN_KEY] as string[] | undefined;
    if (!seen) {
      // First run with this feature: count what is already earned as seen, without fanfare.
      setDraft(SEEN_KEY, now);
      return;
    }
    const fresh = now.filter((id) => !seen.includes(id));
    if (fresh.length) {
      setDraft(SEEN_KEY, [...seen, ...fresh]);
      queueStickers(fresh);
    }
  }, [earnedIds]);

  const current = STICKERS.find((x) => x.id === stickerQueue[0]);
  if (!current) return null;
  return (
    <Modal
      open
      onClose={shiftSticker}
      title="New sticker!"
      footer={
        <div className="flex justify-end">
          <button type="button" className="btn btn-primary" onClick={shiftSticker} autoFocus>
            {stickerQueue.length > 1 ? 'Next sticker' : 'Awesome'}
          </button>
        </div>
      }
    >
      <div className="grid place-items-center gap-3 py-2 text-center">
        <div className="pop-in">
          <StickerBadge sticker={current} earned size={120} />
        </div>
        <div className="flex items-center gap-2 font-display text-2xl font-extrabold">
          <PartyPopper size={22} className="text-sun" /> {current.title}
        </div>
        <p className="max-w-xs text-muted">{current.how}</p>
      </div>
    </Modal>
  );
}
