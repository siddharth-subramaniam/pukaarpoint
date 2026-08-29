"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userIdentifier, setUserIdentifier] = useState('');
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
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userIdentifier');
    setIsLoggedIn(false);
    setUserIdentifier('');
    router.push('/login');
  };

  if (pathname.startsWith('/admin')) {
    return (
      <header className="navbar">
        <div className="nav-container">
          <div className="brand" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'var(--accent-primary)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div className="brand-text" style={{ whiteSpace: 'nowrap', fontSize: '1rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
              National Cyber Crime Reporting Portal
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button 
              onClick={() => {
                localStorage.removeItem('admin_token');
                router.push('/admin');
                window.location.reload();
              }} 
              className="btn-outline" 
              style={{ padding: '6px 12px', fontSize: '0.85rem' }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link href="/" className="brand" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'var(--accent-primary)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div className="brand-text" style={{ whiteSpace: 'nowrap', fontSize: '1rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
            National Cyber Crime Reporting Portal
          </div>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="nav-links" style={{ display: 'flex', gap: '16px', margin: 0, alignItems: 'center' }}>
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
            <Link href="/emergency" className={`nav-link-danger ${pathname === '/emergency' ? 'active' : ''}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Emergency Triage
            </Link>
            <div style={{ width: '1px', height: '24px', background: 'linear-gradient(to bottom, transparent, #cbd5e1, transparent)' }} />
            <Link href="/evidence" className={`nav-link ${pathname === '/evidence' ? 'active' : ''}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              Evidence Toolkit
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
                <button onClick={handleLogout} className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
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
  );
}
