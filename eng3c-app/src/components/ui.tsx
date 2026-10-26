import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, Check, CheckCircle2, ChevronRight, X, XCircle } from 'lucide-react';
import type { StrandId } from '../types';
import { STRAND_BY_ID, STRAND_STYLE } from '../data/curriculum';
import type { Check as CheckItem } from '../lib/writingChecks';
import { cx } from '../lib/util';
import { navigate } from '../lib/router';

export function PageHeader({
  eyebrow,
  title,
  desc,
  strand,
  actions,
}: {
  eyebrow?: string;
  title: string;
  desc?: ReactNode;
  strand?: StrandId | 'all';
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0 max-w-3xl">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          {strand && strand !== 'all' && <StrandChip id={strand} />}
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        </div>
        <h1 className="text-[1.9rem] font-semibold sm:text-4xl">{title}</h1>
        {desc && <p className="mt-2 text-[1.02rem] text-muted">{desc}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function StrandChip({ id, withName = true, small }: { id: StrandId; withName?: boolean; small?: boolean }) {
  const s = STRAND_STYLE[id];
  return (
    <span className={cx('chip border-transparent', s.soft, s.text, small && '!px-1.5 !py-0 !text-[0.7rem]')} title={STRAND_BY_ID[id].name}>
      <span className={cx('h-2 w-2 rounded-full', s.dot)} aria-hidden />
      {id}
      {withName && <span className="font-normal">{STRAND_BY_ID[id].short}</span>}
    </span>
  );
}

export function ProgressBar({ value, max = 100, tone = 'ink', label }: { value: number; max?: number; tone?: 'ink' | 'good' | 'warn' | 'bad' | 'pen' | StrandId; label?: string }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const color =
    tone === 'ink' ? 'bg-ink' : tone === 'good' ? 'bg-good' : tone === 'warn' ? 'bg-warn' : tone === 'bad' ? 'bg-bad' : tone === 'pen' ? 'bg-pen' : STRAND_STYLE[tone].bg;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-sunken" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className={cx('h-full rounded-full transition-[width] duration-500', color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Segmented<T extends string>({ options, value, onChange, label }: { options: { value: T; label: ReactNode }[]; value: T; onChange: (v: T) => void; label?: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex max-w-full flex-wrap rounded-lg border border-line bg-sunken p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          onClick={() => onChange(o.value)}
          className={cx(
            'min-h-[2.1rem] rounded-md px-3 text-sm font-bold transition-colors',
            o.value === value ? 'bg-surface text-ink shadow-lift' : 'text-muted hover:text-ink',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean; footer?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center"
      style={{ padding: 'env(safe-area-inset-top, 0px) max(12px, env(safe-area-inset-right, 0px)) env(safe-area-inset-bottom, 0px) max(12px, env(safe-area-inset-left, 0px))' }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cx('fade-in card my-3 flex max-h-[calc(100%-24px)] w-full flex-col overflow-hidden shadow-lift outline-none', wide ? 'max-w-3xl' : 'max-w-lg')}
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="border-t border-line px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

/** A destructive action that asks for a second tap in place (no browser dialogs). */
export function ConfirmButton({ label, confirmLabel = 'Tap again to confirm', onConfirm, className, icon }: { label: ReactNode; confirmLabel?: string; onConfirm: () => void; className?: string; icon?: ReactNode }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = window.setTimeout(() => setArmed(false), 3500);
    return () => window.clearTimeout(t);
  }, [armed]);
  return (
    <button
      type="button"
      className={cx('btn', armed ? 'btn-pen' : '', className)}
      onClick={() => {
        if (armed) {
          setArmed(false);
          onConfirm();
        } else setArmed(true);
      }}
    >
      {icon}
      {armed ? confirmLabel : label}
    </button>
  );
}

export function CheckList({ checks, compact }: { checks: CheckItem[]; compact?: boolean }) {
  return (
    <ul className={cx('grid', compact ? 'gap-1' : 'gap-1.5')}>
      {checks.map((c) => (
        <li key={c.id} className="flex items-start gap-2 text-[0.92rem] leading-snug">
          {c.level === 'pass' ? (
            <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-good" aria-label="Pass" />
          ) : c.level === 'warn' ? (
            <AlertTriangle size={17} className="mt-0.5 shrink-0 text-warn" aria-label="Warning" />
          ) : (
            <XCircle size={17} className="mt-0.5 shrink-0 text-bad" aria-label="Needs fixing" />
          )}
          <span className="min-w-0">
            <span className={cx(c.level === 'pass' && 'text-muted')}>{c.label}</span>
            {c.tip && c.level !== 'pass' && <span className="block text-[0.82rem] text-muted">{c.tip}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function Stat({ label, value, sub, tone }: { label: string; value: ReactNode; sub?: ReactNode; tone?: 'good' | 'warn' | 'bad' }) {
  return (
    <div className="min-w-0">
      <div className="eyebrow">{label}</div>
      <div className={cx('num font-display text-3xl font-semibold leading-tight', tone === 'good' && 'text-good', tone === 'warn' && 'text-warn', tone === 'bad' && 'text-bad')}>{value}</div>
      {sub && <div className="text-sm text-muted">{sub}</div>}
    </div>
  );
}

export function ScoreBadge({ score, suffix = '%' }: { score: number; suffix?: string }) {
  const tone = score >= 80 ? 'bg-good/15 text-good' : score >= 60 ? 'bg-warn/15 text-warn' : 'bg-bad/15 text-bad';
  return <span className={cx('chip num border-transparent', tone)}>{Math.round(score)}{suffix}</span>;
}

export function Section({ title, children, aside, className }: { title: ReactNode; children: ReactNode; aside?: ReactNode; className?: string }) {
  return (
    <section className={cx('mb-8', className)}>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function LinkRow({ title, sub, onClick, right, leading }: { title: ReactNode; sub?: ReactNode; onClick: () => void; right?: ReactNode; leading?: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-sunken">
      {leading}
      <span className="min-w-0 flex-1">
        <span className="block font-bold">{title}</span>
        {sub && <span className="block text-sm text-muted">{sub}</span>}
      </span>
      {right}
      <ChevronRight size={18} className="shrink-0 text-muted" />
    </button>
  );
}

export function ToolLink({ tool, param, children, className }: { tool: string; param?: string; children: ReactNode; className?: string }) {
  return (
    <button type="button" className={cx('btn', className)} onClick={() => navigate(tool, param)}>
      {children}
    </button>
  );
}

export function Pill({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <span className={cx('chip border-transparent', ok ? 'bg-good/15 text-good' : 'bg-sunken text-muted')}>
      {ok && <Check size={13} />}
      {children}
    </span>
  );
}

export function Callout({ tone = 'info', title, children }: { tone?: 'info' | 'warn' | 'good'; title?: ReactNode; children: ReactNode }) {
  const cls = tone === 'warn' ? 'border-warn/40 bg-warn/10' : tone === 'good' ? 'border-good/40 bg-good/10' : 'border-strandB/30 bg-strandB/5';
  return (
    <div className={cx('rounded-card border px-4 py-3 text-[0.95rem]', cls)}>
      {title && <div className="mb-0.5 font-bold">{title}</div>}
      {children}
    </div>
  );
}
