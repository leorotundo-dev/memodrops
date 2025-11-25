import { FastifyInstance } from 'fastify';
import { healthRoutes } from './health';
import { plansRoutes } from './plans';
import { authRoutes } from './auth';
import { disciplineRoutes } from './disciplines';
import { dropsRoutes } from './drops';
import { trailRoutes } from './trail';

export async function registerRoutes(app: FastifyInstance) {
  app.log.info('📝 Registrando healthRoutes...');
  await app.register(healthRoutes);
  app.log.info('✅ healthRoutes registrado');
  
  app.log.info('📝 Registrando plansRoutes...');
  await app.register(plansRoutes);
  app.log.info('✅ plansRoutes registrado');
  
  app.log.info('📝 Registrando authRoutes...');
  await app.register(authRoutes);
  app.log.info('✅ authRoutes registrado');
  
  app.log.info('📝 Registrando disciplineRoutes...');
  await app.register(disciplineRoutes);
  app.log.info('✅ disciplineRoutes registrado');
  
  app.log.info('📝 Registrando dropsRoutes...');
  await app.register(dropsRoutes);
  app.log.info('✅ dropsRoutes registrado');
  
  app.log.info('📝 Registrando trailRoutes...');
  await app.register(trailRoutes);
  app.log.info('✅ trailRoutes registrado');
}
