# 🌟 Philosoph-AI

> An enterprise-grade AI wisdom engine powered by 732 classical philosophy books, Google BigQuery vector search, Vertex AI embeddings, and modern serverless architecture.

## 🎯 Overview

Philosoph-AI is a production-ready Next.js application that brings the wisdom of 200+ classical philosophers to life through advanced AI and massive-scale document processing. Built with Google Cloud Platform's most powerful services, this application provides contextually-aware philosophical responses backed by an extensive corpus of classical texts.

### 🚀 What Makes This Special

- **732 Philosophy Books**: Comprehensive library spanning 2,500+ years of philosophical thought from Project Gutenberg
- **200+ Philosophers**: From ancient wisdom (Socrates, Confucius, Lao Tzu) to modern thought (Nietzsche, Kierkegaard, Schopenhauer)
- **BigQuery Vector Search**: Enterprise-scale semantic search across millions of text chunks using 768-dimensional embeddings
- **Vertex AI Embeddings**: State-of-the-art text-embedding-004 model for semantic understanding
- **Intelligent RAG Pipeline**: Retrieval-Augmented Generation ensures responses are grounded in actual philosophical texts
- **Multi-Philosopher Perspectives**: Get diverse viewpoints from multiple traditions simultaneously
- **Automated CI/CD**: GitHub Actions workflow for seamless Cloud Run deployments
- **Production Architecture**: Containerized deployment with auto-scaling, monitoring, and cost optimization

## ✨ Key Features

### 📚 Massive Knowledge Base
- **732 Classical Philosophy Books**: Complete texts from Project Gutenberg, spanning Ancient Greece to 20th century thought
- **200+ Philosopher Profiles**: Comprehensive metadata including biographical info, schools of thought, key themes, and regional traditions
- **15 Philosophical Themes**: Ethics, Metaphysics, Epistemology, Logic, Political Philosophy, Aesthetics, Philosophy of Mind, and more
- **Geographic Filtering**: Ancient Greece, Roman Stoic, German Modern, British Empiricist, French Enlightenment, Ancient China, Islamic Golden Age, and more
- **Automated Book Ingestion**: Scripts to download, process, and chunk texts for vector storage

### 🤖 Advanced AI & Vector Search
- **BigQuery Vector Storage**: Scalable storage for millions of 768-dimensional embeddings with ARRAY<FLOAT64> optimization
- **Vertex AI Embeddings**: Google's text-embedding-004 model for semantic understanding with retry logic and rate limiting
- **Semantic Chunking**: Intelligent text splitting (1000 chars, 100 char overlap) preserving context boundaries
- **Cosine Similarity Search**: Fast vector similarity queries to retrieve relevant philosophical passages
- **RAG Pipeline**: Retrieval-Augmented Generation ensures AI responses cite actual philosophical texts
- **Multi-Turn Context**: Session management maintains conversational context across queries
- **Quota Management**: Exponential backoff and rate limiting for API stability

### 💬 Intelligent Conversation Modes
- **Single Philosopher Mode**: Engage with specific philosophers (Socrates, Plato, Aristotle, Nietzsche, Confucius, etc.) in their authentic voice
- **General Mode**: Receive multi-perspective answers synthesizing insights from multiple philosophical traditions
- **Theme Detection Algorithm**: Keyword-based scoring system automatically categorizes questions by philosophical domain
- **Contextual Recommendations**: System suggests relevant philosophers based on question content and detected themes
- **Voice Authenticity**: Each philosopher's responses match their historical writing style, terminology, and argumentative approach

### 🎨 Modern UI/UX
- **Glassmorphism Design**: Semi-transparent cards with backdrop blur effects creating depth and elegance
- **Dark/Light Mode**: Auto-detects system preference, persists user choice across sessions
- **Smooth Animations**: Fade-in, slide-in, pulse, and bounce effects powered by Tailwind CSS
- **Fully Responsive**: Optimized layouts for mobile, tablet, and desktop (Tailwind breakpoints)
- **Color-Coded Philosophers**: Each philosopher has a unique brand color for visual distinction
- **Real-Time Feedback**: Loading states, progress indicators, and error handling with user-friendly messages
- **Accessibility**: ARIA labels, keyboard navigation, and semantic HTML

