$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot)
& docker compose up -d api
if ($LASTEXITCODE -ne 0) { throw 'Could not start the API container. Check Docker Desktop and .env.' }
$taskContainerId = (& docker compose ps -q api).Trim()
if (-not $taskContainerId) { throw 'The API container is not running.' }
# The runtime can remain alive after a failed attach while its debugger FIFOs
# are missing. Checking the diagnostics socket alone does not detect this.
$taskPipeCheck = 'for taskPipe in /tmp/clr-debug-pipe-1-*-in; do if [ -p "$taskPipe" ] && [ -p "${taskPipe%-in}-out" ]; then exit 0; fi; done; exit 1'
& docker compose exec -T api sh -c $taskPipeCheck
if ($LASTEXITCODE -ne 0) {
    Write-Host 'Runtime debugger pipes are missing. Restarting the API to recreate them.'
    & docker compose restart api
    if ($LASTEXITCODE -ne 0) { throw 'Could not restart the API to restore debugger communication.' }
    $taskPipesReady = $false
    for ($taskAttempt = 0; $taskAttempt -lt 20; $taskAttempt++) {
        & docker compose exec -T api sh -c $taskPipeCheck
        if ($LASTEXITCODE -eq 0) { $taskPipesReady = $true; break }
        Start-Sleep -Milliseconds 250
    }
    if (-not $taskPipesReady) { throw 'The .NET runtime did not create debugger pipes. Check runtime diagnostics settings and API logs.' }
}
$taskDebuggerPath = '/remote_debugger/linux-x64/latest/vsdbg'
& docker compose exec -T api test -x $taskDebuggerPath
if ($LASTEXITCODE -ne 0) {
    $taskDebuggerCache = Join-Path $env:USERPROFILE '.vsdbg\linux-x64\latest'
    if (-not (Test-Path (Join-Path $taskDebuggerCache 'vsdbg'))) {
        throw 'Linux vsdbg is missing. Install it using Microsoft Container Tools, then retry. Expected cache: ~/.vsdbg/linux-x64/latest.'
    }
    & docker compose exec -T -u root api mkdir -p /remote_debugger/linux-x64/latest
    if ($LASTEXITCODE -ne 0) { throw 'Could not create the container debugger directory.' }
    & docker cp "$taskDebuggerCache\." "${taskContainerId}:/remote_debugger/linux-x64/latest"
    if ($LASTEXITCODE -ne 0) { throw 'Could not copy Linux vsdbg into the API container.' }
    & docker compose exec -T -u root api chmod -R a+rX /remote_debugger/linux-x64/latest
    & docker compose exec -T -u root api chmod a+rx $taskDebuggerPath
    if ($LASTEXITCODE -ne 0) { throw 'Could not make the debugger executable.' }
}
& docker compose exec -T api test -f /app/Library.Api.pdb
if ($LASTEXITCODE -ne 0) { throw 'Debug symbols are missing. Rebuild the API with the Debug configuration.' }
& docker compose exec -T api $taskDebuggerPath --help
if ($LASTEXITCODE -ne 0) { throw 'The Linux debugger failed to start.' }
Write-Host 'Debugger preflight passed. Attaching directly to the current API service, process 1.'
