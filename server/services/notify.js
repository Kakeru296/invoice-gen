export async function sendSlack({ webhookUrl, boardName, itemName, columnTitle, value, boardUrl }) {
  const body = {
    blocks: [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `🔔 *<${boardUrl || '#'}|${boardName}>* updated` },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Item*\n${itemName}` },
          { type: 'mrkdwn', text: `*${columnTitle}*\n${value}` },
        ],
      },
    ],
    text: `${boardName}: ${itemName} — ${columnTitle} changed to ${value}`,
  };
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Slack returned ${res.status}`);
}

export async function sendTeams({ webhookUrl, boardName, itemName, columnTitle, value, boardUrl }) {
  const body = {
    type: 'message',
    attachments: [
      {
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: {
          $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
          type: 'AdaptiveCard',
          version: '1.4',
          body: [
            {
              type: 'Container',
              style: 'emphasis',
              items: [
                { type: 'TextBlock', text: '🔔 Smart Notify', weight: 'Bolder', size: 'Small', color: 'Accent' },
              ],
            },
            {
              type: 'Container',
              items: [
                { type: 'TextBlock', text: boardName, weight: 'Bolder', size: 'Medium', wrap: true },
                {
                  type: 'FactSet',
                  facts: [
                    { title: 'Item', value: itemName },
                    { title: columnTitle, value: value },
                  ],
                },
              ],
            },
          ],
          actions: boardUrl
            ? [{ type: 'Action.OpenUrl', title: 'View in monday.com', url: boardUrl }]
            : [],
          msteams: { width: 'Full' },
        },
      },
    ],
  };
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Teams returned ${res.status}`);
}

export async function sendEmail({ to, boardName, itemName, columnTitle, value }) {
  console.log(`[Email] To: ${to} | ${boardName} > ${itemName} | ${columnTitle}: ${value}`);
}

export async function sendNotification(rule, payload) {
  const { channel, webhook_url } = rule;
  if (channel === 'slack') return sendSlack({ webhookUrl: webhook_url, ...payload });
  if (channel === 'teams') return sendTeams({ webhookUrl: webhook_url, ...payload });
  if (channel === 'email') return sendEmail({ to: webhook_url, ...payload });
  throw new Error(`Unknown channel: ${channel}`);
}
