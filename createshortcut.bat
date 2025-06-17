@echo off

setlocal enabledelayedexpansion

:: 使用 for /f 循环从 getmac 命令获取 MAC 地址
for /f "usebackq tokens=1 delims= " %%i in (`getmac ^| find "-"`) do (
    set MACAddress=%%i
    goto :break
)
:break
cls

title [创建导出快捷方式 - https://github.com/suxf/xlsx2json]

set ROOT_DIR=%~dp0

echo 正在创建导出快捷方式...
net session >nul 2>&1
if %errorLevel% == 0 (
	echo %ROOT_DIR%settings\%MACAddress%.bat
	
    if not exist "%ROOT_DIR%settings\%MACAddress%.bat" (
        echo 没有找到配置文件,请先配置
        pause
    )
	echo 导出快捷方式...
    call "%ROOT_DIR%settings\%MACAddress%.bat"

	powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%ROOT_DIR%..\!XLSX_CONFIG_PATH!\~~~~~导出JSON~~~~~.lnk'); $s.TargetPath = '%ROOT_DIR%\export.bat'; $s.WorkingDirectory = '%ROOT_DIR%'; $s.Save()"
	echo %ROOT_DIR%..\!XLSX_CONFIG_PATH!\~~~~~导出JSON~~~~~.lnk
	exit
)
echo 无管理员权限
pause