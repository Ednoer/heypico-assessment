import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { json, urlencoded } from 'express';
import placesRouter from './routes/places';

// --- Security & Usage Limit Middleware ---
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

// Simple API key check middleware
interface ApiKeyAuthRequest extends Request {
  headers: Request['headers'] & { 'x-api-key'?: string };
}

function apiKeyAuth(
  req: ApiKeyAuthRequest,
  res: Response,
  next: NextFunction
): Response | void {
  // todo you can handle more complex auth logic here, e.g., check against a database
  next();
}

// Rate limiter: 30 requests per 10 minutes per IP
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30,
  message: { error: 'Too many requests, please try again later.' },
});

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'], credentials: false }));
app.use(urlencoded({ extended: true }));
app.use(json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Apply security and usage limit middleware to /api/places
app.use('/api/places', apiKeyAuth, limiter, placesRouter);

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${port}`);
});


