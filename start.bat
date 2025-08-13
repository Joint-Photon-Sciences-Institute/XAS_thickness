@echo off
REM Start script for XAS Thickness Calculator on Windows

echo Starting XAS Thickness Calculator...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed. Please install Python first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm is not installed. Please install Node.js and npm first.
    pause
    exit /b 1
)

REM Check if xraylib is installed
echo Checking Python dependencies...
python -c "import xraylib" >nul 2>&1
if errorlevel 1 (
    echo xraylib is not installed. Installing Python dependencies...
    pip install -r requirements.txt
)

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing npm dependencies...
    npm install
)

echo.
echo All dependencies are installed!
echo.
echo Starting servers...
echo    - API server will run on: http://localhost:5001
echo    - Web app will run on:    http://localhost:5173
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Start both servers
npm run start