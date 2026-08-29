"use client";
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface Message {
  sender: 'bot' | 'user' | string;
  text: string;
  isEmergency?: boolean;
  link?: string;
}

export default function EmergencyPage() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: 'Hello. I am the Cyber First Responder Bot. To get started, please tell me briefly what happened.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

      if (responseText.includes('EMERGENCY_TRIGGER_1930')) {
        isEmergency = true;
        responseText = responseText.replace('EMERGENCY_TRIGGER_1930', '').trim();
      } else if (responseText.includes('EXTORTION_TRIGGER')) {
        link = '/register?category=individuals';
        responseText = responseText.replace('EXTORTION_TRIGGER', '').trim();
      } else if (responseText.includes('GENERAL_TRIGGER')) {
        link = '/register';
        responseText = responseText.replace('GENERAL_TRIGGER', '').trim();
      }

      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: responseText,
        isEmergency,
        link
      }] as any);

    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Network connection error.' }]);
    }
    
    setIsLoading(false);
  };

  return (
    <main style={{ padding: '40px 5%', maxWidth: '1600px', margin: '0 auto', minHeight: '80vh' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 className="heading-serif" style={{ fontSize: '1.5rem', color: 'var(--accent-red)', marginBottom: '16px' }}>Emergency Assistance</h1>
        <p className="text-muted" style={{ fontSize: '0.95rem', maxWidth: '600px', marginBottom: '32px', lineHeight: 1.6 }}>Chat with our First Responder AI to determine your immediate next steps.</p>
      </div>

      <div className="card" style={{ 
        width: '100%', 
        maxWidth: '800px',
        height: '500px',
        display: 'flex', 
        flexDirection: 'column', 
        padding: 0, 
        overflow: 'hidden',
        border: '1px solid var(--accent-red)'
      }}>
        {/* Chat Area */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
              {m.sender === 'bot' && (
                <div style={{ background: 'var(--accent-red)', color: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: '2px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
              )}
              <div style={{ 
                maxWidth: '75%', 
                padding: '14px 18px', 
                borderRadius: '16px',
                background: m.sender === 'user' ? 'var(--accent-primary)' : (m.isEmergency ? '#fef2f2' : 'white'),
                color: m.sender === 'user' ? 'white' : (m.isEmergency ? 'var(--accent-red)' : 'var(--text-primary)'),
                border: m.sender === 'bot' ? '1px solid var(--border-color)' : 'none',
                borderBottomLeftRadius: m.sender === 'bot' ? '0px' : '16px',
                borderBottomRightRadius: m.sender === 'user' ? '0px' : '16px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                fontWeight: m.sender === 'bot' ? 600 : 400
              }}>
                {m.text}
                {m.link && (
                  <div style={{ marginTop: '16px' }}>
                    <Link href={m.link}>
                      <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem', width: '100%' }}>Proceed to Form</button>
                    </Link>
                  </div>
                )}
                {m.isEmergency && (
                  <div style={{ marginTop: '16px' }}>
                    <a href="tel:1930" style={{ textDecoration: 'none' }}>
                      <button className="btn-danger" style={{ padding: '12px 24px', fontSize: '1.1rem', width: '100%', background: 'var(--accent-red)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                        CALL 1930 NOW
                      </button>
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} style={{ padding: '20px', background: 'white', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '12px' }}>
          <input 
            type="text" 
            placeholder="Describe your issue..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ flex: 1, padding: '16px 20px', borderRadius: '32px', border: '1px solid var(--border-color)', fontSize: '1.05rem', outline: 'none' }}
          />
          <button type="submit" disabled={!input.trim() || isLoading} style={{ 
            background: (input.trim() && !isLoading) ? 'var(--accent-primary)' : '#cbd5e1', 
            color: 'white', 
            border: 'none', 
            width: '56px', 
            height: '56px', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: (input.trim() && !isLoading) ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(45deg)' }}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </form>
      </div>
    </main>
  );
}
