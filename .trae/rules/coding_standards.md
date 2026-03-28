# AI 编码规范指南

本文档定义了 AI 助手在本项目中编写代码时必须遵循的规范和最佳实践。

## 核心原则

### 1. 代码质量标准

#### 1.1 类型安全
- **严格类型定义**：所有变量、函数参数、返回值必须明确定义类型
- **避免 any**：除非绝对必要，禁止使用 `any` 类型，优先使用 `unknown` 并进行类型守卫
- **使用类型别名**：复杂类型必须定义 type 或 interface，提高代码可读性
- **泛型使用**：可复用的组件和函数必须使用泛型，确保类型推断准确

```typescript
// ✅ 正确示例
interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user' | 'guest'
}

function getUserById(id: string): Promise<User | null> {
  // 实现
}

// ❌ 错误示例
function getUserById(id: any): any {
  // 实现
}
```

#### 1.2 错误处理
- **边界检查**：所有外部输入必须进行验证和边界检查
- **异常捕获**：异步操作必须使用 try-catch 包裹
- **错误类型**：自定义错误类型，避免直接抛出字符串
- **优雅降级**：关键功能失败时提供备选方案

```typescript
// ✅ 正确示例
class ApiError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function fetchData<T>(url: string): Promise<T> {
  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new ApiError(
        'FETCH_ERROR',
        response.status,
        `Failed to fetch: ${response.statusText}`
      )
    }
    
    const data = await response.json()
    return data as T
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`API Error [${error.code}]:`, error.message)
      throw error
    }
    console.error('Unexpected error:', error)
    throw new ApiError('UNKNOWN_ERROR', 500, 'An unexpected error occurred')
  }
}

// ❌ 错误示例
async function fetchData(url: string) {
  const response = await fetch(url)
  return response.json()
}
```

#### 1.3 空值处理
- **显式检查**：使用严格的空值检查（`=== null` 或 `=== undefined`）
- **可选链强制使用**：访问对象子属性时，必须使用可选链操作符 `?.`，防止因父对象不存在而导致的运行时错误
- **空值合并**：提供默认值时使用空值合并操作符 `??`
- **类型守卫**：创建可复用的类型守卫函数

### 1.4 消息提示
- **使用 sonner**：项目中使用 `sonner` 库作为 Toast 提示组件
- **导入方式**：`import { toast } from 'sonner'`
- **使用方式**：直接调用 `toast.success()`, `toast.error()`, `toast.info()`, `toast.warning()`
- **禁止使用**：禁止使用自定义 Message 组件或 Arco Design 的 Message 组件

```typescript
// ✅ 正确示例
import { toast } from 'sonner'

// 成功提示
toast.success('操作成功')

// 错误提示
toast.error('操作失败')

// 信息提示
toast.info('这是一条信息')

// 警告提示
toast.warning('请注意')

// 带描述的提示
toast.success('保存成功', {
  description: '您的更改已保存到数据库'
})

// 自定义持续时间
toast.error('发生错误', {
  duration: 5000
})
```

### 1.5 图标使用规范
- **优先使用 lucide-react**：项目中优先使用 `lucide-react` 提供的图标
- **其次使用自定义图标**：当 lucide-react 没有合适的图标时，使用项目自定义图标
- **禁止使用 Arco Design 图标**：禁止使用 `@arco-design/web-react` 的 Icon 组件
- **导入方式**：必须使用 `as` 关键字添加 `Icon` 前缀别名，格式为 `import { IconName as IconIconName } from 'lucide-react'`
- **命名规范**：所有图标组件在使用时必须以 `Icon` 开头，保持命名一致性

