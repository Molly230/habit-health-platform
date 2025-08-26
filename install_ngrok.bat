@echo off
echo 正在下载和安装 ngrok...
echo.

REM 创建临时目录
if not exist "%TEMP%\ngrok" mkdir "%TEMP%\ngrok"
cd /d "%TEMP%\ngrok"

echo 📥 下载 ngrok Windows 版本...
powershell -Command "& {Invoke-WebRequest -Uri 'https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip' -OutFile 'ngrok.zip'}"

if exist "ngrok.zip" (
    echo ✅ 下载完成！
    
    echo 📦 解压文件...
    powershell -Command "& {Expand-Archive -Path 'ngrok.zip' -DestinationPath '.' -Force}"
    
    if exist "ngrok.exe" (
        echo 📂 将 ngrok 复制到系统目录...
        copy "ngrok.exe" "C:\Windows\System32\" >nul
        
        echo.
        echo ✅ ngrok 安装成功！
        echo 🚀 现在可以使用 ngrok 命令了
        echo.
        echo 📋 使用方法：
        echo    ngrok http 5000
        echo.
        
        REM 测试安装
        ngrok version
        
    ) else (
        echo ❌ 解压失败，请手动安装
        echo 请访问 https://ngrok.com/download 下载
    )
) else (
    echo ❌ 下载失败，请检查网络连接
    echo 请访问 https://ngrok.com/download 手动下载
)

echo.
echo 按任意键继续...
pause >nul