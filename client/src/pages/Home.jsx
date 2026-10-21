import { Link } from 'react-router-dom';
import { ArrowRight, Camera, Cpu, Volume2, ShieldCheck, Zap, BookOpen, Hand } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

// Stylised 21-point hand skeleton for the hero illustration
const PTS = [
  [120, 250], [92, 228], [74, 196], [62, 168], [50, 142], [104, 160], [100, 116], [98, 88], [96, 62],
  [126, 156], [128, 106], [130, 72], [131, 44], [146, 162], [154, 118], [158, 88], [161, 62],
  [164, 174], [178, 140], [186, 116], [192, 94],
];
const BONES = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11], [11, 12], [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [0, 17], [17, 18], [18, 19], [19, 20]];

function HandGraphic() {
  return (
    <svg viewBox="20 20 200 250" className="h-full w-full" role="img" aria-label="Illustration of 21 hand landmarks">
      {BONES.map(([a, b]) => (
        <line key={`${a}-${b}`} x1={PTS[a][0]} y1={PTS[a][1]} x2={PTS[b][0]} y2={PTS[b][1]} stroke="#2A9CA6" strokeWidth="3.5" strokeLinecap="round" />
      ))}
      {PTS.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === 0 ? 7 : 5} fill="#FBF8F3" stroke={i === 0 ? '#C98A3A' : '#2A9CA6'} strokeWidth="2.5" />
      ))}
    </svg>
  );
}

const STEPS = [
  { icon: Camera, title: 'Capture', text: 'Your webcam feed is read by the browser at up to 30 frames per second.' },
  { icon: Hand, title: 'Track', text: 'MediaPipe finds 21 3D landmarks on each hand — no gloves, no sensors.' },
  { icon: Cpu, title: 'Classify', text: 'A TensorFlow.js neural network turns the normalised landmarks into an ISL sign.' },
  { icon: Volume2, title: 'Speak', text: 'The sign appears as live captions and is spoken aloud with the Web Speech API.' },
];

const PILLARS = [
  { icon: ShieldCheck, title: 'Private by design', text: 'Video never leaves your device. Only the recognised text is saved — and only if you sign in.' },
  { icon: Zap, title: 'Real-time, zero GPU servers', text: 'Inference runs on WebGL in your browser, so there is no streaming lag and no cloud bill.' },
  { icon: BookOpen, title: 'Learn as you go', text: 'Practise signs with instant feedback and track your mastery across the ISL dictionary.' },
];

export default function Home() {
  const { user } = useAuth();
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-teal-100/60 blur-3xl" />
        <div className="container-x relative grid items-center gap-12 py-16 lg:grid-cols-[1.15fr_.85fr] lg:py-24">
          <div className="animate-rise">
            <p className="eyebrow">Indian Sign Language · Real-time</p>
            <h1 className="mt-4 text-5xl font-semibold leading-[1.05] text-ink sm:text-6xl">
              Speak with your hands.<br /><span className="text-teal-600">Be heard instantly.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-soft">
              SignBridge translates ISL gestures into text and speech right inside your browser — bridging conversations between
              Deaf and hearing people without special hardware.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/translate" className="btn-primary px-6 py-3 text-base">Start translating <ArrowRight className="h-4 w-4" /></Link>
              <Link to={user ? '/learn' : '/register'} className="btn-outline px-6 py-3 text-base">{user ? 'Continue learning' : 'Learn ISL free'}</Link>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6">
              {[['21×2', '3D landmarks'], ['30+', 'frames / sec'], ['0', 'videos uploaded']].map(([v, l]) => (
                <div key={l}>
                  <dt className="font-display text-3xl font-semibold text-ink">{v}</dt>
                  <dd className="text-xs font-semibold uppercase tracking-wide text-ink-mute">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm">
            <div className="absolute inset-0 rotate-3 rounded-[2rem] bg-amber-100" />
            <div className="absolute inset-0 overflow-hidden rounded-[2rem] bg-gradient-to-br from-teal-900 to-ink p-8 shadow-lift">
              <div className="h-[calc(100%-6.5rem)]"><HandGraphic /></div>
              <div className="absolute inset-x-6 bottom-6 rounded-2xl bg-white/95 p-4 shadow-card">
                <div className="flex items-center justify-between">
                  <span className="font-display text-2xl font-semibold">Hello</span>
                  <span className="chip bg-moss-50 text-moss-600">96%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-sand-200"><div className="h-full w-[96%] rounded-full bg-moss-500" /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-sand-200 bg-white/60">
        <div className="container-x py-16">
          <p className="eyebrow">How it works</p>
          <h2 className="mt-2 text-3xl font-semibold">From gesture to voice in four on-device steps</h2>
          <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="card relative p-6">
                <span className="absolute right-5 top-5 font-display text-4xl font-semibold text-sand-200">{i + 1}</span>
                <div className="inline-flex rounded-xl bg-teal-50 p-3 text-teal-600"><Icon className="h-5 w-5" /></div>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-ink-soft">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-x grid gap-6 py-16 md:grid-cols-3">
        {PILLARS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="p-2">
            <Icon className="h-6 w-6 text-amber-600" />
            <h3 className="mt-3 text-xl font-semibold">{title}</h3>
            <p className="mt-2 text-ink-soft">{text}</p>
          </div>
        ))}
      </section>
    </>
  );
}
