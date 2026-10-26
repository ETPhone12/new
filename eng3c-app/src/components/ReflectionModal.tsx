import { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';
import type { StrandId } from '../types';
import { closeReflection, toast, useUi } from '../store/ui';
import { addReflection } from '../store/store';
import { STRAND_BY_ID } from '../data/curriculum';
import { Modal, StrandChip } from './ui';
import { cx } from '../lib/util';

export const STRATEGIES: Record<StrandId, { worked: string[]; tripped: string[] }> = {
  A: {
    worked: ['Previewing the topic before listening', 'Cornell notes', 'Listening for signposts', 'Rehearsing out loud', 'Marking pauses in my script', 'Recording and replaying myself'],
    tripped: ['Lost focus partway through', 'Missed the main idea', 'Spoke too fast', 'Too many filler words', 'Nerves', 'Ran over time'],
  },
  B: {
    worked: ['Reading the questions first', 'Highlighting by function', 'Using context clues', 'Checking the source', 'Rereading tricky parts', 'Summarizing each paragraph'],
    tripped: ['Unfamiliar vocabulary', 'Sentences that mix fact and opinion', 'Reading the graphic too fast', 'Missing the implied meaning', 'Losing track of the main idea'],
  },
  C: {
    worked: ['Outlining first', 'PPE structure', 'Reading my draft aloud', 'Running the linter', 'Using signal phrases', 'Cutting wordy phrases'],
    tripped: ['Getting started', 'Explaining evidence instead of summarizing', 'Comma splices and run-ons', 'Citations', 'Passive voice', 'Running out of time'],
  },
  D: {
    worked: ['Asking who made it and why', 'Naming camera angles', 'Separating overt and implied messages', 'Lateral reading', 'Planning a shot list', 'Writing tight captions'],
    tripped: ['Spotting implied messages', 'Naming techniques', 'Identifying the audience', 'Composing my own shots', 'Keeping captions short'],
  },
};

const SECONDS = 60;

export default function ReflectionModal() {
  const { reflection } = useUi();
  const open = reflection !== null;
  const [strand, setStrand] = useState<StrandId>('C');
  const [worked, setWorked] = useState('');
  const [tripped, setTripped] = useState('');
  const [adjust, setAdjust] = useState('');
  const [left, setLeft] = useState(SECONDS);
  const [startedAt, setStartedAt] = useState(0);

  useEffect(() => {
    if (!reflection) return;
    setStrand(reflection.strand);
    setWorked('');
    setTripped('');
    setAdjust('');
    setLeft(SECONDS);
    setStartedAt(Date.now());
  }, [reflection]);

  useEffect(() => {
    if (!open) return;
    const t = window.setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(t);
  }, [open]);

  if (!reflection) return null;
  const s = STRATEGIES[strand];
  const code = STRAND_BY_ID[strand].reflection;
  const adjustOk = adjust.trim().split(/\s+/).length >= 4;
  const canSave = worked.trim() && tripped.trim() && adjustOk;

  const save = () => {
    addReflection({
      strand,
      task: reflection.task,
      worked: worked.trim(),
      trippedUp: tripped.trim(),
      adjustment: adjust.trim(),
      seconds: Math.round((Date.now() - startedAt) / 1000),
    });
    toast(`Reflection saved to ${code}`);
    const done = reflection.onDone;
    closeReflection();
    done?.();
  };

  const skip = () => {
    const done = reflection.onDone;
    closeReflection();
    done?.();
  };

  return (
    <Modal
      open={open}
      onClose={skip}
      title="60-second reflection"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button type="button" className="btn btn-ghost" onClick={skip}>
            Skip for now
          </button>
          <button type="button" className="btn btn-primary" disabled={!canSave} onClick={save}>
            Save reflection
          </button>
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="eyebrow">Just finished</div>
          <div className="font-bold">{reflection.task}</div>
        </div>
        <div className={cx('chip num gap-1.5 border-transparent', left > 0 ? 'bg-sunken' : 'bg-warn/15 text-warn')} aria-live="polite">
          <Timer size={14} />
          {left > 0 ? `0:${String(left).padStart(2, '0')}` : 'Time! Wrap it up'}
        </div>
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted">Counts toward</span>
        {(['A', 'B', 'C', 'D'] as StrandId[]).map((id) => (
          <button key={id} type="button" onClick={() => setStrand(id)} className={cx('rounded-full', strand === id ? 'ring-2 ring-ink ring-offset-1 ring-offset-surface' : 'opacity-60')}>
            <StrandChip id={id} withName={false} small />
          </button>
        ))}
        <span className="font-bold">{code}</span>
      </div>

      <ChipField id="refl-worked" label="1. Which strategy worked best?" value={worked} onChange={setWorked} options={s.worked} />
      <ChipField id="refl-tripped" label="2. What tripped me up?" value={tripped} onChange={setTripped} options={s.tripped} />
      <div className="mt-4">
        <label htmlFor="refl-adjust" className="label">3. One concrete adjustment for next time</label>
        <input id="refl-adjust" className="input" value={adjust} onChange={(e) => setAdjust(e.target.value)} placeholder="Next time I will outline my three points before I start the draft." />
        <p className={cx('mt-1 text-[0.82rem]', adjustOk || !adjust ? 'text-muted' : 'text-warn')}>
          Make it specific and doable: start with "Next time I will..."
        </p>
      </div>
    </Modal>
  );
}

function ChipField({ id, label, value, onChange, options }: { id: string; label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="mt-3">
      <label htmlFor={id} className="label">{label}</label>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button key={o} type="button" onClick={() => onChange(o)} className={cx('chip font-normal', value === o ? 'border-ink bg-ink text-surface' : 'hover:border-ink/40')}>
            {o}
          </button>
        ))}
      </div>
      <input id={id} className="input" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Tap one above or write your own" />
    </div>
  );
}
