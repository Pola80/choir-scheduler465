import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  const wrap: React.CSSProperties = {
    maxWidth: 800, margin: '0 auto', padding: '48px 24px 80px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    color: '#1e293b', lineHeight: 1.75,
  };
  const h1: React.CSSProperties = { fontSize: 36, fontWeight: 800, marginBottom: 8, color: '#0f172a' };
  const updated: React.CSSProperties = { fontSize: 14, color: '#64748b', marginBottom: 36 };
  const h2: React.CSSProperties = { fontSize: 22, fontWeight: 700, marginTop: 40, marginBottom: 12, color: '#0f172a' };
  const p: React.CSSProperties = { marginBottom: 16, fontSize: 15 };
  const ul: React.CSSProperties = { paddingLeft: 24, marginBottom: 16 };
  const li: React.CSSProperties = { marginBottom: 8, fontSize: 15 };
  const backBtn: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: 'none', border: '1px solid #e2e8f0', borderRadius: 10,
    padding: '8px 18px', fontSize: 14, fontWeight: 600, color: '#4f46e5',
    cursor: 'pointer', marginBottom: 32, transition: 'all 0.15s',
  };

  return (
    <div style={wrap}>
      <button style={backBtn} onClick={() => navigate('/')}>← Back to Home</button>

      <h1 style={h1}>Privacy Policy</h1>
      <p style={updated}>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

      <p style={p}>
        Choir Scheduler ("we", "our", or "us") is committed to protecting the privacy of our users.
        This Privacy Policy explains how we collect, use, disclose, and safeguard your information when
        you use our web application and services.
      </p>

      <h2 style={h2}>1. Information We Collect</h2>
      <p style={p}>We collect the following types of information:</p>
      <ul style={ul}>
        <li style={li}><strong>Account Information:</strong> When you register, we collect your name, email address, and a hashed version of your password.</li>
        <li style={li}><strong>Profile Data:</strong> Your role within the choir (e.g., member, director, admin) and any profile details you choose to provide.</li>
        <li style={li}><strong>Event & Attendance Data:</strong> Information about events you create, attend, or manage, including dates, times, locations, and attendance records.</li>
        <li style={li}><strong>Messages:</strong> Content of announcements and messages you send through the platform.</li>
        <li style={li}><strong>Usage Data:</strong> We may collect information about how you access and interact with our services, including IP address, browser type, and access times.</li>
      </ul>

      <h2 style={h2}>2. How We Use Your Information</h2>
      <p style={p}>We use the information we collect to:</p>
      <ul style={ul}>
        <li style={li}>Provide, maintain, and improve our services</li>
        <li style={li}>Authenticate your identity and manage your account</li>
        <li style={li}>Facilitate event scheduling, member management, and attendance tracking</li>
        <li style={li}>Send you important notifications about events and choir activities</li>
        <li style={li}>Send email reminders for upcoming events (when email is configured)</li>
        <li style={li}>Respond to your enquiries and provide support</li>
      </ul>

      <h2 style={h2}>3. Data Storage & Security</h2>
      <p style={p}>
        Your data is stored securely in a PostgreSQL database hosted on Google Cloud Platform (GCP).
        We implement appropriate technical and organisational measures to protect your personal data, including:
      </p>
      <ul style={ul}>
        <li style={li}>Passwords are hashed using bcrypt before storage — we never store plaintext passwords</li>
        <li style={li}>Authentication is handled via JSON Web Tokens (JWT) with automatic expiry</li>
        <li style={li}>API endpoints are protected with rate limiting to prevent abuse</li>
        <li style={li}>All data in transit is encrypted via HTTPS/TLS</li>
        <li style={li}>Security headers are enforced using Helmet.js</li>
      </ul>

      <h2 style={h2}>4. Data Sharing & Disclosure</h2>
      <p style={p}>
        We do <strong>not</strong> sell, trade, or otherwise transfer your personal information to third parties.
        Your data may only be shared in the following circumstances:
      </p>
      <ul style={ul}>
        <li style={li}><strong>Within your choir:</strong> Other members of your choir may see your name, role, and attendance records as part of normal app functionality.</li>
        <li style={li}><strong>Service providers:</strong> We use Google Cloud Platform to host our services. Data is processed in accordance with Google's privacy and security standards.</li>
        <li style={li}><strong>Legal requirements:</strong> We may disclose your information if required to do so by law or in response to valid legal requests.</li>
      </ul>

      <h2 style={h2}>5. Data Retention</h2>
      <p style={p}>
        We retain your personal data for as long as your account is active or as needed to provide you services.
        If you wish to delete your account and associated data, please contact us and we will process your
        request within 30 days.
      </p>

      <h2 style={h2}>6. Your Rights</h2>
      <p style={p}>Depending on your location, you may have the following rights regarding your personal data:</p>
      <ul style={ul}>
        <li style={li}><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
        <li style={li}><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
        <li style={li}><strong>Deletion:</strong> Request deletion of your personal data</li>
        <li style={li}><strong>Portability:</strong> Request your data in a portable format</li>
        <li style={li}><strong>Objection:</strong> Object to certain types of data processing</li>
      </ul>

      <h2 style={h2}>7. Cookies & Local Storage</h2>
      <p style={p}>
        We use browser local storage to maintain your login session and save your preferences (such as your
        choir profile on the landing page). We do not use third-party tracking cookies or analytics services.
      </p>

      <h2 style={h2}>8. Children's Privacy</h2>
      <p style={p}>
        Our services are not directed to individuals under the age of 13. We do not knowingly collect personal
        information from children under 13. If you are a parent or guardian and believe your child has provided
        us with personal data, please contact us so we can take appropriate action.
      </p>

      <h2 style={h2}>9. Changes to This Policy</h2>
      <p style={p}>
        We may update this Privacy Policy from time to time. Any changes will be reflected on this page with
        an updated "Last updated" date. We encourage you to review this policy periodically.
      </p>

      <h2 style={h2}>10. Contact Us</h2>
      <p style={p}>
        If you have any questions about this Privacy Policy or our data practices, please contact us at:
      </p>
      <p style={{ ...p, background: '#f1f5f9', borderRadius: 12, padding: '16px 20px' }}>
        📧 <strong>Email:</strong> support@choirscheduler.app<br />
        🌐 <strong>Website:</strong>{' '}
        <a href="https://choir-backend-925038690128.us-central1.run.app" style={{ color: '#4f46e5', fontWeight: 600 }}>
          choir-backend-925038690128.us-central1.run.app
        </a>
      </p>

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: '#94a3b8' }}>© {new Date().getFullYear()} Choir Scheduler. All rights reserved.</p>
      </div>
    </div>
  );
}
