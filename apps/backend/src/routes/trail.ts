import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { query } from '../db';
import { markDropCompleted } from '../repositories/userDropRepository';

interface TrailDrop {
  id: string;
  discipline_id: string;
  title: string;
  content: string;
  difficulty: number;
}

export async function trailRoutes(app: FastifyInstance) {
  // Trilha do dia (MVP): primeiros N drops ainda não concluídos pelo usuário
  app.get('/trail/today', async (request, reply) => {
    const anyReq: any = request;
    try {
      await anyReq.jwtVerify();
    } catch {
      return reply.status(401).send({ error: 'Não autorizado.' });
    }

    const user = anyReq.user as { sub: string };
    const userId = user.sub;

    const { rows } = await query<TrailDrop>(
      `
        SELECT d.*
        FROM drops d
        LEFT JOIN user_drops ud
          ON ud.drop_id = d.id
          AND ud.user_id = $1
          AND ud.status = 'done'
        WHERE ud.id IS NULL
        ORDER BY d.created_at ASC
        LIMIT 10
      `,
      [userId]
    );

    return { drops: rows };
  });

  // Marcar drop como concluído
  app.post('/trail/complete', async (request, reply) => {
    const anyReq: any = request;
    try {
      await anyReq.jwtVerify();
    } catch {
      return reply.status(401).send({ error: 'Não autorizado.' });
    }

    const user = anyReq.user as { sub: string };
    const userId = user.sub;

    const bodySchema = z.object({
      drop_id: z.string().uuid()
    });

    const body = bodySchema.parse(request.body);

    const record = await markDropCompleted(userId, body.drop_id);

    return reply.status(200).send({ user_drop: record });
  });
}
