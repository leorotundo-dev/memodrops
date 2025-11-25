import { query } from '../db';

export interface Drop {
  id: string;
  discipline_id: string;
  title: string;
  content: string;
  difficulty: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateDropInput {
  discipline_id: string;
  title: string;
  content: string;
  difficulty?: number;
}

export async function listDrops(disciplineId?: string): Promise<Drop[]> {
  if (disciplineId) {
    const { rows } = await query<Drop>(
      'SELECT * FROM drops WHERE discipline_id = $1 ORDER BY created_at ASC',
      [disciplineId]
    );
    return rows;
  }

  const { rows } = await query<Drop>('SELECT * FROM drops ORDER BY created_at ASC');
  return rows;
}

export async function createDrop(input: CreateDropInput): Promise<Drop> {
  const difficulty = input.difficulty ?? 1;

  const { rows } = await query<Drop>(
    `
      INSERT INTO drops (discipline_id, title, content, difficulty)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
    [input.discipline_id, input.title, input.content, difficulty]
  );
  return rows[0];
}
