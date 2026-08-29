import Link from 'next/link';

export default function Home() {
  return (
    <>
      {/* Premium Decorative Background */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '600px', overflow: 'hidden', zIndex: -1, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-100px', left: '-50px', width: '400px', height: '400px', background: 'var(--accent-primary)', opacity: 0.04, borderRadius: '50%', filter: 'blur(80px)' }}></div>
        <div style={{ position: 'absolute', top: '150px', right: '-100px', width: '500px', height: '500px', background: 'var(--accent-red)', opacity: 0.03, borderRadius: '50%', filter: 'blur(100px)' }}></div>
      </div>

      <main className="container" style={{ paddingBottom: '80px', position: 'relative' }}>
        
        {/* Floating Helpline Card (Top Right Side) */}
        <div className="card" style={{ position: 'absolute', top: '24px', right: '24px', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px', zIndex: 10, background: 'white' }}>
          <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '50%', color: 'var(--accent-red)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '2px' }}>National Helpline</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-red)', lineHeight: 1 }}>1930</div>
          </div>
        </div>

        <section style={{ padding: '60px 0 20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          
          {/* Trust Badges */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
            <span style={{ padding: '6px 14px', background: '#ecfdf5', color: '#059669', borderRadius: '24px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #a7f3d0' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              256-Bit Encrypted
            </span>
            <span style={{ padding: '6px 14px', background: '#eff6ff', color: 'var(--accent-primary)', borderRadius: '24px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #bfdbfe' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              Anonymous Filing Available
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ background: 'var(--accent-primary)', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '3rem', color: 'var(--accent-primary)', letterSpacing: '-1px', margin: 0, display: 'flex', alignItems: 'center' }}>
              <span style={{ fontWeight: 700 }}>Pukaar</span>
              <span style={{ fontWeight: 400 }}>Point</span>
            </h1>
          </div>
          <p style={{ fontSize: '1.1rem', color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '16px', letterSpacing: '0.02em' }}>
            Intelligent Cybercrime Reporting & Evidence Management.
          </p>
          <p className="text-muted" style={{ fontSize: '1.15rem', maxWidth: '650px', marginBottom: '20px', lineHeight: 1.6 }}>
            Streamline your path to justice. Securely file complaints, leverage our advanced AI to automatically extract and redact forensic evidence, and track your case with law enforcement in real-time.
          </p>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 className="text-center heading-serif mb-8" style={{ fontSize: '1.5rem' }}>Report a Cyber Crime</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
            
            {/* Crimes Against Individuals */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '8px', color: 'var(--accent-primary)' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Crimes Against Individuals</h3>
              </div>
              <p className="text-muted" style={{ marginBottom: '24px', lineHeight: 1.5 }}>
                Report offenses that target individuals, personal identity, and safety.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--accent-primary)' }}>•</span> Crimes targeting women and children
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--accent-primary)' }}>•</span> Identity and personal data theft
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--accent-primary)' }}>•</span> Cyber defamation
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--accent-primary)' }}>•</span> Cyberbullying & Harassment
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--accent-primary)' }}>•</span> Cyber Stalking
                </li>
              </ul>
              <Link href="/register?category=individuals" style={{ width: '100%' }}>
                <button className="btn-primary" style={{ width: '100%' }}>
                  File Complaint
                </button>
              </Link>
            </div>

            {/* Crimes Against Property and Finance */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '8px', color: 'var(--accent-red)' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Crimes Against Property & Finance</h3>
              </div>
              <p className="text-muted" style={{ marginBottom: '24px', lineHeight: 1.5 }}>
                Report financial frauds, unauthorized access, and intellectual property theft.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--accent-red)' }}>•</span> Financial fraud
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--accent-red)' }}>•</span> Hacking & unauthorized access
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--accent-red)' }}>•</span> Malware & ransomware
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--accent-red)' }}>•</span> Denial-of-Service (DoS/DDoS)
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--accent-red)' }}>•</span> IP Theft & Piracy
                </li>
              </ul>
              <Link href="/register?category=property" style={{ width: '100%' }}>
                <button className="btn-danger" style={{ width: '100%' }}>
                  File Complaint
                </button>
              </Link>
            </div>

          </div>
          
          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <Link href="/track">
              <button className="btn-outline" style={{ padding: '14px 32px', fontSize: '1.125rem' }}>
                Track an Existing Complaint Status
              </button>
            </Link>
          </div>
        </section>

        <section style={{ borderTop: '1px solid var(--border-color)', marginTop: '64px', paddingTop: '64px' }}>
          <h2 className="text-center heading-serif mb-8" style={{ fontSize: '2rem', marginBottom: '40px' }}>How it Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            <div className="card">
              <div style={{ background: '#eff6ff', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>1</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>Register Complaint</h3>
              <p className="text-muted" style={{ lineHeight: 1.6 }}>Provide incident details and upload necessary evidence securely. Options are available for anonymous filing.</p>
            </div>
            
            <div className="card">
              <div style={{ background: '#eff6ff', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>2</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>Investigation</h3>
              <p className="text-muted" style={{ lineHeight: 1.6 }}>The complaint is instantly routed to the respective law enforcement agency for verification and strict action.</p>
            </div>

            <div className="card">
              <div style={{ background: '#eff6ff', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>3</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>Track Status</h3>
              <p className="text-muted" style={{ lineHeight: 1.6 }}>Use your unique acknowledgement number provided during registration to check real-time updates.</p>
            </div>
          </div>
        </section>


      </main>
    </>
  );
}
