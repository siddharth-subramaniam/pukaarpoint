"use client";
import { useState, useEffect } from 'react';

type Scamster = {
  id: string;
  identifier: string;
  type: string;
  reports: number;
  risk: string;
  date: string;
  notes: string;
};

export default function DatabasePage() {
  const [data, setData] = useState<Scamster[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  
  const [sortColumn, setSortColumn] = useState<keyof Scamster | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetch('/api/scamsters')
      .then(res => res.json())
      .then((records) => {
        setData(records);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
  }, []);

  const filteredData = data.filter(item => {
    const matchesSearch = item.identifier.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.notes.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'All' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    
    let valA = a[sortColumn];
    let valB = b[sortColumn];
    
    if (sortColumn === 'risk') {
      const riskWeight = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
      valA = riskWeight[valA as keyof typeof riskWeight] || 0;
      valB = riskWeight[valB as keyof typeof riskWeight] || 0;
    }
    
    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (column: keyof Scamster) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const renderSortIcon = (column: keyof Scamster) => {
    const isActive = sortColumn === column;
    const isAsc = isActive && sortDirection === 'asc';
    const isDesc = isActive && sortDirection === 'desc';

    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px' }}>
        {/* UP Chevron */}
        <path 
          d="M7 9l5-5 5 5" 
          stroke={isAsc ? 'var(--accent-primary)' : 'currentColor'} 
          style={{ opacity: isAsc ? 1 : 0.3 }} 
        />
        {/* DOWN Chevron */}
        <path 
          d="M7 15l5 5 5-5" 
          stroke={isDesc ? 'var(--accent-primary)' : 'currentColor'} 
          style={{ opacity: isDesc ? 1 : 0.3 }} 
        />
      </svg>
    );
  };

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'Critical': return { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' };
      case 'High': return { bg: '#fff7ed', text: '#9a3412', border: '#fed7aa' };
      case 'Medium': return { bg: '#fefce8', text: '#854d0e', border: '#fef08a' };
      case 'Low': return { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' };
      default: return { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' };
    }
  };

  return (
    <>
      <style>{`
        .search-input {
          width: 100%;
          padding: 18px 24px;
          font-size: 1.05rem;
          border-radius: 16px;
          border: 1px solid #cbd5e1;
          outline: none;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          transition: all 0.2s ease;
          background: #ffffff;
          color: var(--text-primary);
        }
        .search-input:hover {
          border-color: #94a3b8;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        .search-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
        }

        .filter-select {
          width: 100%;
          padding: 18px 48px 18px 20px;
          font-size: 1.05rem;
          border-radius: 16px;
          border: 1px solid #cbd5e1;
          outline: none;
          background: #ffffff;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          appearance: none;
          cursor: pointer;
          transition: all 0.2s ease;
          color: var(--text-primary);
        }
        .filter-select:hover {
          border-color: #94a3b8;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        .filter-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
        }

        .table-row {
          transition: background-color 0.2s ease;
        }
        .table-row:hover {
          background-color: #f1f5f9;
        }

        .table-header {
          transition: all 0.2s ease;
        }
        .table-header:hover {
          background-color: #e2e8f0;
          color: var(--text-primary) !important;
        }
      `}</style>

      <main style={{ padding: '40px 5%', maxWidth: '1600px', margin: '0 auto', minHeight: '80vh' }}>
        <div style={{ marginBottom: '40px' }}>
          <h1 className="heading-serif" style={{ fontSize: '2rem', marginBottom: '16px' }}>Scamster Database</h1>
          <p className="text-muted" style={{ fontSize: '1rem', maxWidth: '800px', marginBottom: '32px', lineHeight: 1.6 }}>
            Search our national repository of reported scammers. Verify suspicious phone numbers, email addresses, UPI IDs, or IP addresses before engaging in transactions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <input 
              type="text" 
              className="search-input"
              placeholder="Search phone number, email, IP, or keywords..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div style={{ flex: '0 0 240px', position: 'relative' }}>
            <select 
              className="filter-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Phone">Phone Numbers</option>
              <option value="Email">Email Addresses</option>
              <option value="UPI">UPI IDs</option>
              <option value="IP Address">IP Addresses</option>
              <option value="Website">Websites</option>
            </select>
            {/* Custom chevron for select */}
            <div style={{ position: 'absolute', top: '50%', right: '20px', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                  <th className="table-header" onClick={() => handleSort('identifier')} style={{ padding: '18px 24px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '1rem', cursor: 'pointer', userSelect: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>Identifier {renderSortIcon('identifier')}</div>
                  </th>
                  <th className="table-header" onClick={() => handleSort('type')} style={{ padding: '18px 24px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '1rem', cursor: 'pointer', userSelect: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>Type {renderSortIcon('type')}</div>
                  </th>
                  <th className="table-header" onClick={() => handleSort('risk')} style={{ padding: '18px 24px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '1rem', cursor: 'pointer', userSelect: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>Risk Level {renderSortIcon('risk')}</div>
                  </th>
                  <th className="table-header" onClick={() => handleSort('reports')} style={{ padding: '18px 24px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '1rem', cursor: 'pointer', userSelect: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>Reports {renderSortIcon('reports')}</div>
                  </th>
                  <th className="table-header" onClick={() => handleSort('notes')} style={{ padding: '18px 24px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '1rem', cursor: 'pointer', userSelect: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>Notes / Activity {renderSortIcon('notes')}</div>
                  </th>
                  <th className="table-header" onClick={() => handleSort('date')} style={{ padding: '18px 24px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '1rem', cursor: 'pointer', userSelect: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>Last Reported {renderSortIcon('date')}</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      <div style={{ marginBottom: '16px' }}>
                        <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto', animation: 'spin 1s linear infinite' }}>
                          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                        </svg>
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)' }}>Loading records...</div>
                    </td>
                  </tr>
                ) : sortedData.length > 0 ? (
                  sortedData.map((item) => (
                    <tr key={item.id} className="table-row" style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '20px 24px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem' }}>{item.identifier}</td>
                      <td style={{ padding: '20px 24px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{item.type}</td>
                      <td style={{ padding: '20px 24px' }}>
                        <span style={{ 
                          padding: '4px 12px', 
                          borderRadius: '24px', 
                          fontSize: '0.85rem', 
                          fontWeight: 600,
                          background: getRiskColor(item.risk).bg,
                          color: getRiskColor(item.risk).text,
                          border: `1px solid ${getRiskColor(item.risk).border}`
                        }}>
                          {item.risk}
                        </span>
                      </td>
                      <td style={{ padding: '20px 24px', color: 'var(--text-primary)', fontWeight: 500, fontSize: '1rem' }}>{item.reports}</td>
                      <td style={{ padding: '20px 24px', color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.notes}>
                        {item.notes}
                      </td>
                      <td style={{ padding: '20px 24px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{item.date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      <div style={{ marginBottom: '16px' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ opacity: 0.5, margin: '0 auto' }}>
                          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px' }}>No records found</div>
                      <p style={{ fontSize: '0.95rem' }}>Try adjusting your search criteria or filter.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
