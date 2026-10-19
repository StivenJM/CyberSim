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
  if (Test-Path -LiteralPath $envPath) { Write-Host ".env existente conservado."; exit 0 }
  $template = [IO.File]::ReadAllText((Join-Path $projectRoot ".env.example"))
  foreach ($key in @("JWT_SECRET","INTERNAL_SIGNING_KEY","N8N_ENCRYPTION_KEY","N8N_RUNNERS_AUTH_TOKEN","N8N_TO_BACKEND_TOKEN","BACKEND_TO_N8N_TOKEN","MAINTENANCE_TOKEN")) {
   $secretBytes = New-Object byte[] 48
   [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($secretBytes)
   $secretValue = [Convert]::ToBase64String($secretBytes)
   $template = [regex]::Replace($template, "(?m)^" + $key + "=[ \t]*$", $key + "=" + $secretValue)
  }
  [IO.File]::WriteAllText($envPath, $template, (New-Object Text.UTF8Encoding($false)))
  Write-Host ".env creado. Completa proveedores después; no compartas su contenido."
  exit 0
 }
 if ($Action -eq "up") { & docker compose up --build --watch; exit $LASTEXITCODE }
 if ($Action -eq "down") { & docker compose down; exit $LASTEXITCODE }
 if ($Action -eq "migrate" -or $Action -eq "deps") {
  & docker compose --profile tools run --rm tools node infra/tools.mjs maintenance pause
  if ($LASTEXITCODE -ne 0) { throw "No se pudo pausar." }
  & docker compose stop backend frontend preparation
  if ($Action -eq "migrate") {
   if ($Subcommand -notin @("create","apply")) { throw "Usa migrate create|apply; reset no está automatizado." }
   $npmTask = if ($Subcommand -eq "create") { "db:migrate" } else { "migrate:deploy" }
   & docker compose --profile tools run --rm -w /host tools npm run $npmTask --workspace @cybersim/backend -- @ToolArguments
  } else {
   & docker compose --profile tools run --rm -w /host tools npm install --package-lock-only --ignore-scripts @ToolArguments
  }
  if ($LASTEXITCODE -ne 0) { throw "Mantenimiento fallido; sigue pausado." }
  & docker compose up -d --build --force-recreate migrate backend frontend preparation
  if ($LASTEXITCODE -ne 0) { throw "Reconstrucción fallida." }
  & docker compose --profile tools run --rm tools node infra/tools.mjs maintenance resume
  exit $LASTEXITCODE
 }
 if ($Action -eq "status") { & docker compose ps }
 & docker compose --profile tools run --rm tools node infra/tools.mjs $Action $Subcommand @ToolArguments
 exit $LASTEXITCODE
} finally { Pop-Location }

