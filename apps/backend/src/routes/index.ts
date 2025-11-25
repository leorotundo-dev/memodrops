import { FastifyInstance } from 'fastify';
import { healthRoutes } from './health';
import { plansRoutes } from './plans';
import { authRoutes } from './auth';
import { disciplineRoutes } from './disciplines';
import { dropsRoutes } from './drops';
import { trailRoutes } from './trail';

export async function registerRoutes(app: FastifyInstance) {
  await app.register(healthRoutes);
  await app.register(plansRoutes);
  await app.register(authRoutes);
  await app.register(disciplineRoutes);
  await app.register(dropsRoutes);
  await app.register(trailRoutes);
}
