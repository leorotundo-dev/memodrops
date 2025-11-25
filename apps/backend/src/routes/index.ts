import { FastifyInstance } from 'fastify';
import { healthRoutes } from './health';
import { plansRoutes } from './plans';
import { authRoutes } from './auth';

export async function registerRoutes(app: FastifyInstance) {
  console.log('🔧 Registrando rotas...');
  
  console.log('✅ Registrando health routes');
  await app.register(healthRoutes);
  
  console.log('✅ Registrando plans routes');
  await app.register(plansRoutes);
  
  console.log('✅ Registrando auth routes');
  await app.register(authRoutes);
  
  console.log('🎉 Todas as rotas registradas com sucesso!');
  
  // Log todas as rotas registradas
  console.log('📋 Rotas disponíveis:');
  app.printRoutes();
}
