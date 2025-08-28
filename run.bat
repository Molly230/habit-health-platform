@echo off
cd /d "F:\360MoveData\Users\administered\Desktop\588"

echo Starting backend...
start "Backend" cmd /k "cd /d F:\360MoveData\Users\administered\Desktop\588\backend && pip install -r requirements.txt && python init_database.py && python run.py"

echo Waiting 5 seconds...
timeout /t 5

echo Starting frontend...
start "Frontend" cmd /k "cd /d F:\360MoveData\Users\administered\Desktop\588 && npm install && npm run dev"

echo.
echo Services are starting...
echo Frontend will be at: http://localhost:5173
echo Backend will be at: http://localhost:5000
echo.
pause