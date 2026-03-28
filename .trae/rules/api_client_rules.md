# API 客户端使用规则

本文档定义了项目中前端调用 API 的统一规范，所有前端代码必须使用封装的 API 客户端函数，禁止直接使用 `fetch()` 调用。

## 核心原则

### 禁止直接使用 fetch()

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

## API 客户端位置

所有 API 请求函数统一封装在 `lib/api/` 目录下，并通过 `lib/api-client.ts` 统一导出。

### 文件结构

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
    ├── database.ts        # 数据库相关 API
    └── contact.ts         # 联系表单 API
```

## 使用方式

### 1. 导入 API 函数

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

### 2. 调用 API 函数

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

## 常用 API 函数列表

### 文章相关

| 函数名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| `getArticles()` | 获取文章列表 | 无 | `Article[]` |
| `getArticleById(id)` | 获取文章详情 | `id: string` | `Article \| null` |
| `createArticle(data)` | 创建文章 | `data: object` | `{ success, message }` |
| `updateArticle(data)` | 更新文章 | `data: object` | `{ success, message }` |
| `deleteArticle(id)` | 删除文章 | `id: string` | `{ success, message }` |

### 配置相关

| 函数名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| `getAdminConfig()` | 获取管理后台配置 | 无 | `Record<string, unknown>` |
| `saveAdminConfigApi(type, data)` | 保存配置 | `type: string, data: any` | `{ success, message }` |
| `getThemeConfig()` | 获取主题配置 | 无 | `{ currentTheme, themes } \| null` |
| `getSchema(type)` | 获取表单 Schema | `type?: string` | `Record<string, any>` |

### 页面相关

| 函数名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| `getPages()` | 获取页面列表 | 无 | `PageInfo[]` |
| `getPageDetail(pageId)` | 获取页面详情 | `pageId: string` | `PageInfo \| null` |
| `createPage(data)` | 创建页面 | `data: object` | `{ success, pageId?, message? }` |
| `updatePageModulesApi(pageId, modules)` | 更新页面模块 | `pageId: string, modules: any[]` | `{ success, message }` |
| `deletePage(pageId)` | 删除页面 | `pageId: string` | `{ success, message }` |
| `publishPageApi(pageId)` | 发布页面 | `pageId: string` | `{ success, message }` |
| `getPagePreview(pageId)` | 获取页面预览 | `pageId: string` | `{ success, pageName?, modules? }` |

### 模块相关

| 函数名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| `getAvailableModules()` | 获取可用模块 | 无 | `ModuleInfo[]` |
| `getModuleSchema(moduleId)` | 获取模块 Schema | `moduleId: string` | `Record<string, unknown> \| null` |
| `getModulePreview(moduleId)` | 获取模块预览 | `moduleId: string` | `{ success, moduleId?, moduleName? }` |

### 账号相关

| 函数名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| `getAccounts()` | 获取账号列表 | 无 | `Account[]` |
| `addAccount(data)` | 添加账号 | `data: object` | `{ success, message }` |
| `updateAccount(data)` | 更新账号 | `data: object` | `{ success, message }` |
| `deleteAccount(username)` | 删除账号 | `username: string` | `{ success, message }` |
| `changePassword(data)` | 修改密码 | `data: object` | `{ success, user?, message? }` |

### 认证相关

| 函数名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| `login(username, password)` | 登录 | `username, password` | `{ success, user?, message? }` |
| `logout()` | 登出 | 无 | `{ success, message? }` |
| `checkAuth()` | 检查认证状态 | 无 | `{ success, user?, message? }` |

### 数据库相关

| 函数名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| `importDatabase(file)` | 导入数据库 | `file: File` | `{ success, message?, backupCreated? }` |
| `resetWebsite(username)` | 一键恢复网站 | `username: string` | `{ success, message?, backupCreated?, tables? }` |
| `checkDefaultDb()` | 检查默认数据库 | 无 | `{ success, exists?, message? }` |
| `validateDatabase()` | 验证数据库 | 无 | `{ success, valid?, tables?, message? }` |

## 添加新的 API 函数

当需要添加新的 API 函数时，请根据功能分类在 `lib/api/` 目录下对应的文件中添加：

### 1. 确定文件位置

根据 API 功能选择对应文件：
- 模块相关 → `lib/api/modules.ts`
- 页面相关 → `lib/api/pages.ts`
- 配置相关 → `lib/api/config.ts`
- 认证相关 → `lib/api/auth.ts`
- 账号管理 → `lib/api/accounts.ts`
- 文章相关 → `lib/api/articles.ts`
- 飞书相关 → `lib/api/feishu.ts`
- 数据库相关 → `lib/api/database.ts`
- 联系表单 → `lib/api/contact.ts`

### 2. 添加函数

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

### 3. 导出函数

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

## 错误处理

API 函数内部已统一处理错误，调用时只需关注返回值：

```typescript
const result = await createArticle(data)
if (result.success) {
  toast.success('操作成功')
} else {
  toast.error(result.message || '操作失败')
}
```

## 特殊情况

### 1. 第三方 API

调用第三方 API（如飞书 API）时，可以使用独立的 API 类，如 `lib/feishu-api.ts` 中的 `FeishuAPI` 类。

### 2. 文件上传

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

## 相关文件

- [lib/api-client.ts](file:///lib/api-client.ts) - API 客户端封装
- [lib/api-utils.ts](file:///lib/api-utils.ts) - API 响应工具函数
- [api_response_rules.md](file:///.trae/rules/api_response_rules.md) - API 响应格式规则
