import express from 'express';
import { generateInvoicePDF } from '../services/pdf.js';
import { getTemplate, createInvoice, listInvoices, getInvoice, updateInvoiceStatus } from '../services/supabase.js';

const router = express.Router();

// ボードから取得したアイテムで請求書 PDF を生成
router.post('/generate', async (req, res) => {
  const { account_id, lineItems, client_name, client_email, due_date } = req.body;

  if (!account_id || !lineItems?.length) {
    return res.status(400).json({ error: 'account_id and lineItems required' });
  }

  const template = await getTemplate(account_id);
  if (!template) {
    return res.status(400).json({ error: 'Please complete company settings first' });
  }

  const tax_rate = Number(template.tax_rate || 0);
  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity || 1) * (item.rate || 0), 0);
  const tax_amount = subtotal * (tax_rate / 100);
  const total = subtotal + tax_amount;

  // 請求書番号生成（プレフィックス + タイムスタンプ）
  const invoice_number = Date.now().toString().slice(-6);

  const invoiceData = {
    account_id,
    invoice_number,
    board_id: req.body.board_id || '',
    item_ids: lineItems.map(i => String(i.item_id || '')),
    client_name: client_name || '',
    client_email: client_email || '',
    subtotal,
    tax_amount,
    total,
    currency: template.currency || 'USD',
    status: 'draft',
    due_date: due_date || null,
    issued_at: new Date().toISOString(),
  };

  const savedInvoice = await createInvoice(invoiceData);

  const pdfBuffer = await generateInvoicePDF({
    template,
    invoice: { ...savedInvoice },
    lineItems,
  });

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${template.invoice_prefix || 'INV-'}${invoice_number}.pdf"`,
    'Content-Length': pdfBuffer.length,
  });
  res.send(pdfBuffer);
});

// 請求書一覧
router.get('/list/:account_id', async (req, res) => {
  const invoices = await listInvoices(req.params.account_id);
  res.json({ invoices });
});

// 請求書詳細 PDF 再生成
router.get('/:id/pdf', async (req, res) => {
  const { account_id } = req.query;
  if (!account_id) return res.status(400).json({ error: 'account_id required' });

  const invoice = await getInvoice(req.params.id, account_id);
  const template = await getTemplate(account_id);
  const pdfBuffer = await generateInvoicePDF({ template, invoice, lineItems: [] });

  res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="invoice-${invoice.invoice_number}.pdf"` });
  res.send(pdfBuffer);
});

// ステータス更新（draft → sent → paid）
router.patch('/:id/status', async (req, res) => {
  const { account_id, status } = req.body;
  if (!account_id || !status) return res.status(400).json({ error: 'account_id and status required' });
  await updateInvoiceStatus(req.params.id, account_id, status);
  res.json({ ok: true });
});

export default router;