```typescript
// ✅ 正确示例 - 使用 lucide-react 并添加 Icon 前缀别名
import { 
  Home as IconHome, 
  User as IconUser, 
  Settings as IconSettings, 
  Search as IconSearch, 
  Plus as IconPlus, 
  Trash2 as IconTrash2,
  Edit as IconEdit,
  ChevronLeft as IconChevronLeft,
  Check as IconCheck,
  Info as IconInfo,
  Undo as IconUndo,
  History as IconHistory
} from 'lucide-react'

function Navigation() {
  return (
    <nav>
      <a href="/"><IconHome className="w-5 h-5" /></a>
      <a href="/users"><IconUser className="w-5 h-5" /></a>
      <a href="/settings"><IconSettings className="w-5 h-5" /></a>
      <button><IconSearch className="w-5 h-5" /></button>
      <button><IconPlus className="w-5 h-5" /></button>
      <button><IconTrash2 className="w-5 h-5" /></button>
    </nav>
  )
}

// ✅ 正确示例 - 使用自定义图标（当 lucide-react 没有合适的图标时）
import { CustomLogo } from '@/components/icons'

function Header() {
  return (
    <header>
      <CustomLogo className="w-10 h-10" />
    </header>
  )
}

// ❌ 错误示例 - 使用 Arco Design 图标
import { IconHome, IconUser, IconSettings } from '@arco-design/web-react/icon'

function Navigation() {
  return (
    <nav>
      <IconHome />
      <IconUser />
      <IconSettings />
    </nav>
  )
}
```

**常用图标映射**：

| 功能 | lucide-react 图标 | Arco Design 图标（已弃用） |
|------|------------------|---------------------------|
| 首页 | `Home` | `IconHome` |
| 用户 | `User` | `IconUser` |
| 设置 | `Settings` | `IconSettings` |
| 搜索 | `Search` | `IconSearch` |
| 添加 | `Plus` | `IconPlus` |
| 删除 | `Trash2` | `IconDelete` |
| 编辑 | `Edit` | `IconEdit` |
| 保存 | `Save` | `IconSave` |
| 关闭 | `X` | `IconClose` |
| 菜单 | `Menu` | `IconMenu` |
| 刷新 | `RefreshCw` | `IconRefresh` |
| 下载 | `Download` | `IconDownload` |
| 上传 | `Upload` | `IconUpload` |
| 更多 | `MoreHorizontal` | `IconMore` |
| 复制 | `Copy` | `IconCopy` |
| 检查 | `Check` | `IconCheck` |
| 警告 | `AlertTriangle` | `IconExclamation` |
| 信息 | `Info` | `IconInfo` |
| 错误 | `XCircle` | `IconCloseCircle` |

```typescript
// ✅ 正确示例
interface Config {
  database?: {
    host?: string
    port?: number
  }
}

function getDatabaseHost(config: Config): string {
  return config.database?.host ?? 'localhost'
}

function getNestedValue(obj: any): string {
  return obj?.nested?.property ?? 'default'
}

function getUserCity(user: User | undefined): string {
  return user?.address?.city ?? 'Unknown'
}

function isValidUser(user: unknown): user is User {
  return (
    typeof user === 'object' &&
    user !== null &&
    'id' in user &&
    'name' in user &&
    'email' in user
  )
}

// ❌ 错误示例
function getDatabaseHost(config: Config): string {
  return config.database.host || 'localhost' // 可能抛出错误
}

function getNestedValue(obj: any): string {
  return obj.nested.property // 如果 obj 或 nested 不存在会报错
}

function getUserCity(user: User | undefined): string {
  return user.address.city // 如果 user 为 undefined 会报错
}
```

### 2. React 组件规范

#### 2.1 组件设计原则
- **单一职责**：每个组件只负责一个功能
- **组件拆分**：超过 150 行的组件必须拆分为子组件
- **Props 类型**：所有组件必须定义 Props 接口
- **默认值**：可选 props 必须提供默认值

```typescript
// ✅ 正确示例
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  children: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  onClick,
  children,
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? <Spinner /> : children}
    </button>
  )
}
```

#### 2.2 Hooks 使用规范
- **自定义 Hook**：可复用的逻辑必须提取为自定义 Hook
- **依赖数组**：useEffect 和 useMemo 必须正确声明依赖
- **性能优化**：大列表使用虚拟化，昂贵计算使用 useMemo
- **状态管理**：复杂状态使用 useReducer，避免多个 useState

