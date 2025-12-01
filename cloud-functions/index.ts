import { https } from 'firebase-functions';
import { ingestPhilosopherTexts } from './ingestPhilosopherTexts';

export const ingest = https.onRequest(ingestPhilosopherTexts);
