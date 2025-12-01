# Upload sample philosopher texts to Cloud Storage
$PROJECT_ID = "your-project-id"
$BUCKET_NAME = "$PROJECT_ID.appspot.com"

Write-Host "Uploading philosopher texts to Cloud Storage..." -ForegroundColor Green

# Create philosophers directory structure in bucket
$philosophers = @(
    "plato",
    "aristotle",
    "socrates",
    "epicurus",
    "marcus-aurelius",
    "nietzsche",
    "confucius",
    "lao-tzu"
)

foreach ($philosopher in $philosophers) {
    Write-Host "Creating directory for $philosopher..." -ForegroundColor Yellow
    
    # Create a placeholder file to establish the directory
    $tempFile = "temp_$philosopher.txt"
    "Placeholder for $philosopher texts" | Out-File -FilePath $tempFile -Encoding UTF8
    
    gsutil cp $tempFile "gs://$BUCKET_NAME/philosophers/$philosopher/"
    
    Remove-Item $tempFile
}

Write-Host ""
Write-Host "Directory structure created!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Upload actual philosopher texts to the following locations:"
Write-Host ""

foreach ($philosopher in $philosophers) {
    Write-Host "   gs://$BUCKET_NAME/philosophers/$philosopher/<work>.txt"
}

Write-Host ""
Write-Host "2. Run the ingestion function to process the texts:"
Write-Host "   ./scripts/run-ingestion.ps1"
