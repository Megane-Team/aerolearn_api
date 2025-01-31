@echo off
for /f "tokens=2 delims=:" %%A in ('ipconfig ^| findstr "IPv4 Address"') do set IP=%%A
set IP=%IP:~1%
rem Ganti nilai WEB_URL dalam .env
powershell -Command "(Get-Content .env) -replace 'WEB_URL=.*', 'WEB_URL=http://%IP%:8000' | Set-Content .env"
pnpm dev
