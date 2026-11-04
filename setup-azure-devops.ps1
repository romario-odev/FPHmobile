# Script to configure Azure DevOps for E2E tests
# Author: Devin
# Requirement: Personal Access Token (PAT) with permissions to manage Variable Groups

param(
    [Parameter(Mandatory=$true)]
    [string]$Organization,
    
    [Parameter(Mandatory=$true)]
    [string]$Project,
    
    [Parameter(Mandatory=$true)]
    [string]$PersonalAccessToken,
    
    [Parameter(Mandatory=$false)]
    [string]$VariableGroupName = "e2e-test-credentials"
)

# Configuration
$baseUrl = "https://dev.azure.com/$Organization"
$apiVersion = "7.1-preview.2"
$authHeader = @{Authorization = "Basic " + [System.Convert]::ToBase64String([System.Text.Encoding]::ASCII.GetBytes(":$PersonalAccessToken"))}

Write-Host "Starting Azure DevOps configuration..." -ForegroundColor Green
Write-Host "Organization: $Organization" -ForegroundColor Cyan
Write-Host "Project: $Project" -ForegroundColor Cyan

# Step 1: Get project ID
Write-Host "`nStep 1: Using project ID..." -ForegroundColor Yellow
$projectId = "c38015f9-0444-4d5c-a2b3-6bd6305f449d"
Write-Host "Project ID: $projectId" -ForegroundColor Green

# Step 2: Check if Variable Group exists
Write-Host "`nStep 2: Checking if Variable Group exists..." -ForegroundColor Yellow
$variableGroupsUrl = "$baseUrl/$Project/_apis/distributedtask/variablegroups?api-version=$apiVersion"
try {
    $variableGroups = Invoke-RestMethod -Uri $variableGroupsUrl -Headers $authHeader -Method Get
    $existingGroup = $variableGroups.value | Where-Object { $_.name -eq $VariableGroupName }
    
    if ($existingGroup) {
        Write-Host "Variable Group '$VariableGroupName' already exists. Updating..." -ForegroundColor Yellow
        $variableGroupId = $existingGroup.id
    } else {
        Write-Host "Variable Group does not exist. Creating new..." -ForegroundColor Green
    }
} catch {
    Write-Host "Variable Group does not exist. Creating new..." -ForegroundColor Green
}

# Step 3: Create/Update Variable Group
Write-Host "`nStep 3: Configuring Variable Group..." -ForegroundColor Yellow

$variableGroupBody = @{
    name = $VariableGroupName
    description = "Credentials for E2E Android tests of FPH Mobile"
    type = "Vsts"
    variables = @{
        USER_EMAIL = @{
            value = "day.mesoli@gmail.com"
            isSecret = $true
        }
        USER_PASSWORD = @{
            value = "123"
            isSecret = $true
        }
    }
    variableGroupProjectReferences = @(
        @{
            name = $VariableGroupName
            projectReference = @{
                id = $projectId
                name = $Project
            }
        }
    )
} | ConvertTo-Json -Depth 10

try {
    if ($existingGroup) {
        # Update existing Variable Group
        $updateUrl = "$baseUrl/_apis/distributedtask/variablegroups/$variableGroupId?api-version=$apiVersion"
        $response = Invoke-RestMethod -Uri $updateUrl -Headers $authHeader -Method Put -Body $variableGroupBody -ContentType "application/json"
        Write-Host "Variable Group updated successfully!" -ForegroundColor Green
    } else {
        # Create new Variable Group
        $createUrl = "$baseUrl/_apis/distributedtask/variablegroups?api-version=$apiVersion"
        $response = Invoke-RestMethod -Uri $createUrl -Headers $authHeader -Method Post -Body $variableGroupBody -ContentType "application/json"
        Write-Host "Variable Group created successfully!" -ForegroundColor Green
        $variableGroupId = $response.id
    }
} catch {
    Write-Host "Error creating/updating Variable Group: $_" -ForegroundColor Red
    exit 1
}

# Step 4: Link Variable Group to Pipeline
Write-Host "`nStep 4: Linking Variable Group to Pipeline..." -ForegroundColor Yellow

$pipelinesUrl = "$baseUrl/$Project/_apis/pipelines?api-version=$apiVersion"
try {
    $pipelines = Invoke-RestMethod -Uri $pipelinesUrl -Headers $authHeader -Method Get
    
    if ($pipelines.value.Count -eq 0) {
        Write-Host "No pipeline found. You will need to link manually." -ForegroundColor Yellow
    } else {
        $pipeline = $pipelines.value[0]
        Write-Host "Pipeline found: $($pipeline.name)" -ForegroundColor Cyan
        
        $pipelineUrl = "$baseUrl/$Project/_apis/pipelines/$($pipeline.id)?api-version=$apiVersion"
        $pipelineConfig = Invoke-RestMethod -Uri $pipelineUrl -Headers $authHeader -Method Get
        
        Write-Host "You may need to link the Variable Group manually in the pipeline" -ForegroundColor Yellow
        Write-Host "   1. Go to Pipelines -> Pipelines -> Edit pipeline" -ForegroundColor White
        Write-Host "   2. Go to Variables -> Link variable group" -ForegroundColor White
        Write-Host "   3. Select '$VariableGroupName'" -ForegroundColor White
    }
} catch {
    Write-Host "Could not check pipelines automatically: $_" -ForegroundColor Yellow
    Write-Host "   You will need to link the Variable Group manually." -ForegroundColor White
}

# Step 5: Run the pipeline
Write-Host "`nStep 5: Do you want to run the pipeline now?" -ForegroundColor Yellow
$execute = Read-Host "Type 'yes' to run or 'no' to skip"

if ($execute -eq "yes" -or $execute -eq "y") {
    if ($pipelines.value.Count -gt 0) {
        $pipeline = $pipelines.value[0]
        $runUrl = "$baseUrl/$Project/_apis/pipelines/$($pipeline.id)/runs?api-version=$apiVersion"
        
        $runBody = @{
            resources = @{
                repositories = @{
                    self = @{
                        refName = "main"
                    }
                }
            }
        } | ConvertTo-Json -Depth 10
        
        try {
            $runResponse = Invoke-RestMethod -Uri $runUrl -Headers $authHeader -Method Post -Body $runBody -ContentType "application/json"
            Write-Host "Pipeline started successfully!" -ForegroundColor Green
            Write-Host "Monitor at: $baseUrl/$Project/_build?definitionId=$($pipeline.id)" -ForegroundColor Cyan
        } catch {
            Write-Host "Error running pipeline: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "No pipeline found to run" -ForegroundColor Yellow
    }
}

Write-Host "`nConfiguration completed!" -ForegroundColor Green
Write-Host "`nSummary:" -ForegroundColor Cyan
Write-Host "   - Variable Group: $VariableGroupName" -ForegroundColor White
Write-Host "   - ID: $variableGroupId" -ForegroundColor White
Write-Host "   - Variables configured: USER_EMAIL, USER_PASSWORD" -ForegroundColor White
Write-Host "`nAccess Azure DevOps to check results:" -ForegroundColor Cyan
Write-Host "   $baseUrl/$Project/_build" -ForegroundColor White
