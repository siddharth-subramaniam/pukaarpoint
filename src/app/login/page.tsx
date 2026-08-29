"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CanvasCaptcha from '@/components/CanvasCaptcha';

export default function Login() {
  const [identifier, setIdentifier] = useState('user@example.com');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [error, setError] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const router = useRouter();

  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [expectedCaptcha, setExpectedCaptcha] = useState('');
  const [captchaKey, setCaptchaKey] = useState(0);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier,
        captchaAnswer,
        expectedCaptcha
      })
    });

    const data = await res.json();
    if (res.ok) {
      setStep('verify');
      setDemoOtp(data.otp); // For testing
    } else {
      setError(data.error);
      setCaptchaKey(prev => prev + 1);
      setCaptchaAnswer('');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, otp })
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userIdentifier', data.user.identifier);
      router.push('/register'); // Redirect to file complaint
    } else {
      setError(data.error);
    }
  };

  return (
    <>
      

      <main className="container" style={{ padding: '80px 24px', display: 'flex', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="card" style={{ width: '100%', maxWidth: '450px' }}>
          <h1 className="heading-serif text-center" style={{ fontSize: '2rem', marginBottom: '8px' }}>Login / Register</h1>
          <p className="text-center text-muted" style={{ marginBottom: '32px' }}>Enter your Mobile Number or Email to receive an OTP.</p>

          {error && (
            <div style={{ background: '#fef2f2', color: 'var(--accent-red)', padding: '12px', borderRadius: '6px', marginBottom: '24px', fontSize: '0.9rem', textAlign: 'center' }}>
              {error}
            </div>
          )}

          {step === 'request' && (
            <form onSubmit={handleRequestOtp}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Mobile Number / Email ID *</label>
                <input 
                  type="text" 
                  style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '1rem' }} 
                  placeholder="e.g. +91 9876543210 or user@mail.com" 
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required 
                />
              </div>

              <div style={{ marginBottom: '24px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Security Captcha *</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <CanvasCaptcha key={captchaKey} onRegenerate={(code) => setExpectedCaptcha(code)} />
                  <input 
                    type="text" 
                    placeholder="Enter characters shown above"
                    style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '1rem' }} 
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%' }}>Send OTP</button>
            </form>
          )}

          {step === 'verify' && (
            <form onSubmit={handleVerifyOtp}>
              <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '6px', marginBottom: '24px', fontSize: '0.9rem', color: 'var(--accent-primary)', textAlign: 'center' }}>
                OTP Sent to {identifier}
                <br />
                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Demo OTP: {demoOtp}</span>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Enter 6-Digit OTP *</label>
                <input 
                  type="text" 
                  maxLength={6}
                  style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '1.25rem', textAlign: 'center', letterSpacing: '4px' }} 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required 
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%' }}>Verify & Login</button>
              
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <button type="button" onClick={() => setStep('request')} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 500, textDecoration: 'underline' }}>
                  Change Number/Email
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </>
  );
}
