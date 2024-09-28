@echo off

setlocal enabledelayedexpansion
:: ʹ�� for /f ѭ���� getmac �����ȡ MAC ��ַ
for /f "usebackq tokens=1 delims= " %%i in (`getmac ^| find "-"`) do (
    set MACAddress=%%i
    goto :break
)
:break
cls

:: �������ROOT_DIR���˳�
if "%ROOT_DIR%" neq "" exit
if "!ROOT_DIR!" neq "" exit

if not exist settings mkdir settings
set PATH_CONFIG_FILENAME=settings\%MACAddress%.bat
if exist %PATH_CONFIG_FILENAME% call %PATH_CONFIG_FILENAME%

pushd..
set ROOT_DIR=%cd%
popd

set TITLE_NAME=Excelת�����ù���(֧��xlsx,xlsm)
title %TITLE_NAME%
echo %TITLE_NAME%

echo �����ļ�·��: %cd%\%PATH_CONFIG_FILENAME%

::if "%CLIENT_CONFIG_PATH%"=="" (
::	if "%SERVER_CONFIG_PATH%"=="" (
::		if "%CLIENT_CONFIG_CS_PATH%"=="" (
::			if "%SERVER_CONFIG_CS_PATH%"=="" (
::				goto :break_config_err
::			)
::		)
::	)
::)

if "%CLIENT_CONFIG_PATH%"=="" if "%CLIENT_CONFIG_CS_PATH%"=="" if "%SERVER_CONFIG_PATH%"=="" if "%SERVER_CONFIG_CS_PATH%"=="" (
	echo �����������ڡ�1��
	goto :break_config_err
)

goto :break_config_ok

:break_config_err

echo.
echo �״�ʹ��������ӱ�ҪԤ��·����
echo ���óɹ����������ٴ�����,��ֱ�ӡ��޸ġ���ɾ���������ļ���
:: if not exist %PATH_CONFIG_FILENAME% (
echo.
echo ע������:
echo 1 ������,����д������,�������������ڡ�1��
echo 2 ��д·��Ϊ���·��,��ʼ���λ��Ϊxlsx2jsonͬ��Ŀ¼ ��ǰ��Ը�Ŀ¼:%ROOT_DIR%
echo 3 ·�����ո�����˫���Ű���,ð�ź�Ҫ���ո�
echo 4 ·��ʹ��\�ָ��,ÿ��ѡ���и�ʾ��·���ṩ�ο�,����Ҫ�Լ����ƹ�ȥ
echo 5 ���õ�ÿ�еȺź�Ҫ���ո���д·��,�ᵼ���޷�ʶ��
echo 6 ���ý�β��Ҫ��Ҫ\�ָ��
echo.
echo # �����ļ���ַ Ĭ��: Excels
set /p XLSX_CONFIG_PATH="[����] XLSX_CONFIG_PATH:"
if "%XLSX_CONFIG_PATH%"=="" set "XLSX_CONFIG_PATH=Excels"
:: �������·���Ƿ����Ĭ�������ļ�
set "DEFAULT_CONFIG=..\%XLSX_CONFIG_PATH%\�񵼱�Ĭ������.bat"
if exist %DEFAULT_CONFIG% (
	echo.
	set /p USE_DEFAULT_CONFIG="��⵽Ĭ�������ļ�,�Ƿ������Զ�������? [y/n]: "
	if /i "%USE_DEFAULT_CONFIG%" neq "y" (
		call "%DEFAULT_CONFIG%"
		goto :break_config_default
	)
)
echo.
echo # �ͻ�������JSON������ַ,������ɻس����� ʾ��: Client\Json
set /p CLIENT_CONFIG_PATH="[ѡ��] CLIENT_CONFIG_PATH:"
echo.
echo # �ͻ�������CS�ű�������ַ,������ɻس����� ʾ��: Client\Scripts\Configs
set /p CLIENT_CONFIG_CS_PATH="[ѡ��] CLIENT_CONFIG_CS_PATH:"
echo.
echo # ����������JSON������ַ,������ɻس����� ʾ��: Server\Json
set /p SERVER_CONFIG_PATH="[ѡ��] SERVER_CONFIG_PATH:"
echo.
echo # ����������CS�ű�������ַ,������ɻس����� ʾ��: Server\Configs
set /p SERVER_CONFIG_CS_PATH="[ѡ��] SERVER_CONFIG_CS_PATH:"

:break_config_default
(
	echo @echo off
	echo :: ע������:
	echo :: 1 ������,����д������,�������������ڡ�1��
	echo :: 2 ��д·��Ϊ���·��,��ʼ���λ��Ϊxlsx2jsonͬ��Ŀ¼
	echo :: 3 ·�����ո�����˫���Ű���,�Ⱥź�Ҫ���ո�
	echo :: 4 ·��ʹ��\�ָ��,ÿ��ѡ���и�ʾ��·���ṩ�ο�,����Ҫ�Լ����ƹ�ȥ
	echo :: 5 ���õ�ÿ�еȺź�Ҫ���ո���д·��,�ᵼ���޷�ʶ��
	echo :: 6 ���ý�β��Ҫ��Ҫ\�ָ��
	echo.
	echo :: �����ļ���ַ Ĭ��: Excels
	echo set XLSX_CONFIG_PATH=%XLSX_CONFIG_PATH%
	echo.
	echo :: �ͻ�������JSON������ַ ʾ��: Client\Json
	echo set CLIENT_CONFIG_PATH=%CLIENT_CONFIG_PATH%
	echo.
	echo :: �ͻ�������CS�ű�������ַ ʾ��: Client\Scripts\Configs
	echo set CLIENT_CONFIG_CS_PATH=%CLIENT_CONFIG_CS_PATH%
	echo.
	echo :: ����������JSON������ַ ʾ��: Server\Json
	echo set SERVER_CONFIG_PATH=%SERVER_CONFIG_PATH%
	echo.
	echo :: ����������CS�ű�������ַ ʾ��: Server\Configs
	echo set SERVER_CONFIG_CS_PATH=%SERVER_CONFIG_CS_PATH%
) > %PATH_CONFIG_FILENAME%
:: )

