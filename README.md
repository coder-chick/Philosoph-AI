# 🌟 Philosoph-AI

> A modern AI-native wisdom engine powered by classical philosophy, Vertex AI, Firebase, and serverless architecture.

## 🎯 Overview

Philosoph-AI is a Next.js web application that enables users to engage with the wisdom of classical philosophers through AI. Users can:

- **Single Philosopher Mode**: Select from 8 legendary philosophers (Socrates, Plato, Aristotle, Epicurus, Marcus Aurelius, Nietzsche, Confucius, Lao Tzu) and receive responses in their unique voice
- **General Mode**: Ask questions and receive multi-perspective answers from multiple philosophers simultaneously
- **Theme Detection**: Automatic categorization of questions by philosophical themes (ethics, justice, knowledge, etc.)
- **Regional Filtering**: Filter philosophers by tradition (Ancient Greece, Roman Stoic, German Modern, Ancient China)
- **Dark/Light Mode**: Sleek modern UI with glassmorphism and smooth theme switching
- **RAG Enhancement** (Optional): Responses enriched with original philosophical texts
- **Admin Dashboard**: Comprehensive analytics and usage insights

## ✨ Key Features

### Modern UI/UX
- 🎨 **Glassmorphism Design**: Semi-transparent cards with backdrop blur effects
- 🌓 **Dark/Light Mode**: Auto-detects system preference, persists user choice
- ✨ **Smooth Animations**: Fade-in, slide-in, pulse, and bounce effects
- 📱 **Fully Responsive**: Adapts to mobile, tablet, and desktop screens
- 🎯 **Color-Coded Philosophers**: Each philosopher has a unique brand color

### Intelligent Features
- 🧠 **Theme Detection Algorithm**: Keyword-based scoring system identifies philosophical themes
- 🔀 **Multi-Perspective Mode**: Get diverse viewpoints from multiple philosophers
- 🌍 **Geographic Filtering**: Focus on specific philosophical traditions
- 🎓 **Contextual Recommendations**: System suggests relevant philosophers based on question content

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (serverless)
- **AI**: Google Cloud Vertex AI (Gemini 1.5 Pro)
- **Database**: Firebase Firestore
- **Storage**: Firebase Cloud Storage
- **Auth**: Firebase Authentication
- **Analytics**: Firebase Analytics, Google Analytics 4
- **Deployment**: Cloud Run (containerized)
- **Functions**: Cloud Functions (document ingestion)

### Project Structure

```
philosoph-ai/
├── app/
│   ├── admin/
│   │   └── page.tsx                 # Protected admin dashboard
│   ├── api/
│   │   ├── ask/route.ts             # Generate responses (single + general mode)
│   │   ├── log/route.ts             # Log questions & analytics
│   │   ├── session/route.ts         # Session management
│   │   └── auth/route.ts            # Authentication endpoints
│   ├── layout.tsx                   # Root layout with ThemeProvider
│   ├── page.tsx                     # Main UI with modern design
│   └── globals.css                  # Global styles with dark mode
├── lib/
│   ├── firebase.ts                  # Firebase client config
│   ├── firebaseAdmin.ts             # Firebase Admin SDK
│   ├── auth.ts                      # Authentication utilities
│   ├── vertexClient.ts              # Vertex AI integration
│   ├── philosophers.ts              # Philosopher definitions & prompts
│   ├── themeDetector.ts             # Theme detection algorithm
│   ├── ThemeProvider.tsx            # Dark/light mode context
│   ├── rag.ts                       # RAG orchestration
│   └── embeddings.ts                # Embedding generation & retrieval
├── philosophy_data/
│   ├── themes.json                  # 15 philosophical themes with keywords
│   ├── theme_to_philosophers.json   # Theme-to-philosopher mappings
│   └── regions.json                 # Geographic groupings
├── instructions/
│   ├── PROJECT_OVERVIEW.md          # Complete architecture documentation
│   └── UI_AND_FEATURES.md           # UI implementation guide
├── cloud-functions/
│   ├── ingestPhilosopherTexts.ts    # Document ingestion function
│   ├── index.ts                     # Function exports
│   ├── package.json                 # Function dependencies
│   └── tsconfig.json                # TypeScript config
├── public/                          # Static assets
├── Dockerfile                       # Container definition
├── package.json                     # Dependencies
├── next.config.js                   # Next.js configuration
├── tailwind.config.js               # Tailwind CSS config
├── tsconfig.json                    # TypeScript config
└── README.md                        # This file
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

## 📊 Firestore Schema

### `questions` Collection

```json
{
  "question": "What is justice?",
  "answer": "...",
  "philosopherId": "plato",
  "timestamp": "2025-01-01T12:00:00Z",
  "sessionId": "abc123",
  "mode": "standard",
  "hasRagContext": false,
  "userAgent": "...",
  "country": "US",
  "answerLength": 850,
  "questionLength": 15
}
```

### `embeddings` Collection

```json
{
  "philosopherId": "plato",
  "content": "Justice is...",
  "embedding": [0.123, -0.456, ...],
  "source": "republic",
  "chunkIndex": 0,
  "createdAt": "2025-01-01T12:00:00Z"
}
```

### `sessions` Collection

```json
{
  "sessionId": "xyz",
  "createdAt": "2025-01-01T12:00:00Z",
  "lastActiveAt": "2025-01-01T12:30:00Z",
  "questionCount": 3
}
```

## 🚢 Deployment

### Deploy to Cloud Run

```powershell
# Set your project
gcloud config set project your-project-id

