import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'

const execAsync = promisify(exec)

export async function POST() {
  try {
    const port = process.env.PORT || '3000'
    const projectRoot = path.resolve(process.cwd())
    
    console.log('准备重启服务，端口:', port, '项目根目录:', projectRoot)
    
    if (process.platform === 'win32') {
      const batPath = path.join(projectRoot, 'scripts', 'restart-server.bat')
      const batContent = `@echo off
setlocal enabledelayedexpansion
cd /d "${projectRoot}"
set PORT=${port}
echo [%date% %time%] 开始重启服务，端口: %PORT% > restart-server.log

REM 杀掉占用端口的进程
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%PORT%') do (
    echo [%date% %time%] 正在终止进程 PID: %%a >> restart-server.log
    taskkill /F /PID %%a >> restart-server.log 2>&1
)

timeout /t 1 /nobreak >nul

REM 确定运行命令
if "%NODE_ENV%"=="production" (
    set RUN_CMD=npm run start
) else (
    set RUN_CMD=npm run dev
)

echo [%date% %time%] 启动服务: !RUN_CMD! >> restart-server.log

start "" cmd /c "cd /d \"${projectRoot}\" && !RUN_CMD! >> restart-server.log 2>&1"

echo [%date% %time%] 服务已启动 >> restart-server.log
`
      fs.writeFileSync(batPath, batContent)
      
      execAsync(`cmd.exe /c "${batPath}"`)
      
      return NextResponse.json({
        success: true,
        message: '正在重启服务，请稍候...'
      })
    } else {
      const scriptPath = path.join(projectRoot, 'scripts', 'restart-server.sh')
      
      if (!fs.existsSync(scriptPath)) {
        return NextResponse.json({
          success: false,
          message: '重启脚本不存在'
        }, { status: 500 })
      }
      
      fs.chmodSync(scriptPath, '755')
      
      execAsync(`bash "${scriptPath}" ${port}`)
      
      return NextResponse.json({
        success: true,
        message: '正在重启服务，请稍候...'
      })
    }
  } catch (error) {
    console.error('重启服务失败:', error)
    return NextResponse.json({
      success: false,
      message: '重启服务失败: ' + (error as Error).message
    }, { status: 500 })
  }
}
