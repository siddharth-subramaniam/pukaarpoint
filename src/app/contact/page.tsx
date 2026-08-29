import Link from 'next/link';

export default function ContactUs() {
  return (
    <>
      

      <main style={{ padding: '40px 5%', maxWidth: '1600px', margin: '0 auto', minHeight: '80vh' }}>
        <div style={{ marginBottom: '40px' }}>
          <h1 className="heading-serif" style={{ fontSize: '2rem', marginBottom: '16px' }}>Contact Us</h1>
          <p className="text-muted" style={{ fontSize: '1rem', maxWidth: '600px', marginBottom: '32px', lineHeight: 1.6 }}>
            If you need immediate assistance or have queries regarding your filed complaint, please reach out to our dedicated support channels.
          </p>
        </div>

        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#b45309', padding: '16px', borderRadius: '8px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span style={{ fontSize: '0.95rem', fontWeight: 500, lineHeight: 1.5 }}>
            <strong>Disclaimer:</strong> This is a prototype application. All contact details, phone numbers, and addresses listed below are purely fictional placeholders for demonstration purposes. Do not attempt to contact them for real emergencies.
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', fontWeight: 600 }}>National Helpline (Mock)</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.5 }}>
              <strong>Dial 555-0199</strong> for financial cyber fraud reporting (24/7 Toll-Free).
            </p>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Standard fictitious rates apply.</p>
          </div>

          <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', fontWeight: 600 }}>Email Support (Mock)</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.5 }}>
              <strong>support@cyberportal-demo.example.com</strong>
            </p>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>We aim to respond to all fictitious inquiries within 48 hours.</p>
          </div>

          <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', fontWeight: 600 }}>Headquarters (Mock)</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.5 }}>
              Demo Cyber Security Agency<br />
              999 Placeholder Avenue, Suite 404<br />
              Null Island, 00000
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
