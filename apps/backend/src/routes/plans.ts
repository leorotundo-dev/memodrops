import { FastifyInstance } from 'fastify';

// Mock data - Stage 2 não especifica planos, mas mantendo compatibilidade
const PLANS = [
  { id: 'free', name: 'Free', price: 0 },
  { id: 'pro', name: 'Pro', price: 9.99 }
];

export async function plansRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    return { plans: PLANS };
  });
}
