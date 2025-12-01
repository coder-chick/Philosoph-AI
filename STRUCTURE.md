# Philosoph-AI Project Structure

This directory contains the complete implementation of Philosoph-AI, a modern AI-native wisdom engine.

## Quick Start

```powershell
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 3. Run development server
npm run dev
```

## Directory Structure

```
app/          - Next.js application pages and API routes
lib/          - Shared utilities and configurations
cloud-functions/ - Cloud Functions for document ingestion
scripts/      - Deployment and setup scripts
public/       - Static assets
```

## Key Files

- `README.md` - Complete documentation
- `package.json` - Dependencies and scripts
- `Dockerfile` - Container configuration for Cloud Run
- `.env.example` - Environment variable template
- `firebase.json` - Firebase configuration
- `firestore.rules` - Firestore security rules
- `storage.rules` - Cloud Storage security rules

## Deployment

See README.md for detailed deployment instructions or run:

```powershell
./scripts/deploy-cloud-run.ps1
./scripts/deploy-functions.ps1
```

## Documentation

Full documentation is available in README.md
