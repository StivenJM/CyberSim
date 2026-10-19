$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$shellName = if ($PSVersionTable.PSEdition -eq 'Core') { 'pwsh.exe' } else { 'powershell.exe' }
$shellPath = Join-Path $PSHOME $shellName
$logPath = [IO.Path]::GetTempFileName()
$oldLog = $env:CYBERSIM_TEST_DOCKER_LOG
$oldScript = $env:CYBERSIM_TEST_DEV_SCRIPT
$oldFailure = $env:CYBERSIM_TEST_DOCKER_FAIL
$env:CYBERSIM_TEST_DOCKER_LOG = $logPath
$env:CYBERSIM_TEST_DEV_SCRIPT = Join-Path $projectRoot 'scripts/dev.ps1'

function Assert-True($condition, [string]$message) {
 if (!$condition) { throw $message }
}

function Invoke-Maintenance([string]$invocation, [string]$failure = '') {
 [IO.File]::WriteAllText($logPath, '')
 $env:CYBERSIM_TEST_DOCKER_FAIL = $failure
 $mock = @'
function global:docker {
 $command = $args -join ' '
 [IO.File]::AppendAllText($env:CYBERSIM_TEST_DOCKER_LOG, $command + [Environment]::NewLine)
 $global:LASTEXITCODE = if ($env:CYBERSIM_TEST_DOCKER_FAIL -and $command.Contains($env:CYBERSIM_TEST_DOCKER_FAIL)) { 1 } else { 0 }
}
& $env:CYBERSIM_TEST_DEV_SCRIPT
'@
 $command = $mock.TrimEnd() + ' ' + $invocation
 $previousPreference = $ErrorActionPreference
 $ErrorActionPreference = 'Continue'
 try { $output = & $shellPath -NoProfile -NonInteractive -ExecutionPolicy Bypass -Command $command 2>&1 }
 finally { $ErrorActionPreference = $previousPreference }
 return @{ Code = $LASTEXITCODE; Calls = [IO.File]::ReadAllText($logPath); Output = $output }
}

try {
 $result = Invoke-Maintenance 'migrate create --name pnpm_test'
 Assert-True ($result.Code -eq 0) "Crear migración falló: $($result.Output)"
 Assert-True ($result.Calls.Contains('run --rm tools pnpm --filter @cybersim/backend run db:migrate --name pnpm_test')) 'Debe reenviar --name usando las dependencias Linux de /workspace.'
 Assert-True (!$result.Calls.Contains('-w /host')) 'Las migraciones no deben usar node_modules del host.'
 Assert-True ($result.Calls.Contains('maintenance resume')) 'Debe reanudar al finalizar correctamente.'

 $result = Invoke-Maintenance 'migrate apply'
 Assert-True ($result.Code -eq 0 -and $result.Calls.Contains('pnpm --filter @cybersim/backend run migrate:deploy')) 'Debe aplicar migraciones con pnpm.'

 foreach ($operation in @('add', 'remove')) {
  $result = Invoke-Maintenance "deps $operation --filter @cybersim/frontend three-stdlib"
  Assert-True ($result.Code -eq 0) "deps $operation falló: $($result.Output)"
  Assert-True ($result.Calls.Contains("-w /host tools pnpm --config.ignore-scripts=true $operation --lockfile-only --filter @cybersim/frontend three-stdlib")) 'Debe modificar los manifiestos del host sin instalar dependencias.'
 }
 $result = Invoke-Maintenance 'deps'
 Assert-True ($result.Code -eq 0 -and $result.Calls.Contains('pnpm --config.ignore-scripts=true install --lockfile-only')) 'deps debe actualizar el lockfile por defecto.'

 foreach ($failure in @('maintenance pause', 'compose stop', 'tools pnpm', 'up -d --build')) {
  $result = Invoke-Maintenance 'migrate apply' $failure
  Assert-True ($result.Code -ne 0) "Debe informar el fallo de $failure."
  Assert-True (!$result.Calls.Contains('maintenance resume')) "No debe reanudar después del fallo de $failure."
 }
 foreach ($invalid in @('migrate reset', 'deps unknown')) {
  $result = Invoke-Maintenance $invalid
  Assert-True ($result.Code -ne 0 -and $result.Calls.Length -eq 0) 'Un subcomando inválido no debe detener servicios ni pausar integraciones.'
 }
 Write-Output 'OK: migraciones, argumentos pnpm, dependencias, validación previa y fallos sin reanudación.'
 $global:LASTEXITCODE = 0
} finally {
 $env:CYBERSIM_TEST_DOCKER_LOG = $oldLog
 $env:CYBERSIM_TEST_DEV_SCRIPT = $oldScript
 $env:CYBERSIM_TEST_DOCKER_FAIL = $oldFailure
 Remove-Item -LiteralPath $logPath -Force
}
