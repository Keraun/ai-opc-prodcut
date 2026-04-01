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
    
    // 新增账号只能是操作员角色
    const account = {
      ...newAccount,
      role: 'operator', // 强制设置为操作员角色
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

// 更新账号
export async function PUT(request: NextRequest, { params }: { params: { username: string } }) {
  try {
    const { username } = params
    const updatedData = await request.json()
    
    // 读取现有账号
    const accounts = readConfig('account') || []
    
    // 找到要更新的账号
    const accountIndex = accounts.findIndex((account: any) => account.username === username)
    if (accountIndex === -1) {
      return badRequestResponse('账号不存在')
    }
    
    const targetAccount = accounts[accountIndex]
    
    // 检查是否是超管账号
    if (targetAccount.isSuperAdmin) {
      // 超管账号只能自己修改自己的密码
      // 这里需要通过cookie或其他方式获取当前登录用户
      // 简化处理：不允许通过账号管理界面修改超管账号的密码
      return badRequestResponse('超管账号不能通过账号管理界面修改密码')
    }
    
    // 更新账号信息
    const updatedAccount = {
      ...targetAccount,
      ...updatedData,
      updated_at: new Date().toISOString()
    }
    
    accounts[accountIndex] = updatedAccount
    writeConfig('account', accounts)
    
    return successResponse(null, '账号更新成功')
  } catch (error) {
    console.error('更新账号失败:', error)
    return errorResponse('更新账号失败')
  }
}

// 删除账号
export async function DELETE(request: NextRequest, { params }: { params: { username: string } }) {
  try {
    const { username } = params
    
    // 读取现有账号
    const accounts = readConfig('account') || []
    
    // 找到要删除的账号
    const accountIndex = accounts.findIndex((account: any) => account.username === username)
    if (accountIndex === -1) {
      return badRequestResponse('账号不存在')
    }
    
    const targetAccount = accounts[accountIndex]
    
    // 不允许删除超管账号
    if (targetAccount.isSuperAdmin) {
      return badRequestResponse('不能删除超管账号')
    }
    
    // 删除账号
    accounts.splice(accountIndex, 1)
    writeConfig('account', accounts)
    
    return successResponse(null, '账号删除成功')
  } catch (error) {
    console.error('删除账号失败:', error)
    return errorResponse('删除账号失败')
  }
}
