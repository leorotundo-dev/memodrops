import { query } from '../db';

export type SrsStatus = 'learning' | 'review' | 'suspended';

export interface SrsCard {
  id: string;
  user_id: string;
  drop_id: string;
  status: SrsStatus;
  interval_days: number;
  ease_factor: number;
  repetition: number;
  next_review_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface SrsReview {
  id: string;
  card_id: string;
  user_id: string;
  grade: number;
  reviewed_at: Date;
}

export async function findCardByUserAndDrop(userId: string, dropId: string): Promise<SrsCard | null> {
  const { rows } = await query<SrsCard>(
    'SELECT * FROM srs_cards WHERE user_id = $1 AND drop_id = $2 LIMIT 1',
    [userId, dropId]
  );
  return rows[0] ?? null;
}

export async function createCard(userId: string, dropId: string): Promise<SrsCard> {
  const { rows } = await query<SrsCard>(
    `
      INSERT INTO srs_cards (user_id, drop_id, status, interval_days, ease_factor, repetition, next_review_at)
      VALUES ($1, $2, 'learning', 1, 2.5, 0, NOW())
      RETURNING *
    `,
    [userId, dropId]
  );
  return rows[0];
}

export async function listDueCards(userId: string, limit: number = 20): Promise<SrsCard[]> {
  const { rows } = await query<SrsCard>(
    `
      SELECT * FROM srs_cards
      WHERE user_id = $1
        AND next_review_at <= NOW()
      ORDER BY next_review_at ASC
      LIMIT $2
    `,
    [userId, limit]
  );
  return rows;
}

export async function saveReview(userId: string, cardId: string, grade: number): Promise<void> {
  await query(
    `
      INSERT INTO srs_reviews (card_id, user_id, grade, reviewed_at)
      VALUES ($1, $2, $3, NOW())
    `,
    [cardId, userId, grade]
  );
}

/**
 * Simple SM-2-like algorithm for scheduling.
 * grade: 0-5, where:
 * 0-2: reset repetition, interval = 1
 * 3-5: increase repetition and grow interval
 */
export function computeNextScheduling(
  currentInterval: number,
  currentEase: number,
  currentRepetition: number,
  grade: number
): { nextInterval: number; nextEase: number; nextRepetition: number } {
  let ease = currentEase;
  let repetition = currentRepetition;
  let interval = currentInterval;

  if (grade < 3) {
    repetition = 0;
    interval = 1;
  } else {
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * ease);
    }
    repetition += 1;
    ease = ease + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
    if (ease < 1.3) {
      ease = 1.3;
    }
  }

  return {
    nextInterval: interval,
    nextEase: ease,
    nextRepetition: repetition
  };
}

export async function updateCardScheduling(cardId: string, data: {
  interval_days: number;
  ease_factor: number;
  repetition: number;
}): Promise<SrsCard> {
  const { rows } = await query<SrsCard>(
    `
      UPDATE srs_cards
      SET interval_days = $2,
          ease_factor = $3,
          repetition = $4,
          next_review_at = NOW() + (CAST($2 AS INTEGER) * INTERVAL '1 day'),
          status = 'review',
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [cardId, data.interval_days, data.ease_factor, data.repetition]
  );
  return rows[0];
}
