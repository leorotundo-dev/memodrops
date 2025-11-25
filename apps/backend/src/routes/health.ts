import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

async function routes(app: FastifyInstance) {
  app.get('/', async () => {
    return {
      status: 'ok',
      service: 'memodrops-backend',
      version: '0.1.0'
    };
  });
}

export const healthRoutes = fp(routes);
