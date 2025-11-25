import { FastifyInstance } from 'fastify';
import { query } from '../db';
import { runJobManually } from '../scheduler/jobScheduler';

interface JobScheduleRow {
  id: number;
  job_name: string;
  cron_expression: string;
  is_active: boolean;
  last_run_at?: Date;
  next_run_at?: Date;
}

interface JobLogRow {
  id: number;
  job_name: string;
  status: string;
  started_at: Date;
  ended_at?: Date;
  items_processed: number;
  items_failed: number;
  error_message?: string;
}

export async function jobsRoutes(app: FastifyInstance) {
  /**
   * GET /api/jobs/schedules
   * Listar todos os agendamentos de jobs
   */
  app.get('/api/jobs/schedules', async (request, reply) => {
    try {
      const { rows } = await query<JobScheduleRow>(
        `SELECT id, job_name, cron_expression, is_active, last_run_at, next_run_at
         FROM job_schedule
         ORDER BY job_name ASC`
      );
      return reply.send(rows);
    } catch (err) {
      return reply.code(500).send({ error: 'Erro ao buscar agendamentos' });
    }
  });

  /**
   * GET /api/jobs/schedules/:jobName
   * Buscar agendamento específico
   */
  app.get<{ Params: { jobName: string } }>(
    '/api/jobs/schedules/:jobName',
    async (request, reply) => {
      try {
        const { rows } = await query<JobScheduleRow>(
          `SELECT id, job_name, cron_expression, is_active, last_run_at, next_run_at
           FROM job_schedule
           WHERE job_name = $1`,
          [request.params.jobName]
        );

        if (rows.length === 0) {
          return reply.code(404).send({ error: 'Job não encontrado' });
        }

        return reply.send(rows[0]);
      } catch (err) {
        return reply.code(500).send({ error: 'Erro ao buscar agendamento' });
      }
    }
  );

  /**
   * PUT /api/jobs/schedules/:jobName
   * Atualizar agendamento de um job
   */
  app.put<{
    Params: { jobName: string };
    Body: { cron_expression?: string; is_active?: boolean };
  }>(
    '/api/jobs/schedules/:jobName',
    async (request, reply) => {
      try {
        const { cron_expression, is_active } = request.body;
        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (cron_expression !== undefined) {
          updates.push(`cron_expression = $${paramCount++}`);
          values.push(cron_expression);
        }

        if (is_active !== undefined) {
          updates.push(`is_active = $${paramCount++}`);
          values.push(is_active);
        }

        updates.push(`updated_at = NOW()`);
        values.push(request.params.jobName);

        if (updates.length === 1) {
          return reply.code(400).send({ error: 'Nenhum campo para atualizar' });
        }

        const { rows } = await query<JobScheduleRow>(
          `UPDATE job_schedule
           SET ${updates.join(', ')}
           WHERE job_name = $${paramCount}
           RETURNING id, job_name, cron_expression, is_active, last_run_at, next_run_at`,
          values
        );

        if (rows.length === 0) {
          return reply.code(404).send({ error: 'Job não encontrado' });
        }

        return reply.send(rows[0]);
      } catch (err) {
        return reply.code(500).send({ error: 'Erro ao atualizar agendamento' });
      }
    }
  );

  /**
   * POST /api/jobs/run/:jobName
   * Executar um job manualmente
   */
  app.post<{
    Params: { jobName: string };
  }>(
    '/api/jobs/run/:jobName',
    async (request, reply) => {
      try {
        const jobName = request.params.jobName;

        // Validar job name
        if (!['extract-blueprints', 'generate-drops'].includes(jobName)) {
          return reply.code(400).send({ error: 'Job desconhecido' });
        }

        console.log(`[jobs-api] Executando job manualmente: ${jobName}`);

        // Executar job em background
        runJobManually(jobName).catch(err => {
          console.error(`[jobs-api] Erro ao executar ${jobName}:`, err);
        });

        return reply.send({
          message: `Job ${jobName} iniciado`,
          jobName
        });
      } catch (err) {
        return reply.code(500).send({ error: 'Erro ao iniciar job' });
      }
    }
  );

  /**
   * GET /api/jobs/logs
   * Listar logs de execução de jobs
   */
  app.get<{
    Querystring: { jobName?: string; limit?: string; offset?: string };
  }>(
    '/api/jobs/logs',
    async (request, reply) => {
      try {
        const limit = Math.min(parseInt(request.query.limit || '50'), 100);
        const offset = parseInt(request.query.offset || '0');

        let sql = `SELECT id, job_name, status, started_at, ended_at, items_processed, items_failed, error_message
                   FROM job_logs`;
        const params: any[] = [];

        if (request.query.jobName) {
          sql += ` WHERE job_name = $1`;
          params.push(request.query.jobName);
        }

        sql += ` ORDER BY started_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const { rows } = await query<JobLogRow>(sql, params);
        return reply.send(rows);
      } catch (err) {
        return reply.code(500).send({ error: 'Erro ao buscar logs' });
      }
    }
  );

  /**
   * GET /api/jobs/logs/:jobName/latest
   * Buscar último log de um job
   */
  app.get<{
    Params: { jobName: string };
  }>(
    '/api/jobs/logs/:jobName/latest',
    async (request, reply) => {
      try {
        const { rows } = await query<JobLogRow>(
          `SELECT id, job_name, status, started_at, ended_at, items_processed, items_failed, error_message
           FROM job_logs
           WHERE job_name = $1
           ORDER BY started_at DESC
           LIMIT 1`,
          [request.params.jobName]
        );

        if (rows.length === 0) {
          return reply.code(404).send({ error: 'Nenhum log encontrado' });
        }

        return reply.send(rows[0]);
      } catch (err) {
        return reply.code(500).send({ error: 'Erro ao buscar log' });
      }
    }
  );

  /**
   * GET /api/jobs/status
   * Obter status geral dos jobs
   */
  app.get(
    '/api/jobs/status',
    async (request, reply) => {
      try {
        const { rows: schedules } = await query<JobScheduleRow>(
          `SELECT id, job_name, cron_expression, is_active, last_run_at, next_run_at
           FROM job_schedule
           ORDER BY job_name ASC`
        );

        const { rows: logs } = await query<JobLogRow>(
          `SELECT id, job_name, status, started_at, ended_at, items_processed, items_failed, error_message
           FROM job_logs
           ORDER BY started_at DESC
           LIMIT 100`
        );

        const { rows: countRows } = await query<{ count: string }>(
          `SELECT COUNT(*) as count FROM job_logs`
        );

        const latestLogs: Record<string, JobLogRow> = {};
        for (const log of logs) {
          if (!latestLogs[log.job_name]) {
            latestLogs[log.job_name] = log;
          }
        }

        return reply.send({
          schedules,
          latestLogs,
          totalLogs: parseInt(countRows[0]?.count || '0', 10)
        });
      } catch (err) {
        return reply.code(500).send({ error: 'Erro ao buscar status' });
      }
    }
  );
}
