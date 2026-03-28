# 服务端UI组件库

这是一套专为Next.js服务端渲染设计的轻量级UI组件库。

## 组件列表

### Button
可配置的按钮组件，支持多种变体和尺寸。

```tsx
import { Button } from "@/components/ui"

<Button variant="primary" size="md">
  点击我
</Button>

<Button variant="secondary" icon={<Icon />}>
  带图标的按钮
</Button>

<Button variant="outline" loading>
  加载中...
</Button>
```

**Props:**
- `variant`: "primary" | "secondary" | "outline" | "ghost" | "text"
- `size`: "sm" | "md" | "lg"
- `fullWidth`: 是否全宽
- `icon`: 图标元素
- `iconPosition`: "left" | "right"
- `loading`: 加载状态
- `disabled`: 禁用状态

### Card
卡片容器组件，支持多种样式变体。

```tsx
import { Card } from "@/components/ui"

<Card
  title="卡片标题"
  description="卡片描述文本"
  variant="elevated"
  hover
>
  <p>卡片内容</p>
</Card>
```

**Props:**
- `title`: 标题
- `description`: 描述
- `footer`: 底部内容
- `variant`: "default" | "outlined" | "elevated"
- `padding`: "none" | "sm" | "md" | "lg"
- `hover`: 是否悬停效果

### Section
页面区块组件，用于组织页面内容。

```tsx
import { Section } from "@/components/ui"

<Section
  id="features"
  title="功能特性"
  description="了解我们的核心功能"
  badge="新功能"
  variant="gradient"
>
  <p>区块内容</p>
</Section>
```

**Props:**
- `id`: 区块ID
- `title`: 标题
- `description`: 描述
- `badge`: 标签
- `variant`: "default" | "gradient" | "minimal"
- `padding`: "none" | "sm" | "md" | "lg"
- `maxWidth`: "sm" | "md" | "lg" | "xl" | "full"
- `centered`: 是否居中

### Menu
导航菜单组件，支持水平和垂直布局。

```tsx
import { Menu } from "@/components/ui"

<Menu
  items={[
    { id: '1', label: '首页', href: '/', icon: <HomeIcon /> },
    { id: '2', label: '产品', href: '/product', badge: '新' },
    { id: '3', label: '关于', href: '/about', disabled: true }
  ]}
  variant="pills"
  orientation="horizontal"
/>
```

**Props:**
- `items`: 菜单项数组
- `orientation`: "horizontal" | "vertical"
- `variant`: "default" | "pills" | "underline"
- `size`: "sm" | "md" | "lg"

## 设计原则

1. **服务端优先**: 所有组件都可以在服务端渲染
2. **类型安全**: 完整的TypeScript类型定义
3. **可组合性**: 组件可以自由组合使用
4. **可定制**: 通过props和className灵活定制样式
5. **无依赖**: 纯CSS实现，不依赖外部UI库

## 样式系统

组件使用Tailwind CSS进行样式设计，确保：
- 一致的设计语言
- 响应式布局
- 可访问性支持
- 性能优化

## 使用示例

```tsx
import { Button, Card, Section, Menu } from "@/components/ui"

export default function Page() {
  return (
    <>
      <Menu items={menuItems} variant="underline" />
      
      <Section title="产品展示" description="我们的核心产品">
        <div className="grid grid-cols-3 gap-6">
          <Card title="产品1" description="描述1" hover>
            <Button variant="primary">了解更多</Button>
          </Card>
          <Card title="产品2" description="描述2" hover>
            <Button variant="secondary">了解更多</Button>
          </Card>
        </div>
      </Section>
    </>
  )
}
```

## 扩展指南

如需添加新组件，请遵循以下规范：

1. 在`components/ui/`目录创建新文件
2. 导出组件和类型定义
3. 在`components/ui/index.ts`中添加导出
4. 更新此文档
