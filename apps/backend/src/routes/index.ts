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
import { adminPlanRoutes } from './admin-plan';
import { dailyPlanRoutes } from './daily-plan';
import { adminLearnRoutes } from './admin-learn';
import { learnRoutes } from './learn';
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
  app.register(adminPlanRoutes);
  app.register(dailyPlanRoutes);
  app.register(adminLearnRoutes);
  app.register(learnRoutes);
  app.register(jobsRoutes);
}
