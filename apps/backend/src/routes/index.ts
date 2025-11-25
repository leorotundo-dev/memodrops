import { FastifyInstance } from 'fastify';
import healthRoutes from './health';
import plansRoutes from './plans';
import authRoutes from './auth';
import disciplinesRoutes from './disciplines';
import dropsRoutes from './drops';
import trailRoutes from './trail';

export async function registerRoutes(app: FastifyInstance) {
  app.register(healthRoutes);
  app.register(plansRoutes);
  app.register(authRoutes);
  app.register(disciplinesRoutes);
  app.register(dropsRoutes);
  app.register(trailRoutes);
}
