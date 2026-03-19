import { useNavigate } from 'react-router-dom';

const features = [
  { icon: '📅', color: '#ede9fe', title: 'Event Management', desc: 'Schedule rehearsals, concerts, and special events. Track every detail from venue to attendance in one place.' },
  { icon: '👥', color: '#dbeafe', title: 'Member Profiles', desc: 'Maintain complete member records including voice parts, contact info, and attendance history.' },
  { icon: '✅', color: '#dcfce7', title: 'Attendance Tracking', desc: 'Effortlessly record and analyse attendance patterns to keep your choir performing at its best.' },
  { icon: '💬', color: '#fef3c7', title: 'Announcements', desc: 'Send important messages to all members instantly. Keep everyone informed and in harmony.' },
];

const steps = [
  { n: '1', title: 'Create Your Account', desc: 'Sign up in seconds. Set up your choir profile and invite your conductor or admin team.' },
  { n: '2', title: 'Add Your Members', desc: 'Import or manually add choir members with their voice parts, contact details, and roles.' },
  { n: '3', title: 'Start Managing', desc: 'Schedule events, track attendance, and communicate — all from one elegant dashboard.' },
];

const members = [
  { name: 'Sarah O.', part: 'Soprano', present: true, color: '#818cf8' },
  { name: 'James A.', part: 'Tenor',   present: true, color: '#34d399' },
  { name: 'Amara K.', part: 'Alto',    present: false, color: '#f472b6' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div>
      {/* ── Navbar ── */}
      <nav className="lp-nav">
        <div className="lp-nav-logo">
          <div className="lp-nav-logo-icon">♪</div>
          Choir Scheduler
        </div>
        <div className="lp-nav-links">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#pricing">About</a>
        </div>
        <div className="lp-nav-actions">
          <button className="btn btn-ghost" onClick={() => navigate('/login')}>Sign In</button>
          <button className="btn btn-primary" onClick={() => navigate('/login?tab=register')}>Get Started Free</button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="lp-hero">
        <div className="lp-hero-bg">
          <div className="lp-blob lp-blob-1" />
          <div className="lp-blob lp-blob-2" />
          <div className="lp-blob lp-blob-3" />
        </div>
        <div className="lp-hero-inner">
          <div className="lp-hero-left">
            <div className="lp-hero-badge">
              <div className="lp-badge-dot" />
              Now available — free for all choirs
            </div>
            <h1>
              Harmonise Your<br />
              <span>Choir Management</span>
            </h1>
            <p className="lp-hero-sub">
              The all-in-one platform for choir directors and administrators.
              Manage members, schedule events, and track attendance — beautifully.
            </p>
            <div className="lp-hero-cta">
              <button className="btn btn-gold btn-lg" onClick={() => navigate('/login?tab=register')}>
                Get Started Free
              </button>
              <button className="btn btn-outline-white btn-lg" onClick={() => navigate('/login')}>
                Sign In
              </button>
            </div>
          </div>

          {/* Floating mockup */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div className="lp-mockup">
              <div className="lp-mockup-chrome">
                <div className="lp-mockup-dots">
                  <span /><span /><span />
                </div>
                <span className="lp-mockup-chrome-title">Choir Scheduler Dashboard</span>
              </div>
              <div className="lp-mockup-stat">
                <span className="lp-mockup-stat-label">Active Members</span>
                <span className="lp-mockup-stat-value">48</span>
              </div>
              <div className="lp-mockup-stat">
                <span className="lp-mockup-stat-label">Events This Month</span>
                <span className="lp-mockup-stat-value">6</span>
              </div>
              <div className="lp-mockup-bar-wrap">
                <div className="lp-mockup-bar-label">Attendance Rate — 87%</div>
                <div className="lp-mockup-bar">
                  <div className="lp-mockup-bar-fill" style={{ width: '87%' }} />
                </div>
              </div>
              <div className="lp-mockup-members">
                {members.map((m) => (
                  <div key={m.name} className="lp-mockup-member">
                    <div className="lp-mockup-avatar" style={{ background: m.color }}>{m.name[0]}</div>
                    <div className="lp-mockup-member-info">
                      <div className="lp-mockup-member-name">{m.name}</div>
                      <div className="lp-mockup-member-part">{m.part}</div>
                    </div>
                    <span className={`lp-mockup-pill ${m.present ? 'on' : 'off'}`}>
                      {m.present ? 'Present' : 'Absent'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="lp-features" id="features">
        <div className="lp-section-head">
          <div className="lp-tag">Features</div>
          <h2>Everything your choir needs</h2>
          <p>Purpose-built tools designed specifically for choir directors, administrators, and conductors.</p>
        </div>
        <div className="lp-features-grid">
          {features.map((f) => (
            <div key={f.title} className="lp-feat-card">
              <div className="lp-feat-icon" style={{ background: f.color }}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="lp-how" id="how">
        <div className="lp-section-head">
          <div className="lp-tag">How it works</div>
          <h2>Up and running in minutes</h2>
          <p>No technical expertise required. Get your choir organised in three simple steps.</p>
        </div>
        <div className="lp-how-grid">
          {steps.map((s) => (
            <div key={s.n} className="lp-step">
              <div className="lp-step-num">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="lp-stats-band">
        <div className="lp-stats-grid">
          <div>
            <div className="lp-stat-num">500+</div>
            <div className="lp-stat-lbl">Choirs Managed</div>
          </div>
          <div>
            <div className="lp-stat-num">12k+</div>
            <div className="lp-stat-lbl">Members Tracked</div>
          </div>
          <div>
            <div className="lp-stat-num">98%</div>
            <div className="lp-stat-lbl">Satisfaction Rate</div>
          </div>
          <div>
            <div className="lp-stat-num">24/7</div>
            <div className="lp-stat-lbl">Always Available</div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="lp-cta-section">
        <h2>Ready to harmonise your choir?</h2>
        <p>Join hundreds of choirs already using Choir Scheduler to stay organised and in sync.</p>
        <div className="lp-cta-btns">
          <button className="btn btn-gold btn-lg" onClick={() => navigate('/login?tab=register')}>
            Get Started — It's Free
          </button>
          <button className="btn btn-outline-white btn-lg" onClick={() => navigate('/login')}>
            Sign In
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer-logo">
          <span style={{ fontSize: 20 }}>♪</span>
          Choir Scheduler
        </div>
        <div className="lp-footer-links">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#about">About</a>
        </div>
        <div className="lp-footer-copy">© {new Date().getFullYear()} Choir Scheduler. All rights reserved.</div>
      </footer>
    </div>
  );
}