### 🔐 Enterprise Security & Admin
- **Firebase Authentication**: Secure user authentication with email/password and Google OAuth
- **Protected Admin Dashboard**: Role-based access control (RBAC) restricting admin routes to authorized emails
- **Analytics Dashboard**: 
  - Total questions count and growth metrics
  - Questions per day/week/month with charts
  - Philosopher popularity rankings
  - RAG usage statistics
  - Average session length and engagement metrics
  - Recent questions table with filtering
  - Geographic distribution of users
- **Firestore Security Rules**: Row-level security preventing unauthorized data access
- **Environment Variable Management**: Secrets stored in GitHub Secrets and Cloud Run environment
- **Credential Rotation**: Automated key rotation capabilities and audit logging

## 🏗️ Architecture

### Tech Stack

**Frontend & API:**
- **Next.js 14**: App Router with React Server Components for optimal performance
- **React 18**: Modern hooks, Suspense, and concurrent rendering
- **TypeScript**: Full type safety across frontend and backend
- **Tailwind CSS**: Utility-first styling with custom design system
- **React Context**: Theme management and global state

**AI & ML:**
- **Google Vertex AI**: Gemini 1.5 Pro for conversational responses
- **Vertex AI Embeddings**: text-embedding-004 model (768 dimensions)
- **BigQuery Vector Search**: Scalable semantic search with cosine similarity
- **RAG Pipeline**: Custom retrieval-augmented generation implementation

**Data Layer:**
- **Google BigQuery**: 
  - `philosophy_data.philosophy_documents` table (chunked texts with embeddings)
  - `philosophy_data.philosophy_books` table (full book metadata)
  - Optimized for ARRAY<FLOAT64> vector storage and similarity queries
- **Firebase Firestore**: Real-time user sessions, analytics, and question logs
- **Cloud Storage**: Original book files (732 .txt files, 440MB)

**Infrastructure:**
- **Cloud Run**: Containerized deployment with auto-scaling (0-10 instances, 1Gi memory)
- **Docker**: Multi-stage builds optimizing for production size
- **GitHub Actions**: Automated CI/CD pipeline with Docker build/push/deploy
- **Google Container Registry (GCR)**: Private Docker image storage
- **Cloud Build**: Build infrastructure (optional, superseded by GitHub Actions)

**DevOps & Monitoring:**
- **GitHub Actions**: Automated deployments on push to master
- **Service Accounts**: Least-privilege IAM roles (run.admin, storage.admin, bigquery.dataEditor)
- **Environment Variables**: Secure secret management via GitHub Secrets
- **Git**: Version control with credential protection and .gitignore best practices
- **Firebase Analytics**: User behavior tracking and engagement metrics
- **Google Analytics 4**: Enhanced analytics with custom events

**Development Tools:**
- **TypeScript**: Strict mode with comprehensive type definitions
- **ESLint**: Code quality and consistency checks
- **Prettier**: Automated code formatting (optional)
- **tsx**: TypeScript execution for scripts
- **Node.js 20**: Latest LTS runtime

### Project Structure

```
philosoph-ai/
├── app/                                # Next.js 14 App Router
│   ├── admin/
│   │   └── page.tsx                    # Protected admin dashboard with analytics
│   ├── api/
│   │   ├── ask/route.ts                # Main AI endpoint (single + general mode)
│   │   ├── log/route.ts                # Question/answer logging to Firestore
│   │   ├── session/route.ts            # Session creation and management
│   │   └── auth/route.ts               # Authentication endpoints
│   ├── layout.tsx                      # Root layout with ThemeProvider
│   ├── page.tsx                        # Main UI with philosopher selector
│   └── globals.css                     # Global styles with dark mode variables
├── lib/                                # Core business logic
│   ├── firebase.ts                     # Firebase client configuration
│   ├── firebaseAdmin.ts                # Firebase Admin SDK for server-side
│   ├── auth.ts                         # Authentication utilities and middleware
│   ├── vertexClient.ts                 # Vertex AI client with retry logic
│   ├── bigqueryClient.ts               # BigQuery client for chunked documents
│   ├── bigqueryBooksClient.ts          # BigQuery client for full books
│   ├── philosophers.ts                 # Philosopher metadata (200+ profiles)
│   ├── themeDetector.ts                # Theme detection algorithm
│   ├── ThemeProvider.tsx               # Dark/light mode React context
│   ├── rag.ts                          # RAG orchestration and retrieval
│   └── embeddings.ts                   # Embedding generation utilities
├── scripts/                            # Data processing scripts
│   ├── download_books.ts               # Download 732 books from Gutendex API
│   ├── ingest_to_bigquery.ts           # Main ingestion pipeline (chunk + embed)
│   ├── upload_books.ts                 # Upload full books to BigQuery
│   └── test_bigquery.ts                # BigQuery connection testing
├── philosophy_data/                    # Data files
│   ├── books/                          # 732 .txt files (440MB, excluded from Docker)
│   ├── philosophers.json               # 200+ philosopher profiles with metadata
│   ├── themes.json                     # 15 philosophical themes with keywords
│   ├── theme_to_philosophers.json      # Theme-to-philosopher mappings
│   └── regions.json                    # Geographic/tradition groupings
├── .github/
│   └── workflows/
│       └── deploy-cloud-run.yml        # GitHub Actions CI/CD workflow
├── public/                             # Static assets (images, fonts, favicon)
├── Dockerfile                          # Multi-stage production container
├── .dockerignore                       # Excludes books, credentials, node_modules
├── .gitignore                          # Prevents committing secrets and local files
├── package.json                        # Dependencies and scripts
├── next.config.js                      # Next.js configuration (standalone output)
├── tailwind.config.js                  # Tailwind CSS custom theme
├── tsconfig.json                       # TypeScript strict configuration
└── README.md                           # This comprehensive documentation
```

