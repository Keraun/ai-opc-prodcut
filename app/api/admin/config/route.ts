import { NextRequest } from "next/server"
import { readConfig, writeConfig, readAllConfigs } from "@/lib/config-manager"
import { 
  wrapAuthApiHandler, 
  successResponse, 
  badRequestResponse 
} from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  return wrapAuthApiHandler(async () => {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    
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
