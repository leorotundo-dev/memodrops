import { generateDropBatch } from '@memodrops/ai/dist/pipelines/generateDropBatch';

export async function generateDropBatchForTopic(input: any) {
  return generateDropBatch(input);
}
