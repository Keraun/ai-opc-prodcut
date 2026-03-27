import { NextRequest, NextResponse } from 'next/server'
import { readConfig, writeConfig } from '@/lib/config-manager'

// 获取账号列表
export async function GET() {
  try {
    const accounts = readConfig('account') || []
    return NextResponse.json({ success: true, accounts })
  } catch (error) {
    console.error('获取账号列表失败:', error)
    return NextResponse.json({ success: false, message: '获取账号列表失败' }, { status: 500 })
  }
}

// 新增账号
export async function POST(request: NextRequest) {
  try {
    const newAccount = await request.json()
    
    // 验证参数
    if (!newAccount.username || !newAccount.password || !newAccount.email) {
      return NextResponse.json({ success: false, message: '用户名、密码和邮箱不能为空' }, { status: 400 })
    }
    
    // 读取现有账号
    const accounts = readConfig('account') || []
    
    // 检查用户名是否已存在
    const existingAccount = accounts.find((account: any) => account.username === newAccount.username)
    if (existingAccount) {
      return NextResponse.json({ success: false, message: '用户名已存在' }, { status: 400 })
    }
    
    // 添加新账号
    const account = {
      ...newAccount,
      mustChangePassword: false,
      lastLoginTime: new Date().toLocaleString('zh-CN'),
      lastLoginIP: request.ip || '',
      currentLoginIP: request.ip || '',
      currentLoginTime: new Date().toLocaleString('zh-CN')
    }
    
    accounts.push(account)
    writeConfig('account', accounts)
    
    return NextResponse.json({ success: true, message: '账号添加成功' })
  } catch (error) {
    console.error('新增账号失败:', error)
    return NextResponse.json({ success: false, message: '新增账号失败' }, { status: 500 })
  }
}

// 删除账号
export async function DELETE(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url)
    const username = pathname.split('/').pop()
    
    if (!username) {
      return NextResponse.json({ success: false, message: '用户名不能为空' }, { status: 400 })
    }
    
    // 检查是否为默认admin账户
    if (username === 'admin') {
      return NextResponse.json({ success: false, message: '默认admin账户不可删除' }, { status: 400 })
    }
    
    // 读取现有账号
    const accounts = readConfig('account') || []
    
    // 检查账号是否存在
    const accountIndex = accounts.findIndex((account: any) => account.username === username)
    if (accountIndex === -1) {
      return NextResponse.json({ success: false, message: '账号不存在' }, { status: 404 })
    }
    
    // 检查是否为最后一个账号
    if (accounts.length === 1) {
      return NextResponse.json({ success: false, message: '至少需要保留一个账号' }, { status: 400 })
    }
    
    // 删除账号
    accounts.splice(accountIndex, 1)
    writeConfig('account', accounts)
    
    return NextResponse.json({ success: true, message: '账号删除成功' })
  } catch (error) {
    console.error('删除账号失败:', error)
    return NextResponse.json({ success: false, message: '删除账号失败' }, { status: 500 })
  }
}

// 修改账号
export async function PUT(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url)
    const username = pathname.split('/').pop()
    
    if (!username) {
      return NextResponse.json({ success: false, message: '用户名不能为空' }, { status: 400 })
    }
    
    const updatedAccount = await request.json()
    
    // 验证参数
    if (!updatedAccount.email) {
      return NextResponse.json({ success: false, message: '邮箱不能为空' }, { status: 400 })
    }
    
    // 读取现有账号
    const accounts = readConfig('account') || []
    
    // 检查账号是否存在
    const accountIndex = accounts.findIndex((account: any) => account.username === username)
    if (accountIndex === -1) {
      return NextResponse.json({ success: false, message: '账号不存在' }, { status: 404 })
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
    
    return NextResponse.json({ success: true, message: '账号修改成功' })
  } catch (error) {
    console.error('修改账号失败:', error)
    return NextResponse.json({ success: false, message: '修改账号失败' }, { status: 500 })
  }
}
