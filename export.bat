@echo off

setlocal enabledelayedexpansion
:: 使用 for /f 循环从 getmac 命令获取 MAC 地址
for /f "usebackq tokens=1 delims= " %%i in (`getmac ^| find "-"`) do (
    set MACAddress=%%i
    goto :break
)
:break
cls

:: 如果存在ROOT_DIR则退出
if "%ROOT_DIR%" neq "" exit
if "!ROOT_DIR!" neq "" exit

if not exist settings mkdir settings
set PATH_CONFIG_FILENAME=settings\%MACAddress%.bat
if exist %PATH_CONFIG_FILENAME% call %PATH_CONFIG_FILENAME%

pushd..
set ROOT_DIR=%cd%
popd

set TITLE_NAME=Excel转换配置工具(支持xlsx,xlsm)
title %TITLE_NAME%
echo %TITLE_NAME%

echo 配置文件路径: %cd%\%PATH_CONFIG_FILENAME%

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
	echo 输出配置需存在≥1个
	goto :break_config_err
)

goto :break_config_ok

:break_config_err

echo.
echo 首次使用请先添加必要预设路径！
echo 配置成功后如果想此再次配置,请直接【修改】或【删除】配置文件！
:: if not exist %PATH_CONFIG_FILENAME% (
echo.
echo 注意事项:
echo 1 可留空,不填写不导出,但输出配置需存在≥1个
echo 2 填写路径为相对路径,初始相对位置为xlsx2json同级目录 当前相对根目录:%ROOT_DIR%
echo 3 路径带空格请用双引号包括,冒号后不要留空格
echo 4 路径使用\分割符,每个选项有个示例路径提供参考,但需要自己复制过去
echo 5 配置的每行等号后不要留空格再写路径,会导致无法识别
echo 6 配置结尾不要需要\分割符
echo.
echo # 配置文件地址 默认: Excels
set /p XLSX_CONFIG_PATH="[必填] XLSX_CONFIG_PATH:"
if "%XLSX_CONFIG_PATH%"=="" set "XLSX_CONFIG_PATH=Excels"
:: 检测配置路径是否存在默认配置文件
set "DEFAULT_CONFIG=..\%XLSX_CONFIG_PATH%\●导表默认配置.bat"
if exist %DEFAULT_CONFIG% (
	echo.
	set /p USE_DEFAULT_CONFIG="检测到默认配置文件,是否重新自定义配置? [y/n]: "
	if /i "%USE_DEFAULT_CONFIG%" neq "y" (
		call "%DEFAULT_CONFIG%"
		goto :break_config_default
	)
)
echo.
echo # 客户端配置JSON导出地址,无需求可回车跳过 示例: Client\Json
set /p CLIENT_CONFIG_PATH="[选填] CLIENT_CONFIG_PATH:"
echo.
echo # 客户端配置CS脚本导出地址,无需求可回车跳过 示例: Client\Scripts\Configs
set /p CLIENT_CONFIG_CS_PATH="[选填] CLIENT_CONFIG_CS_PATH:"
echo.
echo # 服务器配置JSON导出地址,无需求可回车跳过 示例: Server\Json
set /p SERVER_CONFIG_PATH="[选填] SERVER_CONFIG_PATH:"
echo.
echo # 服务器配置CS脚本导出地址,无需求可回车跳过 示例: Server\Configs
set /p SERVER_CONFIG_CS_PATH="[选填] SERVER_CONFIG_CS_PATH:"

:break_config_default
(
	echo @echo off
	echo :: 注意事项:
	echo :: 1 可留空,不填写不导出,但输出配置需存在≥1个
	echo :: 2 填写路径为相对路径,初始相对位置为xlsx2json同级目录
	echo :: 3 路径带空格请用双引号包括,等号后不要留空格
	echo :: 4 路径使用\分割符,每个选项有个示例路径提供参考,但需要自己复制过去
	echo :: 5 配置的每行等号后不要留空格再写路径,会导致无法识别
	echo :: 6 配置结尾不要需要\分割符
	echo.
	echo :: 配置文件地址 默认: Excels
	echo set XLSX_CONFIG_PATH=%XLSX_CONFIG_PATH%
	echo.
	echo :: 客户端配置JSON导出地址 示例: Client\Json
	echo set CLIENT_CONFIG_PATH=%CLIENT_CONFIG_PATH%
	echo.
	echo :: 客户端配置CS脚本导出地址 示例: Client\Scripts\Configs
	echo set CLIENT_CONFIG_CS_PATH=%CLIENT_CONFIG_CS_PATH%
	echo.
	echo :: 服务器配置JSON导出地址 示例: Server\Json
	echo set SERVER_CONFIG_PATH=%SERVER_CONFIG_PATH%
	echo.
	echo :: 服务器配置CS脚本导出地址 示例: Server\Configs
	echo set SERVER_CONFIG_CS_PATH=%SERVER_CONFIG_CS_PATH%
) > %PATH_CONFIG_FILENAME%
:: )

