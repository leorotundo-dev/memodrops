export type DropType = 'explanation' | 'mini_question' | 'flashcard';

export interface DropContent {
  title?: string;
  text?: string;
  question?: string;
  alternatives?: string[];
  answer?: string;
}

export interface Drop {
  id?: number;
  blueprintId?: number;
  topicCode: string;
  type: DropType;
  difficulty: number;
  content: DropContent;
}
