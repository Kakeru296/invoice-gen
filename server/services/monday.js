export async function exchangeCodeForToken(code) {
  const res = await fetch('https://auth.monday.com/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      client_id: process.env.MONDAY_CLIENT_ID,
      client_secret: process.env.MONDAY_CLIENT_SECRET,
      redirect_uri: `${process.env.APP_URL}/api/oauth/callback`,
    }),
  });
  if (!res.ok) throw new Error('Token exchange failed');
  return res.json();
}

export async function registerWebhook({ boardId, accessToken, callbackUrl }) {
  const query = `
    mutation {
      create_webhook(
        board_id: ${boardId},
        url: "${callbackUrl}",
        event: change_column_value
      ) { id board_id }
    }
  `;
  const res = await fetch('https://api.monday.com/v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: accessToken,
    },
    body: JSON.stringify({ query }),
  });
  const data = await res.json();
  if (data.errors) throw new Error(data.errors[0].message);
  return data.data.create_webhook;
}
