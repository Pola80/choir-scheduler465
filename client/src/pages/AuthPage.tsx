import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<'login' | 'register'>(
    searchParams.get('tab') === 'register' ? 'register' : 'login'
  );
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    setMessage({ text: 'Signing in…', error: false });
    try {
      const data = await apiFetch('/api/v1/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      login(data);
      setMessage({ text: 'Welcome back! Redirecting…', error: false });
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (err: unknown) {
      setMessage({ text: err instanceof Error ? err.message : 'Login failed', error: true });
    }
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    if (password.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters', error: true });
      return;
    }
    setMessage({ text: 'Creating your account…', error: false });
    try {
      const data = await apiFetch('/api/v1/users/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      login(data);
      setMessage({ text: 'Account created! Redirecting…', error: false });
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (err: unknown) {
      setMessage({ text: err instanceof Error ? err.message : 'Registration failed', error: true });
    }
  }

  return (
    <div className="auth-page">
      {/* ── Brand panel ── */}
      <div className="auth-brand">
        <div className="auth-brand-blob auth-brand-blob-1" />
        <div className="auth-brand-blob auth-brand-blob-2" />

        <div className="auth-brand-logo">
          <div className="auth-brand-logo-icon">♪</div>
          Choir Scheduler
        </div>

        <div className="auth-brand-body">
          <h2>Your choir's<br /><span>digital home</span></h2>
          <p>Everything you need to manage your choir in one beautiful, easy-to-use platform.</p>
          <div className="auth-brand-feats">
            <div className="auth-brand-feat"><div className="auth-brand-feat-icon">📅</div> Event scheduling &amp; management</div>
            <div className="auth-brand-feat"><div className="auth-brand-feat-icon">👥</div> Member profiles &amp; voice parts</div>
            <div className="auth-brand-feat"><div className="auth-brand-feat-icon">✅</div> Attendance tracking</div>
            <div className="auth-brand-feat"><div className="auth-brand-feat-icon">💬</div> Choir announcements</div>
          </div>
        </div>

        <div className="auth-brand-bottom">© {new Date().getFullYear()} Choir Scheduler</div>
      </div>

      {/* ── Form panel ── */}
      <div className="auth-form-side">
        <div className="auth-form-wrap">
          <button className="auth-back btn btn-ghost btn-sm" onClick={() => navigate('/')}>
            ← Back to home
          </button>

          <div className="auth-form-head">
            <h1>{tab === 'login' ? 'Welcome back' : 'Create account'}</h1>
            <p>{tab === 'login' ? 'Sign in to your choir dashboard' : 'Get started — it\'s free'}</p>
          </div>

          <div className="auth-tabs">
            <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setMessage(null); }}>Sign In</button>
            <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setMessage(null); }}>Sign Up</button>
          </div>

          {message && (
            <div className={`alert ${message.error ? 'alert-error' : 'alert-success'}`} style={{ marginBottom: 16 }}>
              {message.text}
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" name="email" placeholder="your@email.com" required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" name="password" placeholder="Enter your password" required />
              </div>
              <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 4 }}>Sign In</button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="auth-form">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="name" placeholder="Your full name" required />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" name="email" placeholder="your@email.com" required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" name="password" placeholder="Min. 6 characters" required />
              </div>
              <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 4 }}>Create Account</button>
            </form>
          )}

          <div className="auth-switch">
            {tab === 'login'
              ? <>Don't have an account? <button onClick={() => { setTab('register'); setMessage(null); }}>Sign up</button></>
              : <>Already have an account? <button onClick={() => { setTab('login'); setMessage(null); }}>Sign in</button></>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
