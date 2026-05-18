import { Router } from 'express';
import { exchangeCodeForToken } from '../services/monday.js';
import { upsertAccount } from '../services/supabase.js';

const router = Router();

router.get('/install', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.MONDAY_CLIENT_ID,
    redirect_uri: `${process.env.APP_URL}/api/oauth/callback`,
  });
  res.redirect(`https://auth.monday.com/oauth2/authorize?${params}`);
});

router.get('/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('Missing code');
  try {
    const token = await exchangeCodeForToken(code);
    await upsertAccount({
      accountId: String(token.account_id),
      accessToken: token.access_token,
      refreshToken: token.refresh_token || null,
    });
    res.redirect(`${process.env.APP_URL}?installed=true`);
  } catch (err) {
    console.error('OAuth callback error:', err);
    res.status(500).send('Authentication failed');
  }
});

export default router;
