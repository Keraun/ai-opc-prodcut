import { NextRequest } from "next/server"
import { successResponse, errorResponse, checkAdminAuth } from "@/lib/api-utils"
import { LLMModelRepository } from "@/lib/repositories/LLMModelRepository"

const repository = new LLMModelRepository()

export async function GET(request: NextRequest) {
  try {
    const authResult = await checkAdminAuth()
    if (!authResult.authenticated) {
      return errorResponse("未授权", 401)
    }

    const models = repository.findAll()
    return successResponse(models)
  } catch (error) {
    console.error("获取大模型列表失败:", error)
    return errorResponse("获取大模型列表失败")
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await checkAdminAuth()
    if (!authResult.authenticated) {
      return errorResponse("未授权", 401)
    }

    const body = await request.json()
    const { name, value, is_default = false } = body

    if (!name || !name.trim() || !value || !value.trim()) {
      return errorResponse("模型名称和值不能为空")
    }

    const model = repository.create({
      name: name.trim(),
      value: value.trim(),
      is_default
    })

    if (is_default) {
      repository.setDefaultModel(model.id!)
    }

    return successResponse(model)
  } catch (error) {
    console.error("添加大模型失败:", error)
    return errorResponse("添加大模型失败")
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await checkAdminAuth()
    if (!authResult.authenticated) {
      return errorResponse("未授权", 401)
    }

    const body = await request.json()
    const { id, name, value, is_default } = body

    if (!id || (!name && !value && is_default === undefined)) {
      return errorResponse("缺少必要参数")
    }

    const updates: any = {}
    if (name !== undefined) {
      updates.name = name.trim()
    }
    if (value !== undefined) {
      updates.value = value.trim()
    }
    if (is_default !== undefined) {
      updates.is_default = is_default
    }

    const success = repository.update(id, updates)
    if (!success) {
      return errorResponse("模型不存在")
    }

    if (is_default) {
      repository.setDefaultModel(id)
    }

    const updatedModel = repository.findById(id)
    return successResponse(updatedModel)
  } catch (error) {
    console.error("更新大模型失败:", error)
    return errorResponse("更新大模型失败")
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await checkAdminAuth()
    if (!authResult.authenticated) {
      return errorResponse("未授权", 401)
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return errorResponse("缺少ID参数")
    }

    const success = repository.delete(parseInt(id))
    if (!success) {
      return errorResponse("模型不存在")
    }

    return successResponse({ message: "删除成功" })
  } catch (error) {
    console.error("删除大模型失败:", error)
    return errorResponse("删除大模型失败")
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await checkAdminAuth()
    if (!authResult.authenticated) {
      return errorResponse("未授权", 401)
    }

    const body = await request.json()
    const { id } = body

    if (!id) {
      return errorResponse("缺少ID参数")
    }

    const success = repository.setDefaultModel(id)
    if (!success) {
      return errorResponse("设置默认模型失败")
    }

    const defaultModel = repository.findDefaultModel()
    return successResponse(defaultModel)
  } catch (error) {
    console.error("设置默认模型失败:", error)
    return errorResponse("设置默认模型失败")
  }
}