```typescript
// ✅ 正确示例
function useApi<T>(url: string) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      try {
        setLoading(true)
        const result = await fetch(url).then((res) => res.json())
        if (!cancelled) {
          setData(result)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Unknown error'))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [url])

  return { data, error, loading }
}
```

### 3. Next.js 最佳实践

#### 3.1 服务端组件 vs 客户端组件
- **默认服务端**：优先使用服务端组件，减少客户端 JavaScript
- **客户端标记**：需要交互的组件使用 'use client' 指令
- **数据获取**：服务端组件直接访问数据库，客户端组件通过 API
- **SEO 优化**：重要页面使用服务端渲染，确保 SEO 友好
- **组件类型保护**：严禁随意更改现有组件的类型（服务端/客户端），特别是 `modules/` 目录下的模块组件，这些组件默认都是服务端组件。如果确实需要更改组件类型，必须先与用户确认并说明原因

```typescript
// ✅ 服务端组件 - 数据获取
// app/users/page.tsx
async function UsersPage() {
  const users = await db.user.findMany()
  
  return (
    <div>
      <h1>Users</h1>
      <UserList users={users} />
    </div>
  )
}

// ✅ 客户端组件 - 交互
// components/UserList.tsx
'use client'

export function UserList({ users }: { users: User[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id} onClick={() => setSelectedId(user.id)}>
          {user.name}
        </li>
      ))}
    </ul>
  )
}

// ❌ 错误示例 - 未经确认更改组件类型
// modules/sidebar-nav/index.tsx
// 原本是服务端组件，不应该随意添加 "use client" 指令
'use client'  // ❌ 未经用户确认就添加

export function SidebarNavModule({ data }: ModuleProps) {
  // ...
}
```

#### 3.2 性能优化
- **图片优化**：使用 Next.js Image 组件自动优化
- **代码分割**：动态导入大型组件 `dynamic(() => import(...))`
- **字体优化**：使用 `next/font` 自动优化字体加载
- **缓存策略**：合理使用 ISR 和静态生成

```typescript
// ✅ 正确示例
import Image from 'next/image'
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false,
})

export function Gallery({ images }: { images: Image[] }) {
  return (
    <div>
      {images.map((img) => (
        <Image
          key={img.id}
          src={img.url}
          alt={img.alt}
          width={img.width}
          height={img.height}
          loading="lazy"
          placeholder="blur"
          blurDataURL={img.blurDataURL}
        />
      ))}
      <HeavyComponent />
    </div>
  )
}
```

### 4. 安全规范

#### 4.1 输入验证
- **服务端验证**：所有用户输入必须在服务端验证
- **类型验证**：使用 Zod 或 Yup 进行运行时类型检查
- **SQL 注入**：使用参数化查询，禁止字符串拼接
- **XSS 防护**：用户输入渲染前必须转义

```typescript
// ✅ 正确示例
import { z } from 'zod'

const UserSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  age: z.number().min(0).max(120).optional(),
})

async function createUser(input: unknown) {
  const validated = UserSchema.parse(input)
  
  const user = await db.user.create({
    data: validated,
  })
  
  return user
}
```

#### 4.2 敏感信息保护
- **环境变量**：敏感配置必须使用环境变量
- **日志脱敏**：日志中禁止输出密码、token 等敏感信息
- **HTTPS**：生产环境强制使用 HTTPS
- **CORS**：严格配置 CORS 白名单

```typescript
// ✅ 正确示例
const config = {
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    password: process.env.DB_PASSWORD,
  },
  api: {
    key: process.env.API_KEY,
  },
}

function logSafe(data: Record<string, unknown>) {
  const safe = { ...data }
  if ('password' in safe) safe.password = '***'
  if ('token' in safe) safe.token = '***'
  console.log(safe)
}
```

### 5. 代码组织

#### 5.1 目录结构
```
project/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 路由组
│   │   ├── login/
│   │   └── register/
│   ├── api/               # API 路由
│   │   └── users/
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/            # 共享组件
│   ├── ui/               # 基础 UI 组件
│   └── features/         # 功能组件
├── lib/                   # 工具库
│   ├── api-client.ts     # API 客户端
│   ├── json-database.ts  # JSON 数据库客户端
│   ├── config-manager.ts # 配置管理器
│   └── utils.ts          # 工具函数
├── hooks/                 # 自定义 Hooks
├── types/                 # 类型定义
├── constants/             # 常量
└── styles/                # 全局样式
```

