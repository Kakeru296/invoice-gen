import { useState } from 'react';

export default function TemplateSettings({ context, template, onSaved }) {
  const [form, setForm] = useState({
    company_name: template?.company_name || '',
    company_address: template?.company_address || '',
    company_email: template?.company_email || '',
    company_phone: template?.company_phone || '',
    tax_rate: template?.tax_rate ?? 0,
    payment_terms: template?.payment_terms || 'Net 30',
    currency: template?.currency || 'USD',
    invoice_prefix: template?.invoice_prefix || 'INV-',
    notes: template?.notes || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const save = async () => {
    if (!form.company_name) return alert('Company name is required');
    setSaving(true);
    try {
      const resp = await fetch(`/api/template/${context?.account?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!resp.ok) throw new Error(await resp.text());
      setSaved(true);
      onSaved(form);
    } catch (e) {
      alert('Error saving: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="section-title">Company Settings</h2>
      <div className="card">
        <div className="form-grid">
          <div className="form-field full">
            <label>Company Name *</label>
            <input value={form.company_name} onChange={update('company_name')} placeholder="Your Company Name" />
          </div>
          <div className="form-field full">
            <label>Address</label>
            <textarea value={form.company_address} onChange={update('company_address')} placeholder="123 Main St, City, State ZIP" rows={2} />
          </div>
          <div className="form-field">
            <label>Email</label>
            <input type="email" value={form.company_email} onChange={update('company_email')} placeholder="billing@yourcompany.com" />
          </div>
          <div className="form-field">
            <label>Phone</label>
            <input value={form.company_phone} onChange={update('company_phone')} placeholder="+1 555 0100" />
          </div>
          <div className="form-field">
            <label>Currency</label>
            <select value={form.currency} onChange={update('currency')}>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="CAD">CAD ($)</option>
              <option value="AUD">AUD ($)</option>
            </select>
          </div>
          <div className="form-field">
            <label>Tax Rate (%)</label>
            <input type="number" value={form.tax_rate} onChange={update('tax_rate')} min="0" max="100" step="0.01" placeholder="0" />
          </div>
          <div className="form-field">
            <label>Payment Terms</label>
            <select value={form.payment_terms} onChange={update('payment_terms')}>
              <option>Net 15</option>
              <option>Net 30</option>
              <option>Net 60</option>
              <option>Due on Receipt</option>
            </select>
          </div>
          <div className="form-field">
            <label>Invoice Number Prefix</label>
            <input value={form.invoice_prefix} onChange={update('invoice_prefix')} placeholder="INV-" />
          </div>
          <div className="form-field full">
            <label>Default Notes / Footer</label>
            <textarea value={form.notes} onChange={update('notes')} placeholder="Thank you for your business!" rows={3} />
          </div>
        </div>

        <div style={{ marginTop: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
          {saved && <span style={{ color: '#2e7d32', fontSize: 13 }}>✓ Saved!</span>}
        </div>
      </div>
    </div>
  );
}
