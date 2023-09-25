@echo off

setlocal enabledelayedexpansion

:: 使用 for /f 循环从 getmac 命令获取 MAC 地址
for /f "usebackq tokens=1 delims= " %%i in (`getmac ^| find "-"`) do (
    set MACAddress=%%i
    goto :break
)
:break
cls

if not exist settings mkdir settings
set PATH_CONFIG_FILENAME=settings\%MACAddress%.bat

if exist %PATH_CONFIG_FILENAME% call %PATH_CONFIG_FILENAME%

set TITLE_NAME=配置xlsx转换工具v0.1.0
title %TITLE_NAME%
echo %TITLE_NAME%

echo 配置文件路径: %PATH_CONFIG_FILENAME%

if "%CLIENT_CONFIG_PATH%"=="" (
	if "%SERVER_CONFIG_PATH%"=="" (
		if "%CLIENT_CONFIG_CS_PATH%"=="" (
			if "%SERVER_CONFIG_CS_PATH%"=="" (
				goto :break_config_err
			)
		)
	)
)

if "%XLSX_CONFIG_PATH%"=="" goto :break_config_err

goto :break_config_ok

:break_config_err
if not exist %PATH_CONFIG_FILENAME% (
	(
    echo :: 注意事项:
    echo :: 1 可留空,不填写不导出
    echo :: 2 填写路径为相对路径,初始相对位置为xlsx2json同级目录
    echo :: 3 路径带空格请用双引号包括,等号后不要留空格
    echo :: 4 路径使用\分割符,每个选项有个默认路径提供参考,但需要自己复制过去
    echo :: 5 配置的每行等号后不要留空格再写路径,会导致无法识别
    echo :: 6 配置结尾不要需要\分割符
    echo.
    echo :: 配置文件地址 默认.\Configs
	echo set XLSX_CONFIG_PATH=
    echo.
	echo :: 客户端配置JSON导出地址 默认.\Client\Json
	echo set CLIENT_CONFIG_PATH=
	echo.
	echo :: 客户端配置CS脚本导出地址 默认.\Client
	echo set CLIENT_CONFIG_CS_PATH=
	echo.
	echo :: 服务器配置JSON导出地址 默认.\Server\Json
	echo set SERVER_CONFIG_PATH=
	echo.
	echo :: 服务器配置CS脚本导出地址 默认.\Server
	echo set SERVER_CONFIG_CS_PATH=
	) > %PATH_CONFIG_FILENAME%
)

echo 第一次使用请先修改配置文件添加预设路径！
echo 注：不需要使用管理员模式运行本工具！
echo.
echo **************************
echo * 填写无误后按任意键检测 *
echo **************************
echo.
@pause > nul
goto :break

:break_config_ok

if not exist "..\%XLSX_CONFIG_PATH%\" (
	mkdir "..\%XLSX_CONFIG_PATH%\"
	xcopy ".\excel\~*.xlsx" "..\%XLSX_CONFIG_PATH%\" /s /e /y /c /h /r 
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
echo excel导出!
call index.bat

echo =============================================

title %TITLE_NAME%
echo 转换完成!
echo 直接关闭 或 按任意键重新导出...
@pause > nul
goto :break