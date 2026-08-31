import 'dotenv/config';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { formatZodIssues } from './middlewares/validator.middleware';
import { ZodError } from 'zod';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import tenantRoutes from './routes/tenant.routes';
import propertyRoutes from './routes/property.routes';

console.log("ISI DATABASE_URL:", process.env.DATABASE_URL);

const app: Application = express();
const PORT = 8000;

app.use(express.json());
app.use(cors());

app.get('/ping', (req: Request, res: Response) => {
  res.send('pong!');
});

// auth routes
app.use('/api/auth', authRoutes);

// Not Found Route
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global Error Handler
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(422).json({
      message: 'Validation error',
      errors: formatZodIssues(err),
    });
  }

  const e = err as {
    stack?: string;
    status?: number;
    message?: string;
    errors?: unknown;
  };
  console.error(e.stack);
  res.status(e.status || 500).json({
    message: e.message || 'Internal Server Error',
    errors: e.errors || [],
  });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(
      `✅ Server Api Running... \n ➜  [API] 🚀 Local: http://localhost:${String(PORT)}`
    );
  });
}

export default app;
