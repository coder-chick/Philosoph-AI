import { db } from './firebaseAdmin';
import { generateEmbedding } from './vertexClient';

export interface EmbeddingDocument {
  id: string;
  philosopherId: string;
  content: string;
  embedding: number[];
  source: string;
  chunkIndex: number;
  createdAt: Date;
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

/**
 * Store an embedding in Firestore
 */
export async function storeEmbedding(doc: Omit<EmbeddingDocument, 'id'>): Promise<string> {
  const docRef = await db.collection('embeddings').add({
    ...doc,
    createdAt: new Date(),
  });
  return docRef.id;
}

/**
 * Retrieve similar documents using RAG
 */
export async function retrieveSimilarDocuments(
  question: string,
  philosopherId: string,
  topK: number = 3
): Promise<EmbeddingDocument[]> {
  try {
    // Generate embedding for the question
    const questionEmbedding = await generateEmbedding(question);
    
    if (!questionEmbedding || questionEmbedding.length === 0) {
      console.error('Failed to generate question embedding');
      return [];
    }

    // Retrieve all embeddings for this philosopher
    const snapshot = await db
      .collection('embeddings')
      .where('philosopherId', '==', philosopherId)
      .get();

    if (snapshot.empty) {
      return [];
    }

    // Calculate similarity scores
    const documents = snapshot.docs.map((doc) => {
      const data = doc.data() as Omit<EmbeddingDocument, 'id'>;
      const similarity = cosineSimilarity(questionEmbedding, data.embedding);
      
      return {
        id: doc.id,
        ...data,
        similarity,
      };
    });

    // Sort by similarity and return top K
    const sortedDocs = documents
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);

    return sortedDocs.map(({ similarity, ...doc }) => doc as EmbeddingDocument);
  } catch (error) {
    console.error('Error retrieving similar documents:', error);
    return [];
  }
}

/**
 * Build RAG context from retrieved documents
 */
export function buildRagContext(documents: EmbeddingDocument[]): string {
  if (documents.length === 0) return '';
  
  return documents
    .map((doc, index) => `[${index + 1}] From ${doc.source}:\n${doc.content}`)
    .join('\n\n');
}
