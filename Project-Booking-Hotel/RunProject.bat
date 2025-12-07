@echo off
title Hotel Booking Launcher
color 0A

echo ========================================================
echo   HOTEL BOOKING SYSTEM - AUTO LAUNCHER
echo ========================================================

:: 1. KIEM TRA FILE CAU HINH (QUAN TRONG)
if not exist "Backend\HotelBooking.API\appsettings.json" (
    color 0C
    echo [LOI] Thieu file "Backend\HotelBooking.API\appsettings.json"
    echo Vui long lay file nay tu nguoi quan ly du an va paste vao thu muc Backend.
    pause
    exit
)

if not exist ".env" (
    color 0C
    echo [LOI] Thieu file ".env" tai thu muc goc.
    echo Vui long lay file nay tu nguoi quan ly du an va paste vao thu muc goc.
    pause
    exit
)

:: 2. Kiem tra va cai dat thu vien Frontend (Neu chua co)
if not exist "node_modules" (
    echo [INFO] Phat hien chay lan dau. Dang cai dat thu vien Frontend...
    call npm install
)

:: 3. KHOI DONG SERVER
echo.
echo [1/2] Dang khoi dong Backend API (Port 5000)...
:: Chay profile http de tranh loi SSL tren localhost
start "Backend API (.NET 8)" cmd /k "cd Backend/HotelBooking.API && dotnet run --launch-profile http"

echo [2/2] Dang khoi dong Frontend React (Port 5173)...
start "Frontend React (Vite)" cmd /k "npm run dev"

echo.
echo ========================================================
echo   HE THONG DA KICH HOAT THANH CONG!
echo   - Frontend: http://localhost:5173
echo   - Backend:  http://localhost:5000
echo ========================================================
echo.
echo Nhan phim bat ky de dong cua so nay (Server van chay ngam)...
pause >nul