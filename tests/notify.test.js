import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendSlack, sendTeams } from '../server/services/notify.js';

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => mockFetch.mockReset());

describe('sendSlack', () => {
  it('sends Block Kit payload with board link', async () => {
    mockFetch.mockResolvedValue({ ok: true });
    await sendSlack({
      webhookUrl: 'https://hooks.slack.com/test',
      boardName: 'Sales Board',
      itemName: 'Deal A',
      columnTitle: 'Status',
      value: 'Done',
      boardUrl: 'https://monday.com/boards/123',
    });
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.blocks[0].text.text).toContain('Sales Board');
    expect(body.blocks[1].fields[0].text).toContain('Deal A');
    expect(body.blocks[1].fields[1].text).toContain('Done');
  });

  it('throws on non-OK response', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 400 });
    await expect(
      sendSlack({ webhookUrl: 'https://hooks.slack.com/test', boardName: 'B', itemName: 'I', columnTitle: 'C', value: 'V' })
    ).rejects.toThrow('400');
  });
});

describe('sendTeams', () => {
  it('sends Adaptive Card payload', async () => {
    mockFetch.mockResolvedValue({ ok: true });
    await sendTeams({
      webhookUrl: 'https://outlook.office.com/test',
      boardName: 'Dev Board',
      itemName: 'Task 1',
      columnTitle: 'Priority',
      value: 'High',
      boardUrl: 'https://monday.com/boards/456',
    });
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.type).toBe('message');
    expect(body.attachments[0].contentType).toBe('application/vnd.microsoft.card.adaptive');
    const card = body.attachments[0].content;
    expect(card.type).toBe('AdaptiveCard');
    const facts = card.body[1].items[1].facts;
    expect(facts).toContainEqual({ title: 'Priority', value: 'High' });
    expect(card.actions[0].url).toBe('https://monday.com/boards/456');
  });

  it('omits actions when no boardUrl', async () => {
    mockFetch.mockResolvedValue({ ok: true });
    await sendTeams({
      webhookUrl: 'https://outlook.office.com/test',
      boardName: 'B', itemName: 'I', columnTitle: 'C', value: 'V',
    });
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.attachments[0].content.actions).toHaveLength(0);
  });

  it('throws on non-OK response', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });
    await expect(
      sendTeams({ webhookUrl: 'https://outlook.office.com/test', boardName: 'B', itemName: 'I', columnTitle: 'C', value: 'V' })
    ).rejects.toThrow('500');
  });
});
