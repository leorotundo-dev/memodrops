import { FastifyInstance } from 'fastify';
import { query } from '../db';

interface QAMetricRow {
  status: string;
  total: number;
}

interface DailyMetricRow {
  date: string;
  metric_name: string;
  metric_value: string;
}

/**
 * Rotas de Métricas e Analytics
 */
/**
 * Rotas de Debug de Blueprints
 */
export async function adminDebugRoutes(app: FastifyInstance) {
  app.get('/admin/debug/blueprints', async (req, reply) => {
    try {
      const { rows } = await query<any>(
        `SELECT id, harvest_item_id, exam_code, banca, cargo, disciplina, created_at FROM exam_blueprints LIMIT 100`
      );
      return { success: true, items: rows };
    } catch (err) {
      console.error('[admin-debug] Erro:', err);
      return reply.status(500).send({ success: false, error: 'Erro ao buscar blueprints' });
    }
  });
}

/**
 * Rotas de Harvest
 */
export async function adminHarvestRoutes(app: FastifyInstance) {
  app.get('/admin/harvest/items', async (req, reply) => {
    try {
      const { rows } = await query<any>(
        `SELECT id, source, url, status, created_at FROM harvest_items LIMIT 100`
      );
      return { success: true, items: rows };
    } catch (err) {
      console.error('[admin-harvest] Erro:', err);
      return reply.status(500).send({ success: false, error: 'Erro ao buscar harvest items' });
    }
  });
}

export async function adminHarvestRoutesRegister(app: FastifyInstance) {
  await adminHarvestRoutes(app);
}

/**
 * Rotas de RAG
 */
export async function adminRagRoutes(app: FastifyInstance) {
  app.get('/admin/rag/blocks', async (req, reply) => {
    try {
      const { disciplina = '*', topicCode = '*' } = req.query as any;
      const { rows } = await query<any>(
        `SELECT id, disciplina, topic_code, summary, created_at FROM rag_blocks 
         WHERE (disciplina = $1 OR $1 = '*') 
         AND (topic_code = $2 OR $2 = '*')
         LIMIT 100`,
        [disciplina, topicCode]
      );
      return { success: true, items: rows };
    } catch (err) {
      console.error('[admin-rag] Erro:', err);
      return reply.status(500).send({ success: false, error: 'Erro ao buscar RAG blocks' });
    }
  });
}

export async function adminRagRoutesRegister(app: FastifyInstance) {
  await adminRagRoutes(app);
}

/**
 * Rotas de Usuários
 */
export async function adminUsersRoutes(app: FastifyInstance) {
  app.get('/admin/users', async (req, reply) => {
    try {
      const { rows } = await query<any>(
        `SELECT id, email, name, created_at FROM users LIMIT 100`
      );
      return { success: true, items: rows };
    } catch (err) {
      console.error('[admin-users] Erro:', err);
      return reply.status(500).send({ success: false, error: 'Erro ao buscar usuários' });
    }
  });
}

export async function adminUsersRoutesRegister(app: FastifyInstance) {
  await adminUsersRoutes(app);
}

export async function adminMetricsRoutes(app: FastifyInstance) {
  /**
   * GET /admin/metrics/qa/summary
   * Resumo de QA por status
   * 
   * Retorna contagem de qa_reviews agrupado por status
   */
  app.get('/admin/metrics/qa/summary', async (req, reply) => {
    try {
      console.log('[admin-metrics] Buscando resumo de QA');

      const { rows } = await query<QAMetricRow>(
        `
        SELECT status, COUNT(*) AS total
        FROM qa_reviews
        GROUP BY status
        ORDER BY status ASC
        `
      );

      return { success: true, items: rows };
    } catch (err) {
      console.error('[admin-metrics] Erro:', err);
      return reply.status(500).send({
        success: false,
        error: err instanceof Error ? err.message : 'Erro ao buscar resumo de QA'
      });
    }
  });

  /**
   * GET /admin/metrics/overview
   * Visão geral de métricas do sistema
   */
  app.get('/admin/metrics/overview', async (req, reply) => {
    try {
      console.log('[admin-metrics] Buscando visão geral de métricas');

      // Contar usuários
      const { rows: userRows } = await query<{ count: string }>(
        'SELECT COUNT(*) as count FROM users'
      );
      const usersCount = parseInt(userRows[0]?.count || '0', 10);

      // Contar drops
      const { rows: dropRows } = await query<{ count: string }>(
        'SELECT COUNT(*) as count FROM drops'
      );
      const dropsCount = parseInt(dropRows[0]?.count || '0', 10);

      // Contar disciplinas
      const { rows: disciplineRows } = await query<{ count: string }>(
        'SELECT COUNT(*) as count FROM disciplines'
      );
      const disciplinesCount = parseInt(disciplineRows[0]?.count || '0', 10);

      // Contar reviews de hoje
      const { rows: reviewRows } = await query<{ count: string }>(
        `SELECT COUNT(*) as count FROM srs_reviews 
         WHERE DATE(reviewed_at) = CURRENT_DATE`
      );
      const reviewsToday = parseInt(reviewRows[0]?.count || '0', 10);

      return {
        success: true,
        usersCount,
        dropsCount,
        disciplinesCount,
        reviewsToday
      };
    } catch (err) {
      console.error('[admin-metrics] Erro ao buscar overview:', err);
      return reply.status(500).send({
        success: false,
        error: err instanceof Error ? err.message : 'Erro ao buscar métricas'
      });
    }
  });

  /**
   * GET /admin/metrics/daily
   * Métricas diárias com filtros
   * 
   * Query params:
   * - metricName: filtrar por métrica (opcional)
   * - days: número de dias (padrão: 30, máximo: 365)
   */
  app.get('/admin/metrics/daily', async (req, reply) => {
    try {
      const { metricName, days = '30' } = req.query as {
        metricName?: string;
        days?: string;
      };

      const parsedDays = Math.min(parseInt(days, 10) || 30, 365);

      console.log(`[admin-metrics] Buscando métricas diárias: metricName=${metricName}, days=${parsedDays}`);

      const params: any[] = [parsedDays];
      let metricFilter = '';

      if (metricName) {
        metricFilter = 'AND metric_name = $2';
        params.push(metricName);
      }

      const { rows } = await query<DailyMetricRow>(
        `
        SELECT
          date,
          metric_name,
          metric_value::text
        FROM metrics_daily
        WHERE date >= (CURRENT_DATE - $1::int)
        ${metricFilter}
        ORDER BY date ASC, metric_name ASC
        `,
        params
      );

      return { success: true, items: rows };
    } catch (err) {
      console.error('[admin-metrics] Erro:', err);
      return reply.status(500).send({
        success: false,
        error: err instanceof Error ? err.message : 'Erro ao buscar métricas diárias'
      });
    }
  });
}
