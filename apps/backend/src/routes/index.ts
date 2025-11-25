import { FastifyInstance } from 'fastify';
import { healthRoutes } from './health';
import { plansRoutes } from './plans';
import { authRoutes } from './auth';

export async function registerRoutes(app: FastifyInstance) {
  app.register(healthRoutes);
  app.register(plansRoutes);
  app.register(authRoutes);
}
