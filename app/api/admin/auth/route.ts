import { NextRequest } from "next/server"
import { cookies } from "next/headers"
import { successResponse, unauthorizedResponse } from "@/lib/api-utils"
import { readConfig } from "@/lib/config-manager"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const adminUserCookie = cookieStore.get('adminUser')
    
    if (adminUserCookie) {
      const adminUserFromCookie = JSON.parse(adminUserCookie.value)
      
      const accountConfig = readConfig('account')
      const admins = Array.isArray(accountConfig) ? accountConfig : accountConfig.admins || []
      
      const admin = admins.find((a: any) => a.username === adminUserFromCookie.username)
      
      if (admin) {
        const user = {
          username: admin.username,
          remark: admin.remark,
          mustChangePassword: admin.must_change_password,
          lastLoginTime: admin.last_login_time,
          lastLoginIP: admin.last_login_ip,
          currentLoginIP: admin.current_login_ip
        }
        
        return successResponse({
          authenticated: true,
          user
        })
      }
      
      return successResponse({
        authenticated: true,
        user: adminUserFromCookie
      })
    }

    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const sessionId = searchParams.get('sessionId')

    if (token || sessionId) {
      return successResponse({
        authenticated: true,
        user: {
          username: 'admin',
          role: 'admin'
        }
      })
    }

    return unauthorizedResponse()
  } catch (error) {
    return unauthorizedResponse()
  }
}
