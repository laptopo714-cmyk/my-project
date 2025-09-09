@echo off
echo ===== Fixing Database Schema =====
node fix-database.mjs

echo.
echo ===== Testing Database Connection =====
node scripts/check-tables.mjs

echo.
echo ===== Done =====
echo If you still see errors, please follow the instructions in README-DATABASE-FIX.md
pause