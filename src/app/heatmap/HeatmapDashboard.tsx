"use client";
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the map to avoid SSR issues with Leaflet
const MapLayer = dynamic(() => import('./MapLayer'), { ssr: false, loading: () => <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>Loading map data...</div> });

const CRIME_TYPES = ['all', 'Financial Fraud', 'Identity Theft', 'Phishing', 'Cyberbullying', 'Ransomware', 'Online Scam', 'Hacking', 'Data Breach', 'Cyber Stalking', 'Investment Fraud'];

export default function HeatmapDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [crimeType, setCrimeType] = useState('all');
  const [status, setStatus] = useState('all');
  const [days, setDays] = useState('180');
  
  // Interaction State
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [sortOption, setSortOption] = useState('newest');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/heatmap?crimeType=${encodeURIComponent(crimeType)}&status=${status}&days=${days}`);
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error("Failed to fetch heatmap data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [crimeType, status, days]);

  const formatCurrency = (val: string | number) => {
    if (!val) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(parseFloat(val.toString()));
  };

  return (
    <>
      <style>{`
        .list-row {
          padding: 8px 12px;
          border-radius: 8px;
          transition: background-color 0.2s ease;
          cursor: default;
        }
        .list-row:hover {
          background-color: #f1f5f9;
        }
        .filter-dropdown {
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .filter-dropdown:hover {
          border-color: #94a3b8 !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          background-color: #f8fafc !important;
        }
      `}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Top Summary Stats */}
        <div style={{ display: 'flex', gap: '32px', paddingBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Total Reports</div>
            <div style={{ fontSize: '2rem', fontWeight: 300, color: 'var(--text-primary)' }}>{loading ? '...' : (data?.stats?.total_reports || 0)}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Resolved</div>
            <div style={{ fontSize: '2rem', fontWeight: 300, color: 'var(--text-primary)' }}>{loading ? '...' : (data?.stats?.resolved || 0)}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Total Lost</div>
            <div style={{ fontSize: '2rem', fontWeight: 300, color: 'var(--accent-red)' }}>{loading ? '...' : formatCurrency(data?.stats?.total_amount_lost)}</div>
          </div>
        </div>

        {/* Minimal Filters */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <select className="filter-dropdown" value={crimeType} onChange={e => setCrimeType(e.target.value)} style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'transparent', fontSize: '0.9rem', color: 'var(--text-primary)', outline: 'none' }}>
            <option value="all">All Crime Types</option>
            <optgroup label="Financial Crimes">
              <option value="Financial Fraud">Financial Fraud</option>
              <option value="Investment Fraud">Investment Fraud</option>
              <option value="Online Scam">Online Scam</option>
              <option value="Phishing">Phishing</option>
            </optgroup>
            <optgroup label="Personal & Social">
              <option value="Cyberbullying">Cyberbullying</option>
              <option value="Cyber Stalking">Cyber Stalking</option>
              <option value="Identity Theft">Identity Theft</option>
            </optgroup>
            <optgroup label="Technical & Data">
              <option value="Data Breach">Data Breach</option>
              <option value="Hacking">Hacking</option>
              <option value="Ransomware">Ransomware</option>
            </optgroup>
          </select>
          
          <select className="filter-dropdown" value={status} onChange={e => setStatus(e.target.value)} style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'transparent', fontSize: '0.9rem', color: 'var(--text-primary)', outline: 'none' }}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
          </select>

          <select className="filter-dropdown" value={days} onChange={e => setDays(e.target.value)} style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'transparent', fontSize: '0.9rem', color: 'var(--text-primary)', outline: 'none' }}>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 3 Months</option>
            <option value="180">Last 6 Months</option>
            <option value="365">Last 1 Year</option>
          </select>
        </div>

      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        
        {/* Left Column: Lists (Minimalist) */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
          
          {/* Top Cities */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '20px', color: 'var(--text-primary)', borderLeft: '3px solid var(--accent-primary)', paddingLeft: '12px' }}>Top Hotspots</h3>
            {loading ? <p className="text-muted">Loading...</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {data?.cities?.slice(0, 6).map((c: any, i: number) => (
                  <div key={i} className="list-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{c.city}</span>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.top_crime}</div>
                    </div>
                    <div style={{ fontWeight: 400, color: 'var(--text-primary)' }}>
                      {c.total}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Crime Breakdown */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '20px', color: 'var(--text-primary)', borderLeft: '3px solid var(--accent-red)', paddingLeft: '12px' }}>Crime Distribution</h3>
            {loading ? <p className="text-muted">Loading...</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {data?.crimeBreakdown?.slice(0, 6).map((c: any, i: number) => (
                  <div key={i} className="list-row">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-primary)' }}>{c.crime_type}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{c.count}</span>
                    </div>
                    <div style={{ width: '100%', background: 'var(--border-color)', borderRadius: '2px', height: '4px', overflow: 'hidden' }}>
                      <div style={{ background: 'var(--accent-primary)', height: '100%', width: `${(c.count / data.stats.total_reports) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Map */}
        <div style={{ flex: '2 1 600px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, minHeight: '600px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative', background: '#111827' }}>
            {!loading && data ? (
              <MapLayer points={data.points} cities={data.cities} onCityClick={(city) => setSelectedCity(city)} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>Loading map...</div>
            )}

            {/* City Details Sidebar Overlay */}
            {selectedCity && data && (
              <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '400px', maxWidth: '100%', background: 'white', zIndex: 1000, boxShadow: '-4px 0 25px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.2s ease-out' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#f8fafc' }}>
                  <div>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '1.3rem', color: 'var(--text-primary)', fontWeight: 600 }}>{selectedCity.city}, {selectedCity.state}</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{selectedCity.total} cases • {formatCurrency(selectedCity.total_amount_lost)} lost</p>
                  </div>
                  <button 
                    onClick={() => setSelectedCity(null)} 
                    title="Close"
                    style={{ 
                      background: 'transparent', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: '6px', 
                      color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' 
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                
                <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>Raw Crime Reports</h4>
                    <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '6px', padding: '4px', gap: '2px', border: '1px solid var(--border-color)' }}>
                      <button 
                        onClick={() => setSortOption(sortOption === 'newest' ? 'oldest' : 'newest')}
                        title={sortOption === 'newest' ? "Sort: Oldest First" : "Sort: Newest First"}
                        style={{ 
                          background: sortOption.includes('est') ? 'white' : 'transparent',
                          boxShadow: sortOption.includes('est') ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                          border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '4px', 
                          color: sortOption.includes('est') ? 'var(--text-primary)' : 'var(--text-secondary)'
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          {sortOption === 'newest' ? <polyline points="6 9 12 15 18 9"/> : <polyline points="18 15 12 9 6 15"/>}
                        </svg>
                      </button>

                      <button 
                        onClick={() => setSortOption('status')}
                        title="Sort by Status"
                        style={{ 
                          background: sortOption === 'status' ? 'white' : 'transparent',
                          boxShadow: sortOption === 'status' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                          border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '4px',
                          color: sortOption === 'status' ? 'var(--text-primary)' : 'var(--text-secondary)'
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      </button>
                    </div>
                  </div>
                  
                  {data.points.filter((p: any) => p.city === selectedCity.city)
                    .sort((a: any, b: any) => {
                      if (sortOption === 'newest') return new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime();
                      if (sortOption === 'oldest') return new Date(a.reported_at).getTime() - new Date(b.reported_at).getTime();
                      if (sortOption === 'status') {
                        const weight: Record<string, number> = { 'resolved': 1, 'investigating': 2, 'pending': 3 };
                        return (weight[a.status] || 4) - (weight[b.status] || 4);
                      }
                      return 0;
                    })
                    .map((report: any, idx: number) => (
                    <div key={idx} style={{ padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{report.crime_type}</span>
                        <span style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '12px', background: report.status === 'resolved' ? '#ecfdf5' : report.status === 'pending' ? '#fffbeb' : '#fef2f2', color: report.status === 'resolved' ? '#059669' : report.status === 'pending' ? '#d97706' : '#dc2626', fontWeight: 600, letterSpacing: '0.02em' }}>
                          {report.status.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'monospace', letterSpacing: '0.02em', color: 'var(--text-secondary)' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                          ID: PKR-{new Date(report.reported_at).getTime().toString().slice(-5)}{idx}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          {new Date(report.reported_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {data.points.filter((p: any) => p.city === selectedCity.city).length === 0 && (
                     <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '40px 0', background: '#f8fafc', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
                       No individual raw reports in the visible dataset for this city.
                     </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
      </div>
    </>
  );
}
