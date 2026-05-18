import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendSlack, sendTeams } from '../server/services/notify.js';

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => mockFetch.mockReset());

describe('sendSlack', () => {
  it('sends correct payload', async () => {
    mockFetch.mockResolvedValue({ ok: true });
    await sendSlack({
      webhookUrl: 'https://hooks.slack.com/test',
      boardName: 'Sales Board',
      itemName: 'Deal A',
      columnTitle: 'Status',
      value: 'Done',
    });
    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe('https://hooks.slack.com/test');
    const body = JSON.parse(opts.body);
    expect(body.text).toContain('Sales Board');
    expect(body.text).toContain('Done');
  });

  it('throws on non-OK response', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 400 });
    await expect(
      sendSlack({ webhookUrl: 'https://hooks.slack.com/test', boardName: 'B', itemName: 'I', columnTitle: 'C', value: 'V' })
    ).rejects.toThrow('400');
  });
});

describe('sendTeams', () => {
  it('sends MessageCard payload', async () => {
    mockFetch.mockResolvedValue({ ok: true });
    await sendTeams({
      webhookUrl: 'https://outlook.office.com/test',
      boardName: 'Dev Board',
      itemName: 'Task 1',
      columnTitle: 'Priority',
      value: 'High',
    });
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body['@type']).toBe('MessageCard');
    expect(body.sections[0].facts).toContainEqual({ name: 'Priority', value: 'High' });
  });
});
