import { NextRequest } from 'next/server'
import { readConfig, writeConfig } from '@/lib/config-manager'
import { successResponse, errorResponse, badRequestResponse } from '@/lib/api-utils'

// 获取账号列表
export async function GET() {
  try {
    const accounts = readConfig('account') || []
    return successResponse(accounts)
  } catch (error) {
    console.error('获取账号列表失败:', error)
    return errorResponse('获取账号列表失败')
  }
}

// 新增账号
export async function POST(request: NextRequest) {
  try {
    const newAccount = await request.json()
    
    // 验证参数
    if (!newAccount.username || !newAccount.password) {
      return badRequestResponse('用户名和密码不能为空')
    }
    
    // 读取现有账号
    const accounts = readConfig('account') || []
    
    // 检查用户名是否已存在
    const existingAccount = accounts.find((account: any) => account.username === newAccount.username)
    if (existingAccount) {
      return badRequestResponse('用户名已存在')
    }
    
    // 添加新账号
    const account = {
      ...newAccount,
      must_change_password: false,
      last_login_time: new Date().toLocaleString('zh-CN'),
      last_login_ip: request.ip || '',
      current_login_ip: request.ip || '',
      current_login_time: new Date().toLocaleString('zh-CN')
    }
    
    accounts.push(account)
    writeConfig('account', accounts)
    
    return successResponse(null, '账号添加成功', 201)
  } catch (error) {
    console.error('新增账号失败:', error)
    return errorResponse('新增账号失败')
  }
}
