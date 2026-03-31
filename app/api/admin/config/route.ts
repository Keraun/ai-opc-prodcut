import { NextRequest, NextResponse } from "next/server"
import { readConfig, writeConfig, readAllConfigs, getRuntimePath } from "@/lib/config-manager"
import { 
  wrapAuthApiHandler, 
  successResponse, 
  badRequestResponse, 
  errorResponse,
  withAuth
} from "@/lib/api-utils"
import fs from 'fs'
import path from 'path'
import AdmZip from 'adm-zip'

export async function GET(request: NextRequest) {
  return withAuth(async () => {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const action = searchParams.get('action')
    
    if (action === 'export') {
      // 导出配置
      try {
        const runtimeDir = path.join(process.cwd(), 'database', 'runtime')
        
        // 使用 adm-zip 创建 zip 文件
        const zip = new AdmZip()
        zip.addLocalFolder(runtimeDir)
        
        const zipBuffer = zip.toBuffer()
        
        return new NextResponse(zipBuffer, {
          headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename=config-export-${new Date().toISOString().split('T')[0]}.zip`
          }
        }) as any
      } catch (error) {
        console.error('导出配置失败:', error)
        return errorResponse('导出配置失败')
      }
    }
    
    if (type) {
      const config = readConfig(type)
      return successResponse(config)
    }
    
    const configs = readAllConfigs()
    return successResponse(configs)
  })
}

export async function POST(request: NextRequest) {
  return wrapAuthApiHandler(async () => {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    if (action === 'import') {
      // 导入配置
      try {
        const formData = await request.formData()
        const file = formData.get('file') as File
        
        if (!file) {
          return badRequestResponse('请选择要导入的文件')
        }
        
        const runtimeDir = path.join(process.cwd(), 'database', 'runtime')
        
        // 确保runtime目录存在
        if (!fs.existsSync(runtimeDir)) {
          fs.mkdirSync(runtimeDir, { recursive: true })
        }
        
        // 读取文件内容
        const fileBuffer = Buffer.from(await file.arrayBuffer())
        
        // 使用 adm-zip 解压文件到runtime目录
        const zip = new AdmZip(fileBuffer)
        zip.extractAllTo(runtimeDir, true)
        
        return successResponse(undefined, '配置导入成功')
      } catch (error) {
        console.error('导入配置失败:', error)
        return errorResponse('导入配置失败')
      }
    }
    
    const body = await request.json()
    const { type, data } = body

    if (!type || data === undefined) {
      return badRequestResponse("参数不完整")
    }

    writeConfig(type, data)
    console.log(`Config updated: ${type}`)

    return successResponse(undefined, "配置保存成功")
  })
}