:: �������·���Ƿ����Ĭ�������ļ�
if not exist %DEFAULT_CONFIG% (
	echo.
	set /p CREATE_DEFAULT_CONFIG="δ��⵽Ĭ�������ļ�,�Ƿ��Դ�������ΪĬ�������ļ�? [y/n]: "
	if /i "!CREATE_DEFAULT_CONFIG!"=="y" (
		echo ����Ĭ�������ļ�...
		(
			echo @echo off
			echo :: ���ļ�ΪĬ�������ļ�,����ɾ��
			echo :: ע������:
			echo :: 1 ������,����д������,�������������ڡ�1��
			echo :: 2 ��д·��Ϊ���·��,��ʼ���λ��Ϊxlsx2jsonͬ��Ŀ¼
			echo :: 3 ·�����ո�����˫���Ű���,�Ⱥź�Ҫ���ո�
			echo :: 4 ·��ʹ��\�ָ��,ÿ��ѡ���и�ʾ��·���ṩ�ο�,����Ҫ�Լ����ƹ�ȥ
			echo :: 5 ���õ�ÿ�еȺź�Ҫ���ո���д·��,�ᵼ���޷�ʶ��
			echo :: 6 ���ý�β��Ҫ��Ҫ\�ָ��
			echo.
			echo :: �ͻ�������JSON������ַ ʾ��: Client\Json
			echo set CLIENT_CONFIG_PATH=%CLIENT_CONFIG_PATH%
			echo.
			echo :: �ͻ�������CS�ű�������ַ ʾ��: Client\Scripts\Configs
			echo set CLIENT_CONFIG_CS_PATH=%CLIENT_CONFIG_CS_PATH%
			echo.
			echo :: ����������JSON������ַ ʾ��: Server\Json
			echo set SERVER_CONFIG_PATH=%SERVER_CONFIG_PATH%
			echo.
			echo :: ����������CS�ű�������ַ ʾ��: Server\Configs
			echo set SERVER_CONFIG_CS_PATH=%SERVER_CONFIG_CS_PATH%
		) > %DEFAULT_CONFIG%
	)
)

echo.
echo **************************
echo * �ٴ�ȷ�Ϻ��������� *
echo **************************
echo.
set "ROOT_DIR="
@pause > nul
goto :break

:break_config_ok

if not exist "..\%XLSX_CONFIG_PATH%\" (
	mkdir "..\%XLSX_CONFIG_PATH%\"
)

for %%F in (.\docs\~*.xlsx) do (
    xcopy "%%F" "..\%XLSX_CONFIG_PATH%\" /y /c /h /r >nul 2>&1
)

:: ������ݷ�ʽ
set "SHORTCUT_NAME=~~~~~����JSON~~~~~.lnk"
if not exist "%ROOT_DIR%\%XLSX_CONFIG_PATH%\%SHORTCUT_NAME%" (
	powershell -Command "Start-Process cmd -Verb RunAs -ArgumentList '/c "%cd%\\createshortcut.bat" cd /d %cd% %* & %~dpnx0 %*'"
)

:: echo ���������ʼ.
:: @pause > nul
:: echo;

echo �������ַ��
echo Xlsx�����ļ���ַ:%XLSX_CONFIG_PATH%
echo �ͻ�������JSON������ַ:%CLIENT_CONFIG_PATH%
echo ����������JSON������ַ:%SERVER_CONFIG_PATH%
echo �ͻ�������CS�ű�������ַ:%CLIENT_CONFIG_CS_PATH%
echo ����������CS�ű�������ַ:%SERVER_CONFIG_CS_PATH%
echo ����������������������������������������������������������������������������
echo ��ʼת��....
echo --------------------------------------

:: excelת����
echo Excelת����ʼ!
echo.
call index.bat

echo =============================================

title %TITLE_NAME%
echo ת�����!
echo ��������˳�...
@pause > nul
::goto :break