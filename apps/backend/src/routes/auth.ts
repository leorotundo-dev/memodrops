import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { createUser, findUserByEmail, findUserById } from '../repositories/userRepository';
import { env } from '../env';

export async function authRoutes(app: FastifyInstance) {
  // Register
  app.post('/auth/register', async (request, reply) => {
    const bodySchema = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(6),
      plan: z.string().optional()
    });

    const body = bodySchema.parse(request.body);

    const existing = await findUserByEmail(body.email);
    if (existing) {
      return reply.status(400).send({ error: 'Email já cadastrado.' });
    }

    const user = await createUser({
      name: body.name,
      email: body.email,
      password: body.password,
      plan: body.plan ?? null
    });

    const token = app.jwt.sign(
      {
        sub: user.id,
        email: user.email,
        plan: user.plan
      },
      {
        expiresIn: '7d'
      }
    );

    return reply.send({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan
      }
    });
  });

  // Login
  app.post('/auth/login', async (request, reply) => {
    const bodySchema = z.object({
      email: z.string().email(),
      password: z.string().min(6)
    });

    const body = bodySchema.parse(request.body);

    const user = await findUserByEmail(body.email);
    if (!user) {
      return reply.status(400).send({ error: 'Credenciais inválidas.' });
    }

    const isValid = await import('bcryptjs').then(m => m.compare(body.password, user.password_hash));
    if (!isValid) {
      return reply.status(400).send({ error: 'Credenciais inválidas.' });
    }

    const token = app.jwt.sign(
      {
        sub: user.id,
        email: user.email,
        plan: user.plan
      },
      {
        expiresIn: '7d'
      }
    );

    return reply.send({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan
      }
    });
  });

  // Me
  app.get('/me', async (request, reply) => {
    try {
      const anyReq: any = request;
      await anyReq.jwtVerify();
      const payload = anyReq.user as { sub: string };

      const user = await findUserById(payload.sub);
      if (!user) {
        return reply.status(404).send({ error: 'Usuário não encontrado.' });
      }

      return reply.send({
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan
      });
    } catch (err) {
      return reply.status(401).send({ error: 'Não autorizado.' });
    }
  });
}
