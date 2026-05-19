import { describe, it, expect, vi, beforeAll } from 'vitest';
import request from 'supertest';

vi.mock('../server/services/supabase.js', () => ({
  upsertAccount: vi.fn().mockResolvedValue(undefined),
  getAccount: vi.fn().mockResolvedValue({ account_id: 'test', access_token: 'tok' }),
  getTemplate: vi.fn().mockResolvedValue({ company_name: 'Test', tax_rate: 0, currency: 'USD', invoice_prefix: 'INV-' }),
  createInvoice: vi.fn().mockResolvedValue({ id: 'uuid', invoice_number: '001', issued_at: new Date().toISOString(), subtotal: 100, tax_amount: 0, total: 100 }),
  listInvoices: vi.fn().mockResolvedValue([]),
  getInvoice: vi.fn().mockResolvedValue({ id: 'uuid', invoice_number: '001', issued_at: new Date().toISOString(), subtotal: 100, tax_amount: 0, total: 100, status: 'draft' }),
  updateInvoiceStatus: vi.fn().mockResolvedValue(undefined),
  upsertTemplate: vi.fn().mockResolvedValue(undefined),
}));

process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_KEY = 'test-key';
process.env.MONDAY_CLIENT_ID = 'test-client-id';
process.env.MONDAY_CLIENT_SECRET = 'test-secret';
process.env.APP_URL = 'http://localhost:3001';

let app;
beforeAll(async () => {
  const mod = await import('../server/index.js');
  app = mod.default;
});

describe('Health check', () => {
  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.app).toBe('invoice-gen');
  });
});

describe('Template API', () => {
  it('GET /api/template/:id returns template', async () => {
    const res = await request(app).get('/api/template/acc-123');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('template');
  });

  it('PUT /api/template/:id validates company_name', async () => {
    const res = await request(app).put('/api/template/acc-123').send({ tax_rate: 10 });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('company_name');
  });

  it('PUT /api/template/:id saves successfully', async () => {
    const res = await request(app).put('/api/template/acc-123').send({ company_name: 'Test Corp' });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});

describe('Invoice API', () => {
  it('GET /api/invoice/list/:id returns invoices', async () => {
    const res = await request(app).get('/api/invoice/list/acc-123');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.invoices)).toBe(true);
  });

  it('POST /api/invoice/generate requires account_id', async () => {
    const res = await request(app).post('/api/invoice/generate').send({ lineItems: [] });
    expect(res.status).toBe(400);
  });

  it('POST /api/invoice/generate requires lineItems', async () => {
    const res = await request(app).post('/api/invoice/generate').send({ account_id: 'acc-123', lineItems: [] });
    expect(res.status).toBe(400);
  });

  it('PATCH /api/invoice/:id/status requires account_id and status', async () => {
    const res = await request(app).patch('/api/invoice/some-id/status').send({});
    expect(res.status).toBe(400);
  });
});
