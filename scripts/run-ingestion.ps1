# Trigger the document ingestion Cloud Function
$PROJECT_ID = "your-project-id"
$REGION = "us-central1"
$FUNCTION_NAME = "ingestPhilosopherTexts"

Write-Host "Triggering document ingestion function..." -ForegroundColor Green

# Get function URL
$FUNCTION_URL = gcloud functions describe $FUNCTION_NAME --region $REGION --format 'value(httpsTrigger.url)'

if ($FUNCTION_URL) {
    Write-Host "Function URL: $FUNCTION_URL" -ForegroundColor Yellow
    
    # Trigger the function
    Write-Host "Starting ingestion process..." -ForegroundColor Yellow
    
    $response = Invoke-WebRequest -Uri $FUNCTION_URL -Method POST -UseBasicParsing
    
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Green
    Write-Host $response.Content
    
    if ($response.StatusCode -eq 200) {
        Write-Host ""
        Write-Host "Ingestion completed successfully!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "Ingestion failed. Check Cloud Functions logs for details." -ForegroundColor Red
    }
} else {
    Write-Host "Function not found. Deploy it first using:" -ForegroundColor Red
    Write-Host "./scripts/deploy-functions.ps1"
}
