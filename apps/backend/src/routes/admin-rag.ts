import { FastifyInstance } from 'fastify';
import { getRagBlocksByTopic } from '../rag/service';

export default async function adminRagRoutes(app: FastifyInstance) {
  app.get('/admin/rag/blocks', async (req, reply) => {
    const { disciplina, topicCode } = req.query as {
      disciplina?: string;
      topicCode?: string;
    };

    if (!disciplina || !topicCode) {
      reply.code(400);
      return { error: 'disciplina e topicCode são obrigatórios' };
    }

    const blocks = await getRagBlocksByTopic(disciplina, topicCode);
    return { items: blocks };
  });
}
