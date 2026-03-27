# API 工具库使用指南

## 概述

`lib/api-utils.ts` 提供了一套统一的 API 底层调用封装，简化了 Next.js API Route 的开发。

## 主要功能

### 1. 统一的响应格式

所有 API 响应都遵循统一格式：

```typescript
{
  code: number,      // HTTP 状态码
  success: boolean,   // 是否成功
  message?: string,   // 可选消息
  data?: T           // 可选数据
}
```

#### 成功响应
```typescript
import { successResponse } from '@/lib/api-utils'

// 返回数据（默认 code: 200）
return successResponse({ users: [...] })

// 返回消息
return successResponse(undefined, '操作成功')

// 返回数据和消息
return successResponse({ id: 1 }, '创建成功')

// 自定义状态码
return successResponse({ id: 1 }, '创建成功', 201)
```

#### 错误响应
```typescript
import { errorResponse, badRequestResponse, unauthorizedResponse, notFoundResponse } from '@/lib/api-utils'

// 通用错误（默认 code: 500）
return errorResponse('服务器错误')

// 自定义错误
return errorResponse('参数不完整', 400)

// 400 错误
return badRequestResponse('参数不完整')

// 401 未授权
return unauthorizedResponse()

// 404 未找到
return notFoundResponse('页面不存在')
```

### 2. 认证检查

#### 基础认证检查
```typescript
import { checkAdminAuth } from '@/lib/api-utils'

export async function GET() {
  const authResult = await checkAdminAuth()
  
  if (!authResult.isAuthenticated) {
    return unauthorizedResponse()
  }
  
  // 使用认证信息
  const username = authResult.username
  const userData = authResult.userData
  
  // ...
}
```

#### 自动认证包装器
```typescript
import { wrapAuthApiHandler } from '@/lib/api-utils'

// 自动处理认证检查
export async function GET() {
  return wrapAuthApiHandler(async (authResult) => {
    // 这里已经通过认证
    const username = authResult.username
    
    // 业务逻辑
    const data = getData()
    
    return successResponse(data)
  })
}
```

### 3. Cookie 管理

```typescript
import { setCookie, getCookie, deleteCookie, parseJsonCookie } from '@/lib/api-utils'

// 设置 Cookie
await setCookie('adminUser', JSON.stringify(userData), {
  maxAge: 60 * 60 * 24 * 7
})

// 获取 Cookie
const cookieValue = await getCookie('adminUser')

// 解析 JSON Cookie
const userData = parseJsonCookie<UserData>(cookieValue)

// 删除 Cookie
await deleteCookie('adminUser')
```

### 4. 工具函数

#### 获取客户端 IP
```typescript
import { getClientIP } from '@/lib/api-utils'

const ip = getClientIP(request)
```

#### 格式化日期时间
```typescript
import { formatDateTime } from '@/lib/api-utils'

const now = formatDateTime()
const formatted = formatDateTime(new Date('2024-01-01'))
```

#### 生成随机 Token
```typescript
import { generateRandomToken } from '@/lib/api-utils'

const token = generateRandomToken(12)
```

### 5. 错误处理包装器

```typescript
import { wrapApiHandler } from '@/lib/api-utils'

// 自动捕获错误并返回统一格式
export async function GET() {
  return wrapApiHandler(async () => {
    // 业务逻辑
    const data = await fetchData()
    
    return successResponse(data)
  })
}
```

## 使用示例

### 示例 1: 简单的 GET 接口

**旧代码:**
```typescript
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { readConfig } from '@/lib/config-manager'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('adminUser')?.value
    
    if (!userCookie) {
      return NextResponse.json({
        success: false,
        message: "未登录"
      }, { status: 401 })
    }
    
    const config = readConfig('site')
    
    return NextResponse.json({
      code: 200,
      data: config
    })
  } catch (error) {
    return NextResponse.json({
      code: 500,
      message: "获取配置失败"
    }, { status: 500 })
  }
}
```

**新代码:**
```typescript
import { wrapAuthApiHandler, successResponse } from '@/lib/api-utils'
import { readConfig } from '@/lib/config-manager'

export async function GET() {
  return wrapAuthApiHandler(async () => {
    const config = readConfig('site')
    return successResponse(config)
  })
}
```

### 示例 2: POST 接口

**旧代码:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { writeConfig } from '@/lib/config-manager'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('adminUser')?.value
    
    if (!userCookie) {
      return NextResponse.json({
        code: 401,
        message: "未登录"
      }, { status: 401 })
    }

    const body = await request.json()
    const { type, data } = body

    if (!type || data === undefined) {
      return NextResponse.json({
        code: 400,
        message: "参数不完整"
      }, { status: 400 })
    }

    writeConfig(type, data)

    return NextResponse.json({
      code: 200,
      message: "配置保存成功"
    })
  } catch (error) {
    return NextResponse.json({
      code: 500,
      message: "配置保存失败"
    }, { status: 500 })
  }
}
```

**新代码:**
```typescript
import { NextRequest } from 'next/server'
import { wrapAuthApiHandler, successResponse, badRequestResponse } from '@/lib/api-utils'
import { writeConfig } from '@/lib/config-manager'

