import fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { env } from './env';
import { registerPlugins } from './plugins';
import { registerRoutes } from './routes';

export async function buildServer() {
  const app = fastify({
    logger: true
  });

  await app.register(cors, {
    origin: [
      'https://memodrops-dashboard-1bj6g09lt-memo-drops.vercel.app',
      'https://memodrops-dashboard-*.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
  });

  await app.register(jwt, {
    secret: env.JWT_SECRET
  });

  app.log.info('🔌 Registrando plugins...');
  await registerPlugins(app);
  app.log.info('✅ Plugins registrados!');
  
  app.log.info('🛣️  Iniciando registro de rotas...');
  await registerRoutes(app);
  app.log.info('✅ Registro de rotas concluído!');
  
  // Debug: listar todas as rotas registradas
  app.log.info('📋 Rotas registradas:');
  app.log.info(app.printRoutes());

  return app;
}
