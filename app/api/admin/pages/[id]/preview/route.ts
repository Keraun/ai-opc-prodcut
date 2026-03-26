import { NextRequest, NextResponse } from 'next/server'
import { initializeModules } from '@/modules/init'
import { getModuleComponent, getModuleDefaultData } from '@/modules/registry'
import { readConfig } from '@/lib/config-manager'
import React from 'react'
import { renderToString } from 'react-dom/server'

initializeModules()

interface ModuleInfo {
  moduleId: string
  moduleName: string
  moduleInstanceId: string
  data: Record<string, unknown>
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { modules } = body as { modules: ModuleInfo[] }

    const pageConfig = readConfig(`page-${params.id}`)
    if (!pageConfig) {
      return NextResponse.json({
        success: false,
        message: '页面不存在',
      }, { status: 404 })
    }

    const moduleHtmlArray: string[] = []

    for (const moduleInfo of modules) {
      const ModuleComponent = getModuleComponent(moduleInfo.moduleId)
      
      if (ModuleComponent) {
        const defaultData = getModuleDefaultData(moduleInfo.moduleId) || {}
        const moduleData = { ...defaultData, ...moduleInfo.data }
        
        try {
          const moduleElement = React.createElement(ModuleComponent, {
            data: moduleData,
            moduleId: moduleInfo.moduleInstanceId,
          })
          
          const moduleHtml = renderToString(moduleElement)
          moduleHtmlArray.push(moduleHtml)
        } catch (error) {
          console.error(`Error rendering module ${moduleInfo.moduleId}:`, error)
          moduleHtmlArray.push(`<div class="module-error">模块 ${moduleInfo.moduleName} 渲染失败</div>`)
        }
      } else {
        moduleHtmlArray.push(`<div class="module-placeholder">模块 ${moduleInfo.moduleName} (${moduleInfo.moduleId})</div>`)
      }
    }

    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>预览 - ${pageConfig.name || params.id}</title>
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
    }
    .module-error {
      padding: 20px;
      background: #fee;
      border: 1px solid #fcc;
      color: #c00;
      margin: 10px 0;
    }
    .module-placeholder {
      padding: 40px;
      background: #f5f5f5;
      border: 2px dashed #ccc;
      text-align: center;
      color: #666;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  ${moduleHtmlArray.join('\n')}
</body>
</html>
    `

    return NextResponse.json({
      success: true,
      html,
    })
  } catch (error) {
    console.error('Generate preview error:', error)
    return NextResponse.json({
      success: false,
      message: '生成预览失败',
    }, { status: 500 })
  }
}