import React from 'react';
import './RuleList.css';

const CHANNEL_LABEL = { slack: 'Slack', teams: 'Teams', email: 'Email' };
const TRIGGER_LABEL = {
  any: 'Any change', status: 'Status change',
  assigned: 'Assigned person change', date: 'Date change',
};

export default function RuleList({ rules, onDelete }) {
  if (rules.length === 0) {
    return (
      <div className="rule-list-empty">
        No rules yet. Add one above to start receiving notifications.
      </div>
    );
  }

  return (
    <div className="rule-list">
      <h2>Active Rules</h2>
      {rules.map((rule) => (
        <div key={rule.id} className="rule-item">
          <div className="rule-info">
            <span className="rule-board">{rule.board_name}</span>
            <span className="rule-meta">
              {TRIGGER_LABEL[rule.trigger_column] || rule.trigger_column}
              {' → '}
              {CHANNEL_LABEL[rule.channel] || rule.channel}
            </span>
          </div>
          <button className="btn-delete" onClick={() => onDelete(rule.id)}>
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
