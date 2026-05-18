export async function sendSlack({ webhookUrl, boardName, itemName, columnTitle, value }) {
  const text = `*${boardName}* — _${itemName}_\n*${columnTitle}* changed to *${value}*`;
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`Slack returned ${res.status}`);
}

export async function sendTeams({ webhookUrl, boardName, itemName, columnTitle, value }) {
  const body = {
    '@type': 'MessageCard',
    themeColor: '0073ea',
    summary: `${boardName} updated`,
    sections: [{
      activityTitle: `**${boardName}**`,
      facts: [
        { name: 'Item', value: itemName },
        { name: columnTitle, value },
      ],
    }],
  };
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Teams returned ${res.status}`);
}

export async function sendNotification(rule, payload) {
  const { channel, webhook_url } = rule;
  if (channel === 'slack') return sendSlack({ webhookUrl: webhook_url, ...payload });
  if (channel === 'teams') return sendTeams({ webhookUrl: webhook_url, ...payload });
  throw new Error(`Unknown channel: ${channel}`);
}
