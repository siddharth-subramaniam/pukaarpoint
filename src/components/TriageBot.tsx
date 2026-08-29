"use client";
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Message {
  sender: 'bot' | 'user' | string;
  text: string;
  isEmergency?: boolean;
  link?: string;
  linkText?: string;
}

export default function TriageBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: 'Hi! I\'m the PukaarPoint AI Assistant. I can help you report a cybercrime emergency, guide you through the portal, or answer any questions. What brings you here today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Don't show on admin routes
  if (pathname.startsWith('/admin')) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    const newMessages = [...messages, { sender: 'user', text: userMsg }];
    setMessages(newMessages as any);
    setInput('');
    setIsLoading(true);

    try {
      const apiMessages = newMessages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages })
      });

      const data = await res.json();
      
      if (data.error) {
        setMessages(prev => [...prev, { sender: 'bot', text: 'Error: ' + data.error + ' Please check your API key in .env.local.' }]);
        setIsLoading(false);
        return;
      }

      let responseText = data.text || '';
      let isEmergency = false;
      let link = '';
      let linkText = '';

      // Strip PREFILL_DATA block and extract description for form pre-fill
      const prefillIndex = responseText.search(/PREFILL_DATA/i);
      if (prefillIndex !== -1) {
        const prefillSection = responseText.substring(prefillIndex);
        responseText = responseText.substring(0, prefillIndex).trim();
        try {
          const jsonMatch = prefillSection.match(/({[\s\S]*})/);
          if (jsonMatch) {
            const prefillData = JSON.parse(jsonMatch[1].trim());
            if (prefillData.description) {
              localStorage.setItem('prefill_description', prefillData.description);
            }
          }
        } catch(e) {
          console.error("Failed to parse prefill data", e);
        }
      }

      // Parse trigger tokens to decide which CTA to show
      if (responseText.includes('EMERGENCY_TRIGGER_1930')) {
        isEmergency = true;
        responseText = responseText.replace('EMERGENCY_TRIGGER_1930', '').trim();
      } else if (responseText.includes('EXTORTION_TRIGGER')) {
        link = '/register?category=individuals';
        linkText = 'Proceed to Form';
        responseText = responseText.replace('EXTORTION_TRIGGER', '').trim();
      } else if (responseText.includes('TRACKING_TRIGGER')) {
        link = '/track';
        linkText = 'Track Complaint';
        responseText = responseText.replace('TRACKING_TRIGGER', '').trim();
      } else if (responseText.includes('GENERAL_TRIGGER')) {
        link = '/register';
        linkText = 'Proceed to Form';
        responseText = responseText.replace('GENERAL_TRIGGER', '').trim();
      } else if (responseText.includes('EVIDENCE_TRIGGER')) {
        link = '/evidence';
        linkText = 'Go to Evidence Toolkit';
        responseText = responseText.replace('EVIDENCE_TRIGGER', '').trim();
      } else if (responseText.includes('DATABASE_TRIGGER')) {
        link = '/database';
        linkText = 'Check Scamster Database';
        responseText = responseText.replace('DATABASE_TRIGGER', '').trim();
      } else if (responseText.includes('HEATMAP_TRIGGER')) {
        link = '/heatmap';
        linkText = 'View Live Heatmap';
        responseText = responseText.replace('HEATMAP_TRIGGER', '').trim();
      } else if (responseText.includes('NO_TRIGGER')) {
        responseText = responseText.replace('NO_TRIGGER', '').trim();
      }

      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: responseText,
        isEmergency,
        link,
        linkText
      }] as any);

    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Network connection error.' }]);
    }
    
    setIsLoading(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        title="PukaarPoint Assistant"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'var(--accent-red)',
          color: 'white',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
          border: 'none',
          cursor: 'pointer',
          zIndex: 999,
          transition: 'transform 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          right: '24px',
          width: '350px',
          height: '500px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid var(--border-color)',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{ background: 'var(--accent-red)', color: 'white', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '50%' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'white' }}>PukaarPoint Assistant</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.9 }}>Triage & Portal Guide</p>
            </div>
          </div>

          {/* Message Area */}
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                {m.sender === 'bot' && (
                  <div style={{ background: 'var(--accent-red)', color: 'white', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: '2px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                )}
                <div style={{ 
                  maxWidth: '75%', 
                  padding: '12px 16px', 
                  borderRadius: '16px',
                  background: m.sender === 'user' ? 'var(--accent-primary)' : (m.isEmergency ? '#fef2f2' : 'white'),
                  color: m.sender === 'user' ? 'white' : (m.isEmergency ? 'var(--accent-red)' : 'var(--text-primary)'),
                  border: m.sender === 'bot' ? '1px solid var(--border-color)' : 'none',
                  borderBottomLeftRadius: m.sender === 'bot' ? '0px' : '16px',
                  borderBottomRightRadius: m.sender === 'user' ? '0px' : '16px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  fontWeight: m.sender === 'bot' ? 500 : 400,
                  whiteSpace: 'pre-wrap'
                }}>
                  {m.text}
                  {m.link && (
                    <div style={{ marginTop: '12px' }}>
                      <Link href={m.link}>
                        <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', width: '100%' }}>{m.linkText || 'Proceed to Form'}</button>
                      </Link>
                    </div>
                  )}
                  {m.isEmergency && (
                    <div style={{ marginTop: '12px' }}>
                      <a href="tel:1930" style={{ textDecoration: 'none' }}>
                        <button className="btn-danger" style={{ padding: '6px 12px', fontSize: '0.8rem', width: '100%', background: 'var(--accent-red)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                          CALL 1930 NOW
                        </button>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                <div style={{ background: 'var(--accent-red)', color: 'white', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div style={{ padding: '12px 16px', borderRadius: '16px', borderBottomLeftRadius: '0px', background: 'white', border: '1px solid var(--border-color)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent-red)', opacity: 0.7, animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} style={{ padding: '12px', background: 'white', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              placeholder="Describe your issue..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{ flex: 1, padding: '10px 12px', borderRadius: '24px', border: '1px solid var(--border-color)', fontSize: '0.9rem', outline: 'none' }}
            />
            <button type="submit" disabled={!input.trim() || isLoading} style={{ 
              background: (input.trim() && !isLoading) ? 'var(--accent-primary)' : '#cbd5e1', 
              color: 'white', 
              border: 'none', 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: (input.trim() && !isLoading) ? 'pointer' : 'not-allowed'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(45deg)' }}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
