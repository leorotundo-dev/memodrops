import { query } from '../../db';

export interface LogInput {
  userId: string;
  dropId: number;
  wasCorrect: boolean;
}

interface DropRow {
  id: number;
  topic_code: string;
}

interface UserStatRow {
  id: number;
  correct_count: number;
  wrong_count: number;
  streak: number;
  next_due_at: string | null;
}

/**
 * Calcular próxima data de revisão (SRS)
 * 
 * Se acerto:
 * - streak 1: 1 dia
 * - streak 2: 2 dias
 * - streak 3: 4 dias
 * - streak >= 4: 7 dias
 * 
 * Se erro:
 * - próxima revisão: 6 horas
 */
function computeNextDueDate(streak: number, wasCorrect: boolean): Date {
  const now = new Date();

  if (!wasCorrect) {
    // Erro: revisar em 6 horas
    now.setHours(now.getHours() + 6);
    return now;
  }

  // Acerto: usar intervalo baseado em streak
  let offsetDays = 1;
  if (streak === 2) offsetDays = 2;
  else if (streak === 3) offsetDays = 4;
  else if (streak >= 4) offsetDays = 7;

  now.setDate(now.getDate() + offsetDays);
  return now;
}

/**
 * Registrar resposta do usuário e atualizar SRS
 * 
 * Fluxo:
 * 1. Buscar drop para obter topic_code
 * 2. Buscar ou criar user_stats
 * 3. Atualizar streak, acertos/erros
 * 4. Calcular próxima revisão
 */
export async function learnLog({ userId, dropId, wasCorrect }: LogInput) {
  console.log(`[learn-log] Registrando resposta: userId=${userId}, dropId=${dropId}, wasCorrect=${wasCorrect}`);

  // Buscar drop para obter topic_code
  const { rows: dropRows } = await query<DropRow>(
    `SELECT id, topic_code FROM drops WHERE id=$1 LIMIT 1`,
    [dropId]
  );

  if (dropRows.length === 0) {
    throw new Error(`Drop ${dropId} não encontrado`);
  }

  const topicCode = dropRows[0].topic_code;
  const now = new Date();

  // Buscar user_stats existente
  const { rows: statRows } = await query<UserStatRow>(
    `
    SELECT id, correct_count, wrong_count, streak, next_due_at
    FROM user_stats
    WHERE user_id=$1 AND topic_code=$2
    LIMIT 1
    `,
    [userId, topicCode]
  );

  // Se não existe, criar novo registro
  if (statRows.length === 0) {
    console.log(`[learn-log] Criando novo registro para userId=${userId}, topicCode=${topicCode}`);

    const initialStreak = wasCorrect ? 1 : 0;
    const nextDue = computeNextDueDate(initialStreak, wasCorrect);

    await query(
      `
      INSERT INTO user_stats (
        user_id, topic_code,
        correct_count, wrong_count, streak,
        last_seen_at, next_due_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      `,
      [
        userId,
        topicCode,
        wasCorrect ? 1 : 0,
        wasCorrect ? 0 : 1,
        initialStreak,
        now,
        nextDue
      ]
    );

    console.log(`[learn-log] ✅ Registro criado: streak=${initialStreak}, nextDue=${nextDue.toISOString()}`);

    return {
      status: 'created',
      topicCode,
      streak: initialStreak,
      nextDue,
      wasCorrect
    };
  }

  // Se existe, atualizar
  console.log(`[learn-log] Atualizando registro para userId=${userId}, topicCode=${topicCode}`);

  const stat = statRows[0];
  const newCorrect = stat.correct_count + (wasCorrect ? 1 : 0);
  const newWrong = stat.wrong_count + (wasCorrect ? 0 : 1);
  const newStreak = wasCorrect ? stat.streak + 1 : 0;
  const nextDue = computeNextDueDate(newStreak, wasCorrect);

  await query(
    `
    UPDATE user_stats
    SET correct_count=$1,
        wrong_count=$2,
        streak=$3,
        last_seen_at=$4,
        next_due_at=$5
    WHERE user_id=$6 AND topic_code=$7
    `,
    [
      newCorrect,
      newWrong,
      newStreak,
      now,
      nextDue,
      userId,
      topicCode
    ]
  );

  console.log(`[learn-log] ✅ Registro atualizado: streak=${newStreak}, nextDue=${nextDue.toISOString()}`);

  return {
    status: 'updated',
    topicCode,
    streak: newStreak,
    nextDue,
    wasCorrect,
    correctCount: newCorrect,
    wrongCount: newWrong
  };
}
