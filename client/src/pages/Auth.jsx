import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Field, Spinner } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { errMsg } from '../api/client.js';

function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="container-x grid min-h-[calc(100vh-8rem)] items-center gap-10 py-12 lg:grid-cols-2">
      <div className="hidden lg:block">
        <p className="eyebrow">SignBridge</p>
        <h2 className="mt-3 text-5xl font-semibold leading-tight text-ink">Every gesture,<br />understood.</h2>
        <p className="mt-4 max-w-md text-lg text-ink-soft">
          Your account keeps your translation history, learning progress and preferred voice — your camera feed always stays on your device.
        </p>
      </div>
      <div className="card mx-auto w-full max-w-md p-8 animate-rise">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>
        <div className="mt-6">{children}</div>
        <div className="mt-6 text-center text-sm text-ink-soft">{footer}</div>
      </div>
    </div>
  );
}

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`);
      navigate(location.state?.from || (user.role === 'admin' ? '/admin' : '/translate'), { replace: true });
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Sign in" subtitle="Continue translating and learning ISL." footer={<>New here? <Link to="/register" className="font-semibold text-teal-600">Create an account</Link></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Email"><input className="input" type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="Password"><input className="input" type="password" autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
        <button className="btn-primary w-full" disabled={busy}>{busy && <Spinner className="h-4 w-4 text-white" />} Sign in</button>
      </form>
    </AuthShell>
  );
}

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user', preferredLang: 'en' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Enter your name';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) e.password = 'At least 8 characters with a letter and a number';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    try {
      await register(form);
      toast.success('Account created');
      navigate(form.role === 'learner' ? '/learn' : '/translate', { replace: true });
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <AuthShell title="Create your account" subtitle="Free · takes less than a minute." footer={<>Already have an account? <Link to="/login" className="font-semibold text-teal-600">Sign in</Link></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Full name" error={errors.name}><input className="input" autoComplete="name" value={form.name} onChange={set('name')} /></Field>
        <Field label="Email" error={errors.email}><input className="input" type="email" autoComplete="email" value={form.email} onChange={set('email')} /></Field>
        <Field label="Password" error={errors.password} hint="Minimum 8 characters, including a letter and a number">
          <input className="input" type="password" autoComplete="new-password" value={form.password} onChange={set('password')} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="I want to">
            <select className="input" value={form.role} onChange={set('role')}>
              <option value="user">Translate</option>
              <option value="learner">Learn ISL</option>
            </select>
          </Field>
          <Field label="Voice language">
            <select className="input" value={form.preferredLang} onChange={set('preferredLang')}>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="ta">Tamil</option>
            </select>
          </Field>
        </div>
        <button className="btn-primary w-full" disabled={busy}>{busy && <Spinner className="h-4 w-4 text-white" />} Create account</button>
      </form>
    </AuthShell>
  );
}
