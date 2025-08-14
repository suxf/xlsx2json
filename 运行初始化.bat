@echo off
title [xlsx2json初始化工具 - https://github.com/suxf/xlsx2json]
setlocal enabledelayedexpansion
:: 从 package.json 读取当前版本
set "CURRENT_VERSION="
for /f "usebackq tokens=2 delims=:," %%a in (`findstr /i "\"version\"" package.json`) do (
    set "raw_version=%%a"
    :: 移除引号和空格
    set "CURRENT_VERSION=!raw_version:"=!"
    set "CURRENT_VERSION=!CURRENT_VERSION: =!"
)

:: 验证当前版本是否获取成功
if not defined CURRENT_VERSION (
	echo 无法从package.json中获取version字段，继续执行原流程...
    goto :continue
)

set GITHUB_USER=suxf
set GITHUB_REPO=xlsx2json
set "API_URL=https://api.github.com/repos/%GITHUB_USER%/%GITHUB_REPO%/releases/latest"
set "RELEASE_URL=https://github.com/%GITHUB_USER%/%GITHUB_REPO%/releases/latest"

echo 让excel支持复杂的json格式, 将xlsx文件转成json以及csharp脚本。
echo 本工具项目地址：https://github.com/suxf/xlsx2json
echo.
echo 正在检查更新...
echo 当前版本：%CURRENT_VERSION%
where curl >nul 2>nul
if errorlevel 1 (
    echo 检查更新失败...
    goto :continue
)

curl -s -H "Accept: application/vnd.github.v3+json" "%API_URL%" > "%TEMP%\latest_release.json"
if errorlevel 1 (
    echo 检查更新失败...
    goto :continue
)

:: 提取tag_name的值
for /f "tokens=2 delims=:," %%a in ('findstr /i "tag_name" "%TEMP%\latest_release.json"'
) do (
    set "LATEST_VERSION_TAG=%%~a"
)

:: 判断是否成功获取
if not defined LATEST_VERSION_TAG (
    echo 未能识别最新版本号，继续执行原流程...
    goto :continue
)

for /f "tokens=2 delims=:," %%a in ('findstr /i "tag_name" "%TEMP%\latest_release.json"') do (
    set "LATEST_VERSION=%%~a"
)
set "LATEST_VERSION=%LATEST_VERSION:"=%"
set "LATEST_VERSION=%LATEST_VERSION: =%"

if "%LATEST_VERSION%"=="" (
    echo 未能获取最新版本号，继续执行原流程...
    goto :continue
)

REM if "%CURRENT_VERSION%"=="%LATEST_VERSION%" (
REM     echo 已是最新版本。
REM ) else (
REM     echo 检测到新版本：%LATEST_VERSION%，正在跳转新版本下载页面...
REM     start "" "%RELEASE_URL%"
REM )

::: 版本比较函数 ::::::::::::::::::::::::::
setlocal enabledelayedexpansion
set "verA=%CURRENT_VERSION%"
set "verB=%LATEST_VERSION%"

:: 拆分版本号组件
for /f "tokens=1-4 delims=." %%a in ("!verA!") do (
    set "a1=%%a" & set "a2=%%b" & set "a3=%%c" & set "a4=%%d"
)
for /f "tokens=1-4 delims=." %%a in ("!verB!") do (
    set "b1=%%a" & set "b2=%%b" & set "b3=%%c" & set "b4=%%d"
)

:: 处理空值（默认设为零）
if "!a1!"=="" set "a1=0"
if "!a2!"=="" set "a2=0"
if "!a3!"=="" set "a3=0"
if "!a4!"=="" set "a4=0"
if "!b1!"=="" set "b1=0"
if "!b2!"=="" set "b2=0"
if "!b3!"=="" set "b3=0"
if "!b4!"=="" set "b4=0"

:: 逐级比较版本号
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
    echo 检测到新版本：%LATEST_VERSION%
	echo.
	echo 浏览器自动跳转最新版本下载页面...
	echo 忽略更新请按任意键继续...
    start "" "%RELEASE_URL%"
	pause
) else (
    echo 已是最新版本。
)

:continue
endlocal

echo.
echo 工具初始化说明：
echo 根据操作完成配置，完成后可在配置文件夹目录直接使用【导出Json】快捷方式启动工具！
echo 工具本身允许请以当前用户身份运行，否则无法正常使用。创建快捷方式会自动申请管理员权限，请允许授权管理员权限。
echo.
echo 提示：每次运行初始化脚本时会自动检测版本更新，如果存在新版本会自动跳转网站。
echo.
echo 按下任意键开始初始化...
pause >nul

export.bat