export async function POST(request: NextRequest) {
  return wrapAuthApiHandler(async () => {
    const body = await request.json()
    const { type, data } = body

    if (!type || data === undefined) {
      return badRequestResponse("参数不完整")
    }

    writeConfig(type, data)

    return successResponse(undefined, "配置保存成功")
  })
}
```

### 示例 3: 登录接口

```typescript
import { NextRequest } from 'next/server'
import { successResponse, errorResponse, setCookie, getClientIP, formatDateTime } from '@/lib/api-utils'
import { readConfig, writeConfig } from '@/lib/config-manager'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    // 验证逻辑...
    const accountConfig = readConfig('account')
    const admins = Array.isArray(accountConfig) ? accountConfig : accountConfig.admins || []
    const admin = admins.find((a: any) => a.username === username)

    if (!admin || admin.password !== password) {
      return errorResponse("用户名或密码错误", 401)
    }

    // 更新登录信息
    const currentIP = getClientIP(request)
    const currentTime = formatDateTime()
    
    // 设置 Cookie
    await setCookie('adminUser', JSON.stringify({
      username: admin.username,
      lastLoginTime: currentTime,
      currentLoginIP: currentIP
    }))

    return successResponse({
      user: { username: admin.username }
    }, "登录成功")
  } catch (error) {
    console.error('Login error:', error)
    return errorResponse("登录失败", 500)
  }
}
```

## API 参考

### 响应函数

| 函数 | 说明 | 参数 |
|------|------|------|
| `successResponse(data?, message?)` | 成功响应 | data: 数据, message: 消息 |
| `errorResponse(message, statusCode)` | 错误响应 | message: 错误消息, statusCode: 状态码 |
| `badRequestResponse(message)` | 400 错误 | message: 错误消息 |
| `unauthorizedResponse(message?)` | 401 未授权 | message: 错误消息（默认"未登录"） |
| `notFoundResponse(message?)` | 404 未找到 | message: 错误消息 |

### 认证函数

| 函数 | 说明 | 返回值 |
|------|------|--------|
| `checkAdminAuth()` | 检查管理员认证 | `Promise<AuthResult>` |
| `withAuth(handler)` | 认证包装器 | `Promise<NextResponse>` |
| `wrapAuthApiHandler(handler)` | 完整的认证+错误处理包装器 | `Promise<NextResponse>` |

### Cookie 函数

| 函数 | 说明 | 参数 |
|------|------|------|
| `setCookie(name, value, options?)` | 设置 Cookie | name, value, options |
| `getCookie(name)` | 获取 Cookie | name |
| `deleteCookie(name)` | 删除 Cookie | name |
| `parseJsonCookie(value)` | 解析 JSON Cookie | value |

### 工具函数

| 函数 | 说明 | 返回值 |
|------|------|--------|
| `getClientIP(request)` | 获取客户端 IP | string |
| `formatDateTime(date?)` | 格式化日期时间 | string |
| `generateRandomToken(length?)` | 生成随机 Token | string |
| `wrapApiHandler(handler)` | 错误处理包装器 | Promise |

## 类型定义

```typescript
interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  [key: string]: any
}

interface AuthResult {
  isAuthenticated: boolean
  username?: string
  userData?: any
}
```

## 最佳实践

1. **统一使用工具函数**: 所有 API 接口都应该使用 `api-utils` 提供的函数
2. **使用包装器**: 优先使用 `wrapAuthApiHandler` 来简化认证和错误处理
3. **统一响应格式**: 所有接口返回 `{ success, message?, data? }` 格式
4. **错误处理**: 使用对应的错误响应函数，而不是手动构造 NextResponse
5. **日志记录**: 在 catch 块中记录错误日志

## 迁移指南

### 步骤 1: 导入工具函数
```typescript
import { 
  successResponse, 
  errorResponse, 
  wrapAuthApiHandler 
} from '@/lib/api-utils'
```

### 步骤 2: 替换认证检查
```typescript
// 旧代码
const cookieStore = await cookies()
const userCookie = cookieStore.get('adminUser')?.value
if (!userCookie) {
  return NextResponse.json({ success: false, message: "未登录" }, { status: 401 })
}

// 新代码
return wrapAuthApiHandler(async () => {
  // 自动处理认证
})
```

### 步骤 3: 替换响应格式
```typescript
// 旧代码
return NextResponse.json({ success: true, data: config })

// 新代码
return successResponse(config)
```

### 步骤 4: 简化错误处理
```typescript
// 旧代码
try {
  // ...
} catch (error) {
  return NextResponse.json({ success: false, message: "错误" }, { status: 500 })
}

// 新代码
return wrapApiHandler(async () => {
  // 自动处理错误
})
```
