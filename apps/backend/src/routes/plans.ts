import { FastifyInstance } from 'fastify';
import { PLANS } from '@memodrops/shared';

export async function plansRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    return { plans: PLANS };
  });
}
