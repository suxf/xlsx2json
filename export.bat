@echo off

setlocal enabledelayedexpansion

:: ʹ�� for /f ѭ���� getmac �����ȡ MAC ��ַ
for /f "usebackq tokens=1 delims= " %%i in (`getmac ^| find "-"`) do (
    set MACAddress=%%i
    goto :break
)
:break
cls

if not exist settings mkdir settings
set PATH_CONFIG_FILENAME=settings\%MACAddress%.bat

if exist %PATH_CONFIG_FILENAME% call %PATH_CONFIG_FILENAME%

set TITLE_NAME=Excelת�����ù���(֧��xlsx,xlsm)
title %TITLE_NAME%
echo %TITLE_NAME%

echo �����ļ�·��: xlsx2json\%PATH_CONFIG_FILENAME%

::if "%CLIENT_CONFIG_PATH%"=="" (
::	if "%SERVER_CONFIG_PATH%"=="" (
::		if "%CLIENT_CONFIG_CS_PATH%"=="" (
::			if "%SERVER_CONFIG_CS_PATH%"=="" (
::				goto :break_config_err
::			)
::		)
::	)
::)

if "%XLSX_CONFIG_PATH%"=="" goto :break_config_err

goto :break_config_ok

:break_config_err
echo.
echo �״�ʹ��������ӱ�ҪԤ��·����
echo ���óɹ����������ٴ�����,��ֱ�ӡ��޸ġ���ɾ���������ļ���
echo ����Ҫʹ�ù���Աģʽ���б����ߣ�
:: if not exist %PATH_CONFIG_FILENAME% (
	echo.
	echo ע������:
    echo 1 ������,����д������
    echo 2 ��д·��Ϊ���·��,��ʼ���λ��Ϊxlsx2jsonͬ��Ŀ¼
    echo 3 ·�����ո�����˫���Ű���,ð�ź�Ҫ���ո�
    echo 4 ·��ʹ��\�ָ��,ÿ��ѡ���и�ʾ��·���ṩ�ο�,����Ҫ�Լ����ƹ�ȥ
    echo 5 ���õ�ÿ�еȺź�Ҫ���ո���д·��,�ᵼ���޷�ʶ��
    echo 6 ���ý�β��Ҫ��Ҫ\�ָ��
	echo.
	echo # �����ļ���ַ ʾ��: .\Excels
	set /p XLSX_CONFIG_PATH="[����] XLSX_CONFIG_PATH:"
	echo.
	echo # �ͻ�������JSON������ַ,������ɻس����� ʾ��: .\Client\Json
	set /p CLIENT_CONFIG_PATH="[ѡ��] CLIENT_CONFIG_PATH:"
	echo.
	echo # �ͻ�������CS�ű�������ַ,������ɻس����� ʾ��: .\Client\Scripts\Configs
	set /p CLIENT_CONFIG_CS_PATH="[ѡ��] CLIENT_CONFIG_CS_PATH:"
	echo.
	echo # ����������JSON������ַ,������ɻس����� ʾ��: .\Server\Json
	set /p SERVER_CONFIG_PATH="[ѡ��] SERVER_CONFIG_PATH:"
	echo.
	echo # ����������CS�ű�������ַ,������ɻس����� ʾ��: .\Server\Configs
	set /p SERVER_CONFIG_CS_PATH="[ѡ��] SERVER_CONFIG_CS_PATH:"

	(
    echo :: ע������:
    echo :: 1 ������,����д������
    echo :: 2 ��д·��Ϊ���·��,��ʼ���λ��Ϊxlsx2jsonͬ��Ŀ¼
    echo :: 3 ·�����ո�����˫���Ű���,�Ⱥź�Ҫ���ո�
    echo :: 4 ·��ʹ��\�ָ��,ÿ��ѡ���и�ʾ��·���ṩ�ο�,����Ҫ�Լ����ƹ�ȥ
    echo :: 5 ���õ�ÿ�еȺź�Ҫ���ո���д·��,�ᵼ���޷�ʶ��
    echo :: 6 ���ý�β��Ҫ��Ҫ\�ָ��
    echo.
    echo :: �����ļ���ַ ʾ��: .\Configs
	echo set XLSX_CONFIG_PATH=%XLSX_CONFIG_PATH%
    echo.
	echo :: �ͻ�������JSON������ַ ʾ��: .\Client\Json
	echo set CLIENT_CONFIG_PATH=%CLIENT_CONFIG_PATH%
	echo.
	echo :: �ͻ�������CS�ű�������ַ ʾ��: .\Client\Scripts\Configs
	echo set CLIENT_CONFIG_CS_PATH=%CLIENT_CONFIG_CS_PATH%
	echo.
	echo :: ����������JSON������ַ ʾ��: .\Server\Json
	echo set SERVER_CONFIG_PATH=%SERVER_CONFIG_PATH%
	echo.
	echo :: ����������CS�ű�������ַ ʾ��: .\Server\Configs
	echo set SERVER_CONFIG_CS_PATH=%SERVER_CONFIG_CS_PATH%
	) > %PATH_CONFIG_FILENAME%
:: )

echo.
echo **************************
echo * �ٴ�ȷ�Ϻ��������� *
echo **************************
echo.
@pause > nul
goto :break

:break_config_ok

if not exist "..\%XLSX_CONFIG_PATH%\" (
	mkdir "..\%XLSX_CONFIG_PATH%\"
	xcopy ".\excel\~*.xlsx" "..\%XLSX_CONFIG_PATH%\" /s /e /y /c /h /r 
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