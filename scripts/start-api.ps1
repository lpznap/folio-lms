param([string]$JwtKey = 'local-development-secret-replace-before-deployment-2026', [string]$DemoPassword = 'FolioDemo2026!')
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot)
$env:Jwt__Key = $JwtKey
$env:Seed__Enabled = 'true'
$env:Seed__Password = $DemoPassword
$env:ASPNETCORE_ENVIRONMENT = 'Development'
$env:DOTNET_CLI_HOME = Join-Path $PWD '.tools/cli'
$env:NUGET_PACKAGES = Join-Path $PWD '.tools/nuget'
$dotnet = if (Test-Path '.tools/dotnet/dotnet.exe') { '.tools/dotnet/dotnet.exe' } else { 'dotnet' }
& $dotnet run --project backend/Library.Api.csproj --urls http://localhost:5080