### Data Processing Pipeline

```
1. Book Acquisition (scripts/download_books.ts)
   └─> Download from Project Gutenberg via Gutendex API
   └─> Clean HTML, validate JSON, retry on failure
   └─> Save to philosophy_data/books/ (732 files)

2. Text Chunking (scripts/ingest_to_bigquery.ts)
   └─> Strip Gutenberg headers/footers
   └─> Split into 1000-char chunks with 100-char overlap
   └─> Preserve sentence boundaries

3. Embedding Generation (lib/vertexClient.ts)
   └─> Vertex AI text-embedding-004
   └─> 768-dimensional vectors
   └─> Retry logic with exponential backoff
   └─> Rate limiting (1.2s delays, 5s on quota errors)

4. BigQuery Storage (lib/bigqueryClient.ts)
   └─> Batch inserts (50 chunks per batch)
   └─> Schema: id, content, embedding ARRAY<FLOAT64>[768], metadata, created_at
   └─> Indexed for fast retrieval

5. Semantic Search (app/api/ask/route.ts)
   └─> Generate query embedding
   └─> Cosine similarity search in BigQuery
   └─> Retrieve top-k relevant chunks
   └─> Augment Gemini prompt with context
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn
- Google Cloud Project with:
  - Vertex AI API enabled
  - Firebase project created
  - Cloud Run API enabled
  - Cloud Functions API enabled
- Firebase CLI: `npm install -g firebase-tools`
- Google Cloud CLI: Install from https://cloud.google.com/sdk/docs/install

### 1. Clone and Install

```powershell
git clone <your-repo-url>
cd Philosoph-AI
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```powershell
cp .env.example .env
```

Required environment variables:

```env
# Firebase (Client)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Admin
FIREBASE_PROJECT_ID=your-project-id
GOOGLE_CLOUD_PROJECT=your-project-id

# Vertex AI
VERTEX_AI_PROJECT_ID=your-project-id
VERTEX_AI_LOCATION=us-central1
VERTEX_AI_MODEL=gemini-1.5-pro

# Admin Access
ADMIN_EMAIL=your_admin_email@example.com
NEXT_PUBLIC_ADMIN_EMAIL=your_admin_email@example.com

# Cloud Storage
GCS_BUCKET_NAME=your-project-id.appspot.com
```

### 3. Initialize Firebase

```powershell
# Login to Firebase
firebase login

# Initialize Firebase services
firebase init firestore
firebase init storage
firebase init hosting
firebase init analytics

# Deploy Firestore security rules and indexes
firebase deploy --only firestore
firebase deploy --only storage
```

### 4. Set Up Firestore Collections

The following collections will be automatically created on first use:
- `questions` - Logs all user questions and responses
- `embeddings` - Stores document chunks with embeddings for RAG
- `documents` - Metadata about ingested documents
- `philosophers` - Philosopher metadata (optional)
- `sessions` - User session tracking

### 5. Upload Philosopher Texts (Optional - for RAG)

To enable RAG, upload classical philosophy texts to Cloud Storage:

