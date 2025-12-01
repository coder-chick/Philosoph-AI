# Deploy Cloud Functions
$PROJECT_ID = "your-project-id"
$REGION = "us-central1"
$FUNCTION_NAME = "ingestPhilosopherTexts"

Write-Host "Deploying Cloud Function: $FUNCTION_NAME..." -ForegroundColor Green

# Navigate to cloud-functions directory
Set-Location -Path "cloud-functions"

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

# Deploy function
gcloud functions deploy $FUNCTION_NAME `
  --runtime nodejs20 `
  --trigger-http `
  --allow-unauthenticated `
  --region $REGION `
  --memory 512MB `
  --timeout 540s `
  --set-env-vars "VERTEX_AI_PROJECT_ID=$PROJECT_ID,VERTEX_AI_LOCATION=$REGION,GCS_BUCKET_NAME=$PROJECT_ID.appspot.com" `
  --entry-point ingestPhilosopherTexts

# Return to root
Set-Location -Path ".."

Write-Host "Function deployed successfully!" -ForegroundColor Green
Write-Host "Function URL:" -ForegroundColor Yellow
gcloud functions describe $FUNCTION_NAME --region $REGION --format 'value(httpsTrigger.url)'
