import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

const PLANS = [
  { id: 'free', name: 'Free', price: 0 },
  { id: 'pro', name: 'Pro', price: 9.99 }
];

async function routes(app: FastifyInstance) {
  app.get('/plans', async () => {
    return { plans: PLANS };
  });
}

export const plansRoutes = fp(routes);
