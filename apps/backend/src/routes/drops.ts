import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { createDrop, listDrops } from '../repositories/dropRepository';

export default async function dropsRoutes(app: FastifyInstance) {
  app.get('/drops', async () => {
    const drops = await listDrops();
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
      difficulty: body.difficulty || 1
    });
    return reply.status(201).send({ drop });
  });
}
