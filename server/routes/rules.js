import { Router } from 'express';
import { getRules, createRule, deleteRule } from '../services/supabase.js';

const router = Router();

router.get('/', async (req, res) => {
  const { accountId } = req.query;
  if (!accountId) return res.status(400).json({ error: 'accountId required' });
  try {
    const rules = await getRules(accountId);
    res.json({ rules });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { accountId, boardId, boardName, triggerColumn, channel, webhookUrl } = req.body;
  if (!accountId || !boardId || !webhookUrl) {
    return res.status(400).json({ error: 'accountId, boardId, webhookUrl required' });
  }
  try {
    const rule = await createRule({ accountId, boardId, boardName, triggerColumn, channel, webhookUrl });
    res.status(201).json({ rule });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { accountId } = req.query;
  if (!accountId) return res.status(400).json({ error: 'accountId required' });
  try {
    await deleteRule(req.params.id, accountId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
