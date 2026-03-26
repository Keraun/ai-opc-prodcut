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

### 2. SVG 图标规范

#### 2.1 图标设计原则
- **参考 Arco Design 视觉风格**：线条简洁、几何规整、圆角处理
- **统一线条粗细**：使用 `strokeWidth="1.5"`
- **圆角处理**：所有线条端点使用 `strokeLinecap="round"`，线条连接处使用 `strokeLinejoin="round"`
- **不使用填充**：优先使用描边 (`stroke`) 而非填充 (`fill`)
- **统一 viewBox**：使用 `viewBox="0 0 24 24"` 保持一致性

```tsx
// ✅ 正确示例
export const HomeIcon = () => (
  <svg className={styles.svgIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V9.5z" />
  </svg>
)

// ❌ 错误示例
export const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" strokeWidth="2">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V9.5z" />
  </svg>
)
```

#### 2.2 图标文件组织
- 所有 SVG 图标存放在 `modules/icons.tsx` 文件中
- 每个图标为独立的函数组件
- 使用 `icons.module.css` 管理图标样式
- 图标命名使用 PascalCase，后缀为 `Icon`

### 3. 响应式组件规范

#### 3.1 设备形态概念
- **Web 形态**：桌面端浏览器环境，展示完整功能
- **Mobile 形态**：移动端浏览器环境，简化布局和交互

#### 3.2 Menu 组件设备形态
项目提供两个独立的菜单组件：
- **Menu 组件**：Web 端横向布局菜单（适用于桌面端浏览器）
- **MobileMenu 组件**：Mobile 端侧滑抽屉菜单（适用于移动端浏览器）

组件应根据设备类型选择使用：
- 在 Web 浏览器环境下，使用 Menu 组件
- 在移动端环境下，使用 MobileMenu 组件

```tsx
// ✅ 正确示例
'use client'

import { useState, useEffect } from 'react'
import { Menu, MobileMenu } from '@/components/ui'

export function Navigation() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768)
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  if (isMobile) {
    return <MobileMenu items={menuItems} />
  }

  return <Menu items={menuItems} variant="underline" />
}
```

### 4. Arco Design 使用规范

#### 4.1 仅用于管理后台
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

#### 4.2 组件导入
- 必须按需导入组件，避免全量导入
- 必须导入对应的 CSS 文件

```typescript
// ✅ 正确
import { Button, Input } from '@arco-design/web-react'
import '@arco-design/web-react/dist/css/arco.css'

// ❌ 错误
import * as Arco from '@arco-design/web-react'
```

### 5. Next.js App Router 规范

#### 5.1 服务端组件
- 默认使用服务端组件
- 数据获取在服务端完成
- 使用 async/await
- C端模块优先使用服务端组件

#### 5.2 客户端组件
- 需要交互时使用 'use client'
- 状态管理在客户端组件
- 事件处理在客户端组件
- 管理后台模块使用客户端组件

### 6. API 路由规范

#### 6.1 路由结构
```
app/api/
├── users/
│   ├── route.ts        # GET /api/users, POST /api/users
│   └── [id]/
│       └── route.ts    # GET /api/users/:id, PUT /api/users/:id, DELETE /api/users/:id
```

#### 6.2 响应格式
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

### 7. 环境变量

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
8. SVG 图标遵循 Arco Design 视觉风格（strokeWidth=1.5、圆角处理）
9. 响应式组件支持 Web 和 Mobile 两种设备形态
