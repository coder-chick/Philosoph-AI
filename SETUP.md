# Philosoph-AI Setup Guide

This document contains all the API keys, configurations, and setup steps needed to run Philosoph-AI.

---

## Prerequisites

- **Node.js** (v18 or later)
- **npm** or **yarn**
- **Google Cloud Platform account** (for Vertex AI)
- **Firebase account** (for Firestore, Storage, and Authentication)

---

## Required API Keys & Configuration

### 1. Google Cloud Platform (Vertex AI)

Philosoph-AI uses Google's Vertex AI Gemini 1.5 Pro for generating philosophical responses.

**Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Vertex AI API**
4. Create a service account:
   - Go to **IAM & Admin** > **Service Accounts**
   - Click **Create Service Account**
   - Name: `philosoph-ai-vertex`
   - Grant role: **Vertex AI User**
5. Create and download a JSON key:
   - Click on the service account
   - Go to **Keys** tab
   - **Add Key** > **Create new key** > **JSON**
   - Save the file as `google-credentials.json`

**Required Values:**
- `GOOGLE_PROJECT_ID`: philosoph-ai-478709
- `GOOGLE_LOCATION`: Region (e.g., `us-central1`)
- `GOOGLE_APPLICATION_CREDENTIALS`: Path to your `google-credentials.json` file

---

### 2. Firebase Configuration

Firebase is used for:
- **Firestore**: Storing conversation logs
- **Cloud Storage**: Storing philosopher texts and embeddings
- **Authentication**: User management (optional)

**Steps:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use the same GCP project
3. Add a web app to your project
4. Copy the Firebase configuration object

**Required Values:**
```javascript
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

**Enable Services:**
- **Firestore Database**: Go to Firestore Database and create a database
- **Storage**: Go to Storage and set up a bucket
- **Authentication** (optional): Enable Email/Password or Google sign-in

---

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Google Cloud / Vertex AI
GOOGLE_PROJECT_ID=your-gcp-project-id
GOOGLE_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json

# Firebase (Public - can be exposed to client)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Optional: Firebase Admin SDK (for server-side operations)
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

---

## Firestore Database Structure

### Collections:

#### `conversations`
```javascript
{
  sessionId: string,
  userId?: string,
  philosopherId: string,
  question: string,
  answer: string,
  hasRagContext: boolean,
  timestamp: timestamp,
  ragSources?: string[]
}
```

#### `embeddings` (for RAG - optional)
```javascript
{
  philosopherId: string,
  text: string,
  embedding: number[],
  source: {
    book: string,
    chapter: string,
    section?: string
  }
}
```

---

## Firebase Storage Structure

```
philosophers/
  ├── plato/
  │   ├── republic.txt
  │   ├── symposium.txt
  │   └── ...
  ├── aristotle/
  │   ├── nicomachean_ethics.txt
  │   └── ...
  └── [philosopher-id]/
      └── [text-files].txt
```

---

## Installation Steps

1. **Clone the repository** (if applicable)
   ```bash
   cd Philosoph-AI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Add environment variables**
   - Create `.env.local` file with the values above
   - Place `google-credentials.json` in the root directory

4. **Initialize Firebase**
   - Run the Firebase initialization if needed:
     ```bash
     firebase init
     ```
   - Select Firestore, Storage, and optionally Authentication

5. **Set up Firestore Security Rules**
   
   In Firebase Console > Firestore Database > Rules:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /conversations/{document} {
         allow read, write: if request.auth != null;
       }
       match /embeddings/{document} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

6. **Set up Storage Security Rules**
   
   In Firebase Console > Storage > Rules:
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /philosophers/{philosopherId}/{allPaths=**} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

7. **Run the development server**
   ```bash
   npm run dev
   ```

8. **Open the app**
   - Navigate to [http://localhost:3000](http://localhost:3000)

---

## Optional: RAG (Retrieval-Augmented Generation) Setup

For more accurate philosophical responses based on actual texts:

1. **Upload philosopher texts** to Firebase Storage (`philosophers/[id]/`)
2. **Generate embeddings** using Vertex AI Text Embeddings API
3. **Store embeddings** in Firestore `embeddings` collection
4. **Enable RAG** in the UI by setting `useRAG: true` in API calls

The RAG system will:
- Convert user questions to embeddings
- Find similar text chunks from philosopher works
- Include relevant context in the AI prompt

---

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

**Important**: Upload `google-credentials.json` as an environment variable:
```bash
# Convert to base64 first
cat google-credentials.json | base64

# Then in Vercel, add as GOOGLE_CREDENTIALS_BASE64
# Decode in your code using Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64')
```

### Other Platforms

- **Firebase Hosting**: Use `firebase deploy`
- **Google Cloud Run**: Containerize with Docker
- **AWS/Azure**: Standard Next.js deployment

---

## Troubleshooting

### Common Issues

1. **"Failed to generate response"**
   - Check if Vertex AI API is enabled
   - Verify `GOOGLE_APPLICATION_CREDENTIALS` path
   - Ensure service account has correct permissions

2. **Firebase connection errors**
   - Verify all `NEXT_PUBLIC_FIREBASE_*` variables are set
   - Check Firebase project settings match `.env.local`

3. **RAG not working**
   - Ensure embeddings are generated and stored in Firestore
   - Check Storage permissions for philosopher texts
   - Verify Vertex AI Embeddings API is enabled

4. **Build errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check Node.js version (should be 18+)
   - Clear `.next` cache: `rm -rf .next`

---

## Cost Considerations

### Vertex AI Pricing
- **Gemini 1.5 Pro**: ~$0.0035 per 1K input tokens, ~$0.0105 per 1K output tokens
- **Embeddings**: ~$0.00025 per 1K tokens

### Firebase Pricing (Free Tier)
- **Firestore**: 50K reads, 20K writes, 20K deletes per day
- **Storage**: 5GB storage, 1GB/day download
- **Authentication**: Unlimited

**Estimate**: ~$5-20/month for moderate usage (100-500 conversations/day)

---

## Support

For issues or questions:
1. Check the logs in `npm run dev` terminal
2. Review Firebase Console for database/storage issues
3. Check Google Cloud Console for Vertex AI errors
4. Review this setup guide for missing configuration

---

## Security Checklist

- [ ] `.env.local` is in `.gitignore` (never commit API keys)
- [ ] Firebase Security Rules are properly configured
- [ ] Service account has minimal required permissions
- [ ] Environment variables are set in deployment platform
- [ ] CORS is configured if needed for external requests
- [ ] Rate limiting implemented for API routes (optional)

---

**Last Updated**: November 19, 2025
