import { FastifyInstance } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import { env } from '../env';

export async function registerPlugins(app: FastifyInstance) {
  // Registrar JWT
  await app.register(fastifyJwt, {
    secret: env.JWT_SECRET
  });
}
