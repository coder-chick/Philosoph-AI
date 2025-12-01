# Deploy to Cloud Run
$PROJECT_ID = "your-project-id"
$REGION = "us-central1"
$SERVICE_NAME = "philosoph-ai"

Write-Host "Deploying Philosoph-AI to Cloud Run..." -ForegroundColor Green

# Set project
gcloud config set project $PROJECT_ID

# Build and deploy
gcloud run deploy $SERVICE_NAME `
  --source . `
  --region $REGION `
  --allow-unauthenticated `
  --platform managed `
  --memory 1Gi `
  --cpu 1 `
  --timeout 300 `
  --set-env-vars "VERTEX_AI_PROJECT_ID=$PROJECT_ID,VERTEX_AI_LOCATION=$REGION,VERTEX_AI_MODEL=gemini-1.5-pro"

Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host "Service URL:" -ForegroundColor Yellow
gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)'
