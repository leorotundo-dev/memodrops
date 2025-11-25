import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { createDrop, listDrops } from '../repositories/dropRepository';

export async function dropsRoutes(app: FastifyInstance) {
  app.get('/drops', async (request) => {
    const querySchema = z.object({
      disciplineId: z.string().uuid().optional()
    });

    const query = querySchema.parse(request.query);

    const drops = await listDrops(query.disciplineId);
    return { drops };
  });

  app.post('/drops', async (request, reply) => {
    const bodySchema = z.object({
      discipline_id: z.string().uuid(),
      title: z.string().min(3),
      content: z.string().min(10),
      difficulty: z.number().int().min(1).max(5).optional()
    });

    const body = bodySchema.parse(request.body);

    const drop = await createDrop({
      discipline_id: body.discipline_id,
      title: body.title,
      content: body.content,
      difficulty: body.difficulty
    });

    return reply.status(201).send({ drop });
  });
}
