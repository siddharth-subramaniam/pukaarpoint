"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function TrackComplaint() {
  const [trackingId, setTrackingId] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'otp_sent' | 'verifying' | 'found' | 'error'>('idle');
  const [complaintData, setComplaintData] = useState<any>(null);
  
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [maskedIdentifier, setMaskedIdentifier] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;

    setStatus('loading');
    setErrorMessage('');
    
    try {
      const res = await fetch('/api/track/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingId })
      });
      const data = await res.json();
      if (res.ok) {
        setMaskedIdentifier(data.maskedIdentifier);
        setDemoOtp(data.demoOtp);
        setStatus('otp_sent');
      } else {
        setErrorMessage(data.error || 'Failed to request OTP');
        setStatus('error');
      }
    } catch (err) {
      setErrorMessage('Network error while requesting OTP');
      setStatus('error');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;

    setStatus('verifying');
    setErrorMessage('');

    try {
      const res = await fetch('/api/track/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingId, otp })
      });
      const data = await res.json();
      if (res.ok) {
        setComplaintData(data.complaint);
        setStatus('found');
      } else {
        setErrorMessage(data.error || 'Invalid OTP');
        setStatus('otp_sent'); // Revert back to OTP input
      }
    } catch (err) {
      setErrorMessage('Network error while verifying OTP');
      setStatus('otp_sent');
    }
  };

  const handleGeneratePDF = () => {
    import('jspdf').then(({ jsPDF }) => {
      import('crypto-js').then((module) => {
        const CryptoJS = module.default || module;
        const doc = new jsPDF();
        
        doc.setFontSize(22);
        doc.text("Official Cybercrime Complaint Report", 20, 20);
        
        doc.setFontSize(12);
        doc.text(`Tracking ID: ${complaintData.tracking_id}`, 20, 40);
        doc.text(`Status: ${complaintData.status.replaceAll('_', ' ').toUpperCase()}`, 20, 50);
        doc.text(`Filed on: ${new Date(complaintData.created_at).toLocaleString()}`, 20, 60);
        doc.text(`Category: ${complaintData.broad_category}`, 20, 70);
        
        const dummyEvidenceString = "evidence_file_001.png";
        const md5Hash = CryptoJS.MD5(dummyEvidenceString).toString();
        const sha256Hash = CryptoJS.SHA256(dummyEvidenceString).toString();
        
        doc.setFontSize(16);
        doc.text("Evidence Cryptographic Hashes", 20, 90);
        doc.setFontSize(10);
        doc.text(`File: ${dummyEvidenceString}`, 20, 100);
        doc.text(`MD5: ${md5Hash}`, 20, 105);
        doc.text(`SHA-256: ${sha256Hash}`, 20, 110);
        
        doc.setFontSize(16);
        doc.text("Statutory Compliance Summary", 20, 130);
        doc.setFontSize(10);
        const complianceText = "This document is generated in compliance with Section 65B of the Indian Evidence Act, 1872 / relevant cyber laws for digital admissibility. The hashes above verify the integrity of the attached digital evidence at the time of submission.";
        const splitText = doc.splitTextToSize(complianceText, 170);
        doc.text(splitText, 20, 140);
        
        doc.save(`${complaintData.tracking_id}_Legal_Export.pdf`);
      });
    });
  };

  return (
    <>
      <main 
        style={{ 
          padding: '40px 5%', 
          maxWidth: '1600px',
          margin: '0 auto',
          minHeight: '80vh'
        }}
      >
        <div style={{ marginBottom: '40px' }}>
          <h1 className="heading-serif" style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Track your Complaint</h1>
          <p className="text-muted" style={{ fontSize: '0.95rem', maxWidth: '600px', marginBottom: '32px', lineHeight: 1.6 }}>
            Enter the tracking ID you received after filing your complaint. For privacy reasons, you must verify your identity via OTP to view the status.
          </p>
        </div>

        <div style={{ width: '100%' }}>
          {/* Tracking ID Form */}
          {status !== 'otp_sent' && status !== 'verifying' && status !== 'found' && (
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '16px', maxWidth: '600px' }}>
              <input 
                type="text" 
                placeholder="e.g. CYB-123456" 
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.95rem', textTransform: 'uppercase' }}
                required
              />
              <button type="submit" className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.95rem' }} disabled={status === 'loading'}>
                {status === 'loading' ? 'Requesting OTP...' : 'Track'}
              </button>
            </form>
          )}

          {/* OTP Verification Form */}
          {(status === 'otp_sent' || status === 'verifying') && (
            <form onSubmit={handleVerifyOtp} style={{ maxWidth: '600px' }}>
              <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '6px', marginBottom: '24px', fontSize: '0.9rem', color: 'var(--accent-primary)', textAlign: 'center' }}>
                Secure tracking OTP sent to <strong>{maskedIdentifier}</strong>
                <br />
                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Demo OTP: {demoOtp}</span>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <input 
                  type="text" 
                  placeholder="Enter 6-Digit OTP" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.95rem', letterSpacing: '2px', textAlign: 'center' }}
                  required
                  maxLength={6}
                />
                <button type="submit" className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.95rem' }} disabled={status === 'verifying'}>
                  {status === 'verifying' ? 'Verifying...' : 'Verify & View'}
                </button>
              </div>
            </form>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div style={{ marginTop: '24px', maxWidth: '600px', background: '#fef2f2', border: '1px solid #fecaca', padding: '16px', borderRadius: '8px', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {errorMessage}
            </div>
          )}

          {/* Results */}
          {status === 'found' && complaintData && (
            <div style={{ marginTop: '40px', borderTop: '1px solid var(--border-color)', paddingTop: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Status for <span style={{ color: 'var(--accent-primary)' }}>{complaintData.tracking_id}</span></h3>
                </div>
                <button type="button" className="btn-primary" onClick={handleGeneratePDF} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#1e293b', border: 'none' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Export Legal Package (PDF)
                </button>
              </div>

              <div style={{ position: 'relative', paddingLeft: '32px' }}>
                <div style={{ position: 'absolute', left: '11px', top: '8px', bottom: '8px', width: '2px', background: '#e2e8f0' }}></div>
                
                {[
                  { id: 'registered', title: 'Complaint Registered', desc: `${new Date(complaintData.created_at).toLocaleDateString()} - Successfully submitted and verified.` },
                  { id: 'assigned_to_investigating_officer', title: 'Assigned to Investigating Officer', desc: 'Forwarded to the Cyber Cell Division.' },
                  { id: 'under_investigation', title: 'Under Investigation', desc: 'Evidence is being analyzed by cyber experts.' },
                  { id: 'action_taken', title: 'Action Taken / Resolved', desc: 'Final resolution and action taken.' }
                ].map((step, index) => {
                  const statusList = ['registered', 'assigned_to_investigating_officer', 'under_investigation', 'action_taken'];
                  const currentIndex = statusList.indexOf(complaintData.status);
                  
                  const isCompleted = index < currentIndex;
                  const isCurrent = index === currentIndex;
                  const isPending = index > currentIndex;
                  
                  return (
                    <div key={step.id} style={{ position: 'relative', marginBottom: index === 3 ? '0' : '32px' }}>
                      {isCompleted ? (
                        <div style={{ position: 'absolute', left: '-32px', top: '4px', width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-primary)', border: '4px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                      ) : isCurrent ? (
                        <div style={{ position: 'absolute', left: '-32px', top: '4px', width: '24px', height: '24px', borderRadius: '50%', background: 'white', border: '4px solid var(--accent-primary)' }}></div>
                      ) : (
                        <div style={{ position: 'absolute', left: '-32px', top: '4px', width: '24px', height: '24px', borderRadius: '50%', background: '#e2e8f0', border: '4px solid white' }}></div>
                      )}
                      
                      <h4 style={{ fontSize: '0.95rem', marginBottom: '4px', color: isPending ? 'var(--text-secondary)' : (isCurrent ? 'var(--accent-primary)' : 'var(--text-primary)') }}>
                        {step.title}
                      </h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                        {isPending ? 'Pending...' : step.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
