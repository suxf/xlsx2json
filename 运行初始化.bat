@echo off
title [xlsx2json初始化工具 - https://github.com/suxf/xlsx2json]
setlocal
set CURRENT_VERSION=1.1.4

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

for /f "tokens=2 delims=:," %%a in ('findstr /i "tag_name" "%TEMP%\latest_release.json"') do (
    set "LATEST_VERSION=%%~a"
)
set "LATEST_VERSION=%LATEST_VERSION:"=%"
set "LATEST_VERSION=%LATEST_VERSION: =%"

if "%LATEST_VERSION%"=="" (
    echo 未能获取最新版本号，继续执行原流程...
    goto :continue
)

if "%CURRENT_VERSION%"=="%LATEST_VERSION%" (
    echo 已是最新版本。
) else (
    echo 检测到新版本：%LATEST_VERSION%，正在跳转新版本下载页面...
    start "" "%RELEASE_URL%"
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
echo 》》》 按下任意键开始初始化 《《《
pause >nul

export.bat