import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { successResponse, unauthorizedResponse } from "@/lib/api-utils"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const adminUserCookie = cookieStore.get('adminUser')
    
    if (!adminUserCookie) {
      return unauthorizedResponse()
    }

    const adminUser = JSON.parse(adminUserCookie.value)
    
    return successResponse({
      authenticated: true,
      user: adminUser
    })
  } catch (error) {
    return unauthorizedResponse()
  }
}
