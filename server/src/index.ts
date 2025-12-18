import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { DynatraceClient } from './dynatrace';
import {
  createPolicyRoutes,
  createGroupRoutes,
  createUserRoutes,
  createBindingRoutes,
  createPermissionsRoutes,
} from './routes';
import { fetchDynatraceSpec } from './spec';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

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
  const statusCode = err.response?.status || err.status || 500;
  const message = err.response?.data?.message || err.message || 'Internal server error';
  res.status(statusCode).json({
    error: message,
    timestamp: new Date().toISOString(),
  });
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  const status = {
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    dynatraceConfigured: !!dynatraceClient,
    apiVersion: '1.0.0',
  };
  res.json(status);
});

// Dynatrace OpenAPI spec proxy
app.get('/api/spec', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const spec = await fetchDynatraceSpec({
      forceRefresh: req.query.refresh === 'true',
      specUrl: (req.query.url as string) || undefined,
    });
    res.json(spec);
  } catch (error) {
    next(error);
  }
});

// API Routes
app.use('/api/policies', createPolicyRoutes(dynatraceClient));
app.use('/api/groups', createGroupRoutes(dynatraceClient));
app.use('/api/users', createUserRoutes(dynatraceClient));
app.use('/api/bindings', createBindingRoutes(dynatraceClient));
app.use('/api/permissions', createPermissionsRoutes(dynatraceClient));

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 API Documentation available at http://localhost:${PORT}/api/health\n`);

  if (!dynatraceClient) {
    console.warn('⚠️  WARNING: Dynatrace credentials not configured.');
    console.warn('   Set environment variables to enable API integration:');
    console.warn('   - DYNATRACE_ENVIRONMENT_ID');
    console.warn('   - DYNATRACE_API_TOKEN');
    console.warn('   - DYNATRACE_API_URL\n');
  } else {
    console.log('✅ Dynatrace client configured and ready\n');
  }

  console.log('Available endpoints:');
  console.log('  GET  /api/health                        - Server health check');
  console.log('  GET  /api/spec                          - Dynatrace OpenAPI spec proxy');
  console.log('  GET  /api/policies                      - List policies');
  console.log('  POST /api/policies                      - Create policy');
  console.log('  GET  /api/policies/:uuid                - Get policy');
  console.log('  PUT  /api/policies/:uuid                - Update policy');
  console.log('  DELETE /api/policies/:uuid              - Delete policy');
  console.log('  GET  /api/groups                        - List groups');
  console.log('  POST /api/groups                        - Create groups');
  console.log('  GET  /api/users                         - List users');
  console.log('  POST /api/users                         - Create user');
  console.log('  GET  /api/bindings                      - List bindings');
  console.log('  GET  /api/permissions/effective         - Get effective permissions\n');
});
