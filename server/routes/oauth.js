import express from 'express';
import { upsertAccount } from '../services/supabase.js';

const router = express.Router();

router.get('/install', (_req, res) => {
  const url = new URL('https://auth.monday.com/oauth2/authorize');
  url.searchParams.set('client_id', process.env.MONDAY_CLIENT_ID);
  url.searchParams.set('redirect_uri', `${process.env.APP_URL}/oauth/callback`);
  res.redirect(url.toString());
});

router.get('/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('Missing code');

  const tokenRes = await fetch('https://auth.monday.com/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      client_id: process.env.MONDAY_CLIENT_ID,
      client_secret: process.env.MONDAY_CLIENT_SECRET,
      redirect_uri: `${process.env.APP_URL}/oauth/callback`,
    }),
  });

  if (!tokenRes.ok) return res.status(400).send('Token exchange failed');
  const { access_token, account_id } = await tokenRes.json();

  await upsertAccount({ account_id: String(account_id), access_token });
  res.send('<script>window.close();</script><p>App installed! You can close this window.</p>');
});

export default router;
