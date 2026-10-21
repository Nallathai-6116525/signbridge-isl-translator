import { Camera, CameraOff, Hand, Cpu, Gauge, ShieldCheck } from 'lucide-react';
import { Spinner, cx } from './ui.jsx';

/**
 * Mirrored webcam view with landmark overlay and live status chips.
 * `tracking` is the object returned by useHandTracking().
 */
export default function CameraStage({ tracking, children, overlay, className }) {
  const { videoRef, canvasRef, start, stop, status, error, fps, handsVisible, delegate } = tracking;
  const running = status === 'running';

  return (
    <div className={cx('relative overflow-hidden rounded-2xl bg-ink shadow-lift', className)}>
      <div className="relative aspect-video w-full">
        <video ref={videoRef} className="mirror absolute inset-0 h-full w-full object-cover" playsInline muted aria-label="Your camera preview" />
        <canvas ref={canvasRef} className="mirror pointer-events-none absolute inset-0 h-full w-full object-cover" aria-hidden="true" />

        {!running && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-teal-900 to-ink p-6 text-center text-sand-100">
            {status === 'loading' ? (
              <>
                <Spinner className="h-9 w-9 text-sand-100" />
                <p className="text-sm">Loading hand-tracking model and starting camera…</p>
              </>
            ) : (
              <>
                <div className="rounded-2xl bg-white/10 p-4"><Camera className="h-8 w-8" /></div>
                <div>
                  <p className="font-display text-xl">Camera is off</p>
                  <p className="mt-1 max-w-sm text-sm text-sand-200/80">Video is processed on this device only — nothing is uploaded.</p>
                </div>
                {error && <p className="max-w-md rounded-lg bg-rust-600/20 px-3 py-2 text-sm text-rust-50">{error}</p>}
                <button type="button" className="btn-accent" onClick={start}><Camera className="h-4 w-4" /> Start camera</button>
              </>
            )}
          </div>
        )}

        {running && (
          <>
            <div className="absolute left-3 top-3 flex flex-wrap gap-2">
              <span className={cx('chip backdrop-blur', handsVisible ? 'bg-moss-500/90 text-white' : 'bg-ink/60 text-sand-100')}>
                <Hand className="h-3.5 w-3.5" /> {handsVisible ? `${handsVisible} hand${handsVisible > 1 ? 's' : ''}` : 'No hands'}
              </span>
              <span className="chip bg-ink/60 text-sand-100 backdrop-blur"><Gauge className="h-3.5 w-3.5" /> {fps} FPS</span>
              {delegate && <span className="chip bg-ink/60 text-sand-100 backdrop-blur"><Cpu className="h-3.5 w-3.5" /> {delegate}</span>}
            </div>
            <div className="absolute right-3 top-3 flex gap-2">
              <span className="chip bg-ink/60 text-sand-100 backdrop-blur"><ShieldCheck className="h-3.5 w-3.5" /> On-device</span>
              <button type="button" className="chip bg-white/90 text-ink hover:bg-white" onClick={stop}>
                <CameraOff className="h-3.5 w-3.5" /> Stop
              </button>
            </div>
            {overlay}
          </>
        )}
      </div>
      {children}
    </div>
  );
}
