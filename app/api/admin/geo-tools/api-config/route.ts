import { NextRequest } from "next/server"
import { successResponse, errorResponse, checkAdminAuth } from "@/lib/api-utils"
import { SystemConfigRepository } from "@/lib/repositories/SystemConfigRepository"

const CONFIG_KEY = "geo_config"
const repository = new SystemConfigRepository()

export async function GET(request: NextRequest) {
  try {
    const authResult = await checkAdminAuth()
    if (!authResult.isAuthenticated) {
      return errorResponse("未授权", 401)
    }

    const config = repository.getValue(CONFIG_KEY, {
      apiKey: "",
      baseUrl: "https://api.siliconflow.cn/v1",
    })

    return successResponse(config)
  } catch (error) {
    console.error("获取API配置失败:", error)
    return errorResponse("获取配置失败")
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await checkAdminAuth()
    if (!authResult.isAuthenticated) {
      return errorResponse("未授权", 401)
    }

    const body = await request.json()
    const { apiKey, baseUrl } = body

    const config = {
      apiKey: apiKey?.trim() || "",
      baseUrl: baseUrl?.trim() || "https://api.siliconflow.cn/v1",
    }

    repository.setValue(CONFIG_KEY, config)

    return successResponse({ message: "配置保存成功" })
  } catch (error) {
    console.error("保存API配置失败:", error)
    return errorResponse("保存配置失败")
  }
}
