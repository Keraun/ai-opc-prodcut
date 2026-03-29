# 管理后台公共组件使用规范

本文档定义了管理后台中公共组件的使用规范，所有管理后台页面必须优先使用这些公共组件，以保证界面的一致性和可维护性。

## 核心原则

### 优先使用公共组件

所有管理后台页面必须优先使用以下公共组件：
- `ManagementHeader` - 管理页面头部组件
- `CommonTable` - 通用表格组件
- `WebPImage` - WebP 兼容图片组件（基于 Next.js Image）
- `ResponsiveImage` - 响应式图片组件

### 保持风格一致

- 所有页面应使用统一的颜色方案
- 所有表格应使用统一的样式
- 所有操作按钮应使用统一的样式
- 所有状态徽章和标签应使用统一的样式

## 公共组件使用指南

### 1. ManagementHeader 组件

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

### 2. CommonTable 组件

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

### 3. WebPImage 组件

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

### 4. ResponsiveImage 组件

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

## 组件特性

### CommonTable 组件特性

1. **视觉优化**：
   - 紧凑的行高和间距
   - 优雅的悬停效果
   - 渐变的表头背景
   - 平滑的过渡动画
   - 美观的滚动条样式

2. **功能完善**：
   - 支持加载状态
   - 支持空状态
   - 支持分页
   - 支持横向滚动
   - 支持自定义列渲染

3. **响应式设计**：
   - 适配不同屏幕尺寸
   - 在小屏幕上优化显示

### 操作按钮特性

1. **统一的样式**：
   - 一致的圆角和阴影
   - 清晰的颜色区分
   - 优雅的悬停效果

2. **类型支持**：
   - `default`：默认按钮
   - `primary`：主要按钮
   - `success`：成功按钮
   - `warning`：警告按钮
   - `danger`：危险按钮

### 状态徽章和标签特性

1. **现代化设计**：
   - 圆角设计
   - 细边框
   - 轻微阴影
   - 悬停效果

2. **颜色支持**：
   - 多种颜色选项
   - 语义化的颜色搭配

## 最佳实践

1. **保持一致性**：所有管理页面应使用相同的组件和样式。

2. **合理使用**：
   - 表格数据使用 `CommonTable`
   - 页面头部使用 `ManagementHeader`
   - 图片展示优先使用 `WebPImage` 组件
   - 需要响应式和懒加载的图片使用 `ResponsiveImage` 组件
   - 状态显示使用 Arco Design 的 `Tag` 组件
   - 分类/标签显示使用 Arco Design 的 `Tag` 组件
   - 操作按钮使用 `ActionButton`
   - 提示框使用 Arco Design 的 `Tooltip` 组件

3. **性能优化**：
   - 合理使用 `loading` 状态
   - 避免不必要的重渲染
   - 优化表格数据的处理

4. **用户体验**：
   - 提供清晰的空状态提示
   - 使用合适的加载动画
   - 保持操作按钮的一致性
   - 提供明确的视觉反馈

## 示例页面

### 页面管理

```tsx
import { CommonTable, ActionButton } from '@/app/admin/dashboard/components'
import { Tag } from '@arco-design/web-react'

<CommonTable
  columns={[
    {
      title: '页面名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '页面类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'dynamic' ? 'purple' : 'arcoblue'}>
          {type === 'dynamic' ? '动态路由' : '静态页面'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          draft: { text: '草稿', color: 'gray' as const },
          published: { text: '已上线', color: 'green' as const },
          offline: { text: '已下线', color: 'red' as const },
        }
        const config = statusMap[status] || statusMap.draft
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <ActionButton type="primary" icon={<IconEdit />} onClick={() => handleEdit(record)}>
            编辑
          </ActionButton>
          <ActionButton type="default" icon={<IconEye />} onClick={() => handlePreview(record)}>
            预览
          </ActionButton>
          {record.status === 'draft' && (
            <ActionButton type="success" onClick={() => handlePublish(record)}>
              发布
            </ActionButton>
          )}
          {record.status === 'published' && (
            <ActionButton type="warning" onClick={() => handleOffline(record)}>
              下线
            </ActionButton>
          )}
          <ActionButton type="danger" icon={<IconDelete />} onClick={() => handleDelete(record)}>
            删除
          </ActionButton>
        </div>
      ),
    },
  ]}
  data={pages}
  loading={loading}
  pagination={{ pageSize: 10 }}
  emptyText="暂无页面数据"
/>
```

## 总结

使用公共组件可以：

1. **提高开发效率**：减少重复代码，快速构建页面
2. **保证一致性**：所有页面保持统一的视觉风格
3. **便于维护**：集中管理组件样式和逻辑
4. **提升用户体验**：提供一致的交互体验

所有管理后台页面必须遵循本规范，优先使用公共组件。