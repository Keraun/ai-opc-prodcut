# 项目规则规范

本文档合并了项目中的所有规则规范，包括管理后台组件使用、API 客户端使用、API 响应格式和 RESTful 规范。

## 目录

- [管理后台公共组件使用规范](#管理后台公共组件使用规范)
- [API 客户端使用规则](#api-客户端使用规则)
- [API 响应格式规则](#api-响应格式规则)
- [API RESTful 规范](#api-restful-规范)
- [数据库相关规则](#数据库相关规则)

## 管理后台公共组件使用规范

### 核心原则

#### 优先使用公共组件

所有管理后台页面必须优先使用以下公共组件：
- `ManagementHeader` - 管理页面头部组件
- `CommonTable` - 通用表格组件
- `WebPImage` - WebP 兼容图片组件（基于 Next.js Image）
- `ResponsiveImage` - 响应式图片组件

#### 保持风格一致

- 所有页面应使用统一的颜色方案
- 所有表格应使用统一的样式
- 所有操作按钮应使用统一的样式
- 所有状态徽章和标签应使用统一的样式

### 公共组件使用指南

#### 1. ManagementHeader 组件

**功能**：管理页面的头部组件，包含标题、描述和操作按钮。

**使用场景**：所有管理页面的顶部。

**示例代码**：

```tsx
import { ManagementHeader } from '@/app/admin/dashboard/components'

<ManagementHeader
  title="页面管理"
  description="管理网站的所有页面，包括创建、编辑和删除页面"
  buttonText="新建页面"
  buttonIcon={<IconPlus />}
  onButtonClick={() => setShowCreateModal(true)}
/>
```

**参数说明**：
- `title` (必填)：页面标题
- `description` (可选)：页面描述
- `buttonText` (可选)：操作按钮文本
- `buttonIcon` (可选)：操作按钮图标
- `onButtonClick` (可选)：操作按钮点击事件

#### 2. CommonTable 组件

**功能**：通用表格组件，支持加载状态、空状态、分页等。

**使用场景**：所有需要展示列表数据的页面。

**示例代码**：

```tsx
import { CommonTable, ActionButton } from '@/app/admin/dashboard/components'
import { Tag } from '@arco-design/web-react'

<CommonTable
  columns={[
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <ActionButton
            type="primary"
            icon={<IconEdit />}
            onClick={() => openEditAccountModal(record)}
          >
            修改
          </ActionButton>
          <ActionButton
            type="danger"
            icon={<IconTrash2 />}
            onClick={() => openDeleteAccountModal(record)}
            disabled={record.username === 'admin'}
          >
            删除
          </ActionButton>
        </div>
      ),
    },
  ]}
  data={accounts}
  loading={loadingAccounts}
  pagination={false}
  emptyText="暂无账号数据"
/>
```

**参数说明**：
- `columns` (必填)：表格列配置
- `data` (必填)：表格数据
- `loading` (可选)：加载状态
- `rowKey` (可选)：行键，默认为 "id"
- `scroll` (可选)：滚动配置
- `pagination` (可选)：分页配置
- `emptyText` (可选)：空状态文本
- `emptyIcon` (可选)：空状态图标
- `className` (可选)：额外类名

#### 3. WebPImage 组件

**功能**：基于 Next.js Image 的 WebP 兼容图片组件，自动检测浏览器 WebP 支持情况，智能回退到原图。

**使用场景**：所有需要展示图片的页面，优先使用 WebP 格式以优化性能。

**核心特性**：
- 自动 WebP 检测与降级
- 完整继承 Next.js Image 所有功能
- 支持自动推导 WebP 路径
- 支持兜底图片

**使用示例**：

```tsx
import { WebPImage } from '@/components'

// 方式一：自动推导 WebP 路径（推荐）
<WebPImage
  src="/uploads/editor/image.jpg"
  alt="图片描述"
  width={800}
  height={600}
/>

// 方式二：手动指定 WebP 路径
<WebPImage
  src="/uploads/editor/original.jpg"
  webpSrc="/uploads/editor/optimized.webp"
  alt="图片描述"
  width={800}
  height={600}
/>

// 方式三：带兜底图片和回调
<WebPImage
  src="/uploads/editor/image.jpg"
  webpSrc="/uploads/editor/image.webp"
  fallbackSrc="/fallback-image.jpg"
  alt="图片描述"
  width={800}
  height={600}
  onWebPFallback={() => console.log('WebP 加载失败')}
  onLoadError={() => console.log('所有图片加载失败')}
/>

// 方式四：完整 Next.js Image 功能
<WebPImage
  src="/uploads/editor/image.jpg"
  alt="产品图片"
  width={400}
  height={300}
  priority={true}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
  className="rounded-lg shadow-md"
  quality={85}
  fill
  style={{ objectFit: 'cover' }}
/>
```

**参数说明**：
- `src` (必填)：原图 URL
- `webpSrc` (可选)：WebP 格式图片 URL，不传则自动从 `src` 推导
- `fallbackSrc` (可选)：兜底图片 URL
- `onWebPFallback` (可选)：WebP 回退回调
- `onLoadError` (可选)：最终加载失败回调
- ...其他所有 Next.js Image 属性

#### 4. ResponsiveImage 组件

**功能**：响应式图片组件，支持懒加载和 Intersection Observer。

**使用场景**：需要懒加载和响应式的图片展示场景。

**使用示例**：

```tsx
import { ResponsiveImage } from '@/components'

<ResponsiveImage
  src="/uploads/editor/image.jpg"
  webpSrc="/uploads/editor/image.webp"
  alt="图片描述"
  sizes="(max-width: 768px) 100vw, 50vw"
  priority={false}
/>
```

### 5. 辅助工具

#### useWebPSupport Hook

检测浏览器是否支持 WebP：

```tsx
import { useWebPSupport } from '@/components'

function MyComponent() {
  const supportsWebP = useWebPSupport()
  
  return (
    <div>
      {supportsWebP ? '✅ 支持 WebP' : '❌ 不支持 WebP'}
    </div>
  )
}
```

#### checkWebPSupport 函数

同步检测 WebP 支持：

```tsx
import { checkWebPSupport } from '@/components'

if (checkWebPSupport()) {
  console.log('浏览器支持 WebP')
}
```

#### deriveWebPSrc 函数

从原图路径推导 WebP 路径：

```tsx
import { deriveWebPSrc } from '@/components'

const webpPath = deriveWebPSrc('/uploads/image.jpg')
// 返回: /uploads/image.webp
```

### 6. 辅助组件

#### Tag 组件

**功能**：标签组件，用于显示分类、标签、状态等。

**使用说明**：使用 Arco Design 官方的 Tag 组件，支持更多特性和更好的视觉效果。

**使用示例**：

```tsx
import { Tag } from '@arco-design/web-react'

// 状态标签
<Tag color="green">已上线</Tag>
<Tag color="gray">草稿</Tag>
<Tag color="red">已下线</Tag>

// 分类标签
<Tag color="arcoblue">静态页面</Tag>
<Tag color="orange">用户页面</Tag>
<Tag color="purple">动态路由</Tag>
```

**参数说明**：
- `color`：标签颜色，支持 'arcoblue', 'success', 'warning', 'danger', 'purple', 'orange', 'green', 'red', 'gray' 等
- `size`：标签大小，支持 'small', 'default', 'large'
- `closable`：是否可关闭
- `onClose`：关闭事件回调

#### ActionButton 组件

**功能**：操作按钮组件，用于表格操作列。

**使用示例**：

```tsx
import { ActionButton } from '@/app/admin/dashboard/components'

<ActionButton
  type="default"
  icon={<IconEye />}
  onClick={() => handleView(record)}
>
  查看
</ActionButton>

<ActionButton
  type="primary"
  icon={<IconEdit />}
  onClick={() => handleEdit(record)}
>
  编辑
</ActionButton>

<ActionButton
  type="danger"
  icon={<IconTrash2 />}
  onClick={() => handleDelete(record)}
>
  删除
</ActionButton>
```

#### Tooltip 组件

**功能**：提示框组件，用于显示悬停提示。

**使用说明**：使用 Arco Design 官方的 Tooltip 组件。

**使用示例**：

```tsx
import { Tooltip } from '@arco-design/web-react'

<Tooltip content="这是一个提示">
  <span>悬停查看提示</span>
</Tooltip>
```

## API 客户端使用规则

### 核心原则

#### 禁止直接使用 fetch()

**错误示例：**
```typescript
// ❌ 禁止这样写
const response = await fetch('/api/articles')
if (response.ok) {
  const data = await response.json()
  setArticles(data)
}
```

**正确示例：**
```typescript
// ✅ 应该这样写
import { getArticles } from '@/lib/api-client'

const data = await getArticles()
setArticles(data)
```

### API 客户端位置

所有 API 请求函数统一封装在 `lib/api/` 目录下，并通过 `lib/api-client.ts` 统一导出。

#### 文件结构

```
lib/
├── api-client.ts          # 统一入口，导出所有 API 函数
└── api/
    ├── types.ts           # 类型定义
    ├── request.ts         # 基础请求函数
    ├── modules.ts         # 模块相关 API
    ├── pages.ts           # 页面相关 API
    ├── config.ts          # 配置相关 API
    ├── auth.ts            # 认证相关 API
    ├── accounts.ts        # 账号管理 API
    ├── articles.ts        # 文章相关 API
    ├── feishu.ts          # 飞书相关 API
    ├── database.ts        # 数据导入导出 API
    └── contact.ts         # 联系表单 API
```

### 使用方式

#### 1. 导入 API 函数

```typescript
import { 
  getArticles, 
  createArticle, 
  updateArticle, 
  deleteArticle,
  getAdminConfig,
  saveAdminConfigApi,
  getThemeConfig
} from '@/lib/api-client'
```

#### 2. 调用 API 函数

```typescript
// 获取数据
const articles = await getArticles()

// 创建数据
const result = await createArticle({ title: '新文章', content: '内容' })
if (result.success) {
  toast.success('创建成功')
}

// 更新数据
const updateResult = await updateArticle({ id: '1', title: '更新标题' })

// 删除数据
const deleteResult = await deleteArticle('1')
```

### 常用 API 函数列表

#### 文章相关

| 函数名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| `getArticles()` | 获取文章列表 | 无 | `Article[]` |
| `getArticleById(id)` | 获取文章详情 | `id: string` | `Article \| null` |
| `createArticle(data)` | 创建文章 | `data: object` | `{ success, message }` |
| `updateArticle(data)` | 更新文章 | `data: object` | `{ success, message }` |
| `deleteArticle(id)` | 删除文章 | `id: string` | `{ success, message }` |

#### 配置相关

| 函数名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| `getAdminConfig()` | 获取管理后台配置 | 无 | `Record<string, unknown>` |
| `saveAdminConfigApi(type, data)` | 保存配置 | `type: string, data: any` | `{ success, message }` |
| `getThemeConfig()` | 获取主题配置 | 无 | `{ currentTheme, themes } \| null` |
| `getSchema(type)` | 获取表单 Schema | `type?: string` | `Record<string, any>` |

#### 页面相关

| 函数名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| `getPages()` | 获取页面列表 | 无 | `PageInfo[]` |
| `getPageDetail(pageId)` | 获取页面详情 | `pageId: string` | `PageInfo \| null` |
| `createPage(data)` | 创建页面 | `data: object` | `{ success, pageId?, message? }` |
| `updatePageModulesApi(pageId, modules)` | 更新页面模块 | `pageId: string, modules: any[]` | `{ success, message }` |
| `deletePage(pageId)` | 删除页面 | `pageId: string` | `{ success, message }` |
| `publishPageApi(pageId)` | 发布页面 | `pageId: string` | `{ success, message }` |
| `getPagePreview(pageId)` | 获取页面预览 | `pageId: string` | `{ success, pageName?, modules? }` |

#### 模块相关

| 函数名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| `getAvailableModules()` | 获取可用模块 | 无 | `ModuleInfo[]` |
| `getModuleSchema(moduleId)` | 获取模块 Schema | `moduleId: string` | `Record<string, unknown> \| null` |
| `getModulePreview(moduleId)` | 获取模块预览 | `moduleId: string` | `{ success, moduleId?, moduleName? }` |

#### 账号相关

| 函数名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| `getAccounts()` | 获取账号列表 | 无 | `Account[]` |
| `addAccount(data)` | 添加账号 | `data: object` | `{ success, message }` |
| `updateAccount(data)` | 更新账号 | `data: object` | `{ success, message }` |
| `deleteAccount(username)` | 删除账号 | `username: string` | `{ success, message }` |
| `changePassword(data)` | 修改密码 | `data: object` | `{ success, user?, message? }` |

#### 认证相关

| 函数名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| `login(username, password)` | 登录 | `username, password` | `{ success, user?, message? }` |
| `logout()` | 登出 | 无 | `{ success, message? }` |
| `checkAuth()` | 检查认证状态 | 无 | `{ success, user?, message? }` |

#### 数据库相关

| 函数名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| `importDatabase(file)` | 导入配置数据 | `file: File` | `{ success, message?, backupCreated? }` |
| `resetWebsite(username)` | 一键恢复网站 | `username: string` | `{ success, message?, backupCreated?, tables? }` |
| `checkDefaultDb()` | 检查默认配置 | 无 | `{ success, exists?, message? }` |
| `validateDatabase()` | 验证配置完整性 | 无 | `{ success, valid?, tables?, message? }` |

> **注意**：本项目使用 JSON 文件存储数据（`database/runtime/` 目录），而非传统数据库。上述函数主要用于配置导入导出和网站恢复功能。

### 添加新的 API 函数

当需要添加新的 API 函数时，请根据功能分类在 `lib/api/` 目录下对应的文件中添加：

#### 1. 确定文件位置

根据 API 功能选择对应文件：
- 模块相关 → `lib/api/modules.ts`
- 页面相关 → `lib/api/pages.ts`
- 配置相关 → `lib/api/config.ts`
- 认证相关 → `lib/api/auth.ts`
- 账号管理 → `lib/api/accounts.ts`
- 文章相关 → `lib/api/articles.ts`
- 飞书相关 → `lib/api/feishu.ts`
- 数据导入导出 → `lib/api/database.ts`
- 联系表单 → `lib/api/contact.ts`

#### 2. 添加函数

在对应文件中按照以下模式添加：

```typescript
export async function newApiFunction(param: string): Promise<ReturnType> {
  try {
    const result = await request<ReturnType>(`/api/endpoint/${param}`)
    return result.success && result.data ? result.data : defaultValue
  } catch (error) {
    console.error('Error description:', error)
    return defaultValue
  }
}
```

#### 3. 导出函数

在 `lib/api-client.ts` 中添加导出：

```typescript
export {
  // ... 其他导出
  newApiFunction
} from './api/对应文件'
```

### 返回值规范

1. **列表数据**：返回数组，失败时返回空数组 `[]`
2. **单个对象**：返回对象或 `null`
3. **操作结果**：返回 `{ success: boolean, message?: string }` 格式

### 错误处理

API 函数内部已统一处理错误，调用时只需关注返回值：

```typescript
const result = await createArticle(data)
if (result.success) {
  toast.success('操作成功')
} else {
  toast.error(result.message || '操作失败')
}
```

### 特殊情况

#### 1. 第三方 API

调用第三方 API（如飞书 API）时，可以使用独立的 API 类，如 `lib/feishu-api.ts` 中的 `FeishuAPI` 类。

#### 2. 文件上传

文件上传需要在 `lib/api/` 目录下对应的文件中添加专门的 API 函数：

```typescript
// 在 lib/api/config.ts 或其他对应文件中添加
export async function uploadFile(file: File): Promise<{ success: boolean; url?: string; message?: string }> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const result = await request<{ url: string }>('/api/upload', {
      method: 'POST',
      body: formData
    })
    return {
      success: result.success,
      url: result.data?.url,
      message: result.message
    }
  } catch (error) {
    console.error('Error uploading file:', error)
    return { success: false, message: '上传失败' }
  }
}
```

然后在 `lib/api-client.ts` 中导出，并在组件中使用：

```typescript
import { uploadFile } from '@/lib/api-client'

const result = await uploadFile(file)
if (result.success) {
  console.log('文件地址:', result.url)
}
```

## API 响应格式规则

### 统一响应格式

#### 成功响应格式

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

#### 错误响应格式

```json
{
  "code": 400,
  "success": false,
  "message": "参数不完整",
  "data": null
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `code` | number | 是 | HTTP 状态码 |
| `success` | boolean | 是 | 是否成功 |
| `message` | string | 是 | 提示信息（成功时返回空字符串，失败时返回错误信息） |
| `data` | any | 是 | 响应数据（成功时返回数据，失败时返回 null） |

### HTTP 状态码规范

#### 成功状态码

| 状态码 | 说明 | 使用场景 |
|--------|------|----------|
| 200 | OK | 请求成功，返回数据 |
| 201 | Created | 资源创建成功 |
| 204 | No Content | 删除成功，无返回内容 |

#### 客户端错误状态码

| 状态码 | 说明 | 使用场景 |
|--------|------|----------|
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未登录或认证失败 |
| 403 | Forbidden | 无权限访问 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突（如已存在） |
| 422 | Unprocessable Entity | 验证失败 |

#### 服务端错误状态码

| 状态码 | 说明 | 使用场景 |
|--------|------|----------|
| 500 | Internal Server Error | 服务器内部错误 |
| 502 | Bad Gateway | 网关错误 |
| 503 | Service Unavailable | 服务不可用 |

### API 工具库使用

项目已封装了统一的 API 工具库，位于 `lib/api-utils.ts`。

#### 成功响应

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

#### 错误响应

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

#### 认证包装器

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

#### 错误处理包装器

```typescript
import { wrapApiHandler, successResponse } from '@/lib/api-utils'

export async function GET() {
  return wrapApiHandler(async () => {
    const data = getData()
    return successResponse(data)
  })
}
```

### 响应示例

#### 成功响应示例

##### 1. 登录成功

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

##### 2. 获取配置成功

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

##### 3. 创建页面成功

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

#### 错误响应示例

##### 1. 参数错误

```json
{
  "code": 400,
  "success": false,
  "message": "页面名称和路径不能为空",
  "data": null
}
```

##### 2. 未登录

```json
{
  "code": 401,
  "success": false,
  "message": "未登录",
  "data": null
}
```

##### 3. 资源不存在

```json
{
  "code": 404,
  "success": false,
  "message": "页面不存在",
  "data": null
}
```

##### 4. 服务器错误

```json
{
  "code": 500,
  "success": false,
  "message": "服务器内部错误",
  "data": null
}
```

### 最佳实践

#### 1. 始终使用工具函数

所有 API 接口都应该使用 `lib/api-utils.ts` 提供的工具函数，不要手动构造 `NextResponse.json()`。

#### 2. 提供有意义的消息

错误响应应该提供清晰、有意义的错误信息，帮助前端开发者理解问题。

#### 3. 保持 data 字段一致性

成功响应的 `data` 字段应该保持类型一致性，避免有时返回数组，有时返回对象。

#### 4. 使用合适的状态码

根据操作类型选择合适的 HTTP 状态码：
- GET 请求成功使用 200
- POST 创建资源使用 201
- DELETE 请求成功使用 204
- 参数错误使用 400
- 认证失败使用 401
- 权限不足使用 403
- 资源不存在使用 404
- 服务器错误使用 500

#### 5. 记录错误日志

在 catch 块中记录错误日志，便于问题排查：

```typescript
catch (error) {
  console.error('API Error:', error)
  return errorResponse('服务器内部错误')
}
```

#### 6. 字段完整性

- **成功响应**：必须包含 `code`、`success`、`message`（空字符串）和 `data` 字段
- **失败响应**：必须包含 `code`、`success`、`message`（错误信息）和 `data`（null）字段
- 所有字段都不能为空或缺失

## API RESTful 规范

### 核心原则

#### 只使用 GET 和 POST 方法

**禁止使用 PUT、DELETE、PATCH 等其他 HTTP 方法**，只使用以下两种方法：

- **GET**：用于获取数据，幂等操作
- **POST**：用于创建、更新、删除数据，非幂等操作

#### 通过接口名称区分语义

使用查询参数 `action` 来区分不同的操作语义，例如：

- `GET /api/admin/themes` - 获取主题列表
- `POST /api/admin/themes?action=create` - 创建主题
- `POST /api/admin/themes?action=update` - 更新主题
- `POST /api/admin/themes?action=delete` - 删除主题
- `POST /api/admin/themes?action=setCurrent` - 设置当前主题

### 接口设计规范

#### 1. 路径命名

- 使用小写字母和连字符（-）
- 路径应该反映资源的层级关系
- 避免使用动词，使用名词表示资源

**示例：**
- `GET /api/admin/themes` - 获取主题列表
- `GET /api/admin/config` - 获取配置信息

#### 2. 查询参数

- 使用 `action` 参数来区分操作类型
- 其他参数根据具体业务需求添加

**示例：**
- `POST /api/admin/themes?action=create` - 创建主题
- `GET /api/admin/themes?onlyCurrent=true` - 获取当前主题

#### 3. 请求体格式

- 使用 JSON 格式
- 所有请求体参数应该是明确的、有意义的

**示例：**
```json
{
  "themeId": "modern",
  "name": "现代主题",
  "colors": {
    "primary": "#007bff",
    "secondary": "#6c757d"
  }
}
```

#### 4. 响应格式

遵循统一的响应格式，详见 [API 响应格式规则](#api-响应格式规则)。

### 接口示例

#### 主题管理接口

| 接口路径 | 方法 | action 参数 | 功能描述 | 请求体 |
|---------|------|------------|----------|--------|
| `/api/admin/themes` | GET | 无 | 获取主题列表 | 无 |
| `/api/admin/themes` | POST | `create` | 创建主题 | `{"themeId": "...", "name": "...", ...}` |
| `/api/admin/themes` | POST | `update` | 更新主题 | `{"themeId": "...", "name": "...", ...}` |
| `/api/admin/themes` | POST | `delete` | 删除主题 | `{"themeId": "..."}` |
| `/api/admin/themes` | POST | `setCurrent` | 设置当前主题 | `{"themeId": "..."}` |

#### 配置管理接口

| 接口路径 | 方法 | action 参数 | 功能描述 | 请求体 |
|---------|------|------------|----------|--------|
| `/api/admin/config` | GET | 无 | 获取配置信息 | 无 |
| `/api/admin/config` | POST | `save` | 保存配置 | `{"type": "...", "data": {...}}` |

### 最佳实践

1. **语义清晰**：通过 `action` 参数明确操作语义
2. **参数最小化**：只传递必要的参数
3. **错误处理**：统一的错误处理机制
4. **响应格式**：遵循统一的响应格式
5. **安全性**：所有管理接口必须进行认证检查

## 数据库相关规则

### 核心原则

#### 数据存储方式

本项目使用 JSON 文件存储数据，而非传统数据库。所有数据文件位于 `database/runtime/` 目录下。

#### 数据文件结构

```
database/
├── runtime/               # 运行时数据目录
│   ├── system_config.json     # 系统配置
│   ├── page_modules.json      # 页面模块配置
│   ├── module_registry.json   # 模块注册表
│   ├── accounts.json          # 账号数据
│   ├── articles.json          # 文章数据
│   ├── messages.json          # 留言数据
│   └── push_records.json      # 推送记录
└── backup/                # 备份目录
    └── YYYY-MM-DD-HH-mm-ss/  # 备份文件
```

### 数据操作规范

#### 1. 读取数据

- 使用 `fs/promises` 模块异步读取 JSON 文件
- 读取后解析为 JavaScript 对象
- 处理文件不存在的情况，返回默认值

**示例：**

```typescript
import fs from 'fs/promises'
import path from 'path'

async function readDataFile(filename: string) {
  const filePath = path.join(process.cwd(), 'database', 'runtime', filename)
  try {
    const data = await fs.readFile(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`读取文件 ${filename} 失败:`, error)
    return []
  }
}
```

#### 2. 写入数据

- 使用 `fs/promises` 模块异步写入 JSON 文件
- 写入前将数据转换为 JSON 字符串，使用缩进美化格式
- 处理写入失败的情况，记录错误日志

**示例：**

```typescript
import fs from 'fs/promises'
import path from 'path'

async function writeDataFile(filename: string, data: any) {
  const filePath = path.join(process.cwd(), 'database', 'runtime', filename)
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8')
    return true
  } catch (error) {
    console.error(`写入文件 ${filename} 失败:`, error)
    return false
  }
}
```

#### 3. 数据备份

- 在进行重要操作（如导入、重置）前，自动创建数据备份
- 备份文件按照时间戳命名，存放在 `database/backup/` 目录
- 备份文件保留最近 10 个，自动清理旧备份

**示例：**

```typescript
import fs from 'fs/promises'
import path from 'path'
import { format } from 'date-fns'

async function createBackup() {
  const backupDir = path.join(process.cwd(), 'database', 'backup')
  const timestamp = format(new Date(), 'yyyy-MM-dd-HH-mm-ss')
  const backupPath = path.join(backupDir, timestamp)
  
  // 创建备份目录
  await fs.mkdir(backupPath, { recursive: true })
  
  // 复制所有运行时数据文件到备份目录
  const runtimeDir = path.join(process.cwd(), 'database', 'runtime')
  const files = await fs.readdir(runtimeDir)
  
  for (const file of files) {
    const sourcePath = path.join(runtimeDir, file)
    const destPath = path.join(backupPath, file)
    await fs.copyFile(sourcePath, destPath)
  }
  
  // 清理旧备份（保留最近 10 个）
  await cleanupOldBackups()
  
  return backupPath
}

async function cleanupOldBackups() {
  const backupDir = path.join(process.cwd(), 'database', 'backup')
  const backups = await fs.readdir(backupDir)
  
  if (backups.length > 10) {
    // 按时间戳排序，删除最旧的
    const sortedBackups = backups.sort()
    const backupsToDelete = sortedBackups.slice(0, backups.length - 10)
    
    for (const backup of backupsToDelete) {
      const backupPath = path.join(backupDir, backup)
      await fs.rm(backupPath, { recursive: true, force: true })
    }
  }
}
```

#### 4. 数据验证

- 在读取和写入数据时，进行数据验证
- 确保数据结构符合预期格式
- 处理数据损坏的情况，提供修复机制

**示例：**

```typescript
function validateData(data: any, schema: any) {
  // 简单的 schema 验证
  for (const key in schema) {
    if (!(key in data)) {
      return false
    }
    if (typeof data[key] !== schema[key]) {
      return false
    }
  }
  return true
}
```

### 数据导入导出规范

#### 1. 导入数据

- 支持从 JSON 文件导入数据
- 导入前进行数据验证
- 导入前自动创建备份
- 导入后验证数据完整性

**示例：**

```typescript
async function importData(file: File) {
  try {
    // 读取文件内容
    const content = await file.text()
    const data = JSON.parse(content)
    
    // 验证数据格式
    if (!validateImportData(data)) {
      throw new Error('数据格式错误')
    }
    
    // 创建备份
    await createBackup()
    
    // 写入数据
    for (const [filename, fileData] of Object.entries(data)) {
      await writeDataFile(filename, fileData)
    }
    
    return { success: true, message: '导入成功' }
  } catch (error) {
    console.error('导入数据失败:', error)
    return { success: false, message: '导入失败' }
  }
}
```

#### 2. 导出数据

- 支持导出所有数据为单个 JSON 文件
- 导出时包含所有运行时数据文件
- 导出文件使用时间戳命名

**示例：**

```typescript
async function exportData() {
  try {
    const exportData: Record<string, any> = {}
    const runtimeDir = path.join(process.cwd(), 'database', 'runtime')
    const files = await fs.readdir(runtimeDir)
    
    for (const file of files) {
      const data = await readDataFile(file)
      exportData[file] = data
    }
    
    return { success: true, data: exportData }
  } catch (error) {
    console.error('导出数据失败:', error)
    return { success: false, message: '导出失败' }
  }
}
```

### 数据库 API 接口

#### 1. 导入配置数据

- 接口：`POST /api/admin/database?action=import`
- 功能：导入配置数据
- 请求体：`multipart/form-data` 格式，包含文件字段 `file`
- 响应：`{ success: boolean, message?: string, backupCreated?: boolean }`

#### 2. 导出配置数据

- 接口：`GET /api/admin/database?action=export`
- 功能：导出配置数据
- 响应：JSON 文件下载

#### 3. 一键恢复网站

- 接口：`POST /api/admin/database?action=reset`
- 功能：一键恢复网站到默认状态
- 请求体：`{ username: string }`
- 响应：`{ success: boolean, message?: string, backupCreated?: boolean, tables?: string[] }`

#### 4. 检查默认配置

- 接口：`GET /api/admin/database?action=checkDefault`
- 功能：检查默认配置是否存在
- 响应：`{ success: boolean, exists?: boolean, message?: string }`

#### 5. 验证配置完整性

- 接口：`GET /api/admin/database?action=validate`
- 功能：验证配置完整性
- 响应：`{ success: boolean, valid?: boolean, tables?: string[], message?: string }`

### 最佳实践

1. **数据安全**：操作数据前始终创建备份
2. **错误处理**：完善的错误处理和日志记录
3. **数据验证**：严格的数据验证，确保数据完整性
4. **性能优化**：对于大型数据操作，考虑使用流式处理
5. **并发控制**：处理并发写入的情况，避免数据冲突
6. **备份策略**：定期自动备份，保留多个备份版本
7. **恢复机制**：提供数据损坏时的恢复机制
8. **权限控制**：数据库操作必须进行权限检查，只有管理员可以执行

## 总结

本规则文档涵盖了项目中的所有核心规范，包括：

1. **管理后台组件使用**：统一的组件使用规范，保证界面一致性
2. **API 客户端使用**：封装的 API 客户端函数，禁止直接使用 fetch()
3. **API 响应格式**：统一的响应格式和状态码规范
4. **API RESTful 规范**：基于 GET 和 POST 的 RESTful 接口设计
5. **数据库相关规则**：JSON 文件存储的数据操作规范

所有开发人员必须严格遵循这些规范，确保项目的一致性、可维护性和安全性。

## 包管理器使用规范

### 核心原则

#### 使用 pnpm 作为包管理器

本项目统一使用 **pnpm** 作为包管理器，禁止使用 npm 或 yarn。

### 安装依赖

```bash
# 安装所有依赖
pnpm install

# 安装生产依赖
pnpm add <package-name>

# 安装开发依赖
pnpm add -D <package-name>

# 安装全局依赖（谨慎使用）
pnpm add -g <package-name>
```

### 移除依赖

```bash
# 移除依赖
pnpm remove <package-name>
```

### 更新依赖

```bash
# 更新所有依赖
pnpm update

# 更新指定依赖
pnpm update <package-name>
```

### 运行脚本

```bash
# 运行开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start

# 运行代码检查
pnpm lint
```

### 常见问题

#### 1. 依赖安装失败

如果遇到依赖安装失败，尝试以下步骤：

```bash
# 清除缓存
pnpm store prune

# 删除 node_modules 和 lockfile
rm -rf node_modules pnpm-lock.yaml

# 重新安装
pnpm install
```

#### 2. 依赖版本冲突

如果遇到依赖版本冲突，检查 `package.json` 中的版本范围，并使用 `pnpm update` 更新到兼容版本。

#### 3. monorepo 支持

如果项目使用 monorepo 结构，pnpm 原生支持 workspace 功能，无需额外配置。

### package.json 配置

在 `package.json` 中添加 `packageManager` 字段，确保团队使用相同的包管理器版本：

```json
{
  "packageManager": "pnpm@10.4.1"
}
```

### 注意事项

1. **不要提交 node_modules**：确保 `.gitignore` 中包含 `node_modules/`
2. **提交 pnpm-lock.yaml**：确保团队成员使用相同版本的依赖
3. **避免使用 npm 或 yarn**：混用包管理器可能导致依赖冲突
4. **定期更新依赖**：定期运行 `pnpm update` 保持依赖最新