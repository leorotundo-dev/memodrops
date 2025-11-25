import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import {
  computeNextScheduling,
  createCard,
  findCardByUserAndDrop,
  listDueCards,
  saveReview,
  updateCardScheduling
} from '../repositories/srsRepository';

export default async function srsRoutes(app: FastifyInstance) {
  // Enrolar um Drop no SRS (cria cartão se não existir)
  app.post('/srs/enroll', async (request, reply) => {
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

    let card = await findCardByUserAndDrop(userId, body.drop_id);
    if (!card) {
      card = await createCard(userId, body.drop_id);
    }

    return reply.status(201).send({ card });
  });

  // Listar cartões de revisão de hoje
  app.get('/srs/today', async (request, reply) => {
    const anyReq: any = request;
    try {
      await anyReq.jwtVerify();
    } catch {
      return reply.status(401).send({ error: 'Não autorizado.' });
    }
    const user = anyReq.user as { sub: string };
    const userId = user.sub;

    const querySchema = z.object({
      limit: z.coerce.number().min(1).max(100).optional()
    });

    const { limit } = querySchema.parse(request.query);

    const cards = await listDueCards(userId, limit ?? 20);

    return reply.send({ cards });
  });

  // Registrar uma revisão de SRS
  app.post('/srs/review', async (request, reply) => {
    const anyReq: any = request;
    try {
      await anyReq.jwtVerify();
    } catch {
      return reply.status(401).send({ error: 'Não autorizado.' });
    }
    const user = anyReq.user as { sub: string };
    const userId = user.sub;

    const bodySchema = z.object({
      card_id: z.string().uuid(),
      grade: z.number().int().min(0).max(5)
    });

    const body = bodySchema.parse(request.body);

    // Buscar card atual
    const { rows } = await (await import('../db')).query(
      'SELECT * FROM srs_cards WHERE id = $1 AND user_id = $2 LIMIT 1',
      [body.card_id, userId]
    );
    const card = rows[0];
    if (!card) {
      return reply.status(404).send({ error: 'Cartão não encontrado.' });
    }

    // Salvar review
    await saveReview(userId, body.card_id, body.grade);

    // Calcular próximo agendamento
    const scheduling = computeNextScheduling(
      card.interval_days,
      card.ease_factor,
      card.repetition,
      body.grade
    );

    const updated = await updateCardScheduling(card.id, {
      interval_days: scheduling.nextInterval,
      ease_factor: scheduling.nextEase,
      repetition: scheduling.nextRepetition
    });

    return reply.send({ card: updated });
  });
}
