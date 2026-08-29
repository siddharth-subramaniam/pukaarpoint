"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [userIdentifier, setUserIdentifier] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Check login state when component mounts or pathname changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    const id = localStorage.getItem('userIdentifier');
    if (token && id) {
      setIsLoggedIn(true);
      setUserIdentifier(id);
    } else {
      setIsLoggedIn(false);
      setUserIdentifier('');
    }

    if (pathname.startsWith('/admin')) {
      const adminToken = localStorage.getItem('admin_token');
      setIsAdminLoggedIn(!!adminToken);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userIdentifier');
    setIsLoggedIn(false);
    setUserIdentifier('');
    setShowLogoutConfirm(false);
    router.push('/login');
  };

  const renderLogoutModal = (onConfirm: () => void) => (
    showLogoutConfirm && (
      <div style={{
        position: 'fixed',
        top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{ maxWidth: '400px', width: '100%', background: 'white', position: 'relative', zIndex: 10000, padding: '32px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', textAlign: 'center', animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ background: '#fef2f2', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', color: '#dc2626' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '12px', color: 'var(--text-primary)' }}>Confirm Logout</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
            Are you sure you want to log out of your account?
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn-outline" onClick={() => setShowLogoutConfirm(false)} style={{ flex: 1 }}>Cancel</button>
            <button className="btn-danger" onClick={onConfirm} style={{ flex: 1 }}>Log Out</button>
          </div>
        </div>
      </div>
    )
  );

  if (pathname.startsWith('/admin')) {
    return (
      <>
        {renderLogoutModal(() => {
          localStorage.removeItem('admin_token');
          setShowLogoutConfirm(false);
          router.push('/admin');
          window.location.reload();
        })}
        <header className="navbar">
          <div className="nav-container">
            <div className="brand" style={{ textDecoration: 'none' }}>
              <div style={{ background: 'var(--accent-primary)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div className="brand-text" style={{ fontFamily: "'Outfit', sans-serif", whiteSpace: 'nowrap', fontSize: '1.25rem', color: 'var(--accent-primary)', letterSpacing: '-0.5px' }}>
                <span style={{ fontWeight: 700 }}>Pukaar</span>
                <span style={{ fontWeight: 300, opacity: 0.85 }}>Point</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {isAdminLoggedIn && (
                <button 
                  onClick={() => setShowLogoutConfirm(true)} 
                  className="btn-outline" 
                  style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </header>
      </>
    );
  }

  return (
    <>
      {renderLogoutModal(handleLogout)}
      <header className="navbar">
      <div className="nav-container">
        <Link href="/" className="brand" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'var(--accent-primary)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div className="brand-text" style={{ fontFamily: "'Outfit', sans-serif", whiteSpace: 'nowrap', fontSize: '1.25rem', color: 'var(--accent-primary)', letterSpacing: '-0.5px' }}>
            <span style={{ fontWeight: 700 }}>Pukaar</span>
            <span style={{ fontWeight: 300, opacity: 0.85 }}>Point</span>
          </div>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="nav-links" style={{ display: 'flex', gap: '0', margin: 0, alignItems: 'center' }}>
            <Link href="/register" className={`nav-link ${pathname === '/register' ? 'active' : ''}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Register a Complaint
            </Link>
            <div style={{ width: '1px', height: '24px', background: 'linear-gradient(to bottom, transparent, #cbd5e1, transparent)' }} />
            <Link href="/track" className={`nav-link ${pathname === '/track' ? 'active' : ''}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              Track your Complaint
            </Link>
            <div style={{ width: '1px', height: '24px', background: 'linear-gradient(to bottom, transparent, #cbd5e1, transparent)' }} />
            <Link href="/heatmap" className={`nav-link ${pathname === '/heatmap' ? 'active' : ''}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
              Live Heatmap
            </Link>
            <div style={{ width: '1px', height: '24px', background: 'linear-gradient(to bottom, transparent, #cbd5e1, transparent)' }} />
            <Link href="/evidence" className={`nav-link ${pathname === '/evidence' ? 'active' : ''}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              Evidence Toolkit
            </Link>
            <div style={{ width: '1px', height: '24px', background: 'linear-gradient(to bottom, transparent, #cbd5e1, transparent)' }} />
            <Link href="/database" className={`nav-link ${pathname === '/database' ? 'active' : ''}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
              Scamster Database
            </Link>
            <div style={{ width: '1px', height: '24px', background: 'linear-gradient(to bottom, transparent, #cbd5e1, transparent)' }} />
            <Link href="/contact" className={`nav-link ${pathname === '/contact' ? 'active' : ''}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Contact Us
            </Link>
          </div>

          <div style={{ width: '1px', height: '32px', background: 'linear-gradient(to bottom, transparent, #cbd5e1, transparent)', marginLeft: '8px' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isLoggedIn ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem', maxWidth: '160px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {userIdentifier}
                  </span>
                </div>
                <button onClick={() => setShowLogoutConfirm(true)} className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login">
                <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                  Login
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
    </>
  );
}
