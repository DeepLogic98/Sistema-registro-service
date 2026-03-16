@echo off

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
if not exist "node_modules\" (
    call npm install
)

:: Verificar si el servidor ya está corriendo
powershell -NoProfile -Command "try { $response = Invoke-WebRequest -UseBasicParsing 'http://localhost:3000' -TimeoutSec 1; if ($response.StatusCode -ge 200) { exit 0 } else { exit 1 } } catch { exit 1 }"

:: Si no está corriendo, iniciarlo en segundo plano
if %ERRORLEVEL% neq 0 (
    powershell -NoProfile -WindowStyle Hidden -Command "Start-Process -FilePath 'node' -ArgumentList 'server.js' -WorkingDirectory '%~dp0' -WindowStyle Hidden"

    :: Esperar hasta 1 segundo a que responda
    powershell -NoProfile -Command "$deadline=(Get-Date).AddSeconds(1); do { try { $response = Invoke-WebRequest -UseBasicParsing 'http://localhost:3000' -TimeoutSec 1; if ($response.StatusCode -ge 200) { break } } catch { } Start-Sleep -Milliseconds 200 } while ((Get-Date) -lt $deadline)"
)

start "" "http://localhost:3000"

exit /b
