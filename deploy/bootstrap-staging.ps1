[CmdletBinding()]
param(
	[Parameter(Mandatory = $true)][string]$SiteAddress,
	[string]$ProjectName = 'cybersim-staging',
	[string]$OutputPath,
	[switch]$DisableDemoSeed
)

$ErrorActionPreference = 'Stop'

if ($SiteAddress -notmatch '^https://[^/]+$') {
	throw 'SiteAddress debe tener la forma https://host o https://IP, sin barra final.'
}

if (-not $OutputPath) {
	$OutputPath = Join-Path $PSScriptRoot 'env/staging'
}

function New-Secret {
	$bytes = New-Object byte[] 48
	$rng = [Security.Cryptography.RandomNumberGenerator]::Create()
	try {
		$rng.GetBytes($bytes)
	} finally {
		$rng.Dispose()
	}
	[Convert]::ToBase64String($bytes)
}

$seed = if ($DisableDemoSeed) { 'false' } else { 'true' }

$content = @"
COMPOSE_PROJECT_NAME=$ProjectName
SITE_ADDRESS=$SiteAddress
FRONTEND_URL=$SiteAddress
RELEASE_VERSION=dev
SEED_DEMO_DATA=$seed

POSTGRES_USER=cybersim
POSTGRES_PASSWORD=$(New-Secret)
POSTGRES_DB=cybersim

JWT_SECRET=$(New-Secret)
INTERNAL_SIGNING_KEY=$(New-Secret)
N8N_ENCRYPTION_KEY=$(New-Secret)
N8N_RUNNERS_AUTH_TOKEN=$(New-Secret)
N8N_TO_BACKEND_TOKEN=$(New-Secret)
BACKEND_TO_N8N_TOKEN=$(New-Secret)
MAINTENANCE_TOKEN=$(New-Secret)
N8N_ADMIN_API_KEY=

OPENAI_API_KEY=
OPENAI_TUTOR_MODEL=gpt-6-luna
OPENAI_COMPLEX_MODEL=gpt-6.1-sol
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_DRIVE_FOLDER_ID=

SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
FROM_EMAIL=
VERIFY_RECIPIENT=
"@

$content = $content -replace "`r`n", "`n"
$directory = Split-Path -Parent $OutputPath
New-Item -ItemType Directory -Force -Path $directory | Out-Null
[IO.File]::WriteAllText($OutputPath, $content, (New-Object Text.UTF8Encoding($false)))

$user = [Security.Principal.WindowsIdentity]::GetCurrent().Name
& icacls $OutputPath /inheritance:r /grant:r "${user}:(R,W)" /grant:r '*S-1-5-32-544:(F)' /grant:r '*S-1-5-18:(F)' | Out-Null
if ($LASTEXITCODE -ne 0) {
	throw "No se pudieron restringir los permisos de $OutputPath"
}

Write-Host "Entorno creado: $OutputPath"
Write-Host "Proyecto: $ProjectName | Origen: $SiteAddress | Seed demo: $seed"
Write-Host 'Edita el archivo para completar OpenAI, Google Drive y SMTP.'
