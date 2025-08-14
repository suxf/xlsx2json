@echo off
title [xlsx2json��ʼ������ - https://github.com/suxf/xlsx2json]
setlocal enabledelayedexpansion
:: �� package.json ��ȡ��ǰ�汾
set "CURRENT_VERSION="
for /f "usebackq tokens=2 delims=:," %%a in (`findstr /i "\"version\"" package.json`) do (
    set "raw_version=%%a"
    :: �Ƴ����źͿո�
    set "CURRENT_VERSION=!raw_version:"=!"
    set "CURRENT_VERSION=!CURRENT_VERSION: =!"
)

:: ��֤��ǰ�汾�Ƿ��ȡ�ɹ�
if not defined CURRENT_VERSION (
	echo �޷���package.json�л�ȡversion�ֶΣ�����ִ��ԭ����...
    goto :continue
)

set GITHUB_USER=suxf
set GITHUB_REPO=xlsx2json
set "API_URL=https://api.github.com/repos/%GITHUB_USER%/%GITHUB_REPO%/releases/latest"
set "RELEASE_URL=https://github.com/%GITHUB_USER%/%GITHUB_REPO%/releases/latest"

echo ��excel֧�ָ��ӵ�json��ʽ, ��xlsx�ļ�ת��json�Լ�csharp�ű���
echo ��������Ŀ��ַ��https://github.com/suxf/xlsx2json
echo.
echo ���ڼ�����...
echo ��ǰ�汾��%CURRENT_VERSION%
where curl >nul 2>nul
if errorlevel 1 (
    echo ������ʧ��...
    goto :continue
)

curl -s -H "Accept: application/vnd.github.v3+json" "%API_URL%" > "%TEMP%\latest_release.json"
if errorlevel 1 (
    echo ������ʧ��...
    goto :continue
)

:: ��ȡtag_name��ֵ
for /f "tokens=2 delims=:," %%a in ('findstr /i "tag_name" "%TEMP%\latest_release.json"'
) do (
    set "LATEST_VERSION_TAG=%%~a"
)

:: �ж��Ƿ�ɹ���ȡ
if not defined LATEST_VERSION_TAG (
    echo δ��ʶ�����°汾�ţ�����ִ��ԭ����...
    goto :continue
)

for /f "tokens=2 delims=:," %%a in ('findstr /i "tag_name" "%TEMP%\latest_release.json"') do (
    set "LATEST_VERSION=%%~a"
)
set "LATEST_VERSION=%LATEST_VERSION:"=%"
set "LATEST_VERSION=%LATEST_VERSION: =%"

if "%LATEST_VERSION%"=="" (
    echo δ�ܻ�ȡ���°汾�ţ�����ִ��ԭ����...
    goto :continue
)

REM if "%CURRENT_VERSION%"=="%LATEST_VERSION%" (
REM     echo �������°汾��
REM ) else (
REM     echo ��⵽�°汾��%LATEST_VERSION%��������ת�°汾����ҳ��...
REM     start "" "%RELEASE_URL%"
REM )

::: �汾�ȽϺ��� ::::::::::::::::::::::::::
setlocal enabledelayedexpansion
set "verA=%CURRENT_VERSION%"
set "verB=%LATEST_VERSION%"

:: ��ְ汾�����
for /f "tokens=1-4 delims=." %%a in ("!verA!") do (
    set "a1=%%a" & set "a2=%%b" & set "a3=%%c" & set "a4=%%d"
)
for /f "tokens=1-4 delims=." %%a in ("!verB!") do (
    set "b1=%%a" & set "b2=%%b" & set "b3=%%c" & set "b4=%%d"
)

:: �����ֵ��Ĭ����Ϊ�㣩
if "!a1!"=="" set "a1=0"
if "!a2!"=="" set "a2=0"
if "!a3!"=="" set "a3=0"
if "!a4!"=="" set "a4=0"
if "!b1!"=="" set "b1=0"
if "!b2!"=="" set "b2=0"
if "!b3!"=="" set "b3=0"
if "!b4!"=="" set "b4=0"

:: �𼶱Ƚϰ汾��
set "result=0"
if !b1! gtr !a1! (set "result=1" & goto :end_compare)
if !b1! lss !a1! (set "result=0" & goto :end_compare)

if !b2! gtr !a2! (set "result=1" & goto :end_compare)
if !b2! lss !a2! (set "result=0" & goto :end_compare)

if !b3! gtr !a3! (set "result=1" & goto :end_compare)
if !b3! lss !a3! (set "result=0" & goto :end_compare)

if !b4! gtr !a4! (set "result=1" & goto :end_compare)
if !b4! lss !a4! (set "result=0" & goto :end_compare)

:end_compare
endlocal & set "NEWER_AVAILABLE=%result%"


if %NEWER_AVAILABLE% equ 1 (
    echo ��⵽�°汾��%LATEST_VERSION%
	echo.
	echo ������Զ���ת���°汾����ҳ��...
	echo ���Ը����밴���������...
    start "" "%RELEASE_URL%"
	pause
) else (
    echo �������°汾��
)

:continue
endlocal

echo.
echo ���߳�ʼ��˵����
echo ���ݲ���������ã���ɺ���������ļ���Ŀ¼ֱ��ʹ�á�����Json����ݷ�ʽ�������ߣ�
echo ���߱����������Ե�ǰ�û�������У������޷�����ʹ�á�������ݷ�ʽ���Զ��������ԱȨ�ޣ���������Ȩ����ԱȨ�ޡ�
echo.
echo ��ʾ��ÿ�����г�ʼ���ű�ʱ���Զ����汾���£���������°汾���Զ���ת��վ��
echo.
echo �����������ʼ��ʼ��...
pause >nul

export.bat