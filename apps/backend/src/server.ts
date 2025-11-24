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
    origin: true,
    credentials: true
  });

  await app.register(jwt, {
    secret: env.JWT_SECRET
  });

  await registerPlugins(app);
  await registerRoutes(app);

  return app;
}
