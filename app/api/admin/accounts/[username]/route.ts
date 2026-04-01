import { NextRequest } from 'next/server'
import { readConfig, writeConfig } from '@/lib/config-manager'
import { successResponse, errorResponse, badRequestResponse, notFoundResponse, getCookie } from '@/lib/api-utils'

// 删除账号
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    
    if (!username) {
      return badRequestResponse('用户名不能为空')
    }
    
    // 检查是否为默认admin账户
    if (username === 'admin') {
      return badRequestResponse('默认管理员账户不可删除')
    }
    
    // 获取当前登录用户信息
    const adminUserCookie = await getCookie('adminUser', request)
    let currentUser = null
    if (adminUserCookie) {
      try {
        currentUser = JSON.parse(adminUserCookie)
      } catch (error) {
        console.error('解析用户信息失败:', error)
      }
    }
    
    // 检查是否为当前登录用户自己的账号
    if (currentUser && currentUser.username === username) {
      return badRequestResponse('不能删除自己的账号')
    }
    
    // 读取现有账号
    const accounts = readConfig('account') || []
    
    // 检查账号是否存在
    const accountIndex = accounts.findIndex((account: any) => account.username === username)
    if (accountIndex === -1) {
      return notFoundResponse('账号不存在')
    }
    
    // 检查是否为最后一个账号
    if (accounts.length === 1) {
      return badRequestResponse('至少需要保留一个账号')
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

// 修改账号
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    
    if (!username) {
      return badRequestResponse('用户名不能为空')
    }
    
    const updatedAccount = await request.json()
    
    // 读取现有账号
    const accounts = readConfig('account') || []
    
    // 检查账号是否存在
    const accountIndex = accounts.findIndex((account: any) => account.username === username)
    if (accountIndex === -1) {
      return notFoundResponse('账号不存在')
    }
    
    // 更新账号信息
    const account = accounts[accountIndex]
    accounts[accountIndex] = {
      ...account,
      email: updatedAccount.email,
      remark: updatedAccount.remark || ''
    }
    
    // 如果提供了密码，则更新密码
    if (updatedAccount.password) {
      accounts[accountIndex].password = updatedAccount.password
    }
    
    writeConfig('account', accounts)
    
    return successResponse(null, '账号修改成功')
  } catch (error) {
    console.error('修改账号失败:', error)
    return errorResponse('修改账号失败')
  }
}
