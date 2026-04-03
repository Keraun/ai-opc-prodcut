import { NextRequest } from "next/server"
import { successResponse, errorResponse, checkAdminAuth } from "@/lib/api-utils"
import { PromptRepository } from "@/lib/repositories/PromptRepository"

const repository = new PromptRepository()

export async function GET(request: NextRequest) {
  try {
    const authResult = await checkAdminAuth()
    if (!authResult.isAuthenticated) {
      return errorResponse("未授权", 401)
    }

    const prompts = repository.findAll()
    return successResponse(prompts)
  } catch (error) {
    console.error("获取提示词列表失败:", error)
    return errorResponse("获取提示词列表失败")
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await checkAdminAuth()
    if (!authResult.isAuthenticated) {
      return errorResponse("未授权", 401)
    }

    const body = await request.json()
    const { name, prompt_content, is_default = false } = body

    if (!name || !name.trim()) {
      return errorResponse("提示词名称不能为空")
    }

    if (!prompt_content || !prompt_content.trim()) {
      return errorResponse("提示词内容不能为空")
    }

    const prompt = repository.create({
      name: name.trim(),
      prompt_content: prompt_content.trim(),
      is_default
    })

    if (is_default) {
      repository.setDefaultPrompt(prompt.id!)
    }

    return successResponse(prompt)
  } catch (error) {
    console.error("添加提示词失败:", error)
    return errorResponse("添加提示词失败")
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await checkAdminAuth()
    if (!authResult.isAuthenticated) {
      return errorResponse("未授权", 401)
    }

    const body = await request.json()
    const { id, name, prompt_content, is_default } = body

    if (!id) {
      return errorResponse("缺少ID参数")
    }

    const updates: any = {}
    if (name !== undefined) {
      updates.name = name.trim()
    }
    if (prompt_content !== undefined) {
      updates.prompt_content = prompt_content.trim()
    }
    if (is_default !== undefined) {
      updates.is_default = is_default
    }

    const success = repository.update(id, updates)
    if (!success) {
      return errorResponse("提示词不存在")
    }

    if (is_default) {
      repository.setDefaultPrompt(id)
    }

    const updatedPrompt = repository.findById(id)
    return successResponse(updatedPrompt)
  } catch (error) {
    console.error("更新提示词失败:", error)
    return errorResponse("更新提示词失败")
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await checkAdminAuth()
    if (!authResult.isAuthenticated) {
      return errorResponse("未授权", 401)
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return errorResponse("缺少ID参数")
    }

    const success = repository.delete(parseInt(id))
    if (!success) {
      return errorResponse("提示词不存在")
    }

    return successResponse({ message: "删除成功" })
  } catch (error) {
    console.error("删除提示词失败:", error)
    return errorResponse("删除提示词失败")
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await checkAdminAuth()
    if (!authResult.isAuthenticated) {
      return errorResponse("未授权", 401)
    }

    const body = await request.json()
    const { id } = body

    if (!id) {
      return errorResponse("缺少ID参数")
    }

    const success = repository.setDefaultPrompt(id)
    if (!success) {
      return errorResponse("设置默认提示词失败")
    }

    const defaultPrompt = repository.findDefaultPrompt()
    return successResponse(defaultPrompt)
  } catch (error) {
    console.error("设置默认提示词失败:", error)
    return errorResponse("设置默认提示词失败")
  }
}
