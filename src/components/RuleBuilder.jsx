import React, { useState, useEffect } from 'react';
import mondaySdk from 'monday-sdk-js';
import './RuleBuilder.css';

const monday = mondaySdk();

const CHANNELS = [
  { value: 'slack', label: 'Slack' },
  { value: 'teams', label: 'Microsoft Teams' },
  { value: 'email', label: 'Email' },
];

export default function RuleBuilder({ onSubmit, context }) {
  const [boards, setBoards] = useState([]);
  const [form, setForm] = useState({
    boardId: '',
    boardName: '',
    triggerColumn: 'any',
    channel: 'slack',
    webhookUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    monday.api('{ boards(limit: 50) { id name } }').then((res) => {
      setBoards(res.data?.boards || []);
    });
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'boardId') {
      const board = boards.find((b) => b.id === value);
      setForm((prev) => ({ ...prev, boardId: value, boardName: board?.name || '' }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.boardId || !form.webhookUrl) {
      setError('Board and Webhook URL are required.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(form);
      setForm({ boardId: '', boardName: '', triggerColumn: 'any', channel: 'slack', webhookUrl: '' });
    } catch {
      setError('Failed to save rule. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rule-builder">
      <h2>Add Notification Rule</h2>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Board</label>
          <select name="boardId" value={form.boardId} onChange={handleChange} required>
            <option value="">Select a board…</option>
            {boards.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Notify when</label>
          <select name="triggerColumn" value={form.triggerColumn} onChange={handleChange}>
            <option value="any">Any column changes</option>
            <option value="status">Status changes</option>
            <option value="assigned">Assigned person changes</option>
            <option value="date">Date changes</option>
          </select>
        </div>

        <div className="field">
          <label>Send to</label>
          <select name="channel" value={form.channel} onChange={handleChange}>
            {CHANNELS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Webhook URL</label>
          <input
            type="url"
            name="webhookUrl"
            value={form.webhookUrl}
            onChange={handleChange}
            placeholder={
              form.channel === 'slack'
                ? 'https://hooks.slack.com/services/…'
                : form.channel === 'teams'
                ? 'https://outlook.office.com/webhook/…'
                : 'your@email.com'
            }
            required
          />
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Saving…' : 'Add Rule'}
        </button>
      </form>
    </div>
  );
}
