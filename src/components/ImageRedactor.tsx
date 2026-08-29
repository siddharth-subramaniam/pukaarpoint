"use client";
import { useState, useRef, useEffect } from 'react';

export default function ImageRedactor({ imageSrc, onSave, onCancel }: { imageSrc: string, onSave: (dataUrl: string) => void, onCancel: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  // Load the image onto the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    setCtx(context);

    const img = new Image();
    img.onload = () => {
      // Scale canvas to fit window nicely while maintaining aspect ratio
      const maxWidth = window.innerWidth * 0.8;
      const maxHeight = window.innerHeight * 0.6;
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (maxHeight / height) * width;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;
      context.drawImage(img, 0, 0, width, height);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setStartPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx || !canvasRef.current) return;
    // We don't want to draw continuously, just preview. But for a simple redaction, drawing black boxes directly on mouse move is actually fine if they want to 'paint' over it.
    // Let's implement a 'paint' brush instead of a drag-rectangle for simpler UX.
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fill();
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleSave = () => {
    if (canvasRef.current) {
      onSave(canvasRef.current.toDataURL('image/jpeg'));
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
      background: 'rgba(15, 23, 42, 0.8)', zIndex: 1000,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '90vw' }}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Privacy Redactor</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Click and drag over the image to black out sensitive PII before uploading.</p>
          </div>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>&times;</button>
        </div>
        
        <div style={{ border: '2px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden', background: '#f8fafc', cursor: 'crosshair' }}>
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ display: 'block' }}
          />
        </div>

        <div style={{ marginTop: '24px', display: 'flex', gap: '16px', width: '100%', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} className="btn-outline">Cancel</button>
          <button onClick={handleSave} className="btn-primary">Attach Redacted Evidence</button>
        </div>
      </div>
    </div>
  );
}
