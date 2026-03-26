import { NextRequest, NextResponse } from 'next/server'
import { initializeModules } from '@/modules/init'
import { getModuleComponent, getModuleDefaultData } from '@/modules/registry'
import React from 'react'
import { renderToString } from 'react-dom/server'

initializeModules()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const moduleId = params.id
    
    const ModuleComponent = getModuleComponent(moduleId)
    
    if (!ModuleComponent) {
      return NextResponse.json({
        success: false,
        message: '模块不存在',
      }, { status: 404 })
    }

    const defaultData = getModuleDefaultData(moduleId) || {}
    
    try {
      const moduleElement = React.createElement(ModuleComponent, {
        data: defaultData,
        moduleId: `preview-${moduleId}`,
      })
      
      const moduleHtml = renderToString(moduleElement)

      const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>模块预览 - ${moduleId}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      padding: 20px;
    }
  </style>
</head>
<body>
  ${moduleHtml}
</body>
</html>
      `

      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      })
    } catch (error) {
      console.error(`Error rendering module ${moduleId}:`, error)
      return new NextResponse(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>模块预览 - ${moduleId}</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      padding: 40px;
      text-align: center;
      color: #c00;
    }
  </style>
</head>
<body>
  <h1>模块渲染失败</h1>
  <p>请检查模块配置</p>
</body>
</html>
      `, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
        status: 500,
      })
    }
  } catch (error) {
    console.error('Module preview error:', error)
    return new NextResponse(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>错误</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      padding: 40px;
      text-align: center;
      color: #c00;
    }
  </style>
</head>
<body>
  <h1>发生错误</h1>
</body>
</html>
    `, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
      status: 500,
    })
  }
}