```powershell
# Structure: gs://your-bucket/philosophers/<philosopher-id>/<work>.txt
gsutil cp republic.txt gs://your-project.appspot.com/philosophers/plato/republic.txt
gsutil cp meditations.txt gs://your-project.appspot.com/philosophers/marcus-aurelius/meditations.txt
```

Then trigger the ingestion function (see Cloud Functions section below).

### 6. Run Locally

```powershell
npm run dev
```

Open http://localhost:3000

## 🔐 Admin Dashboard Access

The admin dashboard at `/admin` is protected and only accessible to the email address specified in `ADMIN_EMAIL`.

To access:

1. Navigate to http://localhost:3000/admin
2. Sign in with your authorized email and password
3. View analytics, charts, and recent questions

**Features:**
- Total questions count
- Questions today
- Average session length
- RAG usage percentage
- Questions per day chart
- Philosopher popularity chart
- Recent questions table

## 📊 BigQuery Schema

### `philosophy_documents` Table

Stores chunked text with 768-dimensional embeddings for semantic search.

```sql
CREATE TABLE `philosophy_data.philosophy_documents` (
  id STRING NOT NULL,                    -- Unique chunk identifier
  content STRING NOT NULL,               -- Text content (1000 chars)
  embedding ARRAY<FLOAT64>,              -- 768-dim vector from text-embedding-004
  metadata JSON,                         -- {philosopher_id, book_title, chunk_index, source}
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);
```

**Sample Query (Cosine Similarity Search):**
```sql
WITH query_embedding AS (
  SELECT [0.123, -0.456, ...] AS embedding  -- 768 values
)
SELECT 
  id,
  content,
  metadata,
  (
    SELECT SUM(a * b) / (
      SQRT(SUM(a * a)) * SQRT(SUM(b * b))
    )
    FROM UNNEST(d.embedding) a WITH OFFSET pos
    JOIN UNNEST(q.embedding) b WITH OFFSET pos USING(pos)
  ) AS similarity_score
FROM `philosophy_data.philosophy_documents` d
CROSS JOIN query_embedding q
ORDER BY similarity_score DESC
LIMIT 5;
```

### `philosophy_books` Table (Optional)

Stores full book metadata for reference.

```sql
CREATE TABLE `philosophy_data.philosophy_books` (
  id STRING NOT NULL,
  title STRING,
  author STRING,
  philosopher_id STRING,
  gutenberg_id INT64,
  file_path STRING,
  word_count INT64,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);
```

## 🚢 Deployment

### Automated Deployment via GitHub Actions (Recommended)

This project uses GitHub Actions for continuous deployment to Cloud Run. Every push to the `master` branch automatically triggers a build and deployment.

**Setup:**

1. **Add GitHub Secrets** at https://github.com/YOUR_USERNAME/Philosoph-AI/settings/secrets/actions:
   - `GCP_SA_KEY`: Service account JSON key with roles `run.admin` and `storage.admin`
   - `NEXT_PUBLIC_FIREBASE_API_KEY`: Firebase API key
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Firebase auth domain
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Firebase project ID
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Firebase storage bucket
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID
   - `NEXT_PUBLIC_FIREBASE_APP_ID`: Firebase app ID

2. **Push to master**:
   ```powershell
   git add .
   git commit -m "Deploy to Cloud Run"
   git push origin master
   ```

3. **Monitor deployment** at https://github.com/YOUR_USERNAME/Philosoph-AI/actions

4. **Access your app** at the Cloud Run URL shown in the workflow output (e.g., `https://philosoph-ai-HASH-uc.a.run.app`)

**Workflow Features:**
- ✅ Automated Docker build with multi-stage optimization
- ✅ Push to Google Container Registry (gcr.io)
- ✅ Deploy to Cloud Run with auto-scaling (0-10 instances)
- ✅ Set all environment variables from GitHub Secrets
- ✅ 1Gi memory, 1 CPU per instance
- ✅ Allow unauthenticated access (public app)

### Manual Deployment via gcloud (Alternative)

```powershell
# Set your project
gcloud config set project your-project-id

# Build and push Docker image
gcloud builds submit --tag gcr.io/your-project-id/philosoph-ai

# Deploy to Cloud Run
gcloud run deploy philosoph-ai `
  --image gcr.io/your-project-id/philosoph-ai `
  --region us-central1 `
  --allow-unauthenticated `
  --platform managed `
  --memory 1Gi `
  --cpu 1 `
  --min-instances 0 `
  --max-instances 10 `
  --set-env-vars "VERTEX_AI_PROJECT_ID=your-project-id,VERTEX_AI_LOCATION=us-central1,ADMIN_EMAIL=your_email@example.com"
