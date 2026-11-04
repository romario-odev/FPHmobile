# Script to list all projects in Azure DevOps organization
param(
    [Parameter(Mandatory=$true)]
    [string]$Organization,
    
    [Parameter(Mandatory=$true)]
    [string]$PersonalAccessToken
)

$baseUrl = "https://dev.azure.com/$Organization"
$apiVersion = "7.1-preview.2"
$authHeader = @{Authorization = "Basic " + [System.Convert]::ToBase64String([System.Text.Encoding]::ASCII.GetBytes(":$PersonalAccessToken"))}

Write-Host "Listing projects in organization: $Organization" -ForegroundColor Cyan

$projectsUrl = "$baseUrl/_apis/projects?api-version=$apiVersion"
try {
    $projects = Invoke-RestMethod -Uri $projectsUrl -Headers $authHeader -Method Get
    Write-Host "`nAvailable projects:" -ForegroundColor Green
    foreach ($project in $projects.value) {
        Write-Host "  - Name: $($project.name)" -ForegroundColor White
        Write-Host "    ID: $($project.id)" -ForegroundColor Gray
        Write-Host "    Description: $($project.description)" -ForegroundColor Gray
        Write-Host ""
    }
} catch {
    Write-Host "Error listing projects: $_" -ForegroundColor Red
    exit 1
}
