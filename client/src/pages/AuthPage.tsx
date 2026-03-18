import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api';

export default function AuthPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
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
    setMessage({ text: 'Signing in...', error: false });
    try {
      const data = await apiFetch('/api/v1/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      login(data);
      setMessage({ text: 'Welcome! Redirecting...', error: false });
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
    setMessage({ text: 'Creating account...', error: false });
    try {
      const data = await apiFetch('/api/v1/users/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      login(data);
      setMessage({ text: 'Account created! Redirecting...', error: false });
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (err: unknown) {
      setMessage({ text: err instanceof Error ? err.message : 'Registration failed', error: true });
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="logo">
          <h1>Choir Scheduler</h1>
          <p>Manage Your Choir with Ease</p>
        </div>

        {message && (
          <div className={`message ${message.error ? 'error' : 'success'}`}>
            {message.text}
          </div>
        )}

        <div className="tabs">
          <button
            className={`tab-btn ${tab === 'login' ? 'active' : ''}`}
            onClick={() => setTab('login')}
          >
            Sign In
          </button>
          <button
            className={`tab-btn ${tab === 'register' ? 'active' : ''}`}
            onClick={() => setTab('register')}
          >
            Sign Up
          </button>
        </div>

        {tab === 'login' && (
          <form onSubmit={handleLogin} className="form-section">
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" placeholder="your@email.com" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" placeholder="Enter your password" required />
            </div>
            <div className="buttons">
              <button type="submit" className="btn-primary">Sign In</button>
            </div>
          </form>
        )}

        {tab === 'register' && (
          <form onSubmit={handleRegister} className="form-section">
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
              <input type="password" name="password" placeholder="Create a strong password" required />
            </div>
            <div className="buttons">
              <button type="submit" className="btn-primary">Create Account</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
