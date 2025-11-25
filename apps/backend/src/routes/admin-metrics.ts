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
