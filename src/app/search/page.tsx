'use client';
import { useState } from 'react';
import Link from 'next/link';

interface Result {
  title: string;
  url: string;
  content: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    const res = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const data = await res.json();
    setResults(data);
    setLoading(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#e0e0e0', fontFamily: 'monospace' }}>
      {/* Header */}
      <header style={{ background: '#111', borderBottom: '1px solid #222', padding: '2rem 0' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 1.5rem' }}>
          <img src="https://file-hosting.dashnexpages.net/manitec/logo.png" alt="Manitec Logo" style={{ height: '48px', marginBottom: '1rem' }} />
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', margin: '0 0 0.25rem' }}>Manitec Search</h1>
          <p style={{ color: '#666', margin: '0 0 1rem', fontSize: '0.875rem' }}>// Initializing search protocol... Access granted.</p>
          <div style={{ fontSize: '0.75rem', color: '#444', display: 'flex', gap: '1rem' }}>
            <span>LAST LOGIN: {new Date().toLocaleString()}</span>
            <span>|</span>
            <span>SYSTEM STATUS: <span style={{ color: '#4ade80' }}>OK</span></span>
            <span style={{ animation: 'blink 1s step-end infinite' }}>_</span>
          </div>
        </div>
      </header>

      {/* Search */}
      <section style={{ padding: '2.5rem 0', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="SEARCH_>"
            style={{
              flex: 1,
              background: '#111',
              border: '1px solid #333',
              color: '#e0e0e0',
              padding: '0.75rem 1rem',
              fontFamily: 'monospace',
              fontSize: '1rem',
              outline: 'none',
              borderRadius: '4px'
            }}
          />
          <button
            onClick={handleSearch}
            style={{
              background: '#e0e0e0',
              color: '#0a0a0a',
              border: 'none',
              padding: '0.75rem 1.5rem',
              fontFamily: 'monospace',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              borderRadius: '4px'
            }}
          >
            EXECUTE_
          </button>
        </div>
        <div style={{ maxWidth: '860px', margin: '0.75rem auto 0', padding: '0 1.5rem' }}>
          <Link href="/" style={{ color: '#555', fontSize: '0.75rem', textDecoration: 'none' }}>
            ← Switch to Kairos Answer Mode
          </Link>
        </div>
      </section>

      {/* Results */}
      <section style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {loading && <p style={{ color: '#555' }}>// Scanning index...</p>}
        {!loading && searched && results.length === 0 && (
          <p style={{ color: '#555' }}>// No results found. Try a different query.</p>
        )}
        {!loading && results.map((r, i) => (
          <div key={i} style={{ marginBottom: '1.75rem', borderLeft: '2px solid #222', paddingLeft: '1rem' }}>
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#93c5fd', textDecoration: 'none', fontWeight: 600, fontSize: '1rem', display: 'block', marginBottom: '0.25rem' }}
            >
              {r.title}
            </a>
            <span style={{ color: '#4ade80', fontSize: '0.75rem', display: 'block', marginBottom: '0.5rem' }}>{r.url}</span>
            <p style={{ color: '#999', fontSize: '0.875rem', margin: 0, lineHeight: 1.6 }}>{r.content}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #1a1a1a', padding: '2rem 0', textAlign: 'center', color: '#444', fontSize: '0.75rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <a href="https://www.buymeacoffee.com/_Joe" target="_blank" rel="noopener noreferrer">
            <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style={{ height: '40px' }} />
          </a>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
          <a href="https://manitec.pw/home" style={{ color: '#555', textDecoration: 'none' }}>Home</a>
          <a href="https://manitec.pw/pages/privacy" style={{ color: '#555', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="https://manitec.pw/pages/terms" style={{ color: '#555', textDecoration: 'none' }}>Terms</a>
          <a href="https://manitec.pw/pages/about" style={{ color: '#555', textDecoration: 'none' }}>About</a>
        </div>
        <p>© 2026 Manitec. All Rights Reserved</p>
      </footer>

      <style>{`
        @keyframes blink {
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
