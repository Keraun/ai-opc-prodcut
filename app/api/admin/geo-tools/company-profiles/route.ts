import { NextRequest } from "next/server"
import { successResponse, errorResponse, checkAdminAuth } from "@/lib/api-utils"
import { CompanyProfileRepository } from "@/lib/repositories/CompanyProfileRepository"

const repository = new CompanyProfileRepository()

export async function GET(request: NextRequest) {
  try {
    const authResult = await checkAdminAuth()
    if (!authResult.authenticated) {
      return errorResponse("未授权", 401)
    }

    const profiles = repository.findAll()
    return successResponse(profiles)
  } catch (error) {
    console.error("获取企业画像列表失败:", error)
    return errorResponse("获取企业画像列表失败")
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await checkAdminAuth()
    if (!authResult.authenticated) {
      return errorResponse("未授权", 401)
    }

    const body = await request.json()
    const { name, company_name, industry, company_advantages, key_data, is_default = false } = body

    if (!name || !name.trim()) {
      return errorResponse("画像名称不能为空")
    }

    if (!company_name || !company_name.trim()) {
      return errorResponse("企业名称不能为空")
    }

    if (!industry || !industry.trim()) {
      return errorResponse("所属行业不能为空")
    }

    const profile = repository.create({
      name: name.trim(),
      company_name: company_name.trim(),
      industry: industry.trim(),
      company_advantages: company_advantages?.trim() || "",
      key_data: key_data?.trim() || "",
      is_default
    })

    if (is_default) {
      repository.setDefaultProfile(profile.id!)
    }

    return successResponse(profile)
  } catch (error) {
    console.error("添加企业画像失败:", error)
    return errorResponse("添加企业画像失败")
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await checkAdminAuth()
    if (!authResult.authenticated) {
      return errorResponse("未授权", 401)
    }

    const body = await request.json()
    const { id, name, company_name, industry, company_advantages, key_data, is_default } = body

    if (!id) {
      return errorResponse("缺少ID参数")
    }

    const updates: any = {}
    if (name !== undefined) {
      updates.name = name.trim()
    }
    if (company_name !== undefined) {
      updates.company_name = company_name.trim()
    }
    if (industry !== undefined) {
      updates.industry = industry.trim()
    }
    if (company_advantages !== undefined) {
      updates.company_advantages = company_advantages.trim()
    }
    if (key_data !== undefined) {
      updates.key_data = key_data.trim()
    }
    if (is_default !== undefined) {
      updates.is_default = is_default
    }

    const success = repository.update(id, updates)
    if (!success) {
      return errorResponse("企业画像不存在")
    }

    if (is_default) {
      repository.setDefaultProfile(id)
    }

    const updatedProfile = repository.findById(id)
    return successResponse(updatedProfile)
  } catch (error) {
    console.error("更新企业画像失败:", error)
    return errorResponse("更新企业画像失败")
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
      return errorResponse("企业画像不存在")
    }

    return successResponse({ message: "删除成功" })
  } catch (error) {
    console.error("删除企业画像失败:", error)
    return errorResponse("删除企业画像失败")
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await checkAdminAuth()
    if (!authResult.authenticated) {
      return errorResponse("未授权", 401)
    }

    const body = await request.json()
    const { id, cancelDefault } = body

    if (!id) {
      return errorResponse("缺少ID参数")
    }

    if (cancelDefault) {
      const success = repository.cancelDefaultProfile(id)
      if (!success) {
        return errorResponse("取消默认企业画像失败")
      }
      return successResponse({ message: "取消默认成功" })
    }

    const success = repository.setDefaultProfile(id)
    if (!success) {
      return errorResponse("设置默认企业画像失败")
    }

    const defaultProfile = repository.findDefaultProfile()
    return successResponse(defaultProfile)
  } catch (error) {
    console.error("设置默认企业画像失败:", error)
    return errorResponse("设置默认企业画像失败")
  }
}
