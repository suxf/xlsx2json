@echo off
title [xlsx2json��ʼ������ - https://github.com/suxf/xlsx2json]
setlocal
set CURRENT_VERSION=1.1.4

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

for /f "tokens=2 delims=:," %%a in ('findstr /i "tag_name" "%TEMP%\latest_release.json"') do (
    set "LATEST_VERSION=%%~a"
)
set "LATEST_VERSION=%LATEST_VERSION:"=%"
set "LATEST_VERSION=%LATEST_VERSION: =%"

if "%LATEST_VERSION%"=="" (
    echo δ�ܻ�ȡ���°汾�ţ�����ִ��ԭ����...
    goto :continue
)

if "%CURRENT_VERSION%"=="%LATEST_VERSION%" (
    echo �������°汾��
) else (
    echo ��⵽�°汾��%LATEST_VERSION%��������ת�°汾����ҳ��...
    start "" "%RELEASE_URL%"
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
echo ������ �����������ʼ��ʼ�� ������
pause >nul

export.bat