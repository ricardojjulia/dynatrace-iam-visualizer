import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { DynatraceClient } from './dynatrace';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Dynatrace client
let dynatraceClient: DynatraceClient | null = null;

if (process.env.DYNATRACE_ENVIRONMENT_ID && process.env.DYNATRACE_API_TOKEN && process.env.DYNATRACE_API_URL) {
  dynatraceClient = new DynatraceClient(
    process.env.DYNATRACE_ENVIRONMENT_ID,
    process.env.DYNATRACE_API_TOKEN,
    process.env.DYNATRACE_API_URL
  );
}

// Middleware
app.use(cors());
app.use(express.json());

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Routes
app.get('/api/health', (req: Request, res: Response) => {
  const status = {
    status: 'Server is running',
    dynatraceConfigured: !!dynatraceClient,
  };
  res.json(status);
});

app.get('/api/policies', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!dynatraceClient) {
      return res.status(503).json({ error: 'Dynatrace client not configured' });
    }

    const policies = await dynatraceClient.getPolicies();
    res.json({ policies });
  } catch (error) {
    next(error);
  }
});

app.get('/api/policies/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!dynatraceClient) {
      return res.status(503).json({ error: 'Dynatrace client not configured' });
    }

    const policy = await dynatraceClient.getPolicy(req.params.id);
    res.json(policy);
  } catch (error) {
    next(error);
  }
});

app.post('/api/policies', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!dynatraceClient) {
      return res.status(503).json({ error: 'Dynatrace client not configured' });
    }

    const policy = await dynatraceClient.createPolicy(req.body);
    res.status(201).json(policy);
  } catch (error) {
    next(error);
  }
});

app.put('/api/policies/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!dynatraceClient) {
      return res.status(503).json({ error: 'Dynatrace client not configured' });
    }

    const policy = await dynatraceClient.updatePolicy(req.params.id, req.body);
    res.json(policy);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/policies/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!dynatraceClient) {
      return res.status(503).json({ error: 'Dynatrace client not configured' });
    }

    await dynatraceClient.deletePolicy(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.post('/api/policies/validate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!dynatraceClient) {
      return res.status(503).json({ error: 'Dynatrace client not configured' });
    }

    const result = await dynatraceClient.validatePolicy(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  if (!dynatraceClient) {
    console.warn('⚠️  Warning: Dynatrace credentials not configured. Set environment variables to enable API integration.');
  } else {
    console.log('✅ Dynatrace client configured and ready');
  }
});
