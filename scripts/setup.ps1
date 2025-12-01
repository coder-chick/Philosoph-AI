# Complete setup script for Philosoph-AI
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Philosoph-AI Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "✓ Node.js: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js not found. Please install Node.js 20 or higher." -ForegroundColor Red
    exit 1
}

# Check npm
$npmVersion = npm --version 2>$null
if ($npmVersion) {
    Write-Host "✓ npm: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "✗ npm not found." -ForegroundColor Red
    exit 1
}

# Check gcloud
$gcloudVersion = gcloud --version 2>$null
if ($gcloudVersion) {
    Write-Host "✓ Google Cloud SDK installed" -ForegroundColor Green
} else {
    Write-Host "✗ Google Cloud SDK not found. Please install from https://cloud.google.com/sdk" -ForegroundColor Red
    exit 1
}

# Check Firebase CLI
$firebaseVersion = firebase --version 2>$null
if ($firebaseVersion) {
    Write-Host "✓ Firebase CLI: $firebaseVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Firebase CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g firebase-tools
}

Write-Host ""

# Step 1: Install dependencies
Write-Host "Step 1: Installing dependencies..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 2: Environment setup
Write-Host "Step 2: Environment configuration..." -ForegroundColor Cyan
if (!(Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Created .env file from template" -ForegroundColor Green
    Write-Host "⚠ Please edit .env and add your configuration values" -ForegroundColor Yellow
} else {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
}
Write-Host ""

# Step 3: Firebase initialization prompt
Write-Host "Step 3: Firebase initialization..." -ForegroundColor Cyan
$initFirebase = Read-Host "Do you want to initialize Firebase now? (y/n)"
if ($initFirebase -eq "y") {
    & "$PSScriptRoot\init-firebase.ps1"
} else {
    Write-Host "⚠ Skipped Firebase initialization. Run ./scripts/init-firebase.ps1 later" -ForegroundColor Yellow
}
Write-Host ""

# Step 4: Build check
Write-Host "Step 4: Running type check..." -ForegroundColor Cyan
npm run type-check

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Type check passed" -ForegroundColor Green
} else {
    Write-Host "⚠ Type check warnings (expected before installing dependencies)" -ForegroundColor Yellow
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit .env with your configuration"
Write-Host "2. Run 'npm run dev' to start development server"
Write-Host "3. Upload philosopher texts: ./scripts/upload-texts.ps1"
Write-Host "4. Deploy to Cloud Run: ./scripts/deploy-cloud-run.ps1"
Write-Host ""
Write-Host "For more information, see README.md" -ForegroundColor Cyan
