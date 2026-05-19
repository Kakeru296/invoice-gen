import { useState, useEffect } from 'react';

export default function InvoiceHistory({ context }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!context?.account?.id) return;
    fetch(`/api/invoice/list/${context.account.id}`)
      .then(r => r.json())
      .then(d => setInvoices(d.invoices || []))
      .finally(() => setLoading(false));
  }, [context]);

  const updateStatus = async (id, status) => {
    await fetch(`/api/invoice/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ account_id: context.account.id, status }),
    });
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv));
  };

  const downloadPdf = async (inv) => {
    const resp = await fetch(`/api/invoice/${inv.id}/pdf?account_id=${context.account.id}`);
    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${inv.invoice_number}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <h2 className="section-title">Invoice History</h2>
      {invoices.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48, color: '#676879' }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>📄</p>
          <p>No invoices yet. Generate your first invoice!</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Client</th>
                <th>Total</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id}>
                  <td style={{ fontWeight: 600 }}>{inv.invoice_number}</td>
                  <td>{inv.client_name || '—'}</td>
                  <td style={{ fontWeight: 600 }}>
                    {inv.currency === 'JPY' ? '¥' : inv.currency === 'EUR' ? '€' : inv.currency === 'GBP' ? '£' : '$'}
                    {Number(inv.total).toFixed(inv.currency === 'JPY' ? 0 : 2)}
                  </td>
                  <td>{new Date(inv.issued_at).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge badge-${inv.status}`}>{inv.status}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-secondary" onClick={() => downloadPdf(inv)} style={{ fontSize: 11, padding: '4px 10px' }}>PDF</button>
                      {inv.status === 'draft' && (
                        <button className="btn btn-secondary" onClick={() => updateStatus(inv.id, 'sent')} style={{ fontSize: 11, padding: '4px 10px' }}>Mark Sent</button>
                      )}
                      {inv.status === 'sent' && (
                        <button className="btn btn-secondary" onClick={() => updateStatus(inv.id, 'paid')} style={{ fontSize: 11, padding: '4px 10px', color: '#2e7d32' }}>Mark Paid</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
