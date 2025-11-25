import { FastifyInstance } from 'fastify';
import { query } from '../db';
import { generateDropBatchForTopic } from '../services/ai/generateDropBatch';

interface BlueprintRow {
  id: number;
  harvest_item_id: number | null;
  banca: string | null;
  cargo: string | null;
  disciplina: string | null;
  created_at: string;
}

interface BlueprintDetailRow extends BlueprintRow {
  blueprint: any;
}

interface DropRow {
  id: number;
  blueprint_id: number | null;
  topic_code: string | null;
  drop_type: string | null;
  difficulty: number | null;
  drop_text: any;
  created_at: string;
}

/**
 * Rotas de Debug e Gerenciamento
 */
export async function adminDebugRoutes(app: FastifyInstance) {
  /**
   * GET /admin/debug/blueprints
   * Listar blueprints com paginação
   * 
   * Query params:
   * - limit: número de items (padrão: 50, máximo: 200)
   * - offset: deslocamento (padrão: 0)
   */
  app.get('/admin/debug/blueprints', async (req, reply) => {
    try {
      const { limit = '50', offset = '0' } = req.query as {
        limit?: string;
        offset?: string;
      };

      const parsedLimit = Math.min(parseInt(limit, 10) || 50, 200);
      const parsedOffset = parseInt(offset, 10) || 0;

      console.log(`[admin-debug] Listando blueprints: limit=${parsedLimit}, offset=${parsedOffset}`);

      const { rows } = await query<BlueprintRow>(
        `
        SELECT
          id,
          harvest_item_id,
          banca,
          cargo,
          disciplina,
          created_at
        FROM exam_blueprints
        ORDER BY id DESC
        LIMIT $1 OFFSET $2
        `,
        [parsedLimit, parsedOffset]
      );

      return { success: true, items: rows };
    } catch (err) {
      console.error('[admin-debug] Erro:', err);
      return reply.status(500).send({
        success: false,
        error: err instanceof Error ? err.message : 'Erro ao listar blueprints'
      });
    }
  });

  /**
   * GET /admin/debug/blueprints/:id
   * Detalhar blueprint específico
   */
  app.get('/admin/debug/blueprints/:id', async (req, reply) => {
    try {
      const { id } = req.params as { id: string };

      console.log(`[admin-debug] Detalhando blueprint: id=${id}`);

      const { rows } = await query<BlueprintDetailRow>(
        `
        SELECT
          id,
          harvest_item_id,
          banca,
          cargo,
          disciplina,
          blueprint,
          created_at
        FROM exam_blueprints
        WHERE id = $1
        LIMIT 1
        `,
        [id]
      );

      if (rows.length === 0) {
        return reply.status(404).send({
          success: false,
          error: 'Blueprint não encontrado'
        });
      }

      return { success: true, data: rows[0] };
    } catch (err) {
      console.error('[admin-debug] Erro:', err);
      return reply.status(500).send({
        success: false,
        error: err instanceof Error ? err.message : 'Erro ao detalhar blueprint'
      });
    }
  });

  /**
   * GET /admin/debug/drops
   * Listar drops com filtros
   * 
   * Query params:
   * - blueprintId: filtrar por blueprint
   * - topicCode: filtrar por tópico
   * - limit: número de items (padrão: 50, máximo: 200)
   */
  app.get('/admin/debug/drops', async (req, reply) => {
    try {
      const { blueprintId, topicCode, limit = '50' } = req.query as {
        blueprintId?: string;
        topicCode?: string;
        limit?: string;
      };

      const parsedLimit = Math.min(parseInt(limit, 10) || 50, 200);

      console.log(`[admin-debug] Listando drops: blueprintId=${blueprintId}, topicCode=${topicCode}, limit=${parsedLimit}`);

      const conditions: string[] = [];
      const params: any[] = [];
      let idx = 1;

      if (blueprintId) {
        conditions.push(`blueprint_id = $${idx++}`);
        params.push(parseInt(blueprintId, 10));
      }

      if (topicCode) {
        conditions.push(`topic_code = $${idx++}`);
        params.push(topicCode);
      }

      const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

      const { rows } = await query<DropRow>(
        `
        SELECT
          id,
          blueprint_id,
          topic_code,
          drop_type,
          difficulty,
          drop_text,
          created_at
        FROM drops
        ${whereClause}
        ORDER BY id DESC
        LIMIT $${idx}
        `,
        [...params, parsedLimit]
      );

      return { success: true, items: rows };
    } catch (err) {
      console.error('[admin-debug] Erro:', err);
      return reply.status(500).send({
        success: false,
        error: err instanceof Error ? err.message : 'Erro ao listar drops'
      });
    }
  });

  /**
   * POST /admin/debug/generate-drops-preview
   * Gerar drops em modo preview (sem gravar)
   * 
   * Body:
   * - disciplina: string (obrigatório)
   * - topicCode: string (obrigatório)
   * - topicName: string (obrigatório)
   * - banca: string (opcional)
   * - nivel: string (opcional)
   * - ragContext: string (opcional)
   */
  app.post('/admin/debug/generate-drops-preview', async (req, reply) => {
    try {
      const body = req.body as {
        disciplina: string;
        topicCode: string;
        topicName: string;
        banca?: string;
        nivel?: string;
        ragContext?: string;
      };

      if (!body.disciplina || !body.topicCode || !body.topicName) {
        return reply.status(400).send({
          success: false,
          error: 'Parâmetros obrigatórios: disciplina, topicCode, topicName'
        });
      }

      console.log(`[admin-debug] Gerando drops em preview: topicCode=${body.topicCode}`);

      const result = await generateDropBatchForTopic({
        disciplina: body.disciplina,
        topicCode: body.topicCode,
        topicName: body.topicName,
        banca: body.banca,
        nivel: body.nivel,
        ragContext: body.ragContext
      });

      return {
        success: true,
        preview: true,
        input: body,
        result
      };
    } catch (err) {
      console.error('[admin-debug] Erro:', err);
      return reply.status(500).send({
        success: false,
        error: err instanceof Error ? err.message : 'Erro ao gerar drops em preview'
      });
    }
  });
}