```

## 🤖 API Endpoints

### `POST /api/ask`

Generate a philosopher response with optional RAG context.

**Request:**
```json
{
  "philosopherId": "plato",         // or "general" for multi-perspective
  "question": "What is justice?",
  "sessionId": "abc123",
  "useRAG": true                    // Enable retrieval-augmented generation
}
```

**Response:**
```json
{
  "answer": "Justice, my friend, is not merely...",
  "philosopherId": "plato",
  "hasRagContext": true,
  "sessionId": "abc123",
  "relevantChunks": [
    {
      "content": "In Book I of The Republic...",
      "similarity": 0.87,
      "source": "republic"
    }
  ]
}
```

**Features:**
- Semantic search retrieves top-5 relevant text chunks from BigQuery
- Gemini 1.5 Pro generates response using philosopher's authentic voice
- Responses cite actual passages when RAG is enabled
- Session context maintains conversation continuity

### `POST /api/log`

Log a question and answer for analytics.

**Request:**
```json
{
  "question": "What is justice?",
  "answer": "Justice, in my view...",
  "philosopherId": "plato",
  "sessionId": "abc123",
  "hasRagContext": true,
  "mode": "single"                  // "single" or "general"
}
```

**Response:**
```json
{
  "success": true,
  "logId": "log_xyz789"
}
```

### `POST /api/session`

Create a new conversation session.

**Response:**
```json
{
  "sessionId": "xyz789",
  "createdAt": "2025-12-01T12:00:00Z"
}
```

### `POST /api/auth`

Create authentication session for admin access.

**Request:**
```json
{
  "idToken": "firebase_id_token_here"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "email": "admin@example.com",
    "uid": "user123"
  }
}
```

## 🎨 Customization

### Adding New Philosophers

Edit `philosophy_data/philosophers.json`:

```json
{
  "id": "new-philosopher",
  "name": "New Philosopher",
  "period": "100-200 CE",
  "school": "School of Thought",
  "keyThemes": ["ethics", "metaphysics"],
  "region": "ancient-greece",
  "color": "#FF6B6B",
  "bio": "Brief biographical information...",
  "styleGuide": "Describe the philosopher's unique speaking style, terminology, and argumentative approach..."
}
```

Then update `lib/philosophers.ts` to reference the new profile.

### Modifying System Prompts

System prompts are generated in `lib/philosophers.ts` via `buildSystemPrompt()`. Customize:

```typescript
export function buildSystemPrompt(philosopher: Philosopher): string {
  return `You are ${philosopher.name}, the ${philosopher.school} philosopher from ${philosopher.period}.
  
Your key themes are: ${philosopher.keyThemes.join(', ')}.

${philosopher.styleGuide}

CRITICAL INSTRUCTIONS:
- Always respond in first person as ${philosopher.name}
- Use terminology and concepts from your historical period
- Reference your key works when relevant
- Maintain your authentic philosophical voice
- If using RAG context, cite specific texts naturally

[Add your custom instructions here]
`;
}
```

### Adjusting Embedding Chunk Size

In `scripts/ingest_to_bigquery.ts`, modify the chunking parameters:

```typescript
// Chunk text into 1000-character segments with 100-character overlap
function chunkText(text: string, chunkSize = 1000, overlap = 100): string[] {
  // Adjust chunkSize and overlap as needed
  // Smaller chunks = more granular search, but more embeddings to generate
  // Larger chunks = more context per chunk, but less precise matching
}
```

**Recommendation:** 1000 chars works well for philosophical texts. Reduce to 500 for more granular search, increase to 1500 for broader context.

### Customizing the Theme Detection Algorithm

Edit `lib/themeDetector.ts` to add new themes or adjust keyword weights:

```typescript
const themes = {
  'new-theme': {
    name: 'New Theme',
    keywords: ['keyword1', 'keyword2', 'keyword3'],
    weight: 1.0  // Adjust weight for importance
  }
};
```

### Modifying BigQuery Similarity Threshold

In `lib/bigqueryClient.ts`, adjust the similarity score filter:

```typescript
// Only return chunks with similarity > 0.7 (adjust as needed)
WHERE similarity_score > 0.7  
ORDER BY similarity_score DESC
LIMIT 5  // Adjust number of retrieved chunks
```

## 🧪 Testing & Development

### Run Full Ingestion Pipeline

Process all 732 books and upload to BigQuery:

```powershell
# Generate embeddings and upload chunks (will take several hours due to rate limits)
npx tsx scripts/ingest_to_bigquery.ts
```

**Note:** This processes ~1.5 million chunks. With rate limiting (1.2s per embedding), expect 20-25 hours for full ingestion.

### Test BigQuery Connection

```powershell
npx tsx scripts/test_bigquery.ts
```

### Download Additional Books

```powershell
# Edit scripts/download_books.ts to add philosopher IDs
# Then run:
npx tsx scripts/download_books.ts
```

### Type Checking

```powershell
npm run type-check
```

### Build Test

```powershell
npm run build
```

### Local Development

```powershell
npm run dev
```

Open http://localhost:3000

### Docker Build Test

```powershell
# Build locally
docker build -t philosoph-ai .

