import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const promptPath = path.join(__dirname, '../../..', 'ai', 'prompts', 'summarizeRAG.prompt.txt');
const systemPrompt = fs.readFileSync(promptPath, 'utf-8');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL
});

const MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

export interface SummarizeRAGInput {
  disciplina: string;
  topicCode: string;
  topicName: string;
  banca?: string;
  sourceUrl: string;
  content: string;
}

export interface SummarizeRAGResult {
  summary: string;
}

export async function summarizeRAGBlock(
  input: SummarizeRAGInput
): Promise<SummarizeRAGResult> {
  const userContent = [
    `Disciplina: ${input.disciplina}`,
    `Tópico: ${input.topicCode} - ${input.topicName}`,
    input.banca ? `Banca: ${input.banca}` : '',
    `Fonte: ${input.sourceUrl}`,
    '',
    'Conteúdo do artigo:',
    input.content.slice(0, 15000)
  ].join('\n');

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent }
    ],
    temperature: 0.3
  });

  const summary = response.choices[0]?.message?.content?.trim() ?? '';

  return { summary };
}
