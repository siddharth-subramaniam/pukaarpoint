"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminPortal() {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken) {
      setToken(savedToken);
      fetchComplaints(savedToken);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('admin_token', data.token);
      setToken(data.token);
      fetchComplaints(data.token);
    } else {
      alert("Invalid Password");
    }
  };

  const fetchComplaints = async (authToken: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/complaints', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setComplaints(data);
      } else {
        // If unauthorized, clear token
        if (res.status === 401) {
          setToken(null);
          localStorage.removeItem('admin_token');
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (tracking_id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/complaints', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ tracking_id, status: newStatus })
      });
      
      if (res.ok) {
        setComplaints(prev => prev.map(c => c.tracking_id === tracking_id ? { ...c, status: newStatus } : c));
        if (selectedComplaint && selectedComplaint.tracking_id === tracking_id) {
          setSelectedComplaint({ ...selectedComplaint, status: newStatus });
        }
      }
    } catch (e) {
      alert("Failed to update status");
    }
  };

  const handleExportSTIX = (complaint: any) => {
    const dataStr = JSON.stringify({
      type: "bundle",
      id: "bundle--" + crypto.randomUUID(),
      spec_version: "2.1",
      objects: [
        {
          type: "incident",
          name: complaint.broad_category + " Incident",
          description: complaint.incident_description,
          created: new Date(complaint.created_at).toISOString(),
          extended_properties: complaint
        }
      ]
    }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `STIX_${complaint.tracking_id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!token) {
    return (
      <main className="container" style={{ padding: '80px 24px', display: 'flex', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="card" style={{ width: '100%', maxWidth: '450px' }}>
          <h1 className="heading-serif text-center" style={{ fontSize: '2rem', marginBottom: '8px' }}>Officer Portal</h1>
          <p className="text-center text-muted" style={{ marginBottom: '32px' }}>Secure access for law enforcement officials.</p>
          
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Master Password *</label>
              <input 
                type="password" 
                placeholder="e.g. admin123" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '1rem' }}
                required
              />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%' }}>Access Dashboard</button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Link href="/" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textDecoration: 'none', fontWeight: 500 }}>Back to Public Portal</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#000000' }}>Admin Dashboard</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedComplaint ? '1fr 1fr' : '1fr', gap: '24px' }}>
        {/* Complaints Table */}
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.9rem' }}>
                <th style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0' }}>Tracking ID</th>
                <th style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0' }}>Date</th>
                <th style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0' }}>Category</th>
                <th style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                <th style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center' }}>Loading...</td></tr>
              ) : complaints.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center' }}>No complaints found.</td></tr>
              ) : (
                complaints.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #e2e8f0', background: selectedComplaint?.id === c.id ? '#eff6ff' : 'white' }}>
                    <td style={{ padding: '16px 24px', fontWeight: 600, color: '#000000' }}>{c.tracking_id}</td>
                    <td style={{ padding: '16px 24px', color: '#475569' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '16px 24px', color: '#475569' }}>{c.broad_category}</td>
                    <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                      <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize' }}>
                        {c.status.replaceAll('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                      <button onClick={() => setSelectedComplaint(c)} className="action-review">
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Detail View */}
        {selectedComplaint && (
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px', height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0 }}>Complaint Details</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button onClick={() => handleExportSTIX(selectedComplaint)} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>
                  Download STIX
                </button>
                <button onClick={() => setSelectedComplaint(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '8px', color: '#334155' }}>Update Status</h3>
              <select 
                value={selectedComplaint.status}
                onChange={(e) => updateStatus(selectedComplaint.tracking_id, e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 600, fontSize: '0.95rem' }}
              >
                <option value="registered">Registered</option>
                <option value="assigned_to_investigating_officer">Assigned to Investigating Officer</option>
                <option value="under_investigation">Under Investigation</option>
                <option value="action_taken">Action Taken / Resolved</option>
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '8px', color: '#334155' }}>Case Information</h3>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
                <p style={{ margin: '0 0 4px 0' }}><strong>Category:</strong> {selectedComplaint.broad_category} / {selectedComplaint.sub_category}</p>
                <p style={{ margin: '0 0 4px 0' }}><strong>Incident Date:</strong> {selectedComplaint.incident_date ? new Date(selectedComplaint.incident_date).toLocaleString() : 'N/A'}</p>
                <p style={{ margin: '0 0 4px 0' }}><strong>Platform:</strong> {selectedComplaint.platform || 'N/A'}</p>
                {selectedComplaint.delay_reason && (
                  <p style={{ margin: '0' }}><strong>Reporting Delay Reason:</strong> {selectedComplaint.delay_reason}</p>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '8px', color: '#334155' }}>Reporter Information</h3>
              {selectedComplaint.is_anonymous ? (
                <p style={{ color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>Filed Anonymously</p>
              ) : (
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
                  <p style={{ margin: '0 0 4px 0' }}><strong>Name:</strong> {selectedComplaint.reporter_name}</p>
                  <p style={{ margin: '0 0 4px 0' }}><strong>Phone:</strong> {selectedComplaint.reporter_phone}</p>
                  <p style={{ margin: '0 0 4px 0' }}><strong>Email:</strong> {selectedComplaint.reporter_email || 'N/A'}</p>
                  <p style={{ margin: '0 0 4px 0' }}><strong>National ID:</strong> {selectedComplaint.national_id || 'N/A'}</p>
                  <p style={{ margin: '0' }}><strong>Address:</strong> {selectedComplaint.reporter_address || 'N/A'}</p>
                </div>
              )}
            </div>

            {selectedComplaint.suspect_details && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '8px', color: '#334155' }}>Suspect Details</h3>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
                  {typeof selectedComplaint.suspect_details === 'string' 
                    ? Object.entries(JSON.parse(selectedComplaint.suspect_details)).map(([key, val]) => (
                        <p key={key} style={{ margin: '0 0 4px 0', textTransform: 'capitalize' }}><strong>{key.replace(/([A-Z])/g, ' $1')}:</strong> {val ? String(val) : 'N/A'}</p>
                      ))
                    : Object.entries(selectedComplaint.suspect_details).map(([key, val]) => (
                        <p key={key} style={{ margin: '0 0 4px 0', textTransform: 'capitalize' }}><strong>{key.replace(/([A-Z])/g, ' $1')}:</strong> {val ? String(val) : 'N/A'}</p>
                      ))
                  }
                </div>
              </div>
            )}

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '8px', color: '#334155' }}>Incident Description</h3>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.9rem', lineHeight: 1.5, maxHeight: '200px', overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                {selectedComplaint.incident_description}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
