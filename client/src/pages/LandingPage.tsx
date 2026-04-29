import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';

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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  function switchTab(newTab: 'setup' | 'preview' | 'reply') {
    if (newTab === tab) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setTab(newTab);
      setIsTransitioning(false);
    }, 200);
  }

  // Completion calculation
  const fields: (keyof ChoirProfile)[] = ['name', 'founded', 'style', 'mission', 'verse', 'members', 'location', 'builtBy'];
  const filledCount = fields.filter(f => profile[f].trim() !== '').length;
  const completionPct = Math.round((filledCount / fields.length) * 100);

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

  const downloadAsImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 800, h = 500;
    canvas.width = w;
    canvas.height = h;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#4f46e5');
    grad.addColorStop(1, '#7c3aed');
    ctx.fillStyle = grad;
    ctx.roundRect(0, 0, w, h, 20);
    ctx.fill();

    // Decorative circles
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(680, 80, 120, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(100, 420, 80, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;

    // Music note icon
    ctx.font = '48px serif';
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillText('♪', 40, 80);

    // Choir name
    ctx.font = 'bold 36px Inter, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText(profile.name || 'Your Choir', 40, 140);

    // Location & founded
    ctx.font = '16px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    const subline = [profile.location, profile.founded ? `Est. ${profile.founded}` : ''].filter(Boolean).join(' · ');
    ctx.fillText(subline || 'Add your details', 40, 175);

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(40, 200); ctx.lineTo(w - 40, 200); ctx.stroke();

    // Mission
    if (profile.mission) {
      ctx.font = '15px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      const words = profile.mission.split(' ');
      let line = '';
      let y = 235;
      for (const word of words) {
        const test = line + word + ' ';
        if (ctx.measureText(test).width > w - 80 && line) {
          ctx.fillText(line.trim(), 40, y);
          line = word + ' ';
          y += 24;
          if (y > 320) { ctx.fillText('...', 40, y); break; }
        } else line = test;
      }
      if (line && y <= 320) ctx.fillText(line.trim(), 40, y);
    }

    // Stats bar at bottom
    const statsY = h - 100;
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.roundRect(30, statsY, w - 60, 70, 12);
    ctx.fill();

    const stats = [
      { icon: '👥', label: 'Members', val: profile.members || '—' },
      { icon: '🎼', label: 'Style', val: profile.style || '—' },
      { icon: '🛠', label: 'Built by', val: profile.builtBy || '—' },
    ];
    stats.forEach((s, i) => {
      const x = 60 + i * ((w - 120) / 3);
      ctx.font = '20px serif';
      ctx.fillText(s.icon, x, statsY + 30);
      ctx.font = 'bold 15px Inter, sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText(s.val, x + 30, statsY + 30);
      ctx.font = '11px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillText(s.label, x + 30, statsY + 50);
      ctx.fillStyle = '#fff';
    });

    // Footer
    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillText('♪ Managed with Choir Scheduler', w - 230, h - 18);

    // Download
    const link = document.createElement('a');
    link.download = `${(profile.name || 'choir-profile').replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [profile]);

  const shareToWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(replyText)}`, '_blank');
  };

  const shareViaEmail = () => {
    window.open(`mailto:?subject=${encodeURIComponent(`About ${profile.name || 'Our Choir'}`)}&body=${encodeURIComponent(replyText)}`, '_blank');
  };

  const hasSomeData = profile.name || profile.location || profile.mission;

  const tabConfig = [
    { key: 'setup' as const, icon: '⚙️', label: 'Setup', desc: 'Enter details' },
    { key: 'preview' as const, icon: '👁', label: 'Preview', desc: 'View card' },
    { key: 'reply' as const, icon: '📋', label: 'Share', desc: 'Copy & send' },
  ];

  const formFields = [
    { field: 'name' as const, label: 'Choir Name', placeholder: 'e.g. Grace Community Choir', icon: '🎵' },
    { field: 'founded' as const, label: 'Founded Year', placeholder: 'e.g. 2005', icon: '📅' },
    { field: 'style' as const, label: 'Choir Style', placeholder: 'e.g. Gospel, Classical, Contemporary', icon: '🎼' },
    { field: 'location' as const, label: 'Location', placeholder: 'e.g. Lagos, Nigeria', icon: '📍' },
    { field: 'members' as const, label: 'No. of Members', placeholder: 'e.g. 45', icon: '👥' },
    { field: 'builtBy' as const, label: 'App Built By', placeholder: 'Your name or organisation', icon: '🛠' },
  ];

  return (
    <section className="about-section" id="about">
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div className="about-container">
        {/* Header */}
        <div className="lp-section-head">
          <div className="lp-tag">About</div>
          <h2>Your Choir Profile</h2>
          <p>Create a beautiful profile card for your choir. Fill in the details, preview your card, and share it anywhere.</p>
        </div>

        {/* Progress Ring */}
        <div className="about-progress-ring-wrap">
          <svg className="about-progress-ring" viewBox="0 0 80 80">
            <circle className="about-progress-track" cx="40" cy="40" r="34" />
            <circle
              className="about-progress-fill"
              cx="40" cy="40" r="34"
              strokeDasharray={`${2 * Math.PI * 34}`}
              strokeDashoffset={`${2 * Math.PI * 34 * (1 - completionPct / 100)}`}
            />
          </svg>
          <div className="about-progress-label">
            <span className="about-progress-pct">{completionPct}%</span>
            <span className="about-progress-text">complete</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="about-card">
          {/* Tab Navigation */}
          <div className="about-tabs">
            {tabConfig.map((t, idx) => (
              <button
                key={t.key}
                className={`about-tab ${tab === t.key ? 'active' : ''}`}
                onClick={() => switchTab(t.key)}
              >
                <span className="about-tab-step">{idx + 1}</span>
                <span className="about-tab-icon">{t.icon}</span>
                <div className="about-tab-text">
                  <span className="about-tab-label">{t.label}</span>
                  <span className="about-tab-desc">{t.desc}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Content */}
          <div
            ref={contentRef}
            className={`about-content ${isTransitioning ? 'fade-out' : 'fade-in'}`}
          >
            {/* ── Setup Tab ── */}
            {tab === 'setup' && (
              <div className="about-setup">
                <div className="about-setup-header">
                  <h3>Choir Details</h3>
                  <p>Fill in your choir's information. Everything saves automatically to your browser.</p>
                </div>

                <div className="about-form-grid">
                  {formFields.map(({ field, label, placeholder, icon }) => (
                    <div key={field} className="about-form-field">
                      <label className="about-form-label">
                        <span className="about-form-label-icon">{icon}</span>
                        {label}
                        {profile[field] && <span className="about-field-check">✓</span>}
                      </label>
                      <input
                        className="about-form-input"
                        placeholder={placeholder}
                        value={profile[field]}
                        onChange={(e) => handleChange(field, e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                <div className="about-form-full">
                  <label className="about-form-label">
                    <span className="about-form-label-icon">🌟</span>
                    Mission Statement
                    {profile.mission && <span className="about-field-check">✓</span>}
                  </label>
                  <textarea
                    className="about-form-textarea"
                    rows={3}
                    placeholder="What is your choir's purpose and vision?"
                    value={profile.mission}
                    onChange={(e) => handleChange('mission', e.target.value)}
                  />
                </div>

                <div className="about-form-full">
                  <label className="about-form-label">
                    <span className="about-form-label-icon">📖</span>
                    Bible Verse / Motto
                    <span className="about-form-optional">optional</span>
                    {profile.verse && <span className="about-field-check">✓</span>}
                  </label>
                  <input
                    className="about-form-input"
                    placeholder='"Sing to the LORD a new song" — Psalm 96:1'
                    value={profile.verse}
                    onChange={(e) => handleChange('verse', e.target.value)}
                  />
                </div>

                <div className="about-form-actions">
                  <button className="btn btn-primary btn-lg" onClick={() => switchTab('preview')}>
                    Preview Profile →
                  </button>
                  <span className="about-form-hint">
                    {filledCount} of {fields.length} fields completed
                  </span>
                </div>
              </div>
            )}

            {/* ── Preview Tab ── */}
            {tab === 'preview' && (
              <div className="about-preview">
                {!hasSomeData ? (
                  <div className="about-empty">
                    <div className="about-empty-icon">🎵</div>
                    <h3>No profile yet</h3>
                    <p>Fill in your choir's details in the Setup tab to see a beautiful preview here.</p>
                    <button className="btn btn-primary" onClick={() => switchTab('setup')}>Go to Setup →</button>
                  </div>
                ) : (
                  <>
                    {/* Profile Card */}
                    <div className="about-profile-card">
                      <div className="about-profile-card-bg" />
                      <div className="about-profile-header">
                        <div className="about-profile-avatar">
                          <span>♪</span>
                        </div>
                        <div className="about-profile-info">
                          <h3>{profile.name || 'Your Choir'}</h3>
                          <p>
                            {profile.location}{profile.location && profile.founded ? ' · ' : ''}
                            {profile.founded ? `Est. ${profile.founded}` : ''}
                          </p>
                        </div>
                        {completionPct === 100 && (
                          <div className="about-profile-badge">
                            <span>✨</span> Complete
                          </div>
                        )}
                      </div>

                      {profile.verse && (
                        <div className="about-profile-verse">
                          <span className="about-verse-mark">"</span>
                          {profile.verse}
                        </div>
                      )}

                      {profile.mission && (
                        <p className="about-profile-mission">{profile.mission}</p>
                      )}
                    </div>

                    {/* Stats Grid */}
                    <div className="about-stats-grid">
                      {[
                        { icon: '👥', label: 'Members', value: profile.members || '—', color: '#ede9fe' },
                        { icon: '🎼', label: 'Style', value: profile.style || '—', color: '#dbeafe' },
                        { icon: '🛠', label: 'Built by', value: profile.builtBy || '—', color: '#fef3c7' },
                      ].map((s) => (
                        <div key={s.label} className="about-stat-card" style={{ background: s.color }}>
                          <div className="about-stat-icon">{s.icon}</div>
                          <div className="about-stat-value">{s.value}</div>
                          <div className="about-stat-label">{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="about-preview-actions">
                      <button className="btn btn-primary" onClick={() => switchTab('reply')}>
                        Share Profile →
                      </button>
                      <button className="btn btn-secondary" onClick={downloadAsImage}>
                        📥 Download as Image
                      </button>
                      <button className="btn btn-ghost" onClick={() => switchTab('setup')}>
                        ✏️ Edit Details
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── Reply / Share Tab ── */}
            {tab === 'reply' && (
              <div className="about-reply">
                <div className="about-reply-header">
                  <div>
                    <h3>Share Your Profile</h3>
                    <p>Copy your choir introduction or share it directly via your favourite platform.</p>
                  </div>
                </div>

                {/* Share Buttons */}
                <div className="about-share-row">
                  <button className="about-share-btn about-share-copy" onClick={copyReply}>
                    {copied ? '✓ Copied!' : '📋 Copy Text'}
                  </button>
                  <button className="about-share-btn about-share-whatsapp" onClick={shareToWhatsApp}>
                    💬 WhatsApp
                  </button>
                  <button className="about-share-btn about-share-email" onClick={shareViaEmail}>
                    ✉️ Email
                  </button>
                  <button className="about-share-btn about-share-download" onClick={downloadAsImage}>
                    📥 Image
                  </button>
                </div>

                {/* Preview text */}
                <pre className="about-reply-text">{replyText}</pre>

                <div className="about-reply-footer">
                  <button className="btn btn-primary" onClick={copyReply}>
                    {copied ? '✓ Copied to Clipboard!' : 'Copy to Clipboard'}
                  </button>
                  <button className="btn btn-ghost" onClick={() => switchTab('setup')}>
                    ✏️ Edit Details
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Testimonial / Quote */}
        <div className="about-testimonial">
          <div className="about-testimonial-quote">"</div>
          <p>Choir Scheduler has transformed how we organise our rehearsals and performances. It&apos;s like having a dedicated assistant for our entire choir.</p>
          <div className="about-testimonial-author">
            <div className="about-testimonial-avatar">M</div>
            <div>
              <div className="about-testimonial-name">Music Director</div>
              <div className="about-testimonial-role">Grace Community Choir</div>
            </div>
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
          <a href="/privacy">Privacy Policy</a>
        </div>
        <div className="lp-footer-copy">© {new Date().getFullYear()} Choir Scheduler. All rights reserved.</div>
      </footer>
    </div>
  );
}
