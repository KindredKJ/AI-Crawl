# Offline Windows speech scratch generation. Professional licensed actor recordings
# should replace these synthesized clips before commercial publication.
[CmdletBinding()]
param([string]$Output = "")
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
if ([string]::IsNullOrWhiteSpace($Output)) {
  $Output = Join-Path $PSScriptRoot "..\clients\unreal\KinnullGame\Content\KinnullVoiceRaw"
}
$manifest = Get-Content -Raw (Join-Path $PSScriptRoot "..\content\kinnull\voice\manifest.json") | ConvertFrom-Json
New-Item -ItemType Directory -Path $Output -Force | Out-Null
try {
  Add-Type -AssemblyName System.Speech -ErrorAction Stop
} catch {
  throw "System.Speech is unavailable. Run this script with Windows PowerShell 5.1 (powershell.exe), or extract Kinnull_Offline_Voice_Pack.zip to the output folder."
}
$speaker = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
  $speaker.Rate = -1
  foreach ($line in $manifest.lines) {
    $destination = Join-Path $Output $line.file
    $speaker.SetOutputToWaveFile($destination)
    try {
      $speaker.Speak([string]$line.text)
    } finally {
      $speaker.SetOutputToNull()
    }
    if (-not (Test-Path -LiteralPath $destination)) { throw "Missing synthesized WAV: $destination" }
    Write-Host "Generated $destination"
  }
} finally { $speaker.Dispose() }
Write-Host "Synthetic offline audio exists. Import it in the Unreal Editor using import_kinnull_voices.py."
