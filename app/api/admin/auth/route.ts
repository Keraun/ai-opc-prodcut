import { NextRequest } from "next/server"
import { cookies } from "next/headers"
import { successResponse, unauthorizedResponse } from "@/lib/api-utils"
import { readConfig } from "@/lib/config-manager"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const adminUserCookie = cookieStore.get('adminUser')

    console.log('[Auth Check] Cookie exists:', !!adminUserCookie)
    
    if (adminUserCookie) {
      const adminUserFromCookie = JSON.parse(adminUserCookie.value)
      console.log('[Auth Check] Cookie value:', adminUserFromCookie)
      
      const accountConfig = readConfig('account')
      const admins = Array.isArray(accountConfig) ? accountConfig : accountConfig.admins || []
      
      const admin = admins.find((a: any) => a.username === adminUserFromCookie.username)
      
      console.log('[Auth Check] Admin found:', !!admin)
      
      if (admin) {
        const user = {
          username: admin.username,
          remark: admin.remark,
          mustChangePassword: admin.must_change_password,
          lastLoginTime: admin.last_login_time,
          lastLoginIP: admin.last_login_ip,
          currentLoginIP: admin.current_login_ip
        }
        
        console.log('[Auth Check] Returning authenticated user:', user)
        
        return successResponse({
          authenticated: true,
          user
        })
      }
      
      const user = {
        username: adminUserFromCookie.username,
        remark: adminUserFromCookie.remark,
        mustChangePassword: adminUserFromCookie.mustChangePassword || false,
        lastLoginTime: adminUserFromCookie.lastLoginTime,
        lastLoginIP: adminUserFromCookie.lastLoginIP,
        currentLoginIP: adminUserFromCookie.currentLoginIP
      }
      
      console.log('[Auth Check] Returning user from cookie:', user)
      
      return successResponse({
        authenticated: true,
        user
      })
    }

    console.log('[Auth Check] No cookie found, returning unauthorized')

    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const sessionId = searchParams.get('sessionId')

    if (token || sessionId) {
      return successResponse({
        authenticated: true,
        user: {
          username: 'admin',
          role: 'admin',
          mustChangePassword: false
        }
      })
    }

    return unauthorizedResponse()
  } catch (error) {
    console.error('[Auth Check] Error:', error)
    return unauthorizedResponse()
  }
}
