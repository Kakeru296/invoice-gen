import { useState, useEffect } from 'react';
import mondaySdk from 'monday-sdk-js';
import ItemSelector from './components/ItemSelector.jsx';
import TemplateSettings from './components/TemplateSettings.jsx';
import InvoiceHistory from './components/InvoiceHistory.jsx';
import './App.css';

const monday = mondaySdk();

export default function App() {
  const [context, setContext] = useState(null);
  const [tab, setTab] = useState('create'); // create | settings | history
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isViewOnly, setIsViewOnly] = useState(false);

  useEffect(() => {
    monday.listen('context', async (res) => {
      const ctx = res.data;
      setContext(ctx);
      setIsViewOnly(!!ctx.isViewOnly);
      try {
        const resp = await fetch(`/api/template/${ctx.account?.id}`);
        const json = await resp.json();
        setTemplate(json.template);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <p>Loading InvoiceGen…</p>
      </div>
    );
  }

  if (isViewOnly) {
    return (
      <div className="view-only-message">
        <span className="view-only-icon">🔒</span>
        <h2>View-only access</h2>
        <p>As a viewer, you are unable to create or manage invoices. Please contact your account admin to get edit access.</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">📄</span>
          <span className="logo-text">InvoiceGen</span>
        </div>
        <nav className="tabs">
          {[
            { id: 'create', label: 'Create Invoice' },
            { id: 'history', label: 'History' },
            { id: 'settings', label: 'Settings' },
          ].map(t => (
            <button
              key={t.id}
              className={`tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <a
          className="help-link"
          href="https://app3-amber.vercel.app/how-to-use"
          target="_blank"
          rel="noopener noreferrer"
        >
          How to use ↗
        </a>
      </header>

      <main className="app-main">
        {!template && tab !== 'settings' && (
          <div className="setup-banner">
            <span>⚠️ Set up your company info before generating invoices.</span>
            <button onClick={() => setTab('settings')}>Go to Settings →</button>
          </div>
        )}

        {tab === 'create' && (
          <ItemSelector context={context} template={template} />
        )}
        {tab === 'settings' && (
          <TemplateSettings
            context={context}
            template={template}
            onSaved={(t) => { setTemplate(t); setTab('create'); }}
          />
        )}
        {tab === 'history' && (
          <InvoiceHistory context={context} />
        )}
      </main>
    </div>
  );
}
