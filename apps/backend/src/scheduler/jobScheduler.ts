import cron from 'node-cron';
import { query } from '../db';
import { extractBlueprint } from '../services/ai/extractBlueprint';
import { generateDropBatchForTopic } from '../services/ai/generateDropBatch';
import { summarizeRAGBlock } from '../services/ai/summarizeRAG';
import fetch from 'node-fetch';
import crypto from 'crypto';

interface JobScheduleRow {
  id: number;
  job_name: string;
  cron_expression: string;
  is_active: boolean;
  last_run_at?: Date;
  next_run_at?: Date;
}

interface HarvestItem {
  id: number;
  source: string;
  url: string;
  raw_html: string;
  status: string;
}

interface ExamBlueprintRow {
  id: number;
  blueprint: any;
}

interface DropCacheRow {
  id: number;
  hash: string;
}

function makeCacheKey(blueprintId: number, topicCode: string) {
  return crypto.createHash('sha256').update(`${blueprintId}:${topicCode}`).digest('hex');
}

/**
 * Registrar execução de job no banco
 */
async function logJobExecution(
  jobName: string,
  status: 'STARTED' | 'COMPLETED' | 'FAILED',
  itemsProcessed: number = 0,
  itemsFailed: number = 0,
  errorMessage?: string
) {
  try {
    await query(
      `
      INSERT INTO job_logs (job_name, status, items_processed, items_failed, error_message)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [jobName, status, itemsProcessed, itemsFailed, errorMessage || null]
    );
  } catch (err) {
    console.error('[scheduler] Erro ao registrar log:', err);
  }
}

/**
 * Job: Extrair blueprints de harvest items pendentes
 */
async function extractBlueprintsJob() {
  console.log('[scheduler] Iniciando job: extract-blueprints');
  const jobName = 'extract-blueprints';
  let itemsProcessed = 0;
  let itemsFailed = 0;

  try {
    await logJobExecution(jobName, 'STARTED');

    const { rows } = await query<HarvestItem>(
      `
      SELECT id, source, url, raw_html, status
      FROM harvest_items
      WHERE status = 'PENDING'
      ORDER BY id ASC
      LIMIT 10
      `
    );

    if (rows.length === 0) {
      console.log('[scheduler] Nenhum harvest_item PENDING encontrado.');
      await logJobExecution(jobName, 'COMPLETED', 0, 0);
      return;
    }

    console.log(`[scheduler] Encontrados ${rows.length} itens para processar`);

    for (const item of rows) {
      try {
        console.log(`[scheduler] Processando harvest id=${item.id}`);

        const blueprint = await extractBlueprint(item.raw_html) as any;

        await query(
          `
          INSERT INTO exam_blueprints (
            harvest_item_id,
            exam_code,
            banca,
            cargo,
            disciplina,
            blueprint,
            priorities
          ) VALUES ($1,$2,$3,$4,$5,$6,$7)
          `,
          [
            item.id,
            null,
            blueprint.banca,
            blueprint.cargo ?? null,
            null,
            JSON.stringify(blueprint),
            null
          ]
        );

        await query(
          `
          UPDATE harvest_items
          SET status = $1, processed_at = NOW()
          WHERE id = $2
          `,
          ['BLUEPRINT_DONE', item.id]
        );

        itemsProcessed++;
        console.log(`[scheduler] ✅ Sucesso para harvest id=${item.id}`);
      } catch (err) {
        itemsFailed++;
        console.error(`[scheduler] ❌ Erro para harvest id=${item.id}:`, err);

        try {
          await query(
            `UPDATE harvest_items SET status = $1, processed_at = NOW() WHERE id = $2`,
            ['BLUEPRINT_ERROR', item.id]
          );
        } catch (updateErr) {
          console.error('[scheduler] Erro ao atualizar status para BLUEPRINT_ERROR:', updateErr);
        }
      }
    }

    await logJobExecution(jobName, 'COMPLETED', itemsProcessed, itemsFailed);
    console.log(`[scheduler] ✅ Job extract-blueprints finalizado: ${itemsProcessed} sucesso, ${itemsFailed} falhas`);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    await logJobExecution(jobName, 'FAILED', itemsProcessed, itemsFailed, errorMsg);
    console.error('[scheduler] ❌ Erro fatal no job extract-blueprints:', err);
  }
}

/**
 * Job: Gerar drops a partir de blueprints
 */
async function generateDropsJob() {
  console.log('[scheduler] Iniciando job: generate-drops');
  const jobName = 'generate-drops';
  let itemsProcessed = 0;
  let itemsFailed = 0;

  try {
    await logJobExecution(jobName, 'STARTED');

    const { rows: blueprints } = await query<ExamBlueprintRow>(
      `SELECT id, blueprint FROM exam_blueprints ORDER BY id ASC LIMIT 5`
    );

    if (blueprints.length === 0) {
      console.log('[scheduler] Nenhum blueprint encontrado.');
      await logJobExecution(jobName, 'COMPLETED', 0, 0);
      return;
    }

    console.log(`[scheduler] Encontrados ${blueprints.length} blueprints para processar`);

    for (const bp of blueprints) {
      try {
        const blueprint = bp.blueprint as any;
        const disciplinas = blueprint.disciplinas ?? [];

        console.log(`[scheduler] Processando blueprint id=${bp.id} com ${disciplinas.length} disciplinas`);

        for (const disc of disciplinas) {
          const topics = disc.topics ?? [];

          for (const topic of topics) {
            const topicCode = topic.code;
            const topicName = topic.name;
            const hash = makeCacheKey(bp.id, topicCode);

            const { rows: cache } = await query<DropCacheRow>(
              `SELECT id FROM drop_cache WHERE hash=$1 LIMIT 1`,
              [hash]
            );

            if (cache.length > 0) {
              console.log(`[scheduler] Cache encontrado para topic=${topicCode}, pulando.`);
              continue;
            }

            console.log(`[scheduler] Gerando drops para topic=${topicCode}`);

            try {
              const result = await generateDropBatchForTopic({
                disciplina: disc.name,
                topicCode,
                topicName,
                banca: blueprint.banca,
                nivel: undefined,
                ragContext: undefined
              }) as any;

              await query(
                `INSERT INTO drop_cache (blueprint_id, hash, payload) VALUES ($1,$2,$3)`,
                [bp.id, hash, JSON.stringify(result)]
              );

              const drops = result.drops ?? [];
              for (const d of drops) {
                await query(
                  `
                  INSERT INTO drops (blueprint_id, topic_code, drop_type, difficulty, drop_text, title, content)
                  VALUES ($1,$2,$3,$4,$5,$6,$7)
                  `,
                  [
                    bp.id,
                    topicCode,
                    d.tipo ?? 'question',
                    d.dificuldade ?? 1,
                    d.conteudo ?? '',
                    d.question ?? topicName,
                    JSON.stringify(d)
                  ]
                );
              }

              itemsProcessed++;
              console.log(`[scheduler] ✅ ${drops.length} drops gerados para topic=${topicCode}`);
            } catch (err) {
              itemsFailed++;
              console.error(`[scheduler] ❌ Erro gerando drops para topic=${topicCode}:`, err);
            }
          }
        }
      } catch (err) {
        itemsFailed++;
        console.error(`[scheduler] ❌ Erro ao processar blueprint id=${bp.id}:`, err);
      }
    }

    await logJobExecution(jobName, 'COMPLETED', itemsProcessed, itemsFailed);
    console.log(`[scheduler] ✅ Job generate-drops finalizado: ${itemsProcessed} sucesso, ${itemsFailed} falhas`);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    await logJobExecution(jobName, 'FAILED', itemsProcessed, itemsFailed, errorMsg);
    console.error('[scheduler] ❌ Erro fatal no job generate-drops:', err);
  }
}

/**
 * Inicializar scheduler
 */
export async function initializeScheduler() {
  console.log('[scheduler] Inicializando scheduler de jobs...');

  try {
    // Buscar agendamentos do banco
    const { rows: schedules } = await query<JobScheduleRow>(
      `SELECT id, job_name, cron_expression, is_active FROM job_schedule WHERE is_active = true`
    );

    if (schedules.length === 0) {
      console.log('[scheduler] Nenhum job agendado ativo.');
      return;
    }

    console.log(`[scheduler] Encontrados ${schedules.length} jobs agendados`);

    for (const schedule of schedules) {
      console.log(`[scheduler] Agendando job: ${schedule.job_name} com cron: ${schedule.cron_expression}`);

      if (schedule.job_name === 'extract-blueprints') {
        cron.schedule(schedule.cron_expression, () => {
          console.log(`[scheduler] ⏰ Executando job: ${schedule.job_name}`);
          extractBlueprintsJob().catch(err => {
            console.error(`[scheduler] Erro ao executar ${schedule.job_name}:`, err);
          });
        });
      } else if (schedule.job_name === 'generate-drops') {
        cron.schedule(schedule.cron_expression, () => {
          console.log(`[scheduler] ⏰ Executando job: ${schedule.job_name}`);
          generateDropsJob().catch(err => {
            console.error(`[scheduler] Erro ao executar ${schedule.job_name}:`, err);
          });
        });
      } else if (schedule.job_name === 'rag-feeder') {
        cron.schedule(schedule.cron_expression, () => {
          console.log(`[scheduler] ⏰ Executando job: ${schedule.job_name}`);
          ragFeederJob().catch(err => {
            console.error(`[scheduler] Erro ao executar ${schedule.job_name}:`, err);
          });
        });
      }
    }

    console.log('[scheduler] ✅ Scheduler inicializado com sucesso');
  } catch (err) {
    console.error('[scheduler] ❌ Erro ao inicializar scheduler:', err);
  }
}

/**
 * Job: Alimentar rag_blocks com conteúdo de fontes externas
 */
function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const RAG_SOURCES = [
  {
    disciplina: 'Português',
    topicCode: 'PT-01',
    topicName: 'Morfologia',
    banca: null,
    sourceUrl: 'https://brasilescola.uol.com.br/gramatica/morfologia.htm'
  },
  {
    disciplina: 'Direito Constitucional',
    topicCode: 'DC-01',
    topicName: 'Constituição Federal – Princípios Fundamentais',
    banca: null,
    sourceUrl: 'https://www.todamateria.com.br/constituicao-federal/'
  }
];

async function ragFeederJob() {
  console.log('[scheduler] Iniciando job: rag-feeder');
  const jobName = 'rag-feeder';
  let itemsProcessed = 0;
  let itemsFailed = 0;

  try {
    await logJobExecution(jobName, 'STARTED');

    for (const src of RAG_SOURCES) {
      try {
        console.log(`[scheduler] Processando: ${src.topicCode} - ${src.topicName}`);

        // Verificar se já existe
        const { rows: existing } = await query<{ id: number }>(
          `
          SELECT id
          FROM rag_blocks
          WHERE disciplina = $1
            AND topic_code = $2
            AND (banca IS NULL OR banca = $3)
            AND source_url = $4
          LIMIT 1
          `,
          [src.disciplina, src.topicCode, src.banca ?? null, src.sourceUrl]
        );

        if (existing.length > 0) {
          console.log('[scheduler] ⏭️  Já existe registro para esta fonte, pulando.');
          continue;
        }

        // Buscar HTML
        const res = await fetch(src.sourceUrl);
        if (!res.ok) {
          console.error(`[scheduler] ❌ Erro ao buscar URL (${res.status}): ${src.sourceUrl}`);
          itemsFailed++;
          continue;
        }

        // Extrair texto
        const html = await res.text();
        const plainText = htmlToText(html);

        if (!plainText || plainText.length < 500) {
          console.warn('[scheduler] ⚠️  Texto extraído muito curto, pulando.');
          continue;
        }

        // Gerar resumo com IA
        const { summary } = await summarizeRAGBlock({
          disciplina: src.disciplina,
          topicCode: src.topicCode,
          topicName: src.topicName,
          banca: src.banca ?? undefined,
          sourceUrl: src.sourceUrl,
          content: plainText
        });

        if (!summary) {
          console.warn('[scheduler] ⚠️  Summary vazio, pulando.');
          continue;
        }

        // Inserir em rag_blocks
        await query(
          `
          INSERT INTO rag_blocks (
            disciplina,
            topic_code,
            banca,
            source_url,
            summary,
            embedding
          ) VALUES ($1, $2, $3, $4, $5, NULL)
          `,
          [
            src.disciplina,
            src.topicCode,
            src.banca ?? null,
            src.sourceUrl,
            summary
          ]
        );

        itemsProcessed++;
        console.log('[scheduler] ✅ Bloco inserido em rag_blocks.');
      } catch (err) {
        itemsFailed++;
        console.error('[scheduler] ❌ Erro ao processar fonte:', err);
      }
    }

    await logJobExecution(jobName, 'COMPLETED', itemsProcessed, itemsFailed);
    console.log(`[scheduler] ✅ Job rag-feeder finalizado: ${itemsProcessed} processados, ${itemsFailed} falhas`);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    await logJobExecution(jobName, 'FAILED', itemsProcessed, itemsFailed, errorMsg);
    console.error('[scheduler] ❌ Erro fatal no job rag-feeder:', err);
  }
}

/**
 * Executar jobs manualmente (para testes)
 */
export async function runJobManually(jobName: string) {
  console.log(`[scheduler] Executando job manualmente: ${jobName}`);

  if (jobName === 'extract-blueprints') {
    await extractBlueprintsJob();
  } else if (jobName === 'generate-drops') {
    await generateDropsJob();
  } else if (jobName === 'rag-feeder') {
    await ragFeederJob();
  } else {
    console.error(`[scheduler] Job desconhecido: ${jobName}`);
  }
}