#### 5.2 命名规范
- **文件命名**：组件使用 PascalCase，工具函数使用 camelCase
- **目录命名**：使用 kebab-case
- **常量命名**：使用 UPPER_SNAKE_CASE
- **类型命名**：接口使用 PascalCase，加 I 前缀（可选）

```typescript
// ✅ 正确示例
// components/UserProfile.tsx
export function UserProfile({ user }: UserProfileProps) {}

// lib/api-client.ts
export async function fetchUser(id: string) {}

// constants/api-endpoints.ts
export const API_ENDPOINTS = {
  USERS: '/api/users',
  AUTH: '/api/auth',
} as const

// types/user.ts
export interface User {
  id: string
  name: string
}
```

#### 5.3 默认数据管理
- **默认数据存储**：所有模块的默认数据必须存放在对应模块的 `default.json` 文件中
- **数据消费**：模块组件必须从 `default.json` 文件读取默认数据，而不是在核心 `index.tsx` 文件中硬编码
- **硬编码禁止**：严禁在 `index.tsx` 中硬编码默认数据，必须删除任何硬编码的默认数据并修改逻辑以使用 `default.json`

```typescript
// ✅ 正确示例 - 从 default.json 读取默认数据
// modules/section-pricing/index.tsx
export function PricingModule({ data }: ModuleProps) {
  const config: PricingData = (data as PricingData) || {}
  // 直接使用 config.plans，默认数据由模块系统从 default.json 加载
  const pricingPlans: PricingFeature[] = config?.plans || []
  
  // 实现...
}

// ❌ 错误示例 - 硬编码默认数据
// modules/section-pricing/index.tsx
export function PricingModule({ data }: ModuleProps) {
  const config: PricingData = (data as PricingData) || {}
  
  // ❌ 禁止硬编码默认数据
  const defaultPlans: PricingFeature[] = [
    { title: "免费版", price: "¥0", /* ... */ },
    { title: "专业版", price: "¥999", /* ... */ },
    { title: "企业版", price: "¥2999", /* ... */ }
  ]
  
  const pricingPlans: PricingFeature[] = config?.plans || defaultPlans
  
  // 实现...
}
```

#### 5.4 JSON 数据库使用规范

本项目使用 JSON 文件作为数据存储，所有数据存放在 `database/runtime/` 目录下。

##### 5.4.1 数据存储位置

```
database/
├── runtime/                    # 运行时数据目录
│   ├── accounts.json          # 账号数据
│   ├── system_config.json     # 系统配置
│   ├── system_logs.json       # 系统日志
│   ├── theme_config.json      # 主题配置
│   ├── pages.json             # 页面配置
│   ├── module_registry.json   # 模块注册表
│   └── page_modules.json      # 页面模块关联
└── templates/                  # 模板数据（初始化用）
```

##### 5.4.2 使用 JsonDatabase 类

```typescript
import { jsonDb } from '@/lib/json-database'

// 插入数据
const newAccount = jsonDb.insert('accounts', {
  username: 'admin',
  password: 'hashed_password',
  email: 'admin@example.com'
})

// 查询数据
const accounts = jsonDb.getAll('accounts')
const account = jsonDb.findOne('accounts', { username: 'admin' })
const filtered = jsonDb.find('accounts', { status: 'active' })

// 更新数据
jsonDb.update('accounts', accountId, { email: 'new@example.com' })

// 删除数据
jsonDb.delete('accounts', { username: 'test' })

// 清空表
jsonDb.clearTable('system_logs')

// 批量插入
jsonDb.insertBatch('theme_config', themes)
```

##### 5.4.3 使用 ConfigManager

对于配置相关的操作，推荐使用 `lib/config-manager.ts` 提供的高级 API：

