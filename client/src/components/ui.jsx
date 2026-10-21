import { useEffect } from 'react';
import { Loader2, X } from 'lucide-react';

export const cx = (...c) => c.filter(Boolean).join(' ');

export function Spinner({ className = 'h-5 w-5' }) {
  return <Loader2 className={cx('animate-spin text-teal-600', className)} aria-hidden="true" />;
}

export function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-ink-mute" role="status">
      <Spinner className="h-8 w-8" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="animate-rise">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="text-3xl font-semibold text-ink sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-ink-soft">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

const TONES = {
  teal: 'bg-teal-50 text-teal-700',
  amber: 'bg-amber-50 text-amber-700',
  moss: 'bg-moss-50 text-moss-600',
  rust: 'bg-rust-50 text-rust-600',
  sand: 'bg-sand-100 text-ink-soft',
  dark: 'bg-ink text-sand-50',
};
export function Badge({ tone = 'sand', children, className }) {
  return <span className={cx('chip', TONES[tone], className)}>{children}</span>;
}

export function StatCard({ icon: Icon, label, value, hint, tone = 'teal' }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-mute">{label}</span>
        {Icon && <span className={cx('rounded-lg p-2', TONES[tone])}><Icon className="h-4 w-4" /></span>}
      </div>
      <div className="mt-3 font-display text-3xl font-semibold text-ink">{value}</div>
      {hint && <div className="mt-1 text-xs text-ink-mute">{hint}</div>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      {Icon && <div className="mb-4 rounded-2xl bg-sand-100 p-4 text-ink-mute"><Icon className="h-7 w-7" /></div>}
      <h3 className="text-xl font-semibold">{title}</h3>
      {children && <p className="mt-2 max-w-md text-sm text-ink-soft">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ConfidenceBar({ value = 0, threshold, neutral = false }) {
  const pct = Math.round(value * 100);
  const tone = neutral ? 'bg-teal-600' : value >= (threshold ?? 0.8) ? 'bg-moss-500' : value >= 0.5 ? 'bg-amber-500' : 'bg-rust-500';
  return (
    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-sand-200" role="meter" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Confidence">
      <div className={cx('h-full rounded-full transition-[width] duration-150', tone)} style={{ width: `${pct}%` }} />
      {threshold !== undefined && <div className="absolute top-0 h-full w-0.5 bg-ink/50" style={{ left: `${threshold * 100}%` }} />}
    </div>
  );
}

export function Modal({ open, onClose, title, children, footer, size = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 backdrop-blur-sm sm:items-center" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className={cx('card w-full animate-pop', size)} onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-sand-200 px-6 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button type="button" className="btn-ghost btn-sm" onClick={onClose} aria-label="Close"><X className="h-4 w-4" /></button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-sand-200 px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

export function Field({ label, error, children, hint }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-ink-mute">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-rust-600">{error}</span>}
    </label>
  );
}

export function Pagination({ meta, onPage }) {
  if (!meta || meta.pages <= 1) return null;
  return (
    <div className="mt-6 flex items-center justify-between text-sm text-ink-soft">
      <span>Page {meta.page} of {meta.pages} · {meta.total} records</span>
      <div className="flex gap-2">
        <button type="button" className="btn-outline btn-sm" disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)}>Previous</button>
        <button type="button" className="btn-outline btn-sm" disabled={meta.page >= meta.pages} onClick={() => onPage(meta.page + 1)}>Next</button>
      </div>
    </div>
  );
}

export const pct = (v, d = 0) => `${((v || 0) * 100).toFixed(d)}%`;
export const fmtDate = (d) => new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
