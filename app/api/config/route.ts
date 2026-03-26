import { NextRequest, NextResponse } from "next/server"
import fs from 'fs'
import path from 'path'

function loadConfigs() {
  const configPath = path.join(process.cwd(), 'config')
  const configs: Record<string, any> = {}

  try {
    const files = fs.readdirSync(configPath)
    files.forEach(file => {
      if (file.endsWith('.json')) {
        const filePath = path.join(configPath, file)
        const content = fs.readFileSync(filePath, 'utf8')
        const key = file.replace('.json', '')
        configs[key] = JSON.parse(content)
      }
    })
  } catch (error) {
    console.error('Error loading configs:', error)
  }

  return configs
}

export async function GET(request: NextRequest) {
  try {
    const configs = loadConfigs()
    return NextResponse.json(configs)
  } catch (error) {
    console.error("Config API error:", error)
    return NextResponse.json({
      success: false,
      message: "获取配置失败"
    }, { status: 500 })
  }
}
