"use client";
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function EvidenceToolkitPage() {
  const [activeTab, setActiveTab] = useState<'ai' | 'redactor' | 'guide'>('ai');

  // AI Analyzer State
  const [aiImage, setAiImage] = useState<string | null>(null);
  const [aiFileName, setAiFileName] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Redactor State
  const [redactImage, setRedactImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  // New Toolset State
  const [markerSize, setMarkerSize] = useState(15);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Prevent default to stop the page from scrolling while zooming
      e.preventDefault();
      // Zoom by 10% per scroll tick
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      setZoomLevel(prev => Math.min(Math.max(0.2, prev * zoomFactor), 5));
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [redactImage]); // re-bind when redactImage changes and container renders

  const saveHistoryState = (context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const data = context.getImageData(0, 0, canvas.width, canvas.height);
    setHistory(prev => {
      const newHistory = prev.slice(0, historyStep + 1);
      newHistory.push(data);
      if (newHistory.length > 20) newHistory.shift();
      return newHistory;
    });
    setHistoryStep(prev => Math.min(prev + 1, 19));
  };

  const handleAiUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAiFileName(file.name);
      const reader = new FileReader();
      reader.onload = (ev) => setAiImage(ev.target?.result as string);
      reader.readAsDataURL(file);
      setAnalysisResult(null);
    }
  };

  const runAiAnalysis = async () => {
    if (!aiImage) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: aiImage })
      });
      const data = await res.json();
      setAnalysisResult(data);
    } catch (e) {
      console.error(e);
      alert('Analysis failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRedactUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target?.result as string;
        setRedactImage(src);
        
        // Load into canvas to strip EXIF and prepare for redaction
        setTimeout(() => {
          const canvas = canvasRef.current;
          if (canvas) {
            const context = canvas.getContext('2d', { willReadFrequently: true });
            if (context) setCtx(context);
            
            const img = new Image();
            img.onload = () => {
              // Scale to fit max width
              const maxWidth = 800;
              let width = img.width;
              let height = img.height;
              if (width > maxWidth) {
                height = (maxWidth / width) * height;
                width = maxWidth;
              }
              canvas.width = width;
              canvas.height = height;
              context?.drawImage(img, 0, 0, width, height);
              
              setHistory([]);
              setHistoryStep(-1);
              setZoomLevel(1);
              setTimeout(() => {
                if (context && canvas) saveHistoryState(context, canvas);
              }, 50);
            };
            img.src = src;
          }
        }, 100);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    
    // Adjust for CSS zoom transform
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(x, y, markerSize, 0, Math.PI * 2);
    ctx.fill();
  };

  const handleMouseUp = () => {
    if (isDrawing && ctx && canvasRef.current) {
      setIsDrawing(false);
      saveHistoryState(ctx, canvasRef.current);
    }
  };

  const handleUndo = () => {
    if (historyStep > 0 && ctx && canvasRef.current) {
      const newStep = historyStep - 1;
      setHistoryStep(newStep);
      ctx.putImageData(history[newStep], 0, 0);
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1 && ctx && canvasRef.current) {
      const newStep = historyStep + 1;
      setHistoryStep(newStep);
      ctx.putImageData(history[newStep], 0, 0);
    }
  };

  const handleClear = () => {
    if (history.length > 0 && ctx && canvasRef.current) {
      setHistoryStep(0);
      ctx.putImageData(history[0], 0, 0);
    }
  };

  const downloadRedacted = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL('image/jpeg', 0.9);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'safe_evidence_redacted.jpg';
      a.click();
    }
  };

  const getDynamicCursor = () => {
    const radius = markerSize * zoomLevel;
    const displayRadius = Math.min(radius, 64); // browser limit is typically 128x128 max cursor size
    const size = displayRadius * 2 + 4;
    const center = size / 2;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${center}" cy="${center}" r="${displayRadius}" fill="rgba(0,0,0,0.3)" stroke="white" stroke-width="1.5" />
      <circle cx="${center}" cy="${center}" r="${displayRadius - 1}" fill="none" stroke="black" stroke-width="1" opacity="0.4"/>
    </svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${center} ${center}, crosshair`;
  };

  return (
    <main style={{ padding: '40px 5%', maxWidth: '1600px', margin: '0 auto', minHeight: '80vh' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 className="heading-serif" style={{ fontSize: '2rem', marginBottom: '16px' }}>
          Smart Evidence Toolkit
        </h1>
        <p className="text-muted" style={{ fontSize: '1rem', maxWidth: '600px', marginBottom: '32px', lineHeight: 1.6 }}>
          Prepare, sanitize, and analyze your digital evidence before filing a complaint. Our AI tools ensure you submit high-quality evidence while protecting your sensitive information.
        </p>

        {/* Top Navigation Tabs */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <button 
            onClick={() => setActiveTab('ai')}
            style={{ 
              background: activeTab === 'ai' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'ai' ? 'white' : 'var(--text-primary)',
              border: activeTab === 'ai' ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
              padding: '10px 24px', borderRadius: '24px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            AI Evidence Analyzer
          </button>
          
          <button 
            onClick={() => setActiveTab('redactor')}
            style={{ 
              background: activeTab === 'redactor' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'redactor' ? 'white' : 'var(--text-primary)',
              border: activeTab === 'redactor' ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
              padding: '10px 24px', borderRadius: '24px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            Privacy Redactor & EXIF Scrubber
          </button>

          <button 
            onClick={() => setActiveTab('guide')}
            style={{ 
              background: activeTab === 'guide' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'guide' ? 'white' : 'var(--text-primary)',
              border: activeTab === 'guide' ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
              padding: '10px 24px', borderRadius: '24px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            Guidelines
          </button>
        </div>

        {/* Tab 1: AI Analyzer */}
        {activeTab === 'ai' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#eff6ff', color: '#2563eb', padding: '6px', borderRadius: '8px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </span>
                Upload Screenshot
              </h3>
              <p className="text-muted" style={{ fontSize: '0.95rem', marginBottom: '24px', textAlign: 'left', lineHeight: 1.6 }}>Upload a screenshot of the scam message, profile, or transaction. Our AI will extract the key details needed for your FIR.</p>
              
              <label style={{ display: 'block', marginBottom: '24px', cursor: 'pointer' }}>
                <div style={{ border: '2px dashed var(--border-color)', borderRadius: '8px', padding: '32px', textAlign: 'center', background: '#f8fafc', transition: 'all 0.2s' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px auto' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Click to choose a file</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>JPG, PNG, up to 5MB</div>
                </div>
                <input type="file" accept="image/*" onChange={handleAiUpload} style={{ display: 'none' }} />
              </label>
              
              <div style={{ 
                border: aiImage ? '1px solid #bbf7d0' : '1px solid transparent', 
                borderRadius: '8px', padding: '16px', marginBottom: '24px', 
                background: aiImage ? '#f0fdf4' : 'transparent', 
                display: 'flex', alignItems: 'center', gap: '12px',
                visibility: aiImage ? 'visible' : 'hidden'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 600, color: '#166534', fontSize: '0.95rem' }}>File uploaded successfully</div>
                  <div style={{ fontSize: '0.85rem', color: '#15803d', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {aiFileName || 'placeholder.jpg'}
                  </div>
                </div>
              </div>

              <button 
                onClick={runAiAnalysis} 
                disabled={!aiImage || isAnalyzing}
                className="btn-primary" 
                style={{ width: '100%', padding: '12px', fontSize: '1.05rem', opacity: (!aiImage || isAnalyzing) ? 0.6 : 1, marginTop: 'auto' }}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Evidence'}
              </button>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>Analysis Results</h3>
              
              {!analysisResult && !isAnalyzing && (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0', margin: 'auto 0' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ opacity: 0.5, marginBottom: '16px', display: 'inline-block' }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <p style={{ fontSize: '0.95rem' }}>Upload an image and run analysis to see extracted data here.</p>
                </div>
              )}

              {isAnalyzing && (
                <div style={{ textAlign: 'center', padding: '40px 0', margin: 'auto 0' }}>
                  <div className="loader" style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTop: '4px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                  <p style={{ fontSize: '0.95rem' }}>Extracting forensic details...</p>
                  <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
              )}

              {analysisResult && analysisResult.error && (
                <div style={{ background: '#fef2f2', padding: '16px', borderRadius: '8px', border: '1px solid #fecaca', textAlign: 'left', margin: 'auto 0' }}>
                  <span style={{ fontSize: '0.9rem', color: '#991b1b', fontWeight: 600 }}>Analysis Error</span>
                  <div style={{ fontSize: '0.95rem', color: '#7f1d1d', marginTop: '4px' }}>{analysisResult.error}</div>
                </div>
              )}

              {analysisResult && !analysisResult.error && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', height: '100%' }}>
                  {/* AI Description / Assessment */}
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>AI Assessment</span>
                    <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '4px', lineHeight: 1.6 }}>
                      {analysisResult.description || analysisResult.analysis || 'Analysis description unavailable.'}
                    </div>
                  </div>

                  {/* Core Details Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
                    <div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Classification</span>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--accent-primary)', marginTop: '4px' }}>{analysisResult.crimeType}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Recommended Category</span>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--accent-primary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {(analysisResult.recommendedCategory || 'Uncategorized').split('->').map((part: string, idx: number, arr: string[]) => (
                          <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {part.trim()}
                            {idx < arr.length - 1 && (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>
                                <path d="M5 12h14"></path>
                                <path d="m12 5 7 7-7 7"></path>
                              </svg>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Platform</span>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>{analysisResult.platform || 'Not visible'}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Evidence Strength</span>
                      <div style={{ 
                        fontSize: '0.95rem', 
                        fontWeight: 600, 
                        marginTop: '4px',
                        color: analysisResult.evidenceStrength === 'Excellent' ? '#059669' : analysisResult.evidenceStrength === 'Good' ? '#ca8a04' : '#dc2626'
                      }}>
                        {analysisResult.evidenceStrength || 'Unknown'}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Suspect Identifiers</span>
                      <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '4px' }}>{analysisResult.suspectInfo}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Technical Artifacts</span>
                      <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '4px', wordBreak: 'break-all' }}>{analysisResult.technicalArtifacts || 'None detected'}</div>
                    </div>
                  </div>

                  <div style={{ background: '#fef2f2', padding: '16px', borderRadius: '8px', border: '1px solid #fecaca' }}>
                    <span style={{ fontSize: '0.85rem', color: '#991b1b', fontWeight: 600 }}>Missing Information</span>
                    <div style={{ fontSize: '0.95rem', color: '#7f1d1d', marginTop: '4px' }}>{analysisResult.missingInformation}</div>
                  </div>

                  <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                    <Link href="/register">
                      <button className="btn-primary" style={{ width: '100%', padding: '12px' }}>Proceed to File Complaint</button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Privacy Redactor */}
        {activeTab === 'redactor' && (
          <div className="card">
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Scrub & Redact Evidence</h3>
              <p className="text-muted" style={{ fontSize: '0.95rem', marginBottom: '32px', maxWidth: '800px', lineHeight: 1.6 }}>
                Uploading images directly can leak your GPS location (EXIF data). This tool automatically strips all hidden metadata upon uploading. You can also manually paint over sensitive passwords, CVV numbers, or irrelevant private data before downloading the safe copy.
              </p>

              <div style={{ marginBottom: '24px', maxWidth: '400px' }}>
                <label style={{ display: 'block', cursor: 'pointer' }}>
                  <div style={{ border: '2px dashed var(--border-color)', borderRadius: '8px', padding: '32px', textAlign: 'center', background: '#f8fafc', transition: 'all 0.2s' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px auto' }}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Upload image to redact</div>
                  </div>
                  <input type="file" accept="image/*" onChange={handleRedactUpload} style={{ display: 'none' }} />
                </label>
              </div>

              {redactImage && (
                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', alignItems: 'start' }}>
                  
                  {/* Toolbar Sidebar */}
                  <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* Marker Thickness */}
                    <div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
                          Marker Size
                        </span>
                        <span>{markerSize}px</span>
                      </span>
                      <input type="range" min="5" max="50" value={markerSize} onChange={(e) => setMarkerSize(Number(e.target.value))} style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent-primary)' }} />
                    </div>

                    {/* Actions */}
                    <div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '12px' }}>Tools</span>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', background: 'white', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                        <button 
                          onClick={handleUndo} 
                          disabled={historyStep <= 0} 
                          title="Undo"
                          style={{ 
                            background: 'transparent', border: 'none', cursor: historyStep <= 0 ? 'default' : 'pointer', 
                            padding: '8px', borderRadius: '6px', color: 'var(--text-primary)',
                            opacity: historyStep <= 0 ? 0.3 : 1, transition: 'background 0.2s',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}
                          onMouseOver={(e) => { if(historyStep > 0) e.currentTarget.style.background = 'rgba(0,0,0,0.05)' }}
                          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
                        </button>
                        
                        <button 
                          onClick={handleRedo} 
                          disabled={historyStep >= history.length - 1} 
                          title="Redo"
                          style={{ 
                            background: 'transparent', border: 'none', cursor: historyStep >= history.length - 1 ? 'default' : 'pointer', 
                            padding: '8px', borderRadius: '6px', color: 'var(--text-primary)',
                            opacity: historyStep >= history.length - 1 ? 0.3 : 1, transition: 'background 0.2s',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}
                          onMouseOver={(e) => { if(historyStep < history.length - 1) e.currentTarget.style.background = 'rgba(0,0,0,0.05)' }}
                          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
                        </button>
                        
                        <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 4px' }} />
                        
                        <button 
                          onClick={handleClear} 
                          disabled={historyStep <= 0} 
                          title="Clear All Edits"
                          style={{ 
                            background: 'transparent', border: 'none', cursor: historyStep <= 0 ? 'default' : 'pointer', 
                            padding: '8px', borderRadius: '6px', color: 'var(--accent-red)',
                            opacity: historyStep <= 0 ? 0.3 : 1, transition: 'background 0.2s',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}
                          onMouseOver={(e) => { if(historyStep > 0) e.currentTarget.style.background = 'rgba(220,38,38,0.1)' }}
                          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </div>

                    {/* Download */}
                    <div style={{ marginTop: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
                      <button onClick={downloadRedacted} className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Download Safe Image
                      </button>
                      <div style={{ fontSize: '0.8rem', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '12px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                        EXIF Metadata Stripped
                      </div>
                    </div>
                  </div>

                  {/* Canvas Container */}
                  <div ref={canvasContainerRef} style={{ background: '#f1f5f9', padding: '24px', borderRadius: '8px', border: '1px solid var(--border-color)', width: '100%', height: '600px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'auto', position: 'relative' }}>
                    <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center', transition: 'transform 0.1s ease', display: 'inline-block' }}>
                      <canvas 
                        ref={canvasRef}
                        onMouseDown={() => setIsDrawing(true)}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onMouseMove={handleDraw}
                        style={{ cursor: getDynamicCursor(), boxShadow: '0 8px 24px rgba(0,0,0,0.15)', display: 'block', backgroundColor: 'white' }}
                      />
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Manual Guide */}
        {activeTab === 'guide' && (
          <div className="card">
             <h2 style={{ marginBottom: '24px', color: 'var(--accent-primary)', fontSize: '1.5rem' }}>Core Guidelines for Preservation</h2>
             <p className="text-muted" style={{ fontSize: '0.95rem', marginBottom: '32px', maxWidth: '900px', lineHeight: 1.6 }}>
               Proper preservation of evidence is crucial for law enforcement to track and recover funds, or prosecute cybercriminals. Follow these comprehensive guidelines to ensure your evidence holds up in court and provides investigators with the data they need.
             </p>

             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
                <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ background: '#eff6ff', color: '#2563eb', padding: '8px', borderRadius: '8px', display: 'flex' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    </span>
                    WhatsApp & Social Media
                  </h4>
                  <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
                    <li><strong>Never use "Clear Chat" or confront the scammer.</strong> Confronting them may prompt them to delete their account before police can freeze it.</li>
                    <li><strong>Export the chat log:</strong> Use the app's native export feature (e.g., WhatsApp &gt; More &gt; Export Chat) to save as a .txt file.</li>
                    <li><strong>Capture Profile URLs:</strong> Screenshots are good, but the unique Profile URL or User ID is better. Copy it directly from the app.</li>
                    <li><strong>Screen Record:</strong> If the scam involves a complex app flow or disappearing messages, take a screen recording navigating through the conversation.</li>
                  </ul>
                </div>
                
                <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ background: '#eff6ff', color: '#2563eb', padding: '8px', borderRadius: '8px', display: 'flex' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    </span>
                    Email Scams & Phishing
                  </h4>
                  <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
                    <li><strong>Do not forward the email to yourself.</strong> Forwarding modifies the email headers, losing the original sender's IP trace.</li>
                    <li><strong>Download Original Headers:</strong> In Gmail, click the three dots &gt; "Show original" and download the .eml file.</li>
                    <li><strong>Capture Malicious Links:</strong> Hover over the link to see the real URL. Right-click and "Copy Link Address" into a safe text file. Do NOT click the link.</li>
                    <li><strong>Save Attachments Safely:</strong> If you must download an attachment for evidence, do not open it. Keep it in its original format.</li>
                  </ul>
                </div>
                
                <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ background: '#eff6ff', color: '#2563eb', padding: '8px', borderRadius: '8px', display: 'flex' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                    </span>
                    Financial & Crypto Fraud
                  </h4>
                  <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
                    <li><strong>Download Official Bank Statements:</strong> Screenshots of SMS alerts are not enough. Download the official PDF statement showing the exact debit.</li>
                    <li><strong>Provide the UTR/Reference ID:</strong> This 12-to-16 digit number is critical for tracing funds across bank networks.</li>
                    <li><strong>Crypto Transactions (TXID):</strong> For crypto scams, provide the exact Transaction Hash (TXID), the sender wallet address, and the destination wallet address.</li>
                    <li><strong>Timeline of Events:</strong> Document the exact date and time (with timezone) that the transaction occurred.</li>
                  </ul>
                </div>
             </div>
          </div>
        )}

      </div>
    </main>
  );
}
