import { retrieveSimilarDocuments, buildRagContext } from './embeddings';

export interface RagOptions {
  enabled: boolean;
  topK?: number;
}

export interface RagResult {
  context: string;
  sources: string[];
  hasContext: boolean;
}

/**
 * Perform RAG retrieval for a question
 */
export async function performRAG(
  question: string,
  philosopherId: string,
  options: RagOptions = { enabled: true, topK: 3 }
): Promise<RagResult> {
  if (!options.enabled) {
    return {
      context: '',
      sources: [],
      hasContext: false,
    };
  }

  try {
    const documents = await retrieveSimilarDocuments(
      question,
      philosopherId,
      options.topK || 3
    );

    if (documents.length === 0) {
      return {
        context: '',
        sources: [],
        hasContext: false,
      };
    }

    const context = buildRagContext(documents);
    const sources = documents.map((doc) => doc.source);

    return {
      context,
      sources,
      hasContext: true,
    };
  } catch (error) {
    console.error('Error performing RAG:', error);
    return {
      context: '',
      sources: [],
      hasContext: false,
    };
  }
}
