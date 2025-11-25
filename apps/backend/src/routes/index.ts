import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { createUser, findUserByEmail, findUserById } from '../repositories/userRepository';

export async function registerRoutes(app: FastifyInstance) {
  app.log.info('🔧 Registrando rotas...');
  
  // Health check
  app.get('/', async () => {
    return {
      status: 'ok',
      service: 'memodrops-backend',
      version: '0.1.0'
    };
  });
  app.log.info('✅ Rota GET / registrada');

  // Plans
  app.get('/plans', async () => {
    return {
      plans: [
        {
          id: 'free',
          name: 'Free',
          price: 0,
          features: ['10 drops/mês', 'Suporte básico']
        },
        {
          id: 'pro',
          name: 'Pro',
          price: 29.90,
          features: ['Drops ilimitados', 'Suporte prioritário', 'Analytics']
        }
      ]
    };
  });
  app.log.info('✅ Rota GET /plans registrada');

  // Auth - Register
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
  app.log.info('✅ Rota POST /auth/register registrada');

  // Auth - Login
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

    const bcrypt = await import('bcryptjs');
    const isValid = await bcrypt.compare(body.password, user.password_hash);
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
  app.log.info('✅ Rota POST /auth/login registrada');

  // Me
  app.get('/me', async (request, reply) => {
    try {
      const anyReq = request as any;
      await anyReq.jwtVerify();
      const payload = anyReq.user as any;

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
  app.log.info('✅ Rota GET /me registrada');

  app.log.info('🎉 Todas as rotas registradas com sucesso!');
  
  // Log todas as rotas registradas
  app.log.info('📋 Rotas disponíveis:');
  app.log.info(app.printRoutes());
}
