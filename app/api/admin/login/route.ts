import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    const accountConfigPath = path.join(process.cwd(), "config/json/account.json")
    const accountConfig = JSON.parse(fs.readFileSync(accountConfigPath, "utf-8"))

    const adminIndex = accountConfig.admins?.findIndex((admin: any) => admin.username === username)

    if (adminIndex === -1 || adminIndex === undefined) {
      return NextResponse.json({
        success: false,
        message: "用户名或密码错误"
      }, { status: 401 })
    }

    const admin = accountConfig.admins[adminIndex]

    if (admin.password !== password) {
      return NextResponse.json({
        success: false,
        message: "用户名或密码错误"
      }, { status: 401 })
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

    accountConfig.admins[adminIndex].lastLoginTime = lastLoginTime
    accountConfig.admins[adminIndex].lastLoginIP = lastLoginIP
    accountConfig.admins[adminIndex].currentLoginIP = currentIP
    accountConfig.admins[adminIndex].currentLoginTime = currentTime

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
      user: userData
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "登录失败"
    }, { status: 500 })
  }
}
