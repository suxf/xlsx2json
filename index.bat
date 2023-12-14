@echo off
title [convert excel]
:: echo press any button to start.
:: @pause > nul
:: echo convert excel start ....

:: 没有bin\config目录创建一个bin\config目录
if not exist .\bin\config1 mkdir .\bin\config1
if not exist .\bin\config2 mkdir .\bin\config2

@del /s/q .\bin\config1\*_config.json > nul 2> nul
@del /s/q .\bin\config2\*_config.json > nul 2> nul

:: 没有bin\csharp目录创建一个bin\csharp目录
if not exist .\bin\csharp1 mkdir .\bin\csharp1
if not exist .\bin\csharp2 mkdir .\bin\csharp2

@del /s/q .\bin\csharp1\*.cs > nul 2> nul
@del /s/q .\bin\csharp2\*.cs > nul 2> nul

:: 运行导出脚本
node index.js --export "..\%XLSX_CONFIG_PATH%\**\[^~$]*.xls[xm]"

:: 迁移json文件
if not "%SERVER_CONFIG_PATH%" == "" (
if not exist "..\%SERVER_CONFIG_PATH%\" mkdir "..\%SERVER_CONFIG_PATH%\"
echo.
echo Server Config Json Copy...
@del /s/q "..\%SERVER_CONFIG_PATH%\*_config.json" > nul 2> nul
xcopy .\bin\config1\*_config.json "..\%SERVER_CONFIG_PATH%\" /s /e /y /c /h /r 
)

if not "%CLIENT_CONFIG_PATH%" == "" (
if not exist "..\%CLIENT_CONFIG_PATH%\" mkdir "..\%CLIENT_CONFIG_PATH%\"
echo.
echo Client Config Json Copy...
@del /s/q "..\%CLIENT_CONFIG_PATH%\*_config.json" > nul 2> nul
xcopy .\bin\config2\*_config.json "..\%CLIENT_CONFIG_PATH%\" /s /e /y /c /h /r 
)

:: 迁移csharp文件
if not "%SERVER_CONFIG_CS_PATH%" == "" (
if not exist "..\%SERVER_CONFIG_CS_PATH%\" mkdir "..\%SERVER_CONFIG_CS_PATH%\"
echo.
echo Server Config CSharp Copy...
@del /s/q "..\%SERVER_CONFIG_CS_PATH%\*Config.cs" > nul 2> nul
xcopy .\bin\csharp1\*Config.cs "..\%SERVER_CONFIG_CS_PATH%\" /s /e /y /c /h /r > nul 2> nul

@del /s/q "..\%SERVER_CONFIG_CS_PATH%\ConfMgr.cs" > nul 2> nul
@xcopy .\bin\csharp1\ConfMgr.cs "..\%SERVER_CONFIG_CS_PATH%\" /s /e /y /c /h /r 
)

if not "%CLIENT_CONFIG_CS_PATH%" == "" (
if not exist "..\%CLIENT_CONFIG_CS_PATH%\" mkdir "..\%CLIENT_CONFIG_CS_PATH%\"
echo.
echo Client Config CSharp Copy...
@del /s/q "..\%CLIENT_CONFIG_CS_PATH%\*Config.cs" > nul 2> nul
xcopy .\bin\csharp2\*Config.cs "..\%CLIENT_CONFIG_CS_PATH%\" /s /e /y /c /h /r 

@del /s/q "..\%CLIENT_CONFIG_CS_PATH%\ConfMgr.cs" > nul 2> nul
@xcopy .\bin\csharp2\ConfMgr.cs "..\%CLIENT_CONFIG_CS_PATH%\" /s /e /y /c /h /r > nul 2> nul
)

:: @pause