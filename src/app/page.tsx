'use client';
import { useEffect, useRef, useState } from 'react';

type Source = { title: string; url: string };
type Turn = { id: string; question: string; answer: string; sources: Source[]; createdAt: string };
type Thread = { id: string; title: string; turns: Turn[]; updatedAt: string };
const KEY = 'kairos.threads.v1';
const button = { background: '#fff', color: '#000', border: 'none', borderRadius: 8, padding: '0.65rem 1rem', cursor: 'pointer' };
const field = { background: '#111116', border: '1px solid #333', borderRadius: 8, color: '#eee', padding: '0.8rem', minWidth: 0 };

function validThread(value: unknown): value is Thread {
  if (!value || typeof value !== 'object') return false;
  const t = value as Thread;
  return typeof t.id === 'string' && typeof t.title === 'string' && typeof t.updatedAt === 'string' && Array.isArray(t.turns) && t.turns.every(v => v && typeof v.id === 'string' && typeof v.question === 'string' && typeof v.answer === 'string' && typeof v.createdAt === 'string' && Array.isArray(v.sources) && v.sources.every(s => s && typeof s.title === 'string' && typeof s.url === 'string' && /^https?:\/\//i.test(s.url)));
}

export default function Home() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [storageOK, setStorageOK] = useState(false);
  const [storageError, setStorageError] = useState('');
  const [error, setError] = useState('');
  const busy = useRef(false);
  const request = useRef<AbortController | null>(null);
  const active = threads.find(t => t.id === activeId);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.version !== 1 || !Array.isArray(saved.threads) || !saved.threads.every(validThread)) throw new Error('Invalid storage');
        setThreads(saved.threads);
        setActiveId(saved.threads.some((t: Thread) => t.id === saved.activeId) ? saved.activeId : null);
      }
      setStorageOK(true);
    } catch {
      setStorageError('Saved threads could not be loaded. Existing storage was left untouched; this session is not being saved.');
    }
    setReady(true);
    return () => request.current?.abort();
  }, []);

  useEffect(() => {
    if (!ready || !storageOK) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ version: 1, threads, activeId }));
      setStorageError('');
    } catch {
      setStorageError('Threads could not be saved on this device. Your current conversation remains in this tab.');
    }
  }, [threads, activeId, ready, storageOK]);

  const startNew = () => {
    if (busy.current) return;
    setActiveId(null); setQuery(''); setError('');
  };
  const rename = (t: Thread) => {
    if (busy.current) return;
    const title = window.prompt('Thread title', t.title)?.trim();
    if (title) setThreads(list => list.map(item => item.id === t.id ? { ...item, title: title.slice(0, 100) } : item));
  };
  const remove = (t: Thread) => {
    if (busy.current || !window.confirm(`Delete "${t.title}" from this device? This cannot be undone.`)) return;
    setThreads(list => list.filter(item => item.id !== t.id));
    if (activeId === t.id) startNew();
  };

  const handleSearch = async () => {
    const question = query.trim();
    if (!question || busy.current || !ready) return;
    if (question.length > 10000) { setError('Please keep your question under 10,000 characters.'); return; }
    busy.current = true; setLoading(true); setError('');
    const targetId = active?.id ?? crypto.randomUUID();
    const prior = active?.turns ?? [];
    const history = prior.slice(-6).flatMap(t => [
      { role: 'user', content: t.question.slice(0, 1500) },
      { role: 'assistant', content: t.answer.slice(0, 1500) },
    ]);
    const controller = new AbortController();
    request.current = controller;
    const timer = setTimeout(() => controller.abort(), 60000);
    try {
      let results = [];
      const directIdentity = /^(who (made|built|created) you|who are you|what (model|ai model) (are you|do you use)|who is your (creator|developer))[?!.\s]*$/i.test(question);
      if (!directIdentity) {
        const searchQuery = prior.length ? `${prior.slice(-2).map(t => t.question.slice(0, 300)).join(' ')} ${question}` : question;
        const response = await fetch('/api/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: searchQuery }), signal: controller.signal });
        const data = await response.json();
        if (!response.ok || !Array.isArray(data) || !data.length) throw new Error('No search results found. Your previous messages are safe; try again.');
        results = data;
      }
      const response = await fetch('/api/answer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: question, results, history }), signal: controller.signal });
      const data = await response.json();
      if (!response.ok || typeof data.answer !== 'string' || !data.answer.trim()) throw new Error(typeof data.error === 'string' ? data.error : 'Failed to generate an answer.');
      const sources: Source[] = Array.isArray(data.sources) ? data.sources.filter((s: Source) => s && typeof s.title === 'string' && typeof s.url === 'string' && /^https?:\/\//i.test(s.url)) : [];
      const now = new Date().toISOString();
      const turn: Turn = { id: crypto.randomUUID(), question, answer: data.answer, sources, createdAt: now };
      setThreads(list => {
        const existing = list.find(t => t.id === targetId);
        const updated: Thread = existing ? { ...existing, turns: [...existing.turns, turn], updatedAt: now } : { id: targetId, title: question.slice(0, 80), turns: [turn], updatedAt: now };
        return [updated, ...list.filter(t => t.id !== targetId)];
      });
      setActiveId(targetId); setQuery('');
    } catch (e: unknown) {
      setError(controller.signal.aborted ? 'The request timed out or was cancelled. Your earlier messages are safe; retry your question.' : e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      clearTimeout(timer); request.current = null; busy.current = false; setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e0e0e0', fontFamily: 'system-ui, sans-serif' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 2rem', borderBottom: '1px solid #222' }}>
        <span>Kairos · Manitec Future LLC</span><a href="/search" style={{ color: '#aaa' }}>Search mode →</a>
      </nav>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', padding: '1.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <aside style={{ flex: '1 1 220px', minWidth: 0 }} aria-label="Saved threads">
          <button style={button} disabled={!ready || loading} onClick={startNew}>New thread</button>
          <p style={{ color: '#aaa', fontSize: '0.8rem' }}>Saved on this device/browser only. No account or cross-device sync. Clearing browser data removes threads. Messages are sent to the answer service when you ask a follow-up. Keep one Kairos tab open to avoid conflicting saves.</p>
          <p role="status" style={{ color: '#ffcc80' }}>{storageError}</p>
          {!ready && <p>Loading threads…</p>}
          {ready && !threads.length && <p style={{ color: '#888' }}>Your first successful answer will start a thread.</p>}
          {threads.map(t => (
            <div key={t.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid #222' }}>
              <button disabled={loading} aria-current={activeId === t.id ? 'true' : undefined} onClick={() => { if (busy.current) return; setActiveId(t.id); setQuery(''); setError(''); }} style={{ ...button, background: activeId === t.id ? '#233044' : '#17171f', color: '#eee', width: '100%', textAlign: 'left', overflowWrap: 'anywhere' }}>{t.title}</button>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}><button disabled={loading} onClick={() => rename(t)}>Rename</button><button disabled={loading} onClick={() => remove(t)}>Delete</button></div>
            </div>
          ))}
        </aside>
        <section style={{ flex: '3 1 500px', minWidth: 0 }} aria-label="Conversation">
          {!active && <header style={{ textAlign: 'center', padding: '2rem 0' }}><h1>The right answer<br />at the right moment.</h1><p style={{ color: '#aaa' }}>Ask a question, then keep exploring in the same thread.</p></header>}
          {active && <h1 style={{ overflowWrap: 'anywhere' }}>{active.title}</h1>}
          {active?.turns.map(turn => (
            <article key={turn.id} style={{ borderBottom: '1px solid #222', padding: '1rem 0', overflowWrap: 'anywhere' }}>
              <h2 style={{ fontSize: '1.1rem', whiteSpace: 'pre-wrap' }}>{turn.question}</h2>
              <time style={{ fontSize: '0.75rem', color: '#888' }} dateTime={turn.createdAt}>{new Date(turn.createdAt).toLocaleString()}</time>
              <div style={{ lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: '1rem 0' }}>{turn.answer}</div>
              {turn.sources.length > 0 && <div><p>Sources for this answer</p>{turn.sources.map((s, i) => <div key={`${s.url}-${i}`}><a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: '#7dd3fc' }}>[{i + 1}] {s.title}</a></div>)}</div>}
            </article>
          ))}
          <form onSubmit={e => { e.preventDefault(); void handleSearch(); }} style={{ display: 'flex', gap: 8, marginTop: '1.5rem' }}>
            <input aria-label={active ? 'Ask a follow-up' : 'Ask a question'} value={query} disabled={!ready || loading} maxLength={10000} onChange={e => setQuery(e.target.value)} placeholder={active ? 'Ask a follow-up…' : 'Ask anything…'} style={{ ...field, flex: 1 }} />
            <button type="submit" disabled={!ready || loading || !query.trim()} style={button}>Ask</button>
          </form>
          <p role="status">{loading ? 'Searching and thinking…' : ''}</p>
          {error && <p role="alert" style={{ color: '#e57373' }}>{error}</p>}
        </section>
      </div>
      <footer style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Kairos · Manitec Future LLC · <a href="https://github.com/Manitec-HQ/kairos" style={{ color: '#aaa' }}>GitHub</a></footer>
    </main>
  );
}
