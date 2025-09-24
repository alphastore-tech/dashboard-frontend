'use client';

import { useState } from 'react';
import Monitor from './Monitor';
import Performance from './Performance';

// ────────────────────────────────────────────────────────────
// 🖼️   PAGE COMPONENT
// ────────────────────────────────────────────────────────────

export default function DomesticFuturePage() {
  const [activeTab, setActiveTab] = useState('monitor');

  const tabs = [
    { id: 'monitor', label: 'Monitor' },
    { id: 'performance', label: 'Performance' },
  ];

  return (
    <div className="w-full border-b border-gray-200 dark:border-slate-700">
      {/* Tab header */}
      <nav className="flex space-x-6 px-4 sm:px-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="relative py-4 text-base font-medium outline-none whitespace-nowrap"
          >
            {/* Tab label */}
            <span className={activeTab === tab.id ? 'text-black' : 'text-gray-400'}>
              {tab.label}
            </span>

            {/* Active underline */}
            {activeTab === tab.id && (
              <span className="absolute left-0 right-0 -bottom-px h-0.5 rounded-full bg-black transition-all" />
            )}
          </button>
        ))}
      </nav>

      {/* Tab panel */}
      <section className="-mx-4 sm:mx-0 px-4 sm:px-6 py-4 sm:py-6">
        {activeTab === 'monitor' && <Monitor />}
        {activeTab === 'performance' && <Performance />}
      </section>
    </div>
  );
}
