@echo off
title [convert excel]
:: echo press any button to start.
:: @pause > nul
:: echo convert excel start ....

:: 没有bin\config目录创建一个bin\config目录
if not exist .\bin\json_server mkdir .\bin\json_server
if not exist .\bin\json_client mkdir .\bin\json_client

@del /s/q .\bin\json_server\*.json > nul 2> nul
@del /s/q .\bin\json_client\*.json > nul 2> nul
@del /s/q .\bin\json_server\*.d.ts > nul 2> nul
@del /s/q .\bin\json_client\*.d.ts > nul 2> nul

:: 没有bin\csharp目录创建一个bin\csharp目录
if not exist .\bin\csharp_server mkdir .\bin\csharp_server
if not exist .\bin\csharp_client mkdir .\bin\csharp_client

@del /s/q .\bin\csharp_server\*.cs > nul 2> nul
@del /s/q .\bin\csharp_client\*.cs > nul 2> nul

:: 运行导出脚本
node index.js --export "..\%XLSX_CONFIG_PATH%\**\[^~$]*.xls[xm]"

:: 迁移json文件
if not "%SERVER_CONFIG_PATH%" == "" (
if not exist "..\%SERVER_CONFIG_PATH%\" mkdir "..\%SERVER_CONFIG_PATH%\"
echo.
echo Server Config Json Copy...
@del /s/q "..\%SERVER_CONFIG_PATH%\*.json" > nul 2> nul
@xcopy .\bin\json_server\*.json "..\%SERVER_CONFIG_PATH%\" /s /e /y /c /h /r > nul 2> nul
@del /s/q "..\%SERVER_CONFIG_PATH%\*.d.ts" > nul 2> nul
@xcopy .\bin\json_server\*.d.ts "..\%SERVER_CONFIG_PATH%\" /s /e /y /c /h /r > nul 2> nul
)

if not "%CLIENT_CONFIG_PATH%" == "" (
if not exist "..\%CLIENT_CONFIG_PATH%\" mkdir "..\%CLIENT_CONFIG_PATH%\"
echo.
echo Client Config Json Copy...
@del /s/q "..\%CLIENT_CONFIG_PATH%\*.json" > nul 2> nul
@xcopy .\bin\json_client\*.json "..\%CLIENT_CONFIG_PATH%\" /s /e /y /c /h /r > nul 2> nul
@del /s/q "..\%CLIENT_CONFIG_PATH%\*.d.ts" > nul 2> nul
@xcopy .\bin\json_client\*.d.ts "..\%CLIENT_CONFIG_PATH%\" /s /e /y /c /h /r > nul 2> nul
)

:: 迁移csharp文件
if not "%SERVER_CONFIG_CS_PATH%" == "" (
if not exist "..\%SERVER_CONFIG_CS_PATH%\" mkdir "..\%SERVER_CONFIG_CS_PATH%\"

echo Server Config CSharp Copy...
@del /s/q "..\%SERVER_CONFIG_CS_PATH%\*.cs" > nul 2> nul
@xcopy .\bin\csharp_server\*.cs "..\%SERVER_CONFIG_CS_PATH%\" /s /e /y /c /h /r > nul 2> nul
)

if not "%CLIENT_CONFIG_CS_PATH%" == "" (
if not exist "..\%CLIENT_CONFIG_CS_PATH%\" mkdir "..\%CLIENT_CONFIG_CS_PATH%\"

echo Client Config CSharp Copy...
@del /s/q "..\%CLIENT_CONFIG_CS_PATH%\*.cs" > nul 2> nul
@xcopy .\bin\csharp_client\*.cs "..\%CLIENT_CONFIG_CS_PATH%\" /s /e /y /c /h /r > nul 2> nul
)

:: @pause