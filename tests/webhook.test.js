import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';
import request from 'supertest';

// Mock supabase and notify before importing app
vi.mock('../server/services/supabase.js', () => ({
  getRules: vi.fn().mockResolvedValue([]),
  logNotification: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../server/services/notify.js', () => ({
  sendNotification: vi.fn().mockResolvedValue(undefined),
}));

process.env.MONDAY_SIGNING_SECRET = 'test-secret';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_KEY = 'test-key';
process.env.APP_URL = 'https://test.app';
process.env.MONDAY_CLIENT_ID = 'cid';
process.env.MONDAY_CLIENT_SECRET = 'csecret';

const { default: app } = await import('../server/index.js');

function sign(body) {
  return 'sha256=' + crypto
    .createHmac('sha256', 'test-secret')
    .update(JSON.stringify(body))
    .digest('base64');
}

describe('POST /api/webhook/monday', () => {
  it('responds to challenge handshake', async () => {
    const body = { challenge: 'abc123' };
    const res = await request(app)
      .post('/api/webhook/monday')
      .send(body)
      .set('x-monday-signature', sign(body));
    expect(res.status).toBe(200);
    expect(res.body.challenge).toBe('abc123');
  });

  it('rejects invalid signature', async () => {
    const res = await request(app)
      .post('/api/webhook/monday')
      .send({ event: { accountId: '1', boardId: '2' } })
      .set('x-monday-signature', 'sha256=invalid');
    expect(res.status).toBe(401);
  });

  it('accepts valid signed event', async () => {
    const body = { event: { accountId: '1', boardId: '2', columnType: 'status', pulseName: 'Item', columnTitle: 'Status', value: { label: { text: 'Done' } } } };
    const res = await request(app)
      .post('/api/webhook/monday')
      .send(body)
      .set('x-monday-signature', sign(body));
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});

describe('GET /api/health', () => {
  it('returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body.ok).toBe(true);
  });
});
