@echo off
set VENV_PATH=c:\Users\USER\Downloads\bus\backend\venv
call %VENV_PATH%\Scripts\activate.bat
python c:\Users\USER\Downloads\bus\backend\seed.py > c:\Users\USER\Downloads\bus\backend\seed_log.txt 2>&1
echo Done >> c:\Users\USER\Downloads\bus\backend\seed_log.txt
