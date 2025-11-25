import { FastifyInstance } from 'fastify';

export default async function healthRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    return {
      status: 'ok',
      service: 'memodrops-backend',
      version: '0.1.0'
    };
  });
}
