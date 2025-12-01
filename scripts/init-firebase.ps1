# Initialize Firebase services
Write-Host "Initializing Firebase for Philosoph-AI..." -ForegroundColor Green

# Login to Firebase
Write-Host "Logging in to Firebase..." -ForegroundColor Yellow
firebase login

# Initialize Firestore
Write-Host "Initializing Firestore..." -ForegroundColor Yellow
firebase init firestore

# Initialize Storage
Write-Host "Initializing Cloud Storage..." -ForegroundColor Yellow
firebase init storage

# Initialize Hosting (optional)
Write-Host "Initializing Firebase Hosting..." -ForegroundColor Yellow
firebase init hosting

# Initialize Analytics
Write-Host "Initializing Firebase Analytics..." -ForegroundColor Yellow
firebase init analytics

# Deploy rules
Write-Host "Deploying Firestore rules and indexes..." -ForegroundColor Yellow
firebase deploy --only firestore

Write-Host "Deploying Storage rules..." -ForegroundColor Yellow
firebase deploy --only storage

Write-Host "Firebase initialization complete!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update .env with your Firebase credentials"
Write-Host "2. Upload philosopher texts to Cloud Storage"
Write-Host "3. Run the ingestion function"