# Build and deploy
gcloud run deploy philosoph-ai `
  --source . `
  --region us-central1 `
  --allow-unauthenticated `
  --platform managed `
  --memory 1Gi `
  --cpu 1 `
  --set-env-vars "VERTEX_AI_PROJECT_ID=your-project-id,VERTEX_AI_LOCATION=us-central1,ADMIN_EMAIL=your_email@example.com"
```

### Deploy Cloud Functions (Document Ingestion)

```powershell
cd cloud-functions

# Install dependencies
npm install

# Deploy
gcloud functions deploy ingestPhilosopherTexts `
  --runtime nodejs20 `
  --trigger-http `
  --allow-unauthenticated `
  --region us-central1 `
  --memory 512MB `
  --timeout 540s `
  --set-env-vars "VERTEX_AI_PROJECT_ID=your-project-id,GCS_BUCKET_NAME=your-project.appspot.com"
```

### Trigger Document Ingestion

After uploading texts to Cloud Storage:

```powershell
# Get the function URL
gcloud functions describe ingestPhilosopherTexts --region us-central1

# Trigger via HTTP
curl -X POST https://REGION-PROJECT_ID.cloudfunctions.net/ingestPhilosopherTexts
```

## 🤖 API Endpoints

### `POST /api/ask`

Generate a philosopher response.

**Request:**
```json
{
  "philosopherId": "plato",
  "question": "What is justice?",
  "sessionId": "abc123",
  "useRAG": false
}
```

**Response:**
```json
{
  "answer": "In my view, justice is...",
  "philosopherId": "plato",
  "hasRagContext": false,
  "sessionId": "abc123"
}
```

### `POST /api/log`

Log a question and answer.

**Request:**
```json
{
  "question": "What is justice?",
  "answer": "...",
  "philosopherId": "plato",
  "sessionId": "abc123",
  "hasRagContext": false
}
```

### `POST /api/session`

Create a new session.

**Response:**
```json
{
  "sessionId": "xyz789"
}
```

### `POST /api/auth`

Create authentication session.

**Request:**
```json
{
  "idToken": "firebase_id_token"
}
```

## 🎨 Customization

### Adding New Philosophers

Edit `lib/philosophers.ts`:

```typescript
{
  id: 'new-philosopher',
  name: 'New Philosopher',
  period: '100-200 CE',
  school: 'School of Thought',
  keyThemes: ['theme1', 'theme2'],
  styleGuide: 'Describe the philosopher\'s speaking style...',
  color: '#HEX_COLOR',
}
```

### Modifying System Prompts

System prompts are generated in `lib/philosophers.ts` via `buildSystemPrompt()`. Customize the prompt structure there.

### Adjusting Embedding Chunk Size

In `cloud-functions/ingestPhilosopherTexts.ts`, modify:

```typescript
const chunks = chunkText(text, 400); // Adjust token count
```

## 🧪 Testing

```powershell
# Type checking
npm run type-check

# Build test
npm run build

# Run tests (if configured)
npm test
```

## 📝 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Yes | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Yes | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Yes | Firebase app ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | No | Firebase measurement ID (Analytics) |
| `FIREBASE_PROJECT_ID` | Yes | Firebase project ID (server-side) |
| `GOOGLE_CLOUD_PROJECT` | Yes | Google Cloud project ID |
| `VERTEX_AI_PROJECT_ID` | Yes | Vertex AI project ID |
| `VERTEX_AI_LOCATION` | Yes | Vertex AI location (e.g., us-central1) |
| `VERTEX_AI_MODEL` | Yes | Vertex AI model name (e.g., gemini-1.5-pro) |
| `ADMIN_EMAIL` | Yes | Admin email for dashboard access |
| `NEXT_PUBLIC_ADMIN_EMAIL` | Yes | Admin email (client-side check) |
| `GCS_BUCKET_NAME` | Yes | Cloud Storage bucket name |

## 🐛 Troubleshooting

### Firebase Admin Credentials

In Cloud Run, Application Default Credentials are automatically available. Locally, set:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account-key.json"
```

### CORS Issues

Ensure Firebase and Cloud Run domains are configured in your Firebase console under Authentication > Settings > Authorized domains.

### Type Errors

The TypeScript errors during scaffolding are expected before dependencies are installed:

```powershell
npm install
```

### Admin Access Denied

Ensure `ADMIN_EMAIL` matches exactly with your Firebase Authentication user email.

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built with Google Cloud Vertex AI
- Powered by Firebase
- Styled with Tailwind CSS
- Inspired by classical philosophy

---

**Built with ❤️ and philosophical curiosity**
