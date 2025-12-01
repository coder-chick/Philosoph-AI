import { VertexAI } from '@google-cloud/vertexai';
import { PredictionServiceClient, helpers } from '@google-cloud/aiplatform';

// Initialize Vertex AI with your Cloud project and location
const PROJECT_ID = process.env.GOOGLE_PROJECT_ID || 'philosoph-ai-478709';
const LOCATION = process.env.GOOGLE_LOCATION || 'us-central1';

if (!PROJECT_ID) {
  throw new Error('GOOGLE_PROJECT_ID environment variable is required');
}

// Initialize Vertex AI
const vertexAI = new VertexAI({
  project: PROJECT_ID,
  location: LOCATION,
});

// Initialize Prediction Service Client for Embeddings
const predictionServiceClient = new PredictionServiceClient({
  apiEndpoint: `${LOCATION}-aiplatform.googleapis.com`,
});

// Get the generative model
const generativeModel = vertexAI.getGenerativeModel({
  model: 'gemini-2.0-flash-001',
  generationConfig: {
    maxOutputTokens: 8192,
    temperature: 0.7,
    topP: 0.95,
  },
});

export interface GenerateContentRequest {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxOutputTokens?: number;
}

export interface GenerateContentResponse {
  text: string;
  finishReason?: string;
  error?: string;
}

/**
 * Generate content using Vertex AI Gemini
 */
export async function generateContent({
  systemPrompt,
  userPrompt,
  temperature = 0.7,
  maxOutputTokens = 2048,
}: GenerateContentRequest): Promise<GenerateContentResponse> {
  try {
    const model = vertexAI.getGenerativeModel({
      model: 'gemini-2.0-flash-001',
      generationConfig: {
        maxOutputTokens,
        temperature,
        topP: 0.95,
        topK: 40,
      },
    });

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemPrompt}\n\n${userPrompt}` },
          ],
        },
      ],
    });

    const response = result.response;
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return {
      text,
      finishReason: response.candidates?.[0]?.finishReason,
    };
  } catch (error) {
    console.error('Error generating content:', error);
    return {
      text: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate embeddings using Vertex AI with retry logic for rate limits
 */
export async function generateEmbedding(text: string, retries = 3): Promise<number[]> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // Add delay on retries to respect rate limits
      if (attempt > 0) {
        const backoffMs = Math.min(1000 * Math.pow(2, attempt), 10000);
        console.log(`   Retry attempt ${attempt + 1} after ${backoffMs}ms delay...`);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }

      const endpoint = `projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/text-embedding-004`;
      
      const instance = {
        content: text,
      };
      
      const instanceValue = helpers.toValue(instance);
      
      const [response] = await predictionServiceClient.predict({
        endpoint,
        instances: [instanceValue!],
      });

      if (response.predictions && response.predictions.length > 0) {
        const prediction = response.predictions[0];
        const embeddings = prediction.structValue?.fields?.embeddings;
        const values = embeddings?.structValue?.fields?.values?.listValue?.values;
        
        if (values) {
          return values.map(v => v.numberValue || 0);
        }
      }
      
      throw new Error('Invalid response format from Vertex AI');
    } catch (error: any) {
      // Check if it's a quota error (RESOURCE_EXHAUSTED = code 8)
      if (error.code === 8 || error.message?.includes('Quota exceeded') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        if (attempt < retries - 1) {
          console.log(`   ⚠️  Quota exceeded, waiting 5s before retry...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue;
        }
      }
      
      // For other errors or final retry, throw
      if (attempt === retries - 1) {
        console.error(`   ❌ Error generating embedding after ${retries} retries:`, error.message);
        throw error;
      }
    }
  }
  
  throw new Error('Failed to generate embedding after retries');
}

export { vertexAI, generativeModel };
