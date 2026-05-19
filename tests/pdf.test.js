import { describe, it, expect } from 'vitest';
import { generateInvoicePDF } from '../server/services/pdf.js';

const template = {
  company_name: 'Test Corp',
  company_address: '123 Main St',
  company_email: 'test@test.com',
  tax_rate: 10,
  payment_terms: 'Net 30',
  currency: 'USD',
  invoice_prefix: 'INV-',
};

const invoice = {
  invoice_number: '123456',
  client_name: 'Acme Inc',
  client_email: 'client@acme.com',
  issued_at: new Date().toISOString(),
  due_date: null,
  subtotal: 1000,
  tax_amount: 100,
  total: 1100,
};

const lineItems = [
  { description: 'Web Design', quantity: 2, rate: 300 },
  { description: 'Hosting', quantity: 1, rate: 400 },
];

describe('PDF Generation', () => {
  it('generates a PDF buffer', async () => {
    const buf = await generateInvoicePDF({ template, invoice, lineItems });
    expect(buf).toBeInstanceOf(Buffer);
    expect(buf.length).toBeGreaterThan(1000);
  });

  it('PDF starts with %PDF header', async () => {
    const buf = await generateInvoicePDF({ template, invoice, lineItems });
    expect(buf.toString('ascii', 0, 4)).toBe('%PDF');
  });

  it('handles empty line items', async () => {
    const buf = await generateInvoicePDF({ template, invoice, lineItems: [] });
    expect(buf).toBeInstanceOf(Buffer);
  });

  it('handles JPY currency (no decimals)', async () => {
    const jpyTemplate = { ...template, currency: 'JPY' };
    const buf = await generateInvoicePDF({ template: jpyTemplate, invoice, lineItems });
    expect(buf).toBeInstanceOf(Buffer);
  });

  it('handles missing optional fields gracefully', async () => {
    const minTemplate = { company_name: 'Min Corp' };
    const minInvoice = { invoice_number: '001', subtotal: 100, tax_amount: 0, total: 100 };
    const buf = await generateInvoicePDF({ template: minTemplate, invoice: minInvoice, lineItems: [] });
    expect(buf).toBeInstanceOf(Buffer);
  });
});
