@echo off

setlocal enabledelayedexpansion

:: ʹ�� for /f ѭ���� getmac �����ȡ MAC ��ַ
for /f "usebackq tokens=1 delims= " %%i in (`getmac ^| find "-"`) do (
    set MACAddress=%%i
    goto :break
)
:break
cls

title [����������ݷ�ʽ - https://github.com/suxf/xlsx2json]

set ROOT_DIR=%~dp0

echo ���ڴ���������ݷ�ʽ...
net session >nul 2>&1
if %errorLevel% == 0 (
	echo %ROOT_DIR%settings\%MACAddress%.bat
	
    if not exist "%ROOT_DIR%settings\%MACAddress%.bat" (
        echo û���ҵ������ļ�,��������
        pause
    )
	echo ������ݷ�ʽ...
    call "%ROOT_DIR%settings\%MACAddress%.bat"

	powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%ROOT_DIR%..\!XLSX_CONFIG_PATH!\~~~~~����JSON~~~~~.lnk'); $s.TargetPath = '%ROOT_DIR%\export.bat'; $s.WorkingDirectory = '%ROOT_DIR%'; $s.Save()"
	echo %ROOT_DIR%..\!XLSX_CONFIG_PATH!\~~~~~����JSON~~~~~.lnk
	exit
)
echo �޹���ԱȨ��
pause