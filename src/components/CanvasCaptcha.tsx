'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function CanvasCaptcha({ onRegenerate }: { onRegenerate: (code: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Background
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Noise lines
        for (let i = 0; i < 7; i++) {
          ctx.strokeStyle = `rgba(${Math.random()*255},${Math.random()*255},${Math.random()*255},0.5)`;
          ctx.beginPath();
          ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
          ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
          ctx.stroke();
        }
        
        // Noise dots
        for (let i = 0; i < 30; i++) {
          ctx.fillStyle = `rgba(${Math.random()*255},${Math.random()*255},${Math.random()*255},0.4)`;
          ctx.beginPath();
          ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, 2 * Math.PI);
          ctx.fill();
        }
        
        // Text
        ctx.font = 'bold 24px monospace';
        ctx.fillStyle = '#1e293b';
        ctx.textBaseline = 'middle';
        
        for (let i = 0; i < code.length; i++) {
          const x = 20 + i * 20;
          const y = canvas.height / 2 + (Math.random() * 10 - 5);
          const angle = (Math.random() * 0.4) - 0.2;
          
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(angle);
          ctx.fillText(code[i], 0, 0);
          ctx.restore();
        }
      }
    }
    
    onRegenerate(code);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
        <canvas ref={canvasRef} width="160" height="48" style={{ display: 'block' }}></canvas>
      </div>
      <button 
        type="button" 
        onClick={generateCaptcha}
        style={{ background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
        title="Regenerate Captcha"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 4 23 10 17 10"></polyline>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
        </svg>
      </button>
    </div>
  );
}
