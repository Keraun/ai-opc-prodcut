# 项目规则

本文档定义了 AI-OPC 项目的特定规则和配置。

## 技术栈

- **框架**: Next.js 14+ (App Router)
- **UI 库**: Arco Design (字节跳动) - 仅用于管理后台
- **样式**: CSS Modules (项目未使用 Tailwind CSS)
- **语言**: TypeScript
- **包管理器**: npm

## 项目特定要求

### 1. 样式系统规范

#### 1.1 CSS Modules 使用规范
- **重要**：本项目使用 CSS Modules，不使用 Tailwind CSS
- 所有样式必须写在 `.module.css` 文件中
- 通过 `styles` 对象引用类名

```typescript
// ✅ 正确 - 使用 CSS Modules
import styles from './index.module.css'

export function MyComponent() {
  return (
    <div className={styles.container}>
      <button className={styles.button}>点击我</button>
    </div>
  )
}

// ❌ 错误 - 使用 Tailwind CSS
export function MyComponent() {
  return (
    <div className="flex items-center justify-center p-4">
      Content
    </div>
  )
}
```

#### 1.2 CSS 文件命名
- 组件样式文件命名为 `[component].module.css`
- 全局样式文件命名为 `globals.css`
- 使用 camelCase 命名 CSS 类

```css
/* ✅ 正确 */
.container {
  display: flex;
  align-items: center;
}

.primaryButton {
  background-color: #1e40af;
  color: white;
}

/* ❌ 错误 - 使用 Tailwind 类名 */
.flex {
  display: flex;
}
```

#### 1.3 响应式设计
- 使用 CSS 媒体查询实现响应式
- 移动优先设计

```css
/* ✅ 正确 */
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### 2. Arco Design 使用规范

#### 2.1 仅用于管理后台
- **重要**：Arco Design 仅用于管理后台 (admin) 模块
- C端（客户端）模块不能使用 Arco Design
- C端模块必须使用原生 HTML + CSS Modules

```typescript
// ✅ 正确 - 管理后台使用 Arco Design
'use client'

import { Button, Card } from '@arco-design/web-react'
import '@arco-design/web-react/dist/css/arco.css'

export function AdminComponent() {
  return (
    <Card>
      <Button type="primary">管理操作</Button>
    </Card>
  )
}

// ✅ 正确 - C端使用原生 HTML + CSS Modules
import styles from './index.module.css'

export function ClientComponent() {
  return (
    <div className={styles.card}>
      <button className={styles.button}>用户操作</button>
    </div>
  )
}

// ❌ 错误 - C端使用 Arco Design
import { Button } from '@arco-design/web-react'

export function ClientComponent() {
  return <Button>这会报错</Button>
}
```

#### 2.2 组件导入
- 必须按需导入组件，避免全量导入
- 必须导入对应的 CSS 文件

```typescript
// ✅ 正确
import { Button, Input } from '@arco-design/web-react'
import '@arco-design/web-react/dist/css/arco.css'

// ❌ 错误
import * as Arco from '@arco-design/web-react'
```

### 3. Next.js App Router 规范

#### 3.1 服务端组件
- 默认使用服务端组件
- 数据获取在服务端完成
- 使用 async/await
- C端模块优先使用服务端组件

#### 3.2 客户端组件
- 需要交互时使用 'use client'
- 状态管理在客户端组件
- 事件处理在客户端组件
- 管理后台模块使用客户端组件

### 4. API 路由规范

#### 4.1 路由结构
```
app/api/
├── users/
│   ├── route.ts        # GET /api/users, POST /api/users
│   └── [id]/
│       └── route.ts    # GET /api/users/:id, PUT /api/users/:id, DELETE /api/users/:id
```

#### 4.2 响应格式
```typescript
// 成功响应
return NextResponse.json({
  success: true,
  data: result,
})

// 错误响应
return NextResponse.json({
  success: false,
  error: {
    code: 'ERROR_CODE',
    message: 'Error message',
  },
}, { status: 400 })
```

### 5. 环境变量

创建 `.env.local` 文件：
```env
# 数据库
DATABASE_URL=

# API
API_KEY=

# 其他配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 常用命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 生产运行
npm run start

# 代码检查
npm run lint
```

## 注意事项

1. **样式系统选择**
   - 本项目使用 CSS Modules，不使用 Tailwind CSS
   - 所有样式必须写在 `.module.css` 文件中
   - 禁止使用 Tailwind CSS 类名

2. **Arco Design 使用限制**
   - 仅用于管理后台模块
   - C端模块禁止使用 Arco Design
   - C端使用原生 HTML + CSS Modules

3. **服务端组件限制**
   - 服务端组件不能使用 hooks
   - 服务端组件不能使用事件处理
   - 服务端组件不能使用浏览器 API

4. **性能优化**
   - 使用 Next.js Image 组件
   - 使用动态导入减少首屏加载
   - 合理使用缓存策略

## AI 助手行为准则

当用户请求代码时，AI 助手必须：

1. 遵循 `.trae/rules/coding_standards.md` 中的所有规范
2. 使用本项目定义的技术栈
3. **不使用 Tailwind CSS，使用 CSS Modules**
4. 管理后台使用 Arco Design，C端使用原生 HTML
5. 确保类型安全
6. 提供完整的错误处理
7. 编写可维护、可测试的代码
