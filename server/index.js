import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import oauthRouter from './routes/oauth.js';
import invoiceRouter from './routes/invoice.js';
import templateRouter from './routes/template.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true, app: 'invoice-gen' }));

app.use('/oauth', oauthRouter);
app.use('/api/invoice', invoiceRouter);
app.use('/api/template', templateRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`InvoiceGen server running on :${PORT}`));
}

export default app;