```typescript
import { readConfig, writeConfig, deleteConfig } from '@/lib/config-manager'

// 读取配置
const siteConfig = readConfig('site')
const themeConfig = readConfig('theme')
const accounts = readConfig('account')

// 写入配置
writeConfig('site', { name: 'My Site', url: 'https://example.com' })
writeConfig('theme', { currentTheme: 'modern', themes: {...} })

// 删除配置
deleteConfig('page-home')
```

##### 5.4.4 支持的配置类型

| 配置类型 | 说明 | 存储表 |
|---------|------|--------|
| `site` | 站点配置 | system_config |
| `site-seo` | SEO 配置 | system_config |
| `theme` | 主题配置 | theme_config |
| `account` | 账号管理 | accounts |
| `token` | 令牌配置 | system_config |
| `feishu-app` | 飞书应用配置 | system_config |
| `system-logs` | 系统日志 | system_logs |
| `page-list` | 页面列表 | pages |
| 模块ID | 模块配置 | module_registry |

##### 5.4.5 禁止事项

- **禁止直接读写 JSON 文件**：必须通过 `jsonDb` 或 `config-manager` 操作
- **禁止在客户端使用**：JSON 数据库只能在服务端使用（需要 `server-only`）
- **禁止并发写入**：JSON 文件不支持并发写入，需要自行处理并发问题

```typescript
// ❌ 错误示例 - 直接读写文件
import fs from 'fs'
const data = JSON.parse(fs.readFileSync('database/runtime/accounts.json'))

// ✅ 正确示例 - 使用 jsonDb
import { jsonDb } from '@/lib/json-database'
const data = jsonDb.getAll('accounts')
```

##### 5.4.6 数据迁移

如果需要从其他数据源迁移数据，使用 `importData` 方法：

```typescript
import { jsonDb } from '@/lib/json-database'

// 导入数据（会覆盖现有数据）
jsonDb.importData('accounts', migratedAccounts)
```

### 6. 测试规范

#### 6.1 单元测试
- **测试覆盖**：核心业务逻辑必须有单元测试
- **测试命名**：描述性测试名称，使用 "should" 或 "when"
- **边界测试**：测试边界条件和异常情况
- **Mock 策略**：外部依赖必须 Mock

```typescript
// ✅ 正确示例
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a user with valid input', async () => {
      const input = { name: 'John', email: 'john@example.com' }
      const result = await createUser(input)
      
      expect(result).toMatchObject(input)
      expect(result.id).toBeDefined()
    })

    it('should throw error when email is invalid', async () => {
      const input = { name: 'John', email: 'invalid-email' }
      
      await expect(createUser(input)).rejects.toThrow('Invalid email')
    })

    it('should throw error when name is too short', async () => {
      const input = { name: 'J', email: 'john@example.com' }
      
      await expect(createUser(input)).rejects.toThrow('Name too short')
    })
  })
})
```

### 7. 性能指标

#### 7.1 性能预算
- **首屏加载**：LCP < 2.5s
- **交互延迟**：FID < 100ms
- **视觉稳定性**：CLS < 0.1
- **包体积**：首屏 JS < 150KB

#### 7.2 监控与优化
- **性能监控**：集成 Web Vitals 监控
- **错误追踪**：集成 Sentry 等错误追踪工具
- **分析工具**：使用 Next.js 内置分析或 Bundle Analyzer

### 8. 文档规范

#### 8.1 代码注释
- **复杂逻辑**：复杂算法和业务逻辑必须注释
- **公共 API**：公共函数和组件必须有 JSDoc 注释
- **TODO 管理**：TODO 必须包含作者和日期

```typescript
// ✅ 正确示例
/**
 * 计算用户的信用评分
 * @param userId - 用户 ID
 * @param factors - 评分因素权重
 * @returns 信用评分 (0-850)
 * @throws {UserNotFoundError} 用户不存在时抛出
 */
function calculateCreditScore(
  userId: string,
  factors: ScoringFactors
): number {
  // 实现细节
}

// TODO: 优化算法性能 - @author - 2024-01-15
// FIXME: 边界情况处理不完善
```

### 9. Git 提交规范

#### 9.1 提交信息格式
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 类型**：
- `feat`: 新功能
- `fix`: 修复 Bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具相关

