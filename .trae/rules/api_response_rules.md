# API 响应格式规则

本文档定义了项目中所有 API 接口的统一响应格式规则。

## 统一响应格式

### 成功响应格式

所有 API 接口必须返回以下统一格式：

```json
{
  "code": 200,
  "success": true,
  "message": "操作成功",
  "data": {
    // 具体数据
  }
}
```

### 错误响应格式

```json
{
  "code": 400,
  "success": false,
  "message": "参数不完整",
  "data": null
}
```

## 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `code` | number | 是 | HTTP 状态码 |
| `success` | boolean | 是 | 是否成功 |
| `message` | string | 是 | 提示信息（成功时返回空字符串，失败时返回错误信息） |
| `data` | any | 是 | 响应数据（成功时返回数据，失败时返回 null） |

## HTTP 状态码规范

### 成功状态码

| 状态码 | 说明 | 使用场景 |
|--------|------|----------|
| 200 | OK | 请求成功，返回数据 |
| 201 | Created | 资源创建成功 |
| 204 | No Content | 删除成功，无返回内容 |

### 客户端错误状态码

| 状态码 | 说明 | 使用场景 |
|--------|------|----------|
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未登录或认证失败 |
| 403 | Forbidden | 无权限访问 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突（如已存在） |
| 422 | Unprocessable Entity | 验证失败 |

### 服务端错误状态码

| 状态码 | 说明 | 使用场景 |
|--------|------|----------|
| 500 | Internal Server Error | 服务器内部错误 |
| 502 | Bad Gateway | 网关错误 |
| 503 | Service Unavailable | 服务不可用 |

## API 工具库使用

项目已封装了统一的 API 工具库，位于 `lib/api-utils.ts`。

### 成功响应

```typescript
import { successResponse } from '@/lib/api-utils'

// 返回数据（默认 200）
return successResponse(data)

// 返回数据和消息
return successResponse(data, '操作成功')

// 自定义状态码
return successResponse(data, '创建成功', 201)

// 只返回消息
return successResponse(undefined, '操作成功')
```

### 错误响应

```typescript
import { 
  errorResponse, 
  badRequestResponse, 
  unauthorizedResponse, 
  notFoundResponse 
} from '@/lib/api-utils'

// 通用错误（默认 500）
return errorResponse('服务器错误')

// 自定义错误
return errorResponse('参数不完整', 400)

// 400 错误
return badRequestResponse('参数不完整')

// 401 未授权
return unauthorizedResponse()
return unauthorizedResponse('未登录')

// 404 未找到
return notFoundResponse('页面不存在')
```

### 认证包装器

```typescript
import { wrapAuthApiHandler, successResponse } from '@/lib/api-utils'

export async function GET() {
  return wrapAuthApiHandler(async (authResult) => {
    // 这里已经通过认证
    const username = authResult.username
    
    const data = getData()
    return successResponse(data)
  })
}
```

### 错误处理包装器

```typescript
import { wrapApiHandler, successResponse } from '@/lib/api-utils'

export async function GET() {
  return wrapApiHandler(async () => {
    const data = getData()
    return successResponse(data)
  })
}
```

## 响应示例

### 成功响应示例

#### 1. 登录成功

```json
{
  "code": 200,
  "success": true,
  "message": "登录成功",
  "data": {
    "user": {
      "username": "admin",
      "lastLoginTime": "2024-01-01 12:00:00",
      "currentLoginIP": "127.0.0.1"
    }
  }
}
```

#### 2. 获取配置成功

```json
{
  "code": 200,
  "success": true,
  "message": "",
  "data": {
    "name": "站点名称",
    "description": "站点描述",
    "url": "https://example.com"
  }
}
```

#### 3. 创建页面成功

```json
{
  "code": 201,
  "success": true,
  "message": "页面创建成功",
  "data": {
    "pageId": "home"
  }
}
```

### 错误响应示例

#### 1. 参数错误

```json
{
  "code": 400,
  "success": false,
  "message": "页面名称和路径不能为空",
  "data": null
}
```

#### 2. 未登录

```json
{
  "code": 401,
  "success": false,
  "message": "未登录",
  "data": null
}
```

#### 3. 资源不存在

```json
{
  "code": 404,
  "success": false,
  "message": "页面不存在",
  "data": null
}
```

#### 4. 服务器错误

```json
{
  "code": 500,
  "success": false,
  "message": "服务器内部错误",
  "data": null
}
```

## 最佳实践

### 1. 始终使用工具函数

所有 API 接口都应该使用 `lib/api-utils.ts` 提供的工具函数，不要手动构造 `NextResponse.json()`。

### 2. 提供有意义的消息

错误响应应该提供清晰、有意义的错误信息，帮助前端开发者理解问题。

### 3. 保持 data 字段一致性

成功响应的 `data` 字段应该保持类型一致性，避免有时返回数组，有时返回对象。

### 4. 使用合适的状态码

根据操作类型选择合适的 HTTP 状态码：
- GET 请求成功使用 200
- POST 创建资源使用 201
- DELETE 请求成功使用 204
- 参数错误使用 400
- 认证失败使用 401
- 权限不足使用 403
- 资源不存在使用 404
- 服务器错误使用 500

### 5. 记录错误日志

在 catch 块中记录错误日志，便于问题排查：

```typescript
catch (error) {
  console.error('API Error:', error)
  return errorResponse('服务器内部错误')
}
```

### 6. 字段完整性

- **成功响应**：必须包含 `code`、`success`、`message`（空字符串）和 `data` 字段
- **失败响应**：必须包含 `code`、`success`、`message`（错误信息）和 `data`（null）字段
- 所有字段都不能为空或缺失

## 迁移指南

### 从旧格式迁移

如果有旧的 API 接口使用了不同的格式，请按以下步骤迁移：

1. **导入工具函数**
```typescript
import { 
  successResponse, 
  errorResponse, 
  wrapAuthApiHandler 
} from '@/lib/api-utils'
```

2. **替换认证检查**
```typescript
// 旧代码
const cookieStore = await cookies()
const userCookie = cookieStore.get('adminUser')?.value
if (!userCookie) {
  return NextResponse.json({ success: false, message: "未登录" }, { status: 401 })
}

// 新代码
return wrapAuthApiHandler(async (authResult) => {
  // 业务逻辑
})
```

3. **替换响应格式**
```typescript
// 旧代码
return NextResponse.json({ code: 200, success: true, data: config })

// 新代码
return successResponse(config)
```

4. **简化错误处理**
```typescript
// 旧代码
try {
  // ...
} catch (error) {
  return NextResponse.json({ code: 500, success: false, message: "错误" }, { status: 500 })
}

// 新代码
return wrapApiHandler(async () => {
  // 业务逻辑
})
```

## 相关文件

- [lib/api-utils.ts](file:///Users/wulingyang/Documents/workspace/ai-opc-prodcut/lib/api-utils.ts) - API 工具库
- [docs/API_UTILS_GUIDE.md](file:///Users/wulingyang/Documents/workspace/ai-opc-prodcut/docs/API_UTILS_GUIDE.md) - API 工具库使用指南
