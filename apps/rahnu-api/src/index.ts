import express from 'express';
import cookieParser from 'cookie-parser';
import { loansRouter } from './routes/loans';
import { vaultRouter } from './routes/vault';

const app = express();
const PORT = process.env.RAHNU_API_PORT || 4001;

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.CLIENT_URL || 'http://localhost:5173');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'rahnu-api', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/rahnu/loans', loansRouter);
app.use('/api/rahnu/vault', vaultRouter);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ 
    success: false,
    message: err.message || 'Internal server error' 
  });
});

app.listen(PORT, () => {
  console.log(`🏦 Rahnu API running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});

