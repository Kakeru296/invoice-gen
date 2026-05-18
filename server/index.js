import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import oauthRouter from './routes/oauth.js';
import webhookRouter from './routes/webhook.js';
import rulesRouter from './routes/rules.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/oauth', oauthRouter);
app.use('/api/webhook', webhookRouter);
app.use('/api/rules', rulesRouter);

app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on :${PORT}`));

export default app;
