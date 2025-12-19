$ErrorActionPreference = "Stop"

$webRoot = Resolve-Path (Join-Path $PSScriptRoot "..\\")
$script = Join-Path $webRoot "scripts\\generate-walkthrough-mockups.mjs"

if (-not (Test-Path $script)) {
  throw "Missing generator script: $script"
}

Push-Location $webRoot
try {
  # Uses Playwright + Tailwind to render realistic mobile-first UI mockups
  node $script
} finally {
  Pop-Location
}
