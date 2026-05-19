import React, { useState, useEffect } from 'react';
import mondaySdk from 'monday-sdk-js';
import RuleBuilder from './components/RuleBuilder.jsx';
import RuleList from './components/RuleList.jsx';
import './App.css';

const monday = mondaySdk();

export default function App() {
  const [context, setContext] = useState(null);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    monday.listen('context', (res) => setContext(res.data));
    monday.execute('valueCreatedForUser');
  }, []);

  useEffect(() => {
    if (!context?.account?.id) return;
    fetchRules(context.account.id);
  }, [context]);

  async function fetchRules(accountId) {
    setLoading(true);
    try {
      const res = await fetch(`/api/rules?accountId=${accountId}`);
      const data = await res.json();
      setRules(data.rules || []);
    } finally {
      setLoading(false);
    }
  }

  async function handleRuleCreate(rule) {
    const res = await fetch('/api/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...rule, accountId: context.account.id }),
    });
    const data = await res.json();
    setRules((prev) => [...prev, data.rule]);
  }

  async function handleRuleDelete(ruleId) {
    await fetch(`/api/rules/${ruleId}?accountId=${context.account.id}`, { method: 'DELETE' });
    setRules((prev) => prev.filter((r) => r.id !== ruleId));
  }

  if (loading) return (
    <div className="app">
      <div className="hero">
        <span className="hero-icon">🔔</span>
        <h1>Smart Notify</h1>
        <p className="tagline">monday.com → Slack & Teams in 30 seconds</p>
      </div>
      <div className="loading">Loading your rules...</div>
    </div>
  );

  return (
    <div className="app">
      <div className="hero">
        <span className="hero-icon">🔔</span>
        <h1>Smart Notify</h1>
        <p className="tagline">Get notified in Slack or Teams when your boards change — no Automation setup needed</p>
      </div>
      <RuleBuilder onSubmit={handleRuleCreate} context={context} />
      <RuleList rules={rules} onDelete={handleRuleDelete} />
    </div>
  );
}
