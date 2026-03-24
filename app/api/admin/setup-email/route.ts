import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { cookies } from "next/headers"

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
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('adminUser')
    
    if (!userCookie) {
      return NextResponse.json({
        success: false,
        message: "未授权"
      }, { status: 401 })
    }

    const userData = JSON.parse(userCookie.value)
    const body = await request.json()
    const { email } = body

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({
        success: false,
        message: "请输入有效的邮箱地址"
      }, { status: 400 })
    }

    const accountConfigPath = path.join(process.cwd(), "config/json/account.json")
    const accountConfig = JSON.parse(fs.readFileSync(accountConfigPath, "utf-8"))

    const adminIndex = accountConfig.admins?.findIndex((admin: any) => admin.username === userData.username)

    if (adminIndex === -1 || adminIndex === undefined) {
      return NextResponse.json({
        success: false,
        message: "用户不存在"
      }, { status: 404 })
    }

    accountConfig.admins[adminIndex].email = email

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

    const admin = accountConfig.admins[adminIndex]
    const lastLoginTime = admin.currentLoginTime || admin.lastLoginTime || ''
    const lastLoginIP = admin.currentLoginIP || admin.lastLoginIP || ''

    accountConfig.admins[adminIndex].lastLoginTime = lastLoginTime
    accountConfig.admins[adminIndex].lastLoginIP = lastLoginIP
    accountConfig.admins[adminIndex].currentLoginIP = currentIP
    accountConfig.admins[adminIndex].currentLoginTime = currentTime

    let showSuperAdminToken = false
    let superAdminToken = ''

    if (!accountConfig.superAdminToken) {
      superAdminToken = generateSuperAdminToken()
      accountConfig.superAdminToken = superAdminToken
      showSuperAdminToken = true
    }

    fs.writeFileSync(accountConfigPath, JSON.stringify(accountConfig, null, 2))

    const loginLogsPath = path.join(process.cwd(), "config/json/login-logs.json")
    const loginLogs = JSON.parse(fs.readFileSync(loginLogsPath, "utf-8"))
    
    loginLogs.logs.unshift({
      username: admin.username,
      loginTime: currentTime,
      loginIP: currentIP,
      id: Date.now()
    })
    
    if (loginLogs.logs.length > 100) {
      loginLogs.logs = loginLogs.logs.slice(0, 100)
    }
    
    fs.writeFileSync(loginLogsPath, JSON.stringify(loginLogs, null, 2))

    const updatedUserData = {
      username: admin.username,
      remark: admin.remark,
      mustChangePassword: admin.mustChangePassword,
      lastLoginTime: lastLoginTime,
      lastLoginIP: lastLoginIP,
      currentLoginIP: currentIP
    }
    
    cookieStore.set('adminUser', JSON.stringify(updatedUserData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    })

    return NextResponse.json({
      success: true,
      showSuperAdminToken,
      superAdminToken: showSuperAdminToken ? superAdminToken : undefined
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "邮箱设置失败"
    }, { status: 500 })
  }
}
