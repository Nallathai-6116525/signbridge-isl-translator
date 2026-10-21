import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { LayoutDashboard, FlaskConical, Boxes, BookOpen, Users, MessageSquareWarning } from 'lucide-react';
import { PageHeader, cx } from '../../components/ui.jsx';
import Overview from './Overview.jsx';
import ModelStudio from './ModelStudio.jsx';
import Models from './Models.jsx';
import Signs from './Signs.jsx';
import UsersAdmin from './Users.jsx';
import FeedbackAdmin from './Feedback.jsx';

const TABS = [
  { to: 'overview', label: 'Overview', icon: LayoutDashboard },
  { to: 'studio', label: 'Model Studio', icon: FlaskConical },
  { to: 'models', label: 'Models', icon: Boxes },
  { to: 'signs', label: 'Signs', icon: BookOpen },
  { to: 'users', label: 'Users', icon: Users },
  { to: 'feedback', label: 'Feedback', icon: MessageSquareWarning },
];

export default function Admin() {
  return (
    <div className="container-x py-10">
      <PageHeader eyebrow="Administration" title="Control centre" subtitle="Monitor usage, train and publish recognition models, and curate the ISL dictionary." />
      <nav className="mb-8 flex gap-1 overflow-x-auto rounded-xl bg-sand-100 p-1" aria-label="Admin sections">
        {TABS.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => cx('flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition', isActive ? 'bg-white text-ink shadow-card' : 'text-ink-mute hover:text-ink')}>
            <Icon className="h-4 w-4" /> {label}
          </NavLink>
        ))}
      </nav>
      <Routes>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<Overview />} />
        <Route path="studio" element={<ModelStudio />} />
        <Route path="models" element={<Models />} />
        <Route path="signs" element={<Signs />} />
        <Route path="users" element={<UsersAdmin />} />
        <Route path="feedback" element={<FeedbackAdmin />} />
        <Route path="*" element={<Navigate to="overview" replace />} />
      </Routes>
    </div>
  );
}
