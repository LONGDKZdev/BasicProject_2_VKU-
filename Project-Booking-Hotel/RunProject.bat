@echo off
echo ==========================================
echo DANG KHOI DONG HE THONG HOTEL BOOKING...
echo ==========================================

:: 1. Chạy Backend (C#) trong cửa sổ riêng
start "Backend API (Port 5000)" cmd /k "cd Backend/HotelBooking.API && dotnet run --launch-profile http"

:: 2. Chạy Frontend (React) trong cửa sổ riêng
start "Frontend React (Port 5173)" cmd /k "npm run dev"

echo Da kich hoat ca 2 server! Hay kiem tra cac cua so moi mo ra.