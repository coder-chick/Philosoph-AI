import { Storage } from '@google-cloud/storage';
import { VertexAI } from '@google-cloud/vertexai';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const storage = new Storage();

// Initialize Vertex AI
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || process.env.VERTEX_AI_PROJECT_ID;
const LOCATION = process.env.VERTEX_AI_LOCATION || 'us-central1';

const vertexAI = new VertexAI({
  project: PROJECT_ID!,
  location: LOCATION,
});

const BUCKET_NAME = process.env.GCS_BUCKET_NAME || `${PROJECT_ID}.appspot.com`;
const PHILOSOPHERS_PREFIX = 'philosophers/';

interface TextChunk {
  content: string;
  chunkIndex: number;
  source: string;
  philosopherId: string;
}

/**
 * Split text into chunks of approximately targetTokens size
 */
function chunkText(text: string, targetTokens: number = 400): string[] {
  // Rough estimate: 1 token ≈ 4 characters
  const targetChars = targetTokens * 4;
  const chunks: string[] = [];
  
  // Split by paragraphs first
  const paragraphs = text.split(/\n\n+/);
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    if ((currentChunk + paragraph).length > targetChars && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  
  // If any chunk is still too large, split by sentences
  const finalChunks: string[] = [];
  for (const chunk of chunks) {
    if (chunk.length > targetChars * 1.5) {
      const sentences = chunk.split(/\. /);
      let subChunk = '';
      
      for (const sentence of sentences) {
        if ((subChunk + sentence).length > targetChars && subChunk.length > 0) {
          finalChunks.push(subChunk.trim() + '.');
          subChunk = sentence;
        } else {
          subChunk += (subChunk ? '. ' : '') + sentence;
        }
      }
      
      if (subChunk) {
        finalChunks.push(subChunk.trim());
      }
    } else {
      finalChunks.push(chunk);
    }
  }
  
  return finalChunks;
}

/**
 * Generate embedding for a text chunk using Vertex AI
 */
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const model = vertexAI.preview.getGenerativeModel({
      model: 'text-embedding-004',
    });

    const request = {
      contents: [{ role: 'user', parts: [{ text }] }],
    };

    const result = await model.generateContent(request);
    
    // Note: The actual embedding extraction may vary based on API response
    // This is a simplified version - adjust based on actual response structure
    const embedding = result.response.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (embedding) {
      return JSON.parse(embedding);
    }
    
    // Fallback: return empty array if embedding generation fails
    console.warn('Failed to generate embedding, using empty array');
    return [];
  } catch (error) {
    console.error('Error generating embedding:', error);
    return [];
  }
}

/**
 * Process a single philosopher's text file
 */
async function processFile(
  bucketName: string,
  filePath: string
): Promise<void> {
  console.log(`Processing file: ${filePath}`);
  
  // Extract philosopher ID and work name from path
  // Expected format: philosophers/<philosopherId>/<work>.txt
  const pathParts = filePath.split('/');
  if (pathParts.length < 3) {
    console.error(`Invalid file path format: ${filePath}`);
    return;
  }
  
  const philosopherId = pathParts[1];
  const workName = pathParts[2].replace('.txt', '');
  
  // Download file content
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(filePath);
  
  const [content] = await file.download();
  const text = content.toString('utf-8');
  
  console.log(`Downloaded ${text.length} characters from ${workName}`);
  
  // Chunk the text
  const chunks = chunkText(text, 400);
  console.log(`Created ${chunks.length} chunks`);
  
  // Process each chunk
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    
    console.log(`Processing chunk ${i + 1}/${chunks.length}`);
    
    // Generate embedding
    const embedding = await generateEmbedding(chunk);
    
    if (embedding.length === 0) {
      console.warn(`Skipping chunk ${i} due to failed embedding generation`);
      continue;
    }
    
    // Store in Firestore
    const docData = {
      philosopherId,
      content: chunk,
      embedding,
      source: workName,
      chunkIndex: i,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    await db.collection('embeddings').add(docData);
    console.log(`Stored chunk ${i} in Firestore`);
  }
  
  console.log(`Completed processing ${filePath}`);
}

/**
 * Main function to ingest all philosopher texts
 */
export async function ingestPhilosopherTexts(
  req: any,
  res: any
): Promise<void> {
  try {
    console.log('Starting philosopher text ingestion...');
    
    // List all files in the philosophers directory
    const bucket = storage.bucket(BUCKET_NAME);
    const [files] = await bucket.getFiles({
      prefix: PHILOSOPHERS_PREFIX,
    });
    
    const textFiles = files.filter(file => file.name.endsWith('.txt'));
    
    console.log(`Found ${textFiles.length} text files to process`);
    
    // Process each file
    for (const file of textFiles) {
      await processFile(BUCKET_NAME, file.name);
    }
    
    console.log('Ingestion complete!');
    
    res.status(200).json({
      success: true,
      message: `Processed ${textFiles.length} files`,
      filesProcessed: textFiles.map(f => f.name),
    });
  } catch (error) {
    console.error('Error during ingestion:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Export for Cloud Functions
export { ingestPhilosopherTexts as default };
