import { extractExamStructureFromHtml } from '@memodrops/ai/dist/pipelines/extractExamStructure';

export async function extractBlueprint(html: string) {
  return extractExamStructureFromHtml(html);
}