**示例**：
```
feat(auth): 添加 OAuth2.0 登录支持

- 集成 Google OAuth
- 集成 GitHub OAuth
- 添加登录回调处理

Closes #123
```

### 10. 依赖管理

#### 10.1 依赖原则
- **最小化依赖**：只安装必要的依赖
- **版本锁定**：使用精确版本号，避免 `^` 或 `~`
- **安全审计**：定期运行 `npm audit` 检查漏洞
- **依赖更新**：定期更新依赖，但需充分测试

#### 10.2 依赖分类
- **生产依赖**：运行时必需的包
- **开发依赖**：构建、测试、开发工具

#### 10.3 第三方包选型原则
在选择第三方包时，必须优先考虑稳定性和兼容性，确保项目长期可维护：

**稳定性评估**：
- **成熟度优先**：优先选择发布时间长、版本号 >= 1.0.0 的稳定版本
- **社区活跃度**：查看 GitHub Stars、Forks、Issues 处理速度，选择社区活跃的包
- **维护状态**：检查最近更新时间，避免使用长期未维护的包（超过 1 年未更新需谨慎）
- **下载量参考**：npm 周下载量可作为参考，高下载量通常意味着更广泛的测试

**兼容性考量**：
- **技术栈匹配**：确保包与当前项目技术栈兼容（Next.js 版本、React 版本、TypeScript 版本等）
- **依赖关系检查**：使用 `npm info <package>` 检查依赖树，避免引入过多间接依赖
- **Peer Dependencies**：特别注意 peerDependencies 要求，确保与项目现有版本匹配
- **TypeScript 支持**：优先选择原生支持 TypeScript 或有高质量类型定义（@types/xxx）的包

**安全与质量**：
- **安全审计**：安装前检查 `npm audit` 结果，避免已知安全漏洞
- **代码质量**：查看源码质量、测试覆盖率、文档完整性
- **Bundle 体积**：使用 `bundlephobia` 检查包体积，优先选择轻量级方案

**选型决策流程**：
```bash
# 1. 检查包信息
npm info <package>

# 2. 检查体积和依赖
npx bundlephobia <package>

# 3. 安全审计
npm audit

# 4. 查看类型支持
npm install @types/<package> --save-dev
```

**优先级排序**：
1. **官方推荐**：框架官方推荐的包（如 Next.js 官方插件）
2. **行业标准**：业界广泛使用的成熟方案
3. **轻量替代**：功能相同但体积更小、依赖更少的方案
4. **自研方案**：简单功能优先考虑自行实现，避免过度依赖

**避免陷阱**：
- ❌ 不要仅因为功能多就选择某个包
- ❌ 不要选择处于 Beta/Alpha 阶段的包用于生产环境
- ❌ 不要选择依赖关系复杂、间接依赖过多的包
- ❌ 不要选择缺乏文档和测试的包

```typescript
// ✅ 正确示例 - 选择成熟的包
// 日期处理：选择 dayjs（轻量、成熟、TypeScript 支持好）
import dayjs from 'dayjs'  // 2KB, 成熟稳定

// ❌ 错误示例 - 选择不稳定或过度依赖的包
import moment from 'moment'  // 67KB, 已停止维护, 体积大
```

---

## 执行检查清单

在完成每个功能或修复时，AI 助手必须确保：

- [ ] 所有类型定义完整且准确
- [ ] 错误处理完善，无未捕获异常
- [ ] 空值检查到位，无潜在空指针
- [ ] 组件职责单一，无过度耦合
- [ ] 性能优化到位，无性能瓶颈
- [ ] 安全检查通过，无安全漏洞
- [ ] 代码格式规范，符合 Prettier 配置
- [ ] 测试覆盖充分，核心逻辑有测试
- [ ] 文档注释完整，复杂逻辑有说明
- [ ] Git 提交规范，信息清晰明确
- [ ] 默认数据存放在 default.json 文件中，无硬编码默认数据

---

**重要提示**：本规范是强制性的，AI 助手在编写代码时必须严格遵守。任何违反规范的代码都应该被拒绝或修正。