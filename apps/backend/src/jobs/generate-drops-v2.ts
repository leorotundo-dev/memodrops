import 'dotenv/config';
import { pool, query } from '../db';
import { generateDropBatchForTopic } from '../services/ai/generateDropBatch';
import crypto from 'crypto';

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

async function main() {
  console.log('[generate-drops] Iniciando job...');

  const { rows: blueprints } = await query<ExamBlueprintRow>(
    `SELECT id, blueprint FROM exam_blueprints ORDER BY id ASC LIMIT 5`
  );

  if (blueprints.length === 0) {
    console.log('[generate-drops] Nenhum blueprint encontrado.');
    await pool.end();
    return;
  }

  let totalDrops = 0;

  for (const bp of blueprints) {
    const blueprint = bp.blueprint as any;
    const disciplinas = blueprint.disciplinas ?? [];

    console.log(`[generate-drops] Processando blueprint id=${bp.id} com ${disciplinas.length} disciplinas`);

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
          console.log(`[generate-drops] Cache encontrado topic=${topicCode}, pulando.`);
          continue;
        }

        console.log(`[generate-drops] Gerando drops para topic=${topicCode}`);

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
            totalDrops++;
          }

          console.log(`[generate-drops] ${drops.length} drops gerados para topic=${topicCode}`);
        } catch (err) {
          console.error('Erro gerando drops:', err);
        }
      }
    }
  }

  console.log(`[generate-drops] Finalizado. Total de drops gerados: ${totalDrops}`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
