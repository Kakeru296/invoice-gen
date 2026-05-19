import { useState, useEffect } from 'react';
import mondaySdk from 'monday-sdk-js';

const monday = mondaySdk();

export default function ItemSelector({ context, template }) {
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState('');
  const [items, setItems] = useState([]);
  const [columns, setColumns] = useState([]);
  const [lineItems, setLineItems] = useState([]);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [generating, setGenerating] = useState(false);
  const [mapping, setMapping] = useState({ description: '', quantity: '', rate: '' });
  const [step, setStep] = useState(1); // 1=board, 2=columns, 3=items, 4=client

  useEffect(() => {
    monday.api(`query { boards(limit: 50) { id name } }`).then(res => {
      setBoards(res.data?.boards || []);
    });
  }, []);

  const loadBoard = async (boardId) => {
    setSelectedBoard(boardId);
    const res = await monday.api(`query {
      boards(ids: [${boardId}]) {
        columns { id title type }
        items_page(limit: 100) { items { id name column_values { id text } } }
      }
    }`);
    const board = res.data?.boards?.[0];
    setColumns(board?.columns?.filter(c => c.type !== 'subtasks') || []);
    setItems(board?.items_page?.items || []);
    setStep(2);
  };

  const buildLineItems = () => {
    if (!mapping.description) return;
    const built = items.map(item => {
      const get = (colId) => item.column_values.find(cv => cv.id === colId)?.text || '';
      const desc = colId => colId ? get(colId) : item.name;
      const qty = parseFloat(get(mapping.quantity)) || 1;
      const rate = parseFloat(get(mapping.rate)) || 0;
      return { item_id: item.id, description: desc(mapping.description), quantity: qty, rate, amount: qty * rate };
    }).filter(li => li.rate > 0);
    setLineItems(built);
    setStep(4);
  };

  const updateLineItem = (idx, field, value) => {
    setLineItems(prev => prev.map((li, i) =>
      i === idx ? { ...li, [field]: field === 'description' ? value : parseFloat(value) || 0, amount: field === 'description' ? li.amount : (field === 'quantity' ? parseFloat(value) * li.rate : li.quantity * parseFloat(value)) } : li
    ));
  };

  const removeLineItem = (idx) => setLineItems(prev => prev.filter((_, i) => i !== idx));

  const addLineItem = () => setLineItems(prev => [...prev, { item_id: '', description: 'Custom item', quantity: 1, rate: 0, amount: 0 }]);

  const subtotal = lineItems.reduce((s, li) => s + (li.quantity || 1) * (li.rate || 0), 0);
  const taxRate = Number(template?.tax_rate || 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;
  const currencySymbol = template?.currency === 'USD' ? '$' : template?.currency === 'EUR' ? '€' : template?.currency === 'GBP' ? '£' : template?.currency === 'JPY' ? '¥' : '$';
  const fmt = (n) => `${currencySymbol}${Number(n).toFixed(template?.currency === 'JPY' ? 0 : 2)}`;

  const generate = async () => {
    if (!lineItems.length || !template) return;
    setGenerating(true);
    try {
      const resp = await fetch('/api/invoice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: context?.account?.id,
          board_id: selectedBoard,
          lineItems,
          client_name: clientName,
          client_email: clientEmail,
          due_date: dueDate || null,
        }),
      });
      if (!resp.ok) throw new Error(await resp.text());
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setStep(1);
      setLineItems([]);
      setClientName('');
      setClientEmail('');
    } catch (e) {
      alert('Error generating invoice: ' + e.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <h2 className="section-title">Create Invoice</h2>

      {/* Step 1: Select board */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: step > 1 ? 0 : 0 }}>
          <span style={{ background: '#1f3c88', color: '#fff', width: 24, height: 24, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>1</span>
          <label style={{ fontSize: 14, fontWeight: 600, color: '#323338', textTransform: 'none', letterSpacing: 0 }}>Select Board</label>
          {step > 1 && <span style={{ color: '#676879', fontSize: 13 }}>— {boards.find(b => b.id === selectedBoard)?.name}</span>}
        </div>
        {step === 1 && (
          <div style={{ marginTop: 16 }}>
            <select value={selectedBoard} onChange={e => loadBoard(e.target.value)} style={{ maxWidth: 400 }}>
              <option value="">Choose a board…</option>
              {boards.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Step 2: Map columns */}
      {step >= 2 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ background: step > 2 ? '#4caf50' : '#1f3c88', color: '#fff', width: 24, height: 24, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{step > 2 ? '✓' : '2'}</span>
            <label style={{ fontSize: 14, fontWeight: 600, color: '#323338', textTransform: 'none', letterSpacing: 0 }}>Map Columns to Invoice Fields</label>
          </div>
          {step === 2 && (
            <>
              <div className="form-grid" style={{ marginBottom: 16 }}>
                <div className="form-field">
                  <label>Description Column</label>
                  <select value={mapping.description} onChange={e => setMapping(m => ({ ...m, description: e.target.value }))}>
                    <option value="">Use item name</option>
                    {columns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>Quantity Column</label>
                  <select value={mapping.quantity} onChange={e => setMapping(m => ({ ...m, quantity: e.target.value }))}>
                    <option value="">Default (1)</option>
                    {columns.filter(c => c.type === 'numbers').map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>Rate / Price Column *</label>
                  <select value={mapping.rate} onChange={e => setMapping(m => ({ ...m, rate: e.target.value }))}>
                    <option value="">Select column…</option>
                    {columns.filter(c => c.type === 'numbers').map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
              </div>
              <button className="btn btn-primary" onClick={buildLineItems} disabled={!mapping.rate}>
                Build Line Items →
              </button>
            </>
          )}
        </div>
      )}

      {/* Step 3+: Line items & client */}
      {step >= 4 && (
        <>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ background: '#1f3c88', color: '#fff', width: 24, height: 24, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>3</span>
                <label style={{ fontSize: 14, fontWeight: 600, color: '#323338', textTransform: 'none', letterSpacing: 0 }}>Line Items</label>
              </div>
              <button className="btn btn-secondary" onClick={addLineItem} style={{ fontSize: 12 }}>+ Add Row</button>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style={{ width: 80 }}>Qty</th>
                  <th style={{ width: 100 }}>Rate</th>
                  <th style={{ width: 100 }}>Amount</th>
                  <th style={{ width: 40 }}></th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((li, i) => (
                  <tr key={i}>
                    <td><input value={li.description} onChange={e => updateLineItem(i, 'description', e.target.value)} style={{ border: 'none', padding: '4px 0', fontSize: 13, width: '100%' }} /></td>
                    <td><input type="number" value={li.quantity} min="0" onChange={e => updateLineItem(i, 'quantity', e.target.value)} style={{ border: 'none', padding: '4px 0', fontSize: 13, width: 60, textAlign: 'right' }} /></td>
                    <td><input type="number" value={li.rate} min="0" onChange={e => updateLineItem(i, 'rate', e.target.value)} style={{ border: 'none', padding: '4px 0', fontSize: 13, width: 80, textAlign: 'right' }} /></td>
                    <td style={{ textAlign: 'right', fontSize: 13 }}>{fmt((li.quantity || 1) * (li.rate || 0))}</td>
                    <td><button onClick={() => removeLineItem(i)} style={{ border: 'none', background: 'none', color: '#c62828', cursor: 'pointer', fontSize: 16 }}>×</button></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginTop: 16, gap: 6 }}>
              <div style={{ color: '#676879', fontSize: 13 }}>Subtotal: <strong>{fmt(subtotal)}</strong></div>
              {taxRate > 0 && <div style={{ color: '#676879', fontSize: 13 }}>Tax ({taxRate}%): <strong>{fmt(taxAmount)}</strong></div>}
              <div style={{ color: '#1f3c88', fontSize: 15, fontWeight: 700 }}>Total: {fmt(total)}</div>
            </div>
          </div>

          {/* Client info */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ background: '#1f3c88', color: '#fff', width: 24, height: 24, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>4</span>
              <label style={{ fontSize: 14, fontWeight: 600, color: '#323338', textTransform: 'none', letterSpacing: 0 }}>Client Info</label>
            </div>
            <div className="form-grid">
              <div className="form-field">
                <label>Client Name</label>
                <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Acme Corp" />
              </div>
              <div className="form-field">
                <label>Client Email</label>
                <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="client@example.com" />
              </div>
              <div className="form-field">
                <label>Due Date</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
            </div>
          </div>

          <button className="btn btn-primary" onClick={generate} disabled={generating || !lineItems.length || !template} style={{ fontSize: 15, padding: '12px 28px' }}>
            {generating ? '⏳ Generating PDF…' : '📄 Generate & Download Invoice'}
          </button>
        </>
      )}
    </div>
  );
}
