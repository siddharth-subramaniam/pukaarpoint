"use client";
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import ImageRedactor from '@/components/ImageRedactor';

function RegisterForm() {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userIdentifier, setUserIdentifier] = useState('');
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const id = localStorage.getItem('userIdentifier');
    if (token && id) {
      setIsLoggedIn(true);
      setUserIdentifier(id);
    }

    const prefillDesc = localStorage.getItem('prefill_description');
    if (prefillDesc) {
      setFormData(prev => ({ ...prev, incidentDescription: prefillDesc }));
      localStorage.removeItem('prefill_description');
    }
  }, []);

  const [step, setStep] = useState(1);
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';

  const [formData, setFormData] = useState({
    broadCategory: initialCategory,
    subCategory: '',
    incidentDate: '',
    platform: '',
    delayReason: '',
    incidentDescription: '',
    suspectDetails: {} as any,
    isAnonymous: false,
    name: '',
    phone: '',
    email: '',
    address: '',
    nationalId: '',
    evidenceFiles: [] as { name: string, dataUrl: string }[],
  });

  const [redactImageSrc, setRedactImageSrc] = useState<string | null>(null);
  const [pendingFileName, setPendingFileName] = useState<string>('');
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setRedactImageSrc(event.target?.result as string);
        setPendingFileName(file.name);
      };
      reader.readAsDataURL(file);
    } else {
      // For non-images, just mock saving them
      setFormData(prev => ({ 
        ...prev, 
        evidenceFiles: [...prev.evidenceFiles, { name: file.name, dataUrl: 'mock_data' }] 
      }));
    }
  };

  const handleRedactSave = (dataUrl: string) => {
    setFormData(prev => ({
      ...prev,
      evidenceFiles: [...prev.evidenceFiles, { name: 'redacted_' + pendingFileName, dataUrl }]
    }));
    setRedactImageSrc(null);
  };

  const categories = {
    individuals: [
      { id: 'women_children', name: 'Crimes targeting women and children', allowsAnonymous: true },
      { id: 'identity_theft', name: 'Identity and personal data theft', allowsAnonymous: true },
      { id: 'defamation', name: 'Cyber defamation', allowsAnonymous: true },
      { id: 'cyber_bullying', name: 'Cyberbullying & Harassment', allowsAnonymous: true },
      { id: 'cyber_stalking', name: 'Cyber Stalking', allowsAnonymous: true },
    ],
    property: [
      { id: 'financial', name: 'Financial fraud', allowsAnonymous: false },
      { id: 'hacking', name: 'Hacking & unauthorized access', allowsAnonymous: false },
      { id: 'malware', name: 'Malware & ransomware', allowsAnonymous: false },
      { id: 'ddos', name: 'Denial-of-Service (DoS/DDoS)', allowsAnonymous: false },
      { id: 'ip_theft', name: 'IP Theft & Piracy', allowsAnonymous: false },
    ]
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handlePrev = () => setStep(prev => prev - 1);

  const getSubcategories = () => {
    if (formData.broadCategory === 'individuals') return categories.individuals;
    if (formData.broadCategory === 'property') return categories.property;
    return [];
  };

  const currentSubcategory = getSubcategories().find(c => c.id === formData.subCategory);
  const canBeAnonymous = currentSubcategory?.allowsAnonymous || false;

  useEffect(() => {
    if (!canBeAnonymous) {
      setFormData(prev => ({ ...prev, isAnonymous: false }));
    }
  }, [canBeAnonymous]);

  const [submitted, setSubmitted] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      handleNext();
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userIdentifier: isLoggedIn ? userIdentifier : null
        })
      });

      const data = await res.json();
      if (res.ok) {
        setTrackingId(data.trackingId);
        setSubmitted(true);
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      alert('Network error occurred while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify({
      type: "bundle",
      id: "bundle--" + crypto.randomUUID(),
      spec_version: "2.1",
      objects: [
        {
          type: "incident",
          name: formData.broadCategory + " - " + formData.subCategory,
          description: formData.incidentDescription,
          created: new Date().toISOString(),
          extended_properties: formData
        }
      ]
    }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `complaint_export_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (submitted) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ background: '#f0fdf4', color: '#166534', padding: '24px', borderRadius: '50%', width: '96px', height: '96px', margin: '0 auto 32px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h1 className="heading-serif" style={{ fontSize: '2rem', marginBottom: '16px' }}>Complaint Submitted Successfully</h1>
        <p className="text-muted" style={{ fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto 32px auto', lineHeight: 1.6 }}>
          Your complaint has been securely transmitted to the authorities. Please save your tracking number below.
        </p>
        <div style={{ background: 'var(--bg-surface)', border: '2px dashed var(--border-color)', padding: '32px', borderRadius: '12px', display: 'inline-block', marginBottom: '40px' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>Tracking ID</p>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-primary)', margin: 0 }}>{trackingId}</p>
        </div>
        <div>
          <Link href="/">
            <button className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.95rem' }}>Return to Home</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      

      {!termsAccepted && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(8px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{ maxWidth: '600px', width: '100%', background: 'white', position: 'relative', zIndex: 101, padding: '24px', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <div style={{ background: '#fef2f2', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: 'var(--accent-red)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h1 className="heading-serif text-center" style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Terms & Conditions</h1>
            
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '6px', border: '1px solid var(--border-color)', marginBottom: '24px', maxHeight: '35vh', overflowY: 'auto', lineHeight: 1.5, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <p style={{ marginBottom: '12px' }}><strong>1. Authenticity:</strong> By proceeding, you confirm that all the information provided in this complaint is true, accurate, and complete.</p>
              <p style={{ marginBottom: '12px' }}><strong>2. Legal Consequences:</strong> Providing false information, fabricated evidence, or filing a malicious complaint is a punishable offense under the law.</p>
              <p style={{ marginBottom: '12px' }}><strong>3. Confidentiality:</strong> Your information is treated with strict confidentiality. If you choose the anonymous option, your identity will not be disclosed to the accused.</p>
              <p><strong>4. Cooperation:</strong> You agree to cooperate with law enforcement agencies if further clarification or evidence is required.</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
              <Link href="/">
                <button type="button" className="btn-outline" style={{ padding: '10px 20px', fontSize: '0.95rem' }}>Decline</button>
              </Link>
              <button 
                type="button" 
                className="btn-primary" 
                style={{ padding: '10px 20px', fontSize: '0.95rem' }}
                onClick={() => setTermsAccepted(true)}
              >
                I Accept & Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <main 
        style={{ 
          padding: '40px 5%', 
          maxWidth: '1600px',
          margin: '0 auto',
          filter: !termsAccepted ? 'blur(8px)' : 'none',
          opacity: !termsAccepted ? 0.6 : 1,
          pointerEvents: !termsAccepted ? 'none' : 'auto',
          userSelect: !termsAccepted ? 'none' : 'auto',
          transition: 'all 0.4s ease'
        }}
      >
        <div style={{ marginBottom: '40px' }}>
          <h1 className="heading-serif" style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Register a Complaint</h1>
          <p className="text-muted" style={{ fontSize: '0.95rem', maxWidth: '600px', marginBottom: '32px', lineHeight: 1.6 }}>
            Please provide accurate details to help law enforcement take prompt action.
          </p>
          
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '16px' }}>
            {['Incident Details', 'Suspect Details', 'Complainant Details', 'Preview & Submit'].map((title, i) => (
              <div key={i} style={{ 
                flex: 1, 
                minWidth: '200px',
                padding: '16px', 
                background: step === i + 1 ? 'var(--accent-primary)' : step > i + 1 ? '#eff6ff' : 'white',
                color: step === i + 1 ? 'white' : step > i + 1 ? 'var(--accent-primary)' : 'var(--text-secondary)',
                border: '1px solid',
                borderColor: step >= i + 1 ? 'var(--accent-primary)' : 'var(--border-color)',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.95rem'
              }}>
                {i + 1}. {title}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          
          {/* Step 1: Incident Details */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>Incident Details</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Category of Complaint *</label>
                  <select 
                    value={formData.broadCategory}
                    onChange={(e) => setFormData(prev => ({ ...prev, broadCategory: e.target.value, subCategory: '' }))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'white' }}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="individuals">Crimes Against Individuals</option>
                    <option value="property">Crimes Against Property and Finance (e.g. Fraud)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Sub-Category *</label>
                  <select 
                    value={formData.subCategory}
                    onChange={(e) => setFormData(prev => ({ ...prev, subCategory: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'white' }}
                    required
                    disabled={!formData.broadCategory}
                  >
                    <option value="">Select Sub-Category</option>
                    {getSubcategories().map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Incident Date & Time *</label>
                  <input 
                    type="datetime-local" 
                    value={formData.incidentDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, incidentDate: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Platform / Medium of Incident</label>
                  <select 
                    value={formData.platform}
                    onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'white' }}
                  >
                    <option value="">Select Platform</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="telegram">Telegram</option>
                    <option value="facebook">Facebook / Instagram</option>
                    <option value="email">Email (Phishing/BEC)</option>
                    <option value="sms">SMS / Phone Call</option>
                    <option value="website">Malicious Website</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Reason for Delay in Reporting (if any)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Was unaware of the fraud until bank statement arrived"
                  value={formData.delayReason}
                  onChange={(e) => setFormData(prev => ({ ...prev, delayReason: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Incident Narrative *</label>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Please include full IoCs (Indicators of Compromise), malicious URLs, or payloads if applicable. Safe parameterized handling is enabled.
                </p>
                <textarea 
                  rows={6} 
                  placeholder="Describe the incident in detail..."
                  value={formData.incidentDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, incidentDescription: e.target.value }))}
                  style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', resize: 'vertical' }}
                  required
                ></textarea>
              </div>
            </div>
          )}

          {/* Step 2: Suspect Details */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>Suspect Details</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>Provide any known identifiers for the attacker. Dynamic fields are shown based on your selected category.</p>

              {formData.broadCategory === 'property' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px', background: '#f8fafc', padding: '24px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Suspect UTR / VPA Number</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 123456789012 or fraudster@upi"
                      value={formData.suspectDetails.utr || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, suspectDetails: { ...prev.suspectDetails, utr: e.target.value } }))}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Target Bank Account / Routing Details</label>
                    <input 
                      type="text" 
                      placeholder="Suspect Account No. / IFSC"
                      value={formData.suspectDetails.bankDetails || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, suspectDetails: { ...prev.suspectDetails, bankDetails: e.target.value } }))}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                    />
                  </div>
                </div>
              )}

              {formData.broadCategory === 'individuals' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px', background: '#f8fafc', padding: '24px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Spoofed Email Headers / SMTP Relay IP</label>
                    <textarea 
                      rows={3}
                      placeholder="Paste full raw email headers if applicable"
                      value={formData.suspectDetails.emailHeaders || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, suspectDetails: { ...prev.suspectDetails, emailHeaders: e.target.value } }))}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Suspect Social Media Handle</label>
                    <input 
                      type="text" 
                      placeholder="e.g. @fraudster_profile"
                      value={formData.suspectDetails.socialHandle || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, suspectDetails: { ...prev.suspectDetails, socialHandle: e.target.value } }))}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Suspect Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="+91..."
                    value={formData.suspectDetails.phone || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, suspectDetails: { ...prev.suspectDetails, phone: e.target.value } }))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Any other Identifiers</label>
                  <input 
                    type="text" 
                    placeholder="Crypto Wallet Address, etc."
                    value={formData.suspectDetails.other || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, suspectDetails: { ...prev.suspectDetails, other: e.target.value } }))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Complainant Details */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>Complainant Details</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
                These fields can be auto-populated from your User Profile if logged in, but you may manually override them here.
              </p>

              {canBeAnonymous && (
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={formData.isAnonymous}
                      onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                      style={{ width: '20px', height: '20px' }}
                    />
                    <div>
                      <strong style={{ display: 'block', color: 'var(--accent-primary)' }}>File Anonymously</strong>
                      <span style={{ fontSize: '0.85rem', color: '#475569' }}>Your identity will be protected and only accessible to verified investigating officers.</span>
                    </div>
                  </label>
                </div>
              )}

              {!formData.isAnonymous && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Full Legal Name *</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                      required={!formData.isAnonymous}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Mobile Number *</label>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                      required={!formData.isAnonymous}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Email Address</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>National ID Number (Aadhaar / Passport)</label>
                    <input 
                      type="text" 
                      value={formData.nationalId}
                      onChange={(e) => setFormData(prev => ({ ...prev, nationalId: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Physical Address</label>
                    <textarea 
                      rows={3} 
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Preview & Submit */}
          {step === 4 && (
            <div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>Preview & Submit</h2>
              
              <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Review Data Artifacts</h3>
                  <button type="button" onClick={handleExportJSON} className="btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    Download STIX 2.1 JSON
                  </button>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Please confirm your observables. You may download a localized JSON copy for your records before finalizing.
                </p>
                
                <ul style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li><strong>Category:</strong> {formData.broadCategory} / {formData.subCategory}</li>
                  <li><strong>Date/Time:</strong> {formData.incidentDate}</li>
                  <li><strong>Platform:</strong> {formData.platform || 'N/A'}</li>
                  <li><strong>Anonymous:</strong> {formData.isAnonymous ? 'Yes' : 'No'}</li>
                  <li><strong>Suspect Identifiers:</strong> {Object.keys(formData.suspectDetails).length} provided</li>
                </ul>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Upload Additional Evidence (Optional)</h3>
                
                {formData.evidenceFiles.length > 0 && (
                  <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {formData.evidenceFiles.map((f, i) => (
                      <div key={i} style={{ background: '#f8fafc', padding: '8px 16px', borderRadius: '24px', border: '1px solid var(--border-color)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                        {f.name}
                      </div>
                    ))}
                  </div>
                )}

                <label style={{ border: '2px dashed var(--border-color)', padding: '40px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', background: 'white', display: 'block' }}>
                  <input type="file" onChange={handleFileUpload} accept="image/*,.pdf,.zip" style={{ display: 'none' }} />
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px auto' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <h4 style={{ fontSize: '0.95rem', marginBottom: '8px' }}>Click to upload or Drag & Drop</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Supported formats: JPG, PNG, PDF, ZIP. Images will prompt the Privacy Redactor.</p>
                </label>
              </div>

              {redactImageSrc && (
                <ImageRedactor 
                  imageSrc={redactImageSrc} 
                  onSave={handleRedactSave}
                  onCancel={() => setRedactImageSrc(null)}
                />
              )}

            </div>
          )}

          {/* Dynamic Login Banner for Step 1 */}
          {step === 1 && !isLoggedIn && formData.subCategory && (
            <div style={{ background: canBeAnonymous ? '#f8fafc' : '#fef2f2', border: `1px solid ${canBeAnonymous ? '#cbd5e1' : '#fecaca'}`, padding: '16px', borderRadius: '8px', marginTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0, color: canBeAnonymous ? 'var(--text-primary)' : 'var(--accent-red)', fontSize: '1rem', marginBottom: '4px' }}>
                  {canBeAnonymous ? 'Optional Login Available' : 'Login Required'}
                </h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {canBeAnonymous 
                    ? 'This category supports anonymous filing. You can proceed without an account, or log in to track your case later.' 
                    : 'This category of crime requires authentication to prevent fraudulent reporting. Please log in to proceed.'}
                </p>
              </div>
              <Link href="/login">
                <button type="button" className="btn-outline" style={{ padding: '8px 16px', fontSize: '0.9rem', borderColor: canBeAnonymous ? '' : 'var(--accent-red)', color: canBeAnonymous ? '' : 'var(--accent-red)' }}>
                  Log In Now
                </button>
              </Link>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
            {step > 1 ? (
              <button type="button" className="btn-outline" onClick={handlePrev} style={{ padding: '10px 20px', fontSize: '0.95rem' }}>Back</button>
            ) : (
              <button type="button" className="btn-outline" onClick={() => setTermsAccepted(false)} style={{ padding: '10px 20px', fontSize: '0.95rem' }}>Cancel</button>
            )}
            
            {step < 4 ? (
              <button type="submit" className="btn-primary" disabled={step === 1 && !isLoggedIn && !canBeAnonymous} style={{ padding: '10px 20px', fontSize: '0.95rem', opacity: (step === 1 && !isLoggedIn && !canBeAnonymous) ? 0.5 : 1, cursor: (step === 1 && !isLoggedIn && !canBeAnonymous) ? 'not-allowed' : 'pointer' }}>Continue</button>
            ) : (
              <button type="submit" className="btn-danger" disabled={isSubmitting} style={{ padding: '10px 20px', fontSize: '0.95rem' }}>
                {isSubmitting ? 'Submitting securely...' : 'Finalize & Submit Complaint'}
              </button>
            )}
          </div>
        </form>
      </main>
    </>
  );
}

export default function RegisterComplaint() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading form securely...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
