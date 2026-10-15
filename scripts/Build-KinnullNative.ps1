# KINNULL-001 - UE 5.8 Windows native packaging
# Executes on the user's Windows machine with an installed UE toolchain.
# No build is claimed successful unless UAT succeeds and a Kinnull executable exists.
[CmdletBinding()]
param(
    [string]$EngineRoot = "C:\Program Files\Epic Games\UE_5.8",
    [string]$ArchiveDirectory = "",
    [ValidateSet('Development','Shipping')]
    [string]$Configuration = 'Development'
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$project = Join-Path $repo 'clients\unreal\KinnullGame\KinnullGame.uproject'
$runUat = Join-Path $EngineRoot 'Engine\Build\BatchFiles\RunUAT.bat'
if (-not (Test-Path -LiteralPath $project)) { throw "Kinnull Unreal project missing: $project" }
if (-not (Test-Path -LiteralPath $runUat)) {
    throw "Unreal automation tool not found: $runUat. Install Unreal Engine 5.8, or supply -EngineRoot."
}
if ([string]::IsNullOrWhiteSpace($ArchiveDirectory)) {
    $ArchiveDirectory = Join-Path $repo 'build\kinnull-native'
}
New-Item -ItemType Directory -Force -Path $ArchiveDirectory | Out-Null
$buildArgs = @(
    'BuildCookRun',
    "-project=$project",
    '-noP4',
    '-platform=Win64',
    "-clientconfig=$Configuration",
    '-build',
    '-cook',
    '-stage',
    '-pak',
    '-archive',
    "-archivedirectory=$ArchiveDirectory",
    '-utf8output'
)
Write-Host "Building KINNULL-001 via Unreal AutomationTool on Windows..."
& $runUat @buildArgs
if ($LASTEXITCODE -ne 0) {
    throw "Unreal BuildCookRun FAILED with exit code $LASTEXITCODE. Do not publish or claim a native build."
}
$executables = @(Get-ChildItem -LiteralPath $ArchiveDirectory -Filter '*.exe' -File -Recurse |
    Where-Object { $_.Name -match 'Kinnull' })
if ($executables.Count -eq 0) {
    throw "Unreal BuildCookRun returned success but no Kinnull executable was found."
}
Write-Host "KINNULL native executable(s) verified:"
$executables | ForEach-Object { Write-Host $_.FullName }
Write-Host "Engine/package build succeeded. Real gameplay, GPU performance, audio and art certification are NOT established by this packaging step."
