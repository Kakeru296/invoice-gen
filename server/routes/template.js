import express from 'express';
import { getTemplate, upsertTemplate } from '../services/supabase.js';

const router = express.Router();

router.get('/:account_id', async (req, res) => {
  const template = await getTemplate(req.params.account_id);
  res.json({ template });
});

router.put('/:account_id', async (req, res) => {
  const { account_id } = req.params;
  const { company_name, company_address, company_email, company_phone, tax_rate, payment_terms, currency, invoice_prefix, notes } = req.body;

  if (!company_name) return res.status(400).json({ error: 'company_name required' });

  await upsertTemplate(account_id, { company_name, company_address, company_email, company_phone, tax_rate, payment_terms, currency, invoice_prefix, notes });
  res.json({ ok: true });
});

export default router;
