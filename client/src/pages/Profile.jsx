import { useState } from 'react';
import toast from 'react-hot-toast';
import { Volume2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useSpeech } from '../hooks/useSpeech.js';
import { errMsg } from '../api/client.js';
import { Badge, Field, PageHeader, Spinner } from '../components/ui.jsx';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: user.name, preferredLang: user.preferredLang });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [busy, setBusy] = useState('');
  const { speak, supported } = useSpeech(form.preferredLang);

  const save = async (e) => {
    e.preventDefault();
    setBusy('profile');
    try { await updateProfile(form); toast.success('Profile updated'); } catch (err) { toast.error(errMsg(err)); } finally { setBusy(''); }
  };
  const changePw = async (e) => {
    e.preventDefault();
    setBusy('pw');
    try { await updateProfile(pw); toast.success('Password changed'); setPw({ currentPassword: '', newPassword: '' }); } catch (err) { toast.error(errMsg(err)); } finally { setBusy(''); }
  };

  return (
    <div className="container-x max-w-3xl py-10">
      <PageHeader eyebrow="Account" title="Your profile" actions={<Badge tone={user.role === 'admin' ? 'amber' : 'teal'} className="capitalize">{user.role}</Badge>} />
      <form onSubmit={save} className="card space-y-4 p-6">
        <h2 className="text-lg font-semibold">Details</h2>
        <Field label="Name"><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Email"><input className="input bg-sand-50" value={user.email} disabled /></Field>
        <Field label="Voice language" hint="Used by text-to-speech when a matching voice is installed on your device.">
          <div className="flex gap-2">
            <select className="input" value={form.preferredLang} onChange={(e) => setForm({ ...form, preferredLang: e.target.value })}>
              <option value="en">English</option><option value="hi">Hindi</option><option value="ta">Tamil</option>
            </select>
            <button type="button" className="btn-outline" disabled={!supported} onClick={() => speak('Hello, welcome to SignBridge')}><Volume2 className="h-4 w-4" /> Test</button>
          </div>
        </Field>
        <button className="btn-primary" disabled={busy === 'profile'}>{busy === 'profile' && <Spinner className="h-4 w-4 text-white" />} Save changes</button>
      </form>
      <form onSubmit={changePw} className="card mt-6 space-y-4 p-6">
        <h2 className="text-lg font-semibold">Change password</h2>
        <Field label="Current password"><input className="input" type="password" autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /></Field>
        <Field label="New password" hint="Minimum 8 characters, including a letter and a number"><input className="input" type="password" autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /></Field>
        <button className="btn-outline" disabled={busy === 'pw' || !pw.currentPassword || !pw.newPassword}>Update password</button>
      </form>
    </div>
  );
}
