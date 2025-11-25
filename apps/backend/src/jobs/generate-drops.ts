import 'dotenv/config';
import { listAllBlueprints, findBlueprintsByDisciplina } from '../repositories/blueprintRepository';
import { createDrop } from '../repositories/dropRepository';
import { generateDropBatchForTopic } from '../services/ai/generateDropBatch';

/**
 * Job: Gerar drops (pílulas de conhecimento) a partir de blueprints
 * 
 * Fluxo:
 * 1. Buscar blueprints não processados
 * 2. Para cada blueprint, extrair tópicos
 * 3. Para cada tópico, gerar drops usando IA
 * 4. Salvar drops em banco de dados
 */

interface GenerationResult {
  blueprintId: number;
  disciplina?: string;
  topicsProcessed: number;
  dropsGenerated: number;
  success: boolean;
  error?: string;
}

async function generateDropsForBlueprint(blueprintId: number, blueprint: any): Promise<GenerationResult> {
  try {
    console.log(`[generate-drops] Processando blueprint ${blueprintId}...`);

    const disciplina = blueprint.disciplina || 'Unknown';
    const banca = blueprint.banca || 'Unknown';
    const nivel = blueprint.cargo || 'Unknown';

    // 1. Extrair tópicos do blueprint
    const topics = blueprint.blueprint?.topics || blueprint.blueprint || {};
    const topicEntries = Object.entries(topics);

    if (topicEntries.length === 0) {
      console.warn(`[generate-drops] Nenhum tópico encontrado no blueprint ${blueprintId}`);
      return {
        blueprintId,
        disciplina,
        topicsProcessed: 0,
        dropsGenerated: 0,
        success: true
      };
    }

    console.log(`[generate-drops] Encontrados ${topicEntries.length} tópicos no blueprint ${blueprintId}`);

    let totalDropsGenerated = 0;

    // 2. Para cada tópico, gerar drops
    for (const [topicCode, topicData] of topicEntries) {
      try {
        const topicName = typeof topicData === 'string' ? topicData : (topicData as any).name || topicCode;
        
        console.log(`[generate-drops] Gerando drops para tópico ${topicCode}...`);

        // Preparar contexto RAG (se disponível)
        const ragContext = typeof topicData === 'object' && topicData !== null
          ? JSON.stringify(topicData)
          : '';
        
        // Ensure we have valid parameters
        if (!topicCode || !topicName) {
          console.warn(`[generate-drops] Skipping invalid topic: ${topicCode}`);
          continue;
        }

        // 3. Chamar serviço de geração de drops
        const generatedDrops = await generateDropBatchForTopic({
          disciplina,
          topicCode,
          topicName,
          banca,
          nivel,
          ragContext
        });

        // 4. Salvar drops no banco
        if (generatedDrops && Array.isArray(generatedDrops.drops)) {
          for (const drop of generatedDrops.drops as any) {
            try {
              await createDrop({
                discipline_id: disciplina,
                title: drop.question || drop.title || topicName,
                content: JSON.stringify({
                  question: drop.question,
                  options: drop.options,
                  correctAnswer: drop.correctAnswer,
                  explanation: drop.explanation,
                  topicCode,
                  banca,
                  nivel
                }),
                difficulty: drop.difficulty || 1
              });
              totalDropsGenerated++;
            } catch (dropError) {
              console.error(`[generate-drops] Erro ao salvar drop:`, dropError);
            }
          }
        }

        console.log(`[generate-drops] ${generatedDrops?.drops?.length || 0} drops gerados para ${topicCode}`);

        // Delay para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (topicError) {
        console.error(`[generate-drops] Erro ao processar tópico ${topicCode}:`, topicError);
      }
    }

    console.log(`[generate-drops] ✅ Blueprint ${blueprintId} processado com sucesso`);

    return {
      blueprintId,
      disciplina,
      topicsProcessed: topicEntries.length,
      dropsGenerated: totalDropsGenerated,
      success: true
    };
  } catch (error) {
    console.error(`[generate-drops] Erro ao processar blueprint ${blueprintId}:`, error);

    return {
      blueprintId,
      topicsProcessed: 0,
      dropsGenerated: 0,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function main() {
  console.log('[generate-drops] Iniciando job de geração de drops...');

  try {
    // 1. Buscar blueprints
    const blueprints = await listAllBlueprints();
    console.log(`[generate-drops] Encontrados ${blueprints.length} blueprints`);

    if (blueprints.length === 0) {
      console.log('[generate-drops] Nenhum blueprint disponível para processar');
      return;
    }

    // 2. Processar cada blueprint
    const results: GenerationResult[] = [];

    for (const blueprint of blueprints) {
      const result = await generateDropsForBlueprint(blueprint.id, blueprint);
      results.push(result);

      // Delay entre blueprints
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 3. Resumo
    const totalTopics = results.reduce((sum, r) => sum + r.topicsProcessed, 0);
    const totalDrops = results.reduce((sum, r) => sum + r.dropsGenerated, 0);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`[generate-drops] ✅ Geração concluída`);
    console.log(`[generate-drops] Blueprints processados: ${successful}, Falhas: ${failed}`);
    console.log(`[generate-drops] Total de tópicos: ${totalTopics}`);
    console.log(`[generate-drops] Total de drops gerados: ${totalDrops}`);

    return {
      blueprintsProcessed: results.length,
      successful,
      failed,
      totalTopics,
      totalDrops,
      results
    };
  } catch (error) {
    console.error('[generate-drops] Erro fatal no job:', error);
    throw error;
  }
}

// Executar job
main()
  .then((result) => {
    console.log('[generate-drops] Job finalizado com sucesso');
    if (result) {
      console.log(JSON.stringify(result, null, 2));
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('[generate-drops] Job falhou:', error);
    process.exit(1);
  });
