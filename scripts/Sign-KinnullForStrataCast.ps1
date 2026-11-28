# Owner-approved handoff: an actually-built Win64 AI Crawl game signs into
# the generic, independent StrataCast native game launcher.
[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)][string]$StrataCastRoot,
  [string]$PackageRoot = "",
  [string]$ExeRelative = "",
  [string]$KeyId = "kindred.publisher.local",
  [string]$PrivateKey = "",
  [string]$PublicKey = "",
  [string]$OutputManifest = "",
  [switch]$Launch
)
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$gameRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$console = Join-Path $StrataCastRoot "scripts\stratacast-native-game.mjs"
if(-not (Test-Path -LiteralPath $console)){throw "StrataCast native-game CLI not present: $console"}
if([string]::IsNullOrWhiteSpace($PackageRoot)){
  $PackageRoot = Join-Path $gameRoot "build\kinnull-native"
}
if(-not (Test-Path -LiteralPath $PackageRoot)){throw "Native package absent. Build it using Build-KinnullNative.ps1 first."}
$PackageRoot = (Resolve-Path $PackageRoot).Path
if([string]::IsNullOrWhiteSpace($PrivateKey)){
  $PrivateKey = Join-Path $StrataCastRoot ".stratacast\owner-keys\publisher-private.pem"
}
if([string]::IsNullOrWhiteSpace($PublicKey)){
  $PublicKey = Join-Path $StrataCastRoot ".stratacast\owner-keys\publisher-public.pem"
}
if(-not (Test-Path -LiteralPath $PrivateKey) -or -not (Test-Path -LiteralPath $PublicKey)){
  throw "Publisher keys are absent. Generate local keys using the StrataCast console keygen command."
}
if([string]::IsNullOrWhiteSpace($ExeRelative)){
  $found = @(Get-ChildItem $PackageRoot -Recurse -File -Filter "*.exe" |
    Where-Object {$_.Name -match "Kinnull"})
  if($found.Count -ne 1){throw "Expected exactly one Kinnull exe, found $($found.Count). Supply -ExeRelative."}
  $ExeRelative = [System.IO.Path]::GetRelativePath($PackageRoot,$found[0].FullName).Replace('\','/')
}
if($ExeRelative.StartsWith("/") -or $ExeRelative.Contains("..") -or $ExeRelative.Contains(":")){
  throw "Executable path must be relative and cannot contain traversal."
}
if([string]::IsNullOrWhiteSpace($OutputManifest)){
  $OutputManifest = Join-Path $gameRoot "build\kinnull-native-signed.json"
}
New-Item -ItemType Directory -Force (Split-Path -Parent $OutputManifest) | Out-Null
if(Test-Path $OutputManifest){throw "Existing signed manifest will not be overwritten: $OutputManifest"}
$signArgs = @("sign","--root",$PackageRoot,"--executable",$ExeRelative,
  "--game-id","game.kindred.aicrawl","--version","0.1.0",
  "--key-id",$KeyId,"--private",$PrivateKey,"--out",$OutputManifest)
& node $console @signArgs
if($LASTEXITCODE -ne 0){throw "Native signing failed"}
$verifyArgs = @("verify","--root",$PackageRoot,"--manifest",$OutputManifest,
  "--key-id",$KeyId,"--public",$PublicKey)
& node $console @verifyArgs
if($LASTEXITCODE -ne 0){throw "Native content/signature verification failed"}
Write-Host "AI Crawl package is signed and verified for StrataCast: $OutputManifest"
if($Launch){
  Write-Host "The owner explicitly requested native OS execution with -Launch."
  $launchArgs = @("launch","--root",$PackageRoot,"--manifest",$OutputManifest,
    "--key-id",$KeyId,"--public",$PublicKey)
  & node $console @launchArgs
  if($LASTEXITCODE -ne 0){throw "Native game process returned exit code $LASTEXITCODE"}
} else {
  Write-Host "No native process started. Supply -Launch when you intend to execute it."
}
