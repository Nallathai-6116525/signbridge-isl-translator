import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User as UserIcon, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { cx } from './ui.jsx';

export function Logo({ className = '' }) {
  return (
    <Link to="/" className={cx('flex items-center gap-2.5', className)} aria-label="SignBridge home">
      <img src="/favicon.svg" alt="" className="h-9 w-9" />
      <span className="leading-none">
        <span className="block font-display text-lg font-semibold text-ink">SignBridge</span>
        <span className="block text-[10px] font-semibold uppercase tracking-[.2em] text-ink-mute">ISL Translator</span>
      </span>
    </Link>
  );
}

const links = [
  { to: '/translate', label: 'Translate' },
  { to: '/dictionary', label: 'Dictionary' },
  { to: '/learn', label: 'Learn', auth: true },
  { to: '/history', label: 'History', auth: true },
  { to: '/admin', label: 'Admin', admin: true },
];

export default function Layout() {
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const visible = links.filter((l) => (!l.auth || user) && (!l.admin || isAdmin));

  const navCls = ({ isActive }) =>
    cx('rounded-lg px-3 py-2 text-sm font-semibold transition', isActive ? 'bg-teal-50 text-teal-700' : 'text-ink-soft hover:bg-sand-100 hover:text-ink');

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">Skip to content</a>
      <header className="sticky top-0 z-40 border-b border-sand-200/80 bg-sand-50/85 backdrop-blur">
        <div className="container-x flex h-16 items-center justify-between">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {visible.map((l) => <NavLink key={l.to} to={l.to} className={navCls}>{l.label}</NavLink>)}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <NavLink to="/profile" className="btn-ghost btn-sm">
                  {isAdmin ? <ShieldCheck className="h-4 w-4 text-amber-600" /> : <UserIcon className="h-4 w-4" />} {user.name.split(' ')[0]}
                </NavLink>
                <button type="button" className="btn-outline btn-sm" onClick={() => { logout(); navigate('/'); }}>
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost btn-sm">Sign in</Link>
                <Link to="/register" className="btn-primary btn-sm">Create account</Link>
              </>
            )}
          </div>
          <button type="button" className="btn-ghost btn-sm md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu" aria-expanded={open}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <div className="border-t border-sand-200 bg-sand-50 md:hidden">
            <nav className="container-x flex flex-col gap-1 py-3" onClick={() => setOpen(false)}>
              {visible.map((l) => <NavLink key={l.to} to={l.to} className={navCls}>{l.label}</NavLink>)}
              {user ? (
                <>
                  <NavLink to="/profile" className={navCls}>Profile</NavLink>
                  <button type="button" className="btn-outline mt-2" onClick={() => { logout(); navigate('/'); }}>Sign out</button>
                </>
              ) : (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Link to="/login" className="btn-outline">Sign in</Link>
                  <Link to="/register" className="btn-primary">Create account</Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-sand-200 bg-sand-100/60">
        <div className="container-x flex flex-col gap-3 py-8 text-sm text-ink-mute sm:flex-row sm:items-center sm:justify-between">
          <p>SignBridge — Indian Sign Language translator · Client-side Edge AI on the MERN stack</p>
          <p>Video never leaves your device.</p>
        </div>
      </footer>
    </div>
  );
}
