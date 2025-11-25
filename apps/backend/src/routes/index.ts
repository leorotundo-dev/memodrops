import { FastifyInstance } from 'fastify';
import healthRoutes from './health';
import plansRoutes from './plans';
import authRoutes from './auth';
import disciplinesRoutes from './disciplines';
import dropsRoutes from './drops';
import trailRoutes from './trail';
import srsRoutes from './srs';
import adminRagRoutes from './admin-rag';
import { adminAIRoutes } from './admin-ai';
import { jobsRoutes } from './jobs';

export async function registerRoutes(app: FastifyInstance) {
  app.register(healthRoutes);
  app.register(plansRoutes);
  app.register(authRoutes);
  app.register(disciplinesRoutes);
  app.register(dropsRoutes);
  app.register(trailRoutes);
  app.register(srsRoutes);
  app.register(adminRagRoutes);
  app.register(adminAIRoutes);
  app.register(jobsRoutes);
}
