import { FastifyInstance } from 'fastify';
import { healthRoutes } from './routes/health';
import { plansRoutes } from './routes/plans';

export async function registerRoutes(app: FastifyInstance) {
  app.register(healthRoutes, { prefix: '/health' });
  app.register(plansRoutes, { prefix: '/plans' });
}