# Run locally
docker run -p 3000:3000 --env-file .env.local philosoph-ai
```

## 📝 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes | Firebase API key for client-side auth |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes | Firebase auth domain (project-id.firebaseapp.com) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Yes | Firebase storage bucket (project-id.appspot.com) |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Yes | Firebase Cloud Messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Yes | Firebase app ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | No | Firebase Analytics measurement ID |
| `FIREBASE_PROJECT_ID` | Yes | Firebase project ID (server-side, auto-populated in Cloud Run) |
| `GOOGLE_CLOUD_PROJECT` | Yes | GCP project ID (auto-populated in Cloud Run) |
| `VERTEX_AI_PROJECT_ID` | Yes | Vertex AI project ID (usually same as GCP project) |
| `VERTEX_AI_LOCATION` | Yes | Vertex AI region (e.g., us-central1) |
| `VERTEX_AI_MODEL` | Yes | Vertex AI model name (e.g., gemini-1.5-pro) |
| `BIGQUERY_PROJECT_ID` | Yes | BigQuery project ID (auto-populated in Cloud Run) |
| `BIGQUERY_DATASET` | Yes | BigQuery dataset name (e.g., philosophy_data) |
| `BIGQUERY_TABLE` | Yes | BigQuery table name (e.g., philosophy_documents) |
| `ADMIN_EMAIL` | Yes | Admin email for dashboard access (server-side check) |
| `NEXT_PUBLIC_ADMIN_EMAIL` | Yes | Admin email (client-side check for UI) |
| `GCS_BUCKET_NAME` | No | Cloud Storage bucket for book files (optional) |

**Note:** In Cloud Run, many GCP variables (like `GOOGLE_CLOUD_PROJECT`) are automatically set via Application Default Credentials.

## 🐛 Troubleshooting

### BigQuery Connection Issues

**Problem:** "Access Denied" or "Permission Denied" errors

**Solution:**
```powershell
# Verify service account has BigQuery Data Editor and Job User roles
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT@YOUR_PROJECT.iam.gserviceaccount.com" \
  --role="roles/bigquery.dataEditor"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT@YOUR_PROJECT.iam.gserviceaccount.com" \
  --role="roles/bigquery.jobUser"
```

### Vertex AI Quota Errors

**Problem:** "Quota exceeded" or 429 errors during embedding generation

**Solution:** The code includes retry logic and rate limiting (1.2s delays). For faster processing:
- Upgrade to Vertex AI paid tier
- Request quota increase in GCP Console
- Reduce batch size in `scripts/ingest_to_bigquery.ts`

### Docker Build Failures

**Problem:** "File not found" errors during build

**Solution:** Check `.dockerignore` isn't excluding required files:
```
# These should NOT be in .dockerignore:
philosophy_data/philosophers.json
philosophy_data/themes.json
philosophy_data/regions.json
```

### GitHub Actions Build Failures

**Problem:** Build fails with "Authentication failed"

**Solution:**
1. Verify `GCP_SA_KEY` secret is correctly formatted (entire JSON key)
2. Ensure service account has `roles/run.admin` and `roles/storage.admin`
3. Check service account key hasn't expired

### TypeScript Errors

**Problem:** Implicit 'any' type errors

**Solution:** Add explicit type annotations:
```typescript
let app: any = null;  // Instead of: let app;
```

### Firebase Admin Credentials

**Problem:** "Could not load default credentials" in local development

**Solution:** Set up Application Default Credentials:
```powershell
# Download service account key from Firebase Console
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\service-account-key.json"

