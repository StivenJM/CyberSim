$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$sourceScript = Join-Path $projectRoot 'scripts/dev.ps1'
$secretNames = @('JWT_SECRET', 'INTERNAL_SIGNING_KEY', 'N8N_ENCRYPTION_KEY', 'N8N_RUNNERS_AUTH_TOKEN', 'N8N_TO_BACKEND_TOKEN', 'BACKEND_TO_N8N_TOKEN', 'MAINTENANCE_TOKEN')
$shellName = if ($PSVersionTable.PSEdition -eq 'Core') { 'pwsh.exe' } else { 'powershell.exe' }
$shellPath = Join-Path $PSHOME $shellName
$tempRoot = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
$testRoot = Join-Path $tempRoot ('cybersim-dev-init-' + [Guid]::NewGuid().ToString('N'))
$encoding = New-Object Text.UTF8Encoding($false)

function Assert-True($condition, [string]$message) {
 if (!$condition) { throw $message }
}

function New-Fixture([string]$name, [string]$template) {
 $fixturePath = Join-Path $testRoot $name
 $scriptsPath = Join-Path $fixturePath 'scripts'
 New-Item -ItemType Directory -Path $scriptsPath -Force | Out-Null
 Copy-Item -LiteralPath $sourceScript -Destination (Join-Path $scriptsPath 'dev.ps1')
 [IO.File]::WriteAllText((Join-Path $fixturePath '.env.example'), $template, $encoding)
 return $fixturePath
}

function Invoke-Init([string]$fixturePath) {
 $scriptPath = Join-Path $fixturePath 'scripts/dev.ps1'
 $initOutput = & $shellPath -NoProfile -NonInteractive -ExecutionPolicy Bypass -File $scriptPath init 2>&1
 Assert-True ($LASTEXITCODE -eq 0) "init falló en $([IO.Path]::GetFileName($fixturePath)): $initOutput"
}

function Assert-Secrets([string]$content) {
 $values = @()
 foreach ($secretName in $secretNames) {
  $entries = [regex]::Matches($content, '(?m)^' + $secretName + '=(?<value>[^\r\n]*)')
  Assert-True ($entries.Count -eq 1) "Debe existir una sola definición de $secretName."
  $secretValue = $entries[0].Groups['value'].Value
  Assert-True ($secretValue -match '^[A-Za-z0-9+/]{64}$') "Debe generarse un secreto de 48 bytes para $secretName."
  $values += $secretValue
 }
 Assert-True ((@($values | Select-Object -Unique)).Count -eq $secretNames.Count) 'Los secretos deben ser diferentes entre sí.'
}

