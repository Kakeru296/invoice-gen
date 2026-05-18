import { Router } from 'express';
import crypto from 'crypto';
import { getRules, logNotification } from '../services/supabase.js';
import { sendNotification } from '../services/notify.js';

const router = Router();

function verifySignature(req) {
  const sig = req.headers['x-monday-signature'];
  if (!sig) return false;
  const hash = crypto
    .createHmac('sha256', process.env.MONDAY_SIGNING_SECRET)
    .update(JSON.stringify(req.body))
    .digest('base64');
  return sig === `sha256=${hash}`;
}

router.post('/monday', async (req, res) => {
  // monday.com challenge handshake
  if (req.body?.challenge) {
    return res.json({ challenge: req.body.challenge });
  }

  if (!verifySignature(req)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const { event } = req.body;
  if (!event) return res.status(400).json({ error: 'No event' });

  const accountId = String(event.accountId);
  const boardId = String(event.boardId);

  res.status(200).json({ ok: true });

  // Process async after responding
  setImmediate(async () => {
    try {
      const rules = await getRules(accountId);
      const matching = rules.filter(
        (r) =>
          r.board_id === boardId &&
          (r.trigger_column === 'any' || r.trigger_column === event.columnType)
      );
      await Promise.allSettled(
        matching.map(async (rule) => {
          try {
            await sendNotification(rule, {
              boardName: rule.board_name,
              itemName: event.pulseName || 'Unknown item',
              columnTitle: event.columnTitle || 'Column',
              value: event.value?.label?.text || String(event.value || ''),
            });
            await logNotification({ ruleId: rule.id, accountId, status: 'success' });
          } catch (err) {
            await logNotification({ ruleId: rule.id, accountId, status: 'error', error: err.message });
          }
        })
      );
    } catch (err) {
      console.error('Webhook processing error:', err);
    }
  });
});

export default router;
