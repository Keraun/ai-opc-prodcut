# 项目规则

本文档定义了 AI-OPC 项目的特定规则和配置。

## 技术栈

- **框架**: Next.js 14+ (App Router)
- **UI 库**: Arco Design (字节跳动)
- **样式**: Tailwind CSS
- **语言**: TypeScript
- **包管理器**: npm

## 项目特定要求

### 1. Arco Design 使用规范

#### 1.1 客户端组件要求
- **重要**：Arco Design 组件必须在客户端组件中使用
- 所有使用 Arco Design 组件的文件必须在顶部添加 `'use client'` 指令
- 这是因为 Arco Design 内部使用了 React Context 和其他客户端特性

```typescript
// ✅ 正确 - 客户端组件
'use client'

import { Button, Card } from '@arco-design/web-react'
import '@arco-design/web-react/dist/css/arco.css'

export function MyComponent() {
  return (
    <Card>
      <Button type="primary">点击我</Button>
    </Card>
  )
}

// ❌ 错误 - 服务端组件中使用 Arco Design
import { Button } from '@arco-design/web-react'

export function MyComponent() {
  return <Button>这会报错</Button>
}
```

#### 1.2 组件导入
- 必须按需导入组件，避免全量导入
- 必须导入对应的 CSS 文件

```typescript
// ✅ 正确
import { Button, Input } from '@arco-design/web-react'
import '@arco-design/web-react/dist/css/arco.css'

// ❌ 错误
import * as Arco from '@arco-design/web-react'
```

#### 1.3 主题定制
- 使用 Arco Design 的主题定制功能
- 主题变量定义在 `app/globals.css` 中

### 2. Tailwind CSS 使用规范

#### 2.1 类名优先
- 优先使用 Tailwind 工具类
- 复杂样式使用 `@apply` 指令
- 避免内联样式

```typescript
// ✅ 正确
<div className="flex items-center justify-center p-4 bg-blue-500 text-white">
  Content
</div>

// ❌ 错误
<div style={{ display: 'flex', alignItems: 'center' }}>
  Content
</div>
```

#### 2.2 响应式设计
- 使用 Tailwind 的响应式前缀
- 移动优先设计

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 移动端 1 列，平板 2 列，桌面 3 列 */}
</div>
```

### 3. Next.js App Router 规范

#### 3.1 服务端组件
- 默认使用服务端组件
- 数据获取在服务端完成
- 使用 async/await

#### 3.2 客户端组件
- 需要交互时使用 'use client'
- 状态管理在客户端组件
- 事件处理在客户端组件

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

# 代码格式化
npm run format
```

## 注意事项

1. **Arco Design 和 Tailwind CSS 冲突**
   - 某些 Arco 组件的样式可能与 Tailwind 冲突
   - 优先使用 Arco 组件的 props 设置样式
   - 必要时使用 Tailwind 的 `!important` 工具类

2. **服务端组件限制**
   - 服务端组件不能使用 hooks
   - 服务端组件不能使用事件处理
   - 服务端组件不能使用浏览器 API

3. **性能优化**
   - 使用 Next.js Image 组件
   - 使用动态导入减少首屏加载
   - 合理使用缓存策略

## AI 助手行为准则

当用户请求代码时，AI 助手必须：

1. 遵循 `.trae/rules/coding_standards.md` 中的所有规范
2. 使用本项目定义的技术栈
3. 优先使用 Arco Design 组件
4. 确保类型安全
5. 提供完整的错误处理
6. 编写可维护、可测试的代码
