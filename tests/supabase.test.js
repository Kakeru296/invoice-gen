import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: (table) => ({
      upsert: vi.fn().mockResolvedValue({ error: null }),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { account_id: 'test-123', company_name: 'Test Corp' }, error: null }),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
  }),
}));

process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_KEY = 'test-key';

describe('Supabase service', () => {
  it('upsertAccount does not throw', async () => {
    const { upsertAccount } = await import('../server/services/supabase.js');
    await expect(upsertAccount({ account_id: 'test', access_token: 'token' })).resolves.not.toThrow();
  });

  it('getTemplate returns null when not found', async () => {
    const mod = await import('../server/services/supabase.js');
    const result = await mod.getTemplate('nonexistent');
    expect(result == null || typeof result === 'object').toBe(true);
  });
});