# Or use gcloud auth
gcloud auth application-default login
```

### Admin Dashboard Access Denied

**Problem:** "Unauthorized" when accessing /admin

**Solution:**
1. Verify `ADMIN_EMAIL` environment variable matches your Firebase Authentication email exactly
2. Ensure you're signed in with Firebase Authentication
3. Check browser console for auth errors

### CORS Issues

**Problem:** "CORS policy" errors when calling API routes

**Solution:** Ensure your Cloud Run domain is added to Firebase authorized domains:
1. Go to Firebase Console → Authentication → Settings → Authorized domains
2. Add your Cloud Run URL (e.g., `philosoph-ai-xyz.a.run.app`)

### Ingestion Script Hangs

**Problem:** `ingest_to_bigquery.ts` stops responding

**Solution:** 
- Check network connectivity
- Verify Vertex AI quota hasn't been exhausted
- Kill process and resume (script processes books sequentially, so partially completed work is saved)

## 🚀 Performance & Scalability

### Vector Search Performance
- **BigQuery ARRAY<FLOAT64>**: Optimized storage for 768-dimensional vectors
- **Cosine Similarity**: Sub-second queries across millions of chunks
- **Indexing Strategy**: Metadata JSON fields indexed for fast filtering by philosopher/book

### Auto-Scaling
- **Cloud Run**: Scales from 0 to 10 instances based on traffic
- **Cold Start Time**: ~2-3 seconds for Next.js container
- **Memory Per Instance**: 1Gi (sufficient for embedding generation)
- **CPU**: 1 vCPU per instance (adequate for API workload)

### Cost Optimization
- **Min Instances: 0**: No charges when idle
- **Serverless Architecture**: Pay only for actual usage
- **BigQuery Storage**: $0.02/GB/month for vectors (~$1-2/month for full corpus)
- **Vertex AI Embeddings**: Free tier covers 1000 requests/day, then $0.00005/1K chars
- **Cloud Run**: Free tier includes 2 million requests/month

### Rate Limits & Quotas
- **Vertex AI Free Tier**: 1,000 requests/day for embeddings
- **Vertex AI Paid Tier**: 1,000 requests/minute (upgrade in GCP Console)
- **BigQuery**: 2,000 queries/day free tier
- **Firestore**: 50,000 reads/day, 20,000 writes/day free tier

### Caching Strategy
- **Session Context**: Stored in Firestore for conversation continuity
- **Embeddings**: Cached in BigQuery (generate once, query many times)
- **Next.js Static Assets**: Cached at CDN edge with Cloud Run

### Monitoring & Observability
- **Cloud Run Logs**: Automatic logging of all requests and errors
- **Firebase Analytics**: User behavior and engagement tracking
- **BigQuery Query Logs**: Audit trail of all vector searches
- **Custom Metrics**: Question count, RAG usage %, philosopher popularity

## 📚 Data Sources

### Project Gutenberg Books (732 texts)
All books are sourced from [Project Gutenberg](https://www.gutenberg.org/) via the [Gutendex API](https://gutendex.com/). These are public domain texts, free for use and distribution.

**Coverage:**
- Ancient Greece: Plato, Aristotle, Epicurus, Epictetus
- Roman Stoics: Marcus Aurelius, Seneca
- German Philosophy: Kant, Hegel, Nietzsche, Schopenhauer
- British Empiricism: Locke, Hume, Mill
- French Enlightenment: Rousseau, Voltaire, Descartes
- Ancient China: Confucius, Lao Tzu, Mencius
- Modern: Kierkegaard, James, Russell, and 180+ more

### Philosopher Metadata
200+ philosopher profiles manually curated with:
- Biographical information (birth/death, period)
- School of thought classification
- Key themes and concepts
- Geographic/cultural tradition
- Writing style characteristics

## 🔒 Security & Best Practices

### Secrets Management
- ✅ Never commit `.json` credential files to git
- ✅ Use GitHub Secrets for CI/CD environment variables
- ✅ Use Application Default Credentials in Cloud Run (no keys needed)
- ✅ `.gitignore` includes all sensitive file patterns
- ✅ Service account keys rotated after exposure incidents

### IAM Best Practices
- ✅ Least-privilege service accounts (only required roles)
- ✅ Separate service accounts for GitHub Actions vs. application runtime
- ✅ No owner/editor roles (only specific roles like run.admin, bigquery.dataEditor)

### Application Security
- ✅ Firebase Authentication for admin access
- ✅ Email-based authorization for /admin routes
- ✅ Firestore security rules prevent unauthorized data access
- ✅ CORS configured to allow only authorized domains
- ✅ Input sanitization on all API endpoints

### Deployment Security
- ✅ Docker multi-stage builds (minimal attack surface)
- ✅ No development dependencies in production image
- ✅ Credentials excluded from Docker context via .dockerignore
- ✅ Automated deployments prevent manual credential exposure

## 📚 Resources & Documentation

### Official Documentation
- [Next.js 14 Documentation](https://nextjs.org/docs) - App Router, Server Components, API Routes
- [Firebase Documentation](https://firebase.google.com/docs) - Authentication, Firestore, Analytics
- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs) - Embeddings, Gemini models
- [BigQuery Documentation](https://cloud.google.com/bigquery/docs) - Vector storage, SQL queries
- [Cloud Run Documentation](https://cloud.google.com/run/docs) - Container deployment, scaling
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility-first styling
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - Type system, advanced types

### Project-Specific Guides
- **Architecture Overview**: See `instructions/PROJECT_OVERVIEW.md` (if exists)
- **UI Implementation**: See `instructions/UI_AND_FEATURES.md` (if exists)
- **Philosopher Profiles**: See `philosophy_data/philosophers.json`
- **Theme Keywords**: See `philosophy_data/themes.json`

### External Resources
- [Project Gutenberg](https://www.gutenberg.org/) - Source for philosophy books
- [Gutendex API](https://gutendex.com/) - Metadata API for Gutenberg books
- [Stanford Encyclopedia of Philosophy](https://plato.stanford.edu/) - Reference for philosopher bios

## 🤝 Contributing

Contributions are welcome! Areas for improvement:

### Feature Ideas
- **Voice Mode**: Text-to-speech for philosopher responses
- **Debate Mode**: Multi-philosopher dialogues on a topic
- **Historical Context**: Timeline visualization of philosophers
- **Book Reader**: In-app reading of original texts
- **Multilingual Support**: Translations for non-English speakers
- **Mobile App**: React Native version for iOS/Android
- **Community Features**: User-submitted questions, voting, comments

### Technical Improvements
- **Streaming Responses**: Use Gemini streaming API for real-time response generation
- **Vector Index Optimization**: Explore BigQuery Vector Index (when GA)
- **Caching Layer**: Redis/Memorystore for frequently asked questions
- **A/B Testing**: Experiment with different prompts and RAG strategies
- **Load Testing**: Artillery or k6 tests for production readiness
- **E2E Tests**: Playwright or Cypress for UI testing

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with clear commit messages
4. Add tests if applicable
5. Update documentation (README, JSDoc comments)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request with detailed description

**Code Style:**
- Follow existing TypeScript patterns
- Use Prettier for formatting (if configured)
- Add JSDoc comments for public functions
- Keep commits atomic and well-described

## 📄 License

MIT License

Copyright (c) 2025 Philosoph-AI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## 🙏 Acknowledgments

### Technologies
- Built with **Google Cloud Platform** (Vertex AI, BigQuery, Cloud Run)
- Powered by **Firebase** (Authentication, Firestore, Analytics)
- Styled with **Tailwind CSS** and modern React patterns
- Deployed via **GitHub Actions** automated CI/CD

### Data Sources
- Philosophy texts from **Project Gutenberg** (public domain)
- Book metadata via **Gutendex API**
- Philosopher biographies curated from **Stanford Encyclopedia of Philosophy** and other academic sources

### Inspiration
- Inspired by classical philosophy and the timeless pursuit of wisdom
- Built to make philosophical thought accessible through modern AI
- Dedicated to preserving and sharing humanity's greatest intellectual traditions

### Special Thanks
- The Project Gutenberg team for digitizing classical texts
- Google Cloud for enterprise-grade AI infrastructure
- The open-source community for Next.js, React, and TypeScript

---

**Built with ❤️, philosophical curiosity, and 732 books worth of wisdom**

*"The unexamined life is not worth living." - Socrates*
