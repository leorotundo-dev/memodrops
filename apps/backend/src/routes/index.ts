import { FastifyInstance } from 'fastify';
import { healthRoutes } from './health';
import { plansRoutes } from './plans';
import { authRoutes } from './auth';

export async function registerRoutes(app: FastifyInstance) {
  app.log.info('🔧 Registrando rotas...');
  
  app.log.info('✅ Registrando health routes');
  await app.register(healthRoutes);
  
  app.log.info('✅ Registrando plans routes');
  await app.register(plansRoutes);
  
  app.log.info('✅ Registrando auth routes');
  await app.register(authRoutes);
  
  app.log.info('🎉 Todas as rotas registradas com sucesso!');
  
  // Log todas as rotas registradas
  app.log.info('📋 Rotas disponíveis:');
  app.printRoutes();
}
