@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if %errorlevel% equ 0 (
  node server.mjs
) else (
  if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" (
    "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" server.mjs
  ) else (
    echo 沒有找到 Node.js。請直接開啟 dist 資料夾中的 index.html 使用離線版。
    pause
  )
)
