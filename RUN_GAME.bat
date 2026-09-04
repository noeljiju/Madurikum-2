@echo off
title Aadum Madhirkkum Pinne Kaikkum - AI Arena
cd /d "%~dp0"
echo ==================================================
echo   Starting AI Expression Arena...
echo ==================================================
start http://localhost:8000/index.html
py run_game.py
pause
