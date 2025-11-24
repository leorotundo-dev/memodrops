import { FastifyInstance } from 'fastify';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    return {
      status: 'ok',
      service: 'memodrops-backend',
      version: '0.1.0'
    };
  });
}
