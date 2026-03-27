import { successResponse, deleteCookie } from "@/lib/api-utils"

export async function POST() {
  await deleteCookie('adminUser')
  return successResponse(undefined, "退出成功")
}
