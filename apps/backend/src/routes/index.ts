import { FastifyInstance } from 'fastify';
import { healthRoutes } from './health';
import { plansRoutes } from './plans';
import { authRoutes } from './auth';

export async function registerRoutes(app: FastifyInstance) {
  await app.register(healthRoutes);
  await app.register(plansRoutes);
  await app.register(authRoutes);
}
