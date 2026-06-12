import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

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
  { name: 'Sarah O.', part: 'Soprano', present: true,  color: '#818cf8' },
  { name: 'James A.', part: 'Tenor',   present: true,  color: '#34d399' },
  { name: 'Amara K.', part: 'Alto',    present: false, color: '#f472b6' },
];

interface ChoirProfile {
  name: string;
  founded: string;
  style: string;
  mission: string;
  verse: string;
  members: string;
  location: string;
  builtBy: string;
}

const defaultProfile: ChoirProfile = {
  name: '', founded: '', style: '', mission: '',
  verse: '', members: '', location: '', builtBy: '',
};

function AboutSection() {
  const [tab, setTab] = useState<'setup' | 'preview' | 'reply'>('setup');
  const [profile, setProfile] = useState<ChoirProfile>(defaultProfile);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('choirProfile');
      if (saved) setProfile(JSON.parse(saved));
    } catch { /* empty */ }
  }, []);

  function handleChange(field: keyof ChoirProfile, value: string) {
    const updated = { ...profile, [field]: value };
    setProfile(updated);
    localStorage.setItem('choirProfile', JSON.stringify(updated));
  }

  const replyText = `Hi there 👋

Here's our choir profile:

🎵 Choir Name: ${profile.name || '—'}
📍 Location: ${profile.location || '—'}
📅 Founded: ${profile.founded || '—'}
🎼 Style: ${profile.style || '—'}
👥 Members: ${profile.members || '—'}

🌟 Mission:
${profile.mission || '—'}

${profile.verse ? `📖 Our Verse:\n"${profile.verse}"\n` : ''}
🛠 App built by: ${profile.builtBy || '—'}

Managed with Choir Scheduler — https://choir-scheduler-sc4ku4ttcq-uc.a.run.app`;

  function copyReply() {
    navigator.clipboard.writeText(replyText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const filled = profile.name || profile.location || profile.mission;

  // shared tab button style
  function tabStyle(active: boolean): React.CSSProperties {
    return {
      padding: '8px 22px', borderRadius: 8, border: 'none', cursor: 'pointer',
      fontWeight: 600, fontSize: 14, transition: 'all 0.15s',
      background: active ? '#7c3aed' : 'transparent',
      color: active ? '#fff' : '#6b7280',
    };
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: '1px solid #e5e7eb', fontSize: 14, outline: 'none',
    background: '#fafafa', boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontWeight: 600, fontSize: 13,
    color: '#374151', marginBottom: 5,
  };

  return (
    <section style={{ padding: '80px 20px', background: '#f9fafb' }} id="about">
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-block', background: '#ede9fe', color: '#7c3aed',
            borderRadius: 20, padding: '4px 16px', fontSize: 13, fontWeight: 700,
            marginBottom: 14,
          }}>About</div>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#111827', margin: '0 0 12px' }}>
            Your Choir Profile
          </h2>
          <p style={{ color: '#6b7280', fontSize: 16, maxWidth: 520, margin: '0 auto' }}>
            Fill in your choir's details to generate a personalised profile card and ready-to-send introduction — works for any choir.
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)', overflow: 'hidden',
        }}>
          {/* Tabs */}
          <div style={{
            display: 'flex', gap: 4, padding: '16px 20px',
            borderBottom: '1px solid #e5e7eb', background: '#f9fafb',
          }}>
            <button style={tabStyle(tab === 'setup')}   onClick={() => setTab('setup')}>Setup</button>
            <button style={tabStyle(tab === 'preview')} onClick={() => setTab('preview')}>Preview</button>
            <button style={tabStyle(tab === 'reply')}   onClick={() => setTab('reply')}>Reply</button>
          </div>

          <div style={{ padding: '28px 28px 32px' }}>

            {/* ── Setup Tab ── */}
            {tab === 'setup' && (
              <div>
                <p style={{ color: '#6b7280', fontSize: 14, marginTop: 0, marginBottom: 24 }}>
                  Fill in your choir's details. Everything is saved automatically in your browser.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 24px' }}>
                  {[
                    { field: 'name',     label: 'Choir Name',    placeholder: 'e.g. Grace Community Choir' },
                    { field: 'founded',  label: 'Founded Year',  placeholder: 'e.g. 2005' },
                    { field: 'style',    label: 'Choir Style',   placeholder: 'e.g. Gospel, Classical, Contemporary' },
                    { field: 'location', label: 'Location',      placeholder: 'e.g. Lagos, Nigeria' },
                    { field: 'members',  label: 'No. of Members',placeholder: 'e.g. 45' },
                    { field: 'builtBy',  label: 'App Built By',  placeholder: 'Your name or organisation' },
                  ].map(({ field, label, placeholder }) => (
                    <div key={field}>
                      <label style={labelStyle}>{label}</label>
                      <input
                        style={inputStyle}
                        placeholder={placeholder}
                        value={profile[field as keyof ChoirProfile]}
                        onChange={(e) => handleChange(field as keyof ChoirProfile, e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 18 }}>
                  <label style={labelStyle}>Mission Statement</label>
                  <textarea
                    style={{ ...inputStyle, resize: 'vertical' }}
                    rows={3}
                    placeholder="What is your choir's purpose and vision?"
                    value={profile.mission}
                    onChange={(e) => handleChange('mission', e.target.value)}
                  />
                </div>

                <div style={{ marginTop: 18 }}>
                  <label style={labelStyle}>Bible Verse / Motto <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span></label>
                  <input
                    style={inputStyle}
                    placeholder='e.g. "Sing to the LORD a new song" — Psalm 96:1'
                    value={profile.verse}
                    onChange={(e) => handleChange('verse', e.target.value)}
                  />
                </div>

                <button
                  onClick={() => setTab('preview')}
                  style={{
                    marginTop: 28, background: '#7c3aed', color: '#fff', border: 'none',
                    borderRadius: 10, padding: '11px 28px', fontWeight: 700, fontSize: 15,
                    cursor: 'pointer',
                  }}
                >
                  Preview Profile →
                </button>
              </div>
            )}

            {/* ── Preview Tab ── */}
            {tab === 'preview' && (
              <div>
                {!filled ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🎵</div>
                    <p>Fill in your details in the Setup tab to see your profile here.</p>
                    <button onClick={() => setTab('setup')} style={{ marginTop: 8, background: 'none', border: 'none', color: '#7c3aed', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Go to Setup →</button>
                  </div>
                ) : (
                  <div>
                    {/* Profile card */}
                    <div style={{
                      background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                      borderRadius: 14, padding: '28px 28px 24px', color: '#fff', marginBottom: 20,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                        <div style={{
                          width: 56, height: 56, borderRadius: '50%',
                          background: 'rgba(255,255,255,0.2)', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', fontSize: 26,
                        }}>♪</div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 22 }}>{profile.name || 'Your Choir'}</div>
                          <div style={{ opacity: 0.8, fontSize: 14 }}>{profile.location}{profile.location && profile.founded ? ' · ' : ''}{profile.founded ? `Est. ${profile.founded}` : ''}</div>
                        </div>
                      </div>
                      {profile.verse && (
                        <div style={{
                          background: 'rgba(255,255,255,0.12)', borderRadius: 10,
                          padding: '10px 14px', fontSize: 13, fontStyle: 'italic',
                          marginBottom: 16, lineHeight: 1.5,
                        }}>
                          "{profile.verse}"
                        </div>
                      )}
                      {profile.mission && (
                        <p style={{ margin: 0, fontSize: 14, opacity: 0.9, lineHeight: 1.6 }}>{profile.mission}</p>
                      )}
                    </div>

                    {/* Stats row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                      {[
                        { icon: '👥', label: 'Members',   value: profile.members  || '—' },
                        { icon: '🎼', label: 'Style',     value: profile.style    || '—' },
                        { icon: '🛠', label: 'Built by',  value: profile.builtBy  || '—' },
                      ].map((s) => (
                        <div key={s.label} style={{
                          background: '#f5f3ff', borderRadius: 10, padding: '14px 12px', textAlign: 'center',
                        }}>
                          <div style={{ fontSize: 22 }}>{s.icon}</div>
                          <div style={{ fontWeight: 700, fontSize: 14, marginTop: 4, color: '#1f2937', wordBreak: 'break-word' }}>{s.value}</div>
                          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={() => setTab('reply')} style={{
                        background: '#7c3aed', color: '#fff', border: 'none',
                        borderRadius: 10, padding: '10px 22px', fontWeight: 700,
                        fontSize: 14, cursor: 'pointer',
                      }}>Get Reply Text →</button>
                      <button onClick={() => setTab('setup')} style={{
                        background: '#f3f4f6', color: '#374151', border: 'none',
                        borderRadius: 10, padding: '10px 22px', fontWeight: 600,
                        fontSize: 14, cursor: 'pointer',
                      }}>Edit Details</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Reply Tab ── */}
            {tab === 'reply' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>
                    Your ready-to-send choir introduction. Copy and share anywhere.
                  </p>
                  <button
                    onClick={copyReply}
                    style={{
                      background: copied ? '#059669' : '#7c3aed', color: '#fff', border: 'none',
                      borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 13,
                      cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s',
                    }}
                  >
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
                <pre style={{
                  background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10,
                  padding: '18px 20px', fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word', color: '#374151', margin: 0,
                }}>{replyText}</pre>
                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <button onClick={copyReply} style={{
                    background: copied ? '#059669' : '#7c3aed', color: '#fff', border: 'none',
                    borderRadius: 10, padding: '10px 22px', fontWeight: 700, fontSize: 14,
                    cursor: 'pointer', transition: 'background 0.2s',
                  }}>{copied ? '✓ Copied!' : 'Copy to Clipboard'}</button>
                  <button onClick={() => setTab('setup')} style={{
                    background: '#f3f4f6', color: '#374151', border: 'none',
                    borderRadius: 10, padding: '10px 22px', fontWeight: 600,
                    fontSize: 14, cursor: 'pointer',
                  }}>Edit Details</button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
}

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
          <a href="#about">About</a>
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

      {/* ── About ── */}
      <AboutSection />

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
