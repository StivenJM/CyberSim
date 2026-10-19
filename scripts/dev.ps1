param(
 [Parameter(Position=0)][string]$Action = "status",
 [Parameter(Position=1)][string]$Subcommand = "",
 [Parameter(ValueFromRemainingArguments=$true)][string[]]$ToolArguments
)
$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
Push-Location -LiteralPath $projectRoot
try {
 if ($Action -eq "init") {
  $envPath = Join-Path $projectRoot ".env"
  $envExists = Test-Path -LiteralPath $envPath
  $sourcePath = if ($envExists) { $envPath } else { Join-Path $projectRoot ".env.example" }
  $envContent = [IO.File]::ReadAllText($sourcePath)
  $lineEnding = if ($envContent.Contains("`r`n")) { "`r`n" } else { "`n" }
  $generatedCount = 0
  $random = [Security.Cryptography.RandomNumberGenerator]::Create()
  try {
   foreach ($key in @("JWT_SECRET","INTERNAL_SIGNING_KEY","N8N_ENCRYPTION_KEY","N8N_RUNNERS_AUTH_TOKEN","N8N_TO_BACKEND_TOKEN","BACKEND_TO_N8N_TOKEN","MAINTENANCE_TOKEN")) {
    $pattern = "(?m)^[ \t]*" + $key + "[ \t]*=(?<value>[^\r\n]*)"
    $entries = [regex]::Matches($envContent, $pattern)
    if ($entries.Count -gt 1) { throw "Variable $key duplicada en .env; conserva una sola definicion y vuelve a ejecutar init." }
    $entry = if ($entries.Count) { $entries[0] } else { $null }
    if ($entry) {
     $value = $entry.Groups['value'].Value.Trim()
     $valueWithoutComment = ($value -split '[ \t]+#', 2)[0].Trim()
     if (!$value.StartsWith('#') -and $valueWithoutComment -notin @('', '""', "''")) { continue }
    }
    $secretBytes = New-Object byte[] 48
    $random.GetBytes($secretBytes)
    $secretLine = $key + "=" + [Convert]::ToBase64String($secretBytes)
    if ($entry) {
     $envContent = $envContent.Remove($entry.Index, $entry.Length).Insert($entry.Index, $secretLine)
    } else {
     if ($envContent.Length -gt 0 -and !$envContent.EndsWith("`n")) { $envContent += $lineEnding }
     $envContent += $secretLine + $lineEnding
    }
    $generatedCount++
   }
  } finally { $random.Dispose() }
  if (!$envExists -or $generatedCount -gt 0) {
   [IO.File]::WriteAllText($envPath, $envContent, (New-Object Text.UTF8Encoding($false)))
  }
  Write-Host "Configuracion local lista: $generatedCount secretos generados; valores configurados conservados."
  Write-Host "Completa proveedores despues; no compartas el contenido de .env."
  exit 0
 }
 if ($Action -eq "up") { & docker compose up --build --watch; exit $LASTEXITCODE }
 if ($Action -eq "down") { & docker compose down; exit $LASTEXITCODE }
 if ($Action -eq "migrate" -or $Action -eq "deps") {
  if ($Action -eq "migrate" -and $Subcommand -notin @("create","apply")) { throw "Usa migrate create|apply; reset no esta automatizado." }
  if ($Action -eq "deps" -and $Subcommand -notin @("","refresh","add","remove")) { throw "Usa deps [refresh|add|remove] seguido de opciones pnpm." }
  & docker compose --profile tools run --rm tools node infra/tools.mjs maintenance pause
  if ($LASTEXITCODE -ne 0) { throw "No se pudo pausar." }
  & docker compose stop backend frontend preparation
  if ($LASTEXITCODE -ne 0) { throw "No se pudieron detener las aplicaciones; sigue pausado." }
  if ($Action -eq "migrate") {
   $packageTask = if ($Subcommand -eq "create") { "db:migrate" } else { "migrate:deploy" }
   & docker compose --profile tools run --rm tools pnpm --filter @cybersim/backend run $packageTask @ToolArguments
  } else {
   $dependencyCommand = if ($Subcommand -in @("add","remove")) { $Subcommand } else { "install" }
   & docker compose --profile tools run --rm -w /host tools pnpm --config.ignore-scripts=true $dependencyCommand --lockfile-only @ToolArguments
  }
  if ($LASTEXITCODE -ne 0) { throw "Mantenimiento fallido; sigue pausado." }
  & docker compose up -d --build --force-recreate migrate backend frontend preparation
  if ($LASTEXITCODE -ne 0) { throw "Reconstruccion fallida." }
  & docker compose --profile tools run --rm tools node infra/tools.mjs maintenance resume
  exit $LASTEXITCODE
 }
 if ($Action -eq "status") { & docker compose ps }
 & docker compose --profile tools run --rm tools node infra/tools.mjs $Action $Subcommand @ToolArguments
 exit $LASTEXITCODE
} finally { Pop-Location }

