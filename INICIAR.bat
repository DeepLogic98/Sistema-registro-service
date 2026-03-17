@echo off
setlocal
setlocal EnableDelayedExpansion

:: Auto-ocultar esta ventana y re-ejecutar el .bat en modo oculto
if /I not "%~1"=="hidden" (
    powershell -NoProfile -WindowStyle Hidden -Command "Start-Process -FilePath '%~f0' -ArgumentList 'hidden' -WindowStyle Hidden"
    exit /b
)

:: Verificar si Node.js está instalado
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    exit /b
)

:: Verificar si las dependencias están instaladas
if not exist "%~dp0node_modules\" (
    pushd "%~dp0"
    call npm install
    popd
)

set "APP_NAME=programa-registro-service"
set "APP_PORT="

:: 1) Buscar si la app YA está corriendo en un rango de puertos conocidos
for %%P in (3000 3001 3002 3003 3004 3005) do (
    powershell -NoProfile -Command "try { $response = Invoke-RestMethod -UseBasicParsing 'http://localhost:%%P/api/health' -TimeoutSec 1; if ($response.app -eq '%APP_NAME%') { exit 0 } else { exit 1 } } catch { exit 1 }"
    if !ERRORLEVEL! equ 0 (
        set "APP_PORT=%%P"
        goto :openApp
    )
)

:: 2) Si no estaba corriendo, intentar levantar en el primer puerto libre del rango
for %%P in (3000 3001 3002 3003 3004 3005) do (
    powershell -NoProfile -Command "$client = $null; try { $client = New-Object System.Net.Sockets.TcpClient; $iar = $client.BeginConnect('127.0.0.1', %%P, $null, $null); $connected = $iar.AsyncWaitHandle.WaitOne(200); if ($connected -and $client.Connected) { $client.EndConnect($iar); exit 1 } else { exit 0 } } catch { exit 0 } finally { if ($client) { $client.Close() } }"
    if !ERRORLEVEL! equ 0 (
        powershell -NoProfile -WindowStyle Hidden -Command "$env:PORT='%%P'; Start-Process -FilePath 'node' -ArgumentList 'server.js' -WorkingDirectory '%~dp0' -WindowStyle Hidden"

        powershell -NoProfile -Command "$deadline=(Get-Date).AddSeconds(6); $ok=$false; do { try { $response = Invoke-RestMethod -UseBasicParsing 'http://localhost:%%P/api/health' -TimeoutSec 1; if ($response.app -eq '%APP_NAME%') { $ok=$true; break } } catch { } Start-Sleep -Milliseconds 250 } while ((Get-Date) -lt $deadline); if ($ok) { exit 0 } else { exit 1 }"

        if !ERRORLEVEL! equ 0 (
            set "APP_PORT=%%P"
            goto :openApp
        )
    )
)

:: No se pudo detectar ni iniciar la app
exit /b

:openApp
start "" "http://localhost:%APP_PORT%/"

exit /b
