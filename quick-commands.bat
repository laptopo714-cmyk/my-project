@echo off
:menu
cls
echo ===============================================
echo    نظام إدارة المدير / Admin Management System
echo ===============================================
echo.
echo Choose an option / اختر خيار:
echo.
echo 1. Full Setup / الإعداد الكامل
echo 2. Create Admin / إنشاء المدير  
echo 3. Test Login / اختبار تسجيل الدخول
echo 4. Update Admin / تحديث المدير
echo 5. Delete Admin / حذف المدير
echo 6. List Users / عرض المستخدمين
echo 7. Reset Password / إعادة تعيين كلمة المرور
echo 8. Exit / خروج
echo.
set /p choice=Enter your choice (1-8): 

if "%choice%"=="1" (
    echo.
    echo 🚀 Running full automated setup...
    node auto-setup.mjs
    goto pause_menu
)

if "%choice%"=="2" (
    echo.
    echo 👤 Creating admin user...
    node admin-manager.mjs create
    goto pause_menu
)

if "%choice%"=="3" (
    echo.
    echo 🧪 Testing admin login...
    node admin-manager.mjs test
    goto pause_menu
)

if "%choice%"=="4" (
    echo.
    echo 🔄 Updating admin user...
    node admin-manager.mjs update
    goto pause_menu
)

if "%choice%"=="5" (
    echo.
    echo 🗑️ Deleting admin user...
    node admin-manager.mjs delete
    goto pause_menu
)

if "%choice%"=="6" (
    echo.
    echo 📋 Listing all users...
    node admin-manager.mjs list
    goto pause_menu
)

if "%choice%"=="7" (
    echo.
    echo 🔑 Resetting admin password...
    node admin-manager.mjs reset
    goto pause_menu
)

if "%choice%"=="8" (
    echo.
    echo Goodbye! / مع السلامة!
    exit /b
)

echo Invalid choice! / خيار غير صحيح!
goto pause_menu

:pause_menu
echo.
echo Press any key to return to menu...
pause > nul
goto menu