:: 检测配置路径是否存在默认配置文件
if not exist %DEFAULT_CONFIG% (
	echo.
	set /p CREATE_DEFAULT_CONFIG="未检测到默认配置文件,是否以此配置作为默认配置文件? [y/n]: "
	if /i "!CREATE_DEFAULT_CONFIG!"=="y" (
		echo 创建默认配置文件...
		(
			echo @echo off
			echo :: 此文件为默认配置文件,请勿删除
			echo :: 注意事项:
			echo :: 1 可留空,不填写不导出,但输出配置需存在≥1个
			echo :: 2 填写路径为相对路径,初始相对位置为xlsx2json同级目录
			echo :: 3 路径带空格请用双引号包括,等号后不要留空格
			echo :: 4 路径使用\分割符,每个选项有个示例路径提供参考,但需要自己复制过去
			echo :: 5 配置的每行等号后不要留空格再写路径,会导致无法识别
			echo :: 6 配置结尾不要需要\分割符
			echo.
			echo :: 客户端配置JSON导出地址 示例: Client\Json
			echo set CLIENT_CONFIG_PATH=%CLIENT_CONFIG_PATH%
			echo.
			echo :: 客户端配置CS脚本导出地址 示例: Client\Scripts\Configs
			echo set CLIENT_CONFIG_CS_PATH=%CLIENT_CONFIG_CS_PATH%
			echo.
			echo :: 服务器配置JSON导出地址 示例: Server\Json
			echo set SERVER_CONFIG_PATH=%SERVER_CONFIG_PATH%
			echo.
			echo :: 服务器配置CS脚本导出地址 示例: Server\Configs
			echo set SERVER_CONFIG_CS_PATH=%SERVER_CONFIG_CS_PATH%
		) > %DEFAULT_CONFIG%
	)
)

echo.
echo **************************
echo * 再次确认后按任意键检测 *
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

:: 创建快捷方式
set "SHORTCUT_NAME=~~~~~导出JSON~~~~~.lnk"
if not exist "%ROOT_DIR%\%XLSX_CONFIG_PATH%\%SHORTCUT_NAME%" (
	powershell -Command "Start-Process cmd -Verb RunAs -ArgumentList '/c "%cd%\\createshortcut.bat" cd /d %cd% %* & %~dpnx0 %*'"
)

:: echo 按任意键开始.
:: @pause > nul
:: echo;

echo 各项导出地址↓
echo Xlsx配置文件地址:%XLSX_CONFIG_PATH%
echo 客户端配置JSON导出地址:%CLIENT_CONFIG_PATH%
echo 服务器配置JSON导出地址:%SERVER_CONFIG_PATH%
echo 客户端配置CS脚本导出地址:%CLIENT_CONFIG_CS_PATH%
echo 服务器配置CS脚本导出地址:%SERVER_CONFIG_CS_PATH%
echo ——————————————————————————————————————
echo 开始转换....
echo --------------------------------------

:: excel转导出
echo Excel转换开始!
echo.
call index.bat

echo =============================================

title %TITLE_NAME%
echo 转换完成!
echo 按任意键退出...
@pause > nul
::goto :break