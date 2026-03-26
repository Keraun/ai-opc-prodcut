import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { cookies } from "next/headers"
import { logOperation } from "@/lib/operation-logger"
import { readConfig, writeConfig } from "@/lib/config-manager"

function generateSuperAdminToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return Buffer.from(result).toString('base64')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    const accountConfig = readConfig('account')

    // 兼容两种格式：数组格式和 { admins: [...] } 对象格式
    const admins = Array.isArray(accountConfig) ? accountConfig : accountConfig.admins || []

    const adminIndex = admins.findIndex((admin: any) => admin.username === username)

    if (adminIndex === -1) {
      return NextResponse.json({
        success: false,
        message: "用户名不存在"
      }, { status: 401 })
    }

    const admin = admins[adminIndex]

    if (admin.password !== password) {
      return NextResponse.json({
        success: false,
        message: "密码错误"
      }, { status: 401 })
    }

    const requireEmailSetup = !admin.email

    if (requireEmailSetup) {
      const cookieStore = await cookies()
      const userData = {
        username: admin.username,
        remark: admin.remark,
        mustChangePassword: admin.mustChangePassword
      }
      
      cookieStore.set('adminUser', JSON.stringify(userData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7
      })

      return NextResponse.json({
        success: true,
        requireEmailSetup: true,
        user: userData
      })
    }

    const currentIP = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown'
    
    const currentTime = new Date().toLocaleString('zh-CN', { 
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })

    const lastLoginTime = admin.currentLoginTime || admin.lastLoginTime || ''
    const lastLoginIP = admin.currentLoginIP || admin.lastLoginIP || ''

    // 更新管理员登录信息
    admins[adminIndex].lastLoginTime = lastLoginTime
    admins[adminIndex].lastLoginIP = lastLoginIP
    admins[adminIndex].currentLoginIP = currentIP
    admins[adminIndex].currentLoginTime = currentTime

    let showSuperAdminToken = false
    let superAdminToken = ''

    const tokenConfigPath = path.join(process.cwd(), "database/runtime/system/system-token.json")
    let tokenConfig = { superAdminToken: '' }
    
    try {
      tokenConfig = JSON.parse(fs.readFileSync(tokenConfigPath, "utf-8"))
    } catch (error) {
      tokenConfig = { superAdminToken: '' }
    }

    if (!tokenConfig.superAdminToken) {
      superAdminToken = generateSuperAdminToken()
      tokenConfig.superAdminToken = superAdminToken
      showSuperAdminToken = true
      fs.writeFileSync(tokenConfigPath, JSON.stringify(tokenConfig, null, 2))
    } else {
      superAdminToken = tokenConfig.superAdminToken
    }

    // 保存时保持原有格式（数组格式）
    writeConfig('account', admins)

    logOperation(admin.username, 'login', '管理员登录', currentIP)

    const cookieStore = await cookies()
    const userData = {
      username: admin.username,
      remark: admin.remark,
      mustChangePassword: admin.mustChangePassword,
      lastLoginTime: lastLoginTime,
      lastLoginIP: lastLoginIP,
      currentLoginIP: currentIP
    }
    
    cookieStore.set('adminUser', JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    })

    return NextResponse.json({
      success: true,
      mustChangePassword: admin.mustChangePassword,
      user: userData,
      showSuperAdminToken,
      superAdminToken: showSuperAdminToken ? superAdminToken : undefined
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "登录失败"
    }, { status: 500 })
  }
}
