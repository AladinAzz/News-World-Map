@echo off
echo ==========================================
echo    Starting AlgeriaPulse 2.0 Application
echo ==========================================

:: Start Backend in a new window
echo [1/3] Starting Backend (Flask)...
start "AlgeriaPulse Backend" cmd /k "set PYTHONPATH=%CD% && cd backend && venv\Scripts\activate && python app.py"

:: Start Frontend in a new window
echo [2/3] Starting Frontend (HTTP Server)...
start "AlgeriaPulse Frontend" cmd /k "cd frontend && python -m http.server 8000"

:: Wait for servers to initialize
echo [3/3] Waiting for servers to initialize...
timeout /t 5 /nobreak > nul

:: Open the browser
echo Opening application at http://localhost:8000...
start http://localhost:8000

echo.
echo Application is running!
echo You can close this window, but keep the Backend and Frontend windows open.
pause