try {
 foreach ($newline in @("`n", "`r`n")) {
  $newlineName = if ($newline -eq "`n") { 'LF' } else { 'CRLF' }
  $template = '# Configuración de prueba' + $newline + (($secretNames | ForEach-Object { $_ + '=' }) -join $newline) + $newline + 'OPENAI_API_KEY=' + $newline
  $fixturePath = New-Fixture $newlineName $template
  Invoke-Init $fixturePath
  $envPath = Join-Path $fixturePath '.env'
  $firstContent = [IO.File]::ReadAllText($envPath)
  Assert-Secrets $firstContent
  Assert-True ($firstContent.Contains('OPENAI_API_KEY=' + $newline)) 'Las credenciales externas deben permanecer vacías.'
  if ($newlineName -eq 'CRLF') {
   Assert-True (![regex]::IsMatch($firstContent, '(?<!\r)\n')) 'Deben conservarse los finales CRLF.'
  }
  Invoke-Init $fixturePath
  Assert-True ($firstContent -ceq [IO.File]::ReadAllText($envPath)) 'Repetir init debe conservar el archivo completo.'

  # Reproduce un .env creado por el script anterior con secretos vacíos.
  [IO.File]::WriteAllText($envPath, $template, $encoding)
  Invoke-Init $fixturePath
  Assert-Secrets ([IO.File]::ReadAllText($envPath))
  Write-Output "OK: creación, repetición y reparación con $newlineName."
 }

 $fixturePath = New-Fixture 'partial' 'JWT_SECRET='
 $envPath = Join-Path $fixturePath '.env'
 $existingContent = @(
  '# Conservar configuración privada'
  'JWT_SECRET=existing-jwt-secret'
  'N8N_ENCRYPTION_KEY="existing-n8n-key"'
  'INTERNAL_SIGNING_KEY=   # pendiente'
  'N8N_RUNNERS_AUTH_TOKEN=""'
  "N8N_TO_BACKEND_TOKEN='' # pendiente"
  'BACKEND_TO_N8N_TOKEN=   '
  'OPENAI_API_KEY=existing-provider-key'
  'POSTGRES_PASSWORD="existing-db-password"'
 ) -join "`r`n"
 [IO.File]::WriteAllText($envPath, $existingContent, $encoding)
 Invoke-Init $fixturePath
 $fixedContent = [IO.File]::ReadAllText($envPath)
 foreach ($preservedLine in @('JWT_SECRET=existing-jwt-secret', 'N8N_ENCRYPTION_KEY="existing-n8n-key"', 'OPENAI_API_KEY=existing-provider-key', 'POSTGRES_PASSWORD="existing-db-password"', '# Conservar configuración privada')) {
  Assert-True ($fixedContent.Contains($preservedLine)) 'Deben conservarse los secretos, las credenciales y los comentarios existentes.'
 }
 foreach ($secretName in $secretNames | Where-Object { $_ -notin @('JWT_SECRET', 'N8N_ENCRYPTION_KEY') }) {
  Assert-True ([regex]::IsMatch($fixedContent, '(?m)^' + $secretName + '=[A-Za-z0-9+/]{64}\r?$')) "Debe completarse $secretName."
 }
 Assert-True (![regex]::IsMatch($fixedContent, '(?<!\r)\n')) 'Las claves ausentes deben añadirse con CRLF.'
 Invoke-Init $fixturePath
 Assert-True ($fixedContent -ceq [IO.File]::ReadAllText($envPath)) 'La reparación debe ser repetible sin modificar valores.'
 Write-Output 'OK: secretos existentes conservados; valores vacíos, entre comillas y ausentes completados.'

 $fixturePath = New-Fixture 'duplicate' 'JWT_SECRET='
 $envPath = Join-Path $fixturePath '.env'
 $duplicateContent = "JWT_SECRET=first`r`nJWT_SECRET=second`r`n"
 [IO.File]::WriteAllText($envPath, $duplicateContent, $encoding)
 $previousErrorPreference = $ErrorActionPreference
 $ErrorActionPreference = 'Continue'
 try { $initOutput = & $shellPath -NoProfile -NonInteractive -ExecutionPolicy Bypass -File (Join-Path $fixturePath 'scripts/dev.ps1') init 2>&1 }
 finally { $ErrorActionPreference = $previousErrorPreference }
 Assert-True ($LASTEXITCODE -ne 0) 'Las definiciones duplicadas deben producir un error.'
 Assert-True ($duplicateContent -ceq [IO.File]::ReadAllText($envPath)) 'Un error no debe escribir cambios parciales.'
 Write-Output 'OK: variables duplicadas rechazadas sin modificar el archivo.'
} finally {
 # Verify the absolute cleanup target stays within the system temporary directory.
 $resolvedTestRoot = [IO.Path]::GetFullPath($testRoot)
 $tempPrefix = $tempRoot.TrimEnd([IO.Path]::DirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar
 if (!$resolvedTestRoot.StartsWith($tempPrefix, [StringComparison]::OrdinalIgnoreCase) -or [IO.Path]::GetFileName($resolvedTestRoot) -notlike 'cybersim-dev-init-*') {
  throw 'La ruta de limpieza no pertenece al directorio temporal de estas pruebas.'
 }
 if (Test-Path -LiteralPath $resolvedTestRoot) { Remove-Item -LiteralPath $resolvedTestRoot -Recurse -Force }
}
