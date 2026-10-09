'use client';

import { useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import './kairos-home.css';

export default function Template({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [threadsOpen, setThreadsOpen] = useState(false);
  if (pathname !== '/') return <>{children}</>;

  return (
    <div className={`kairos-home${threadsOpen ? ' kairos-threads-open' : ''}`}>
      <header className="kairos-topbar">
        <a className="kairos-brand" href="/">Kairos<span>MANITEC FUTURE LLC</span></a>
        <div className="kairos-nav-actions">
          <button className="kairos-threads-toggle" type="button" aria-expanded={threadsOpen} onClick={() => setThreadsOpen(open => !open)}>{threadsOpen ? 'Hide threads' : 'Threads'}</button>
          <a href="/search">Search mode →</a>
        </div>
      </header>
      <details className="kairos-storage-note">
        <summary>Saved on this device</summary>
        <p>Threads are saved in this browser, not synced across devices. Clearing browser data removes them. Recent messages are sent to the answer service when you ask a follow-up. Use one Kairos tab at a time to avoid conflicting saves.</p>
      </details>
      {children}
    </div>
  );
}
