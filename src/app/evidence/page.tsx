"use client";
import { useState } from 'react';
import Link from 'next/link';

type Platform = 'email' | 'whatsapp' | 'social' | 'financial';

export default function EvidenceToolkitPage() {
  const [activeTab, setActiveTab] = useState<Platform>('whatsapp');

  return (
    <main style={{ padding: '40px 5%', maxWidth: '1600px', margin: '0 auto', minHeight: '80vh' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 className="heading-serif" style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '16px' }}>
          Digital Evidence Preservation Toolkit
        </h1>
        <p className="text-muted" style={{ fontSize: '0.95rem', maxWidth: '600px', marginBottom: '32px', lineHeight: 1.6 }}>
          Before you file a formal complaint, it is critical to capture evidence correctly. Scammers often delete their messages or accounts. Use these guides to secure your evidence.
        </p>

        <div style={{ 
          background: '#fffbeb', 
          border: '1px solid #fde68a', 
          color: '#92400e', 
          padding: '16px 24px', 
          borderRadius: '8px',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>Critical Rule: Do not confront the scammer or tip them off. They may delete accounts or messages, destroying your evidence.</span>
        </div>

        <div className="card" style={{ display: 'flex', padding: 0, overflow: 'hidden', border: '1px solid var(--border-color)', minHeight: '550px' }}>
          
          {/* Sidebar */}
          <div style={{ width: '240px', background: 'var(--bg-surface)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Platform</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <button 
                onClick={() => setActiveTab('whatsapp')}
                style={{ 
                  padding: '16px 20px', textAlign: 'left', background: activeTab === 'whatsapp' ? '#f1f5f9' : 'transparent', 
                  border: 'none', borderLeft: activeTab === 'whatsapp' ? '3px solid var(--accent-primary)' : '3px solid transparent',
                  cursor: 'pointer', fontSize: '0.95rem', fontWeight: activeTab === 'whatsapp' ? 600 : 400,
                  color: activeTab === 'whatsapp' ? 'var(--accent-primary)' : 'var(--text-primary)',
                  transition: 'all 0.2s'
                }}
              >
                WhatsApp & Chat Apps
              </button>
              <button 
                onClick={() => setActiveTab('email')}
                style={{ 
                  padding: '16px 20px', textAlign: 'left', background: activeTab === 'email' ? '#f1f5f9' : 'transparent', 
                  border: 'none', borderLeft: activeTab === 'email' ? '3px solid var(--accent-primary)' : '3px solid transparent',
                  cursor: 'pointer', fontSize: '0.95rem', fontWeight: activeTab === 'email' ? 600 : 400,
                  color: activeTab === 'email' ? 'var(--accent-primary)' : 'var(--text-primary)',
                  transition: 'all 0.2s'
                }}
              >
                Email Phishing/Scams
              </button>
              <button 
                onClick={() => setActiveTab('social')}
                style={{ 
                  padding: '16px 20px', textAlign: 'left', background: activeTab === 'social' ? '#f1f5f9' : 'transparent', 
                  border: 'none', borderLeft: activeTab === 'social' ? '3px solid var(--accent-primary)' : '3px solid transparent',
                  cursor: 'pointer', fontSize: '0.95rem', fontWeight: activeTab === 'social' ? 600 : 400,
                  color: activeTab === 'social' ? 'var(--accent-primary)' : 'var(--text-primary)',
                  transition: 'all 0.2s'
                }}
              >
                Social Media
              </button>
              <button 
                onClick={() => setActiveTab('financial')}
                style={{ 
                  padding: '16px 20px', textAlign: 'left', background: activeTab === 'financial' ? '#f1f5f9' : 'transparent', 
                  border: 'none', borderLeft: activeTab === 'financial' ? '3px solid var(--accent-primary)' : '3px solid transparent',
                  cursor: 'pointer', fontSize: '0.95rem', fontWeight: activeTab === 'financial' ? 600 : 400,
                  color: activeTab === 'financial' ? 'var(--accent-primary)' : 'var(--text-primary)',
                  transition: 'all 0.2s'
                }}
              >
                Bank & Financial
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div style={{ flex: 1, padding: '32px', background: 'white', overflowY: 'auto' }}>
            {activeTab === 'whatsapp' && (
              <div>
                <h2 style={{ marginBottom: '24px', color: 'var(--accent-primary)', fontSize: '1.25rem' }}>Preserving WhatsApp & Chat Logs</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <h4 style={{ fontWeight: 600, marginBottom: '8px', fontSize: '1.05rem' }}>1. Do not use "Clear Chat"</h4>
                    <p className="text-muted" style={{ lineHeight: 1.6, fontSize: '0.95rem' }}>Law enforcement requires the full context of the conversation. Never delete messages, even if they contain sensitive, explicit, or embarrassing material. Deleting them destroys the chain of evidence.</p>
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 600, marginBottom: '8px', fontSize: '1.05rem' }}>2. Export the Chat Log Officially</h4>
                    <p className="text-muted" style={{ lineHeight: 1.6, fontSize: '0.95rem' }}>Screenshots are easily manipulated and often dismissed in court. Instead, export the native text log: Go to the chat &gt; Tap the contact's name &gt; Scroll down to <strong>Export Chat</strong>. Choose "Without Media" to get the `.txt` file, then save it securely to your drive.</p>
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 600, marginBottom: '8px', fontSize: '1.05rem' }}>3. Capture the Phone Number/Profile</h4>
                    <p className="text-muted" style={{ lineHeight: 1.6, fontSize: '0.95rem' }}>A screenshot of the chat screen is not enough. You must take a screenshot of the contact's profile page clearly showing their <strong>phone number</strong> or <strong>username</strong> (e.g. Telegram @username). Ensure your own phone's top status bar (battery, time, network) is visible in the screenshot to prove authenticity.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'email' && (
              <div>
                <h2 style={{ marginBottom: '24px', color: 'var(--accent-primary)', fontSize: '1.25rem' }}>Extracting Email Headers</h2>
                <p className="text-muted" style={{ lineHeight: 1.6, marginBottom: '24px', fontSize: '0.95rem' }}>Screenshots of emails are easily faked. Investigators need the "Original Message" headers to trace the sender's actual IP address and server relays.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <h4 style={{ fontWeight: 600, marginBottom: '8px', fontSize: '1.05rem' }}>Gmail Users</h4>
                    <p className="text-muted" style={{ lineHeight: 1.6, fontSize: '0.95rem' }}>Open the email &gt; Click the <strong>three dots</strong> next to Reply (top right of the email body) &gt; Select <strong>Show original</strong>. Click the "Download Original" button. This will save a `.eml` or `.txt` file.</p>
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 600, marginBottom: '8px', fontSize: '1.05rem' }}>Outlook / Hotmail Users</h4>
                    <p className="text-muted" style={{ lineHeight: 1.6, fontSize: '0.95rem' }}>Open the email &gt; Click the <strong>three dots (More actions)</strong> &gt; View &gt; <strong>View message details</strong>. Copy all the text displayed in the pop-up box and paste it into a new text document.</p>
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 600, marginBottom: '8px', fontSize: '1.05rem' }}>Apple Mail Users</h4>
                    <p className="text-muted" style={{ lineHeight: 1.6, fontSize: '0.95rem' }}>Open the email &gt; Click <strong>View</strong> in the top menu bar &gt; Message &gt; <strong>Raw Source</strong>. Copy everything and save it as a text file.</p>
                  </div>
                  <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--accent-primary)' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}><strong>Note:</strong> When filing your complaint, you will upload this text file as technical evidence. Do NOT forward the email to yourself, as this alters the original headers.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'social' && (
              <div>
                <h2 style={{ marginBottom: '24px', color: 'var(--accent-primary)', fontSize: '1.25rem' }}>Social Media & Profile Evidence</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <h4 style={{ fontWeight: 600, marginBottom: '8px', fontSize: '1.05rem' }}>1. Capture the Profile URL / Unique ID</h4>
                    <p className="text-muted" style={{ lineHeight: 1.6, fontSize: '0.95rem' }}>Display names can be changed instantly, making the scammer impossible to find later. You MUST capture the unique profile URL (e.g., `instagram.com/actual_username_123` or Facebook numerical ID). Copy this link immediately to a notepad.</p>
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 600, marginBottom: '8px', fontSize: '1.05rem' }}>2. Full Desktop Screenshots</h4>
                    <p className="text-muted" style={{ lineHeight: 1.6, fontSize: '0.95rem' }}>Mobile screenshots often cut off important timestamps and URLs. If possible, open the profile or chat on a computer and take a full-screen capture showing the browser URL bar, and your computer's date and time in the taskbar.</p>
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 600, marginBottom: '8px', fontSize: '1.05rem' }}>3. Screen Record for Video Evidence</h4>
                    <p className="text-muted" style={{ lineHeight: 1.6, fontSize: '0.95rem' }}>If the harassment involves disappearing messages (WhatsApp View Once, Snapchat) or Instagram Stories, use your phone's screen recording feature immediately, or record it using a second physical smartphone to bypass app restrictions.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'financial' && (
              <div>
                <h2 style={{ marginBottom: '24px', color: 'var(--accent-primary)', fontSize: '1.25rem' }}>Financial & Banking Scams</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <h4 style={{ fontWeight: 600, marginBottom: '8px', fontSize: '1.05rem' }}>1. Extract the UTR / Transaction ID</h4>
                    <p className="text-muted" style={{ lineHeight: 1.6, fontSize: '0.95rem' }}>Check your bank statement or SMS for the 12-digit UTR (Unique Transaction Reference) number, IMPS, NEFT, or UPI reference number. This alphanumeric string is mandatory for freezing stolen funds.</p>
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 600, marginBottom: '8px', fontSize: '1.05rem' }}>2. Save Bank Statements</h4>
                    <p className="text-muted" style={{ lineHeight: 1.6, fontSize: '0.95rem' }}>Download the official PDF statement from your banking app showing the fraudulent transaction. Screenshots of SMS alerts are good secondary evidence, but the digitally signed PDF statement is the primary legal proof.</p>
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 600, marginBottom: '8px', fontSize: '1.05rem' }}>3. Do Not Ignore Crypto TXIDs</h4>
                    <p className="text-muted" style={{ lineHeight: 1.6, fontSize: '0.95rem' }}>If the scam involved Cryptocurrency, log into your exchange (e.g. Binance, Coinbase) and copy the exact TXID (Transaction Hash) and the destination wallet address. Do not just take a screenshot of the balance.</p>
                  </div>
                  <div style={{ background: '#fef2f2', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--accent-red)' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--accent-red)', fontWeight: 500 }}><strong>Emergency Action:</strong> If the transaction happened within the last 2 hours, call 1930 immediately before filing the report. Time is critical for reversing transactions.</p>
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p className="text-muted" style={{ margin: 0, fontSize: '0.95rem' }}>Got your evidence ready?</p>
              <Link href="/register">
                <button className="btn-primary" style={{ padding: '10px 20px' }}>File Complaint Now</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
