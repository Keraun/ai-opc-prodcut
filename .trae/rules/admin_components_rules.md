# 管理后台公共组件使用规范

本文档定义了管理后台中公共组件的使用规范，所有管理后台页面必须优先使用这些公共组件，以保证界面的一致性和可维护性。

## 核心原则

### 优先使用公共组件

所有管理后台页面必须优先使用以下公共组件：
- `ManagementHeader` - 管理页面头部组件
- `CommonTable` - 通用表格组件

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
import { CommonTable, Tag, ActionButton } from '@/app/admin/dashboard/components'

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

### 3. 辅助组件

#### StatusBadge 组件

**功能**：状态徽章组件，用于显示不同状态。

**使用示例**：

```tsx
import { StatusBadge } from '@/app/admin/dashboard/components'

<StatusBadge status="success">已上线</StatusBadge>
<StatusBadge status="warning">草稿</StatusBadge>
<StatusBadge status="error">已下线</StatusBadge>
<StatusBadge status="info">已更新</StatusBadge>
<StatusBadge status="default">未知</StatusBadge>
```

#### Tag 组件

**功能**：标签组件，用于显示分类、标签等。

**使用示例**：

```tsx
import { Tag } from '@/app/admin/dashboard/components'

<Tag color="primary">静态页面</Tag>
<Tag color="success">用户页面</Tag>
<Tag color="warning">系统页面</Tag>
<Tag color="danger">已删除</Tag>
<Tag color="purple">动态路由</Tag>
<Tag color="orange">重要</Tag>
```

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

**使用示例**：

```tsx
import { Tooltip } from '@/app/admin/dashboard/components'

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
   - 状态显示使用 `StatusBadge`
   - 标签显示使用 `Tag`
   - 操作按钮使用 `ActionButton`

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
import { CommonTable, Tag, ActionButton } from '@/app/admin/dashboard/components'

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
        <Tag color={type === 'dynamic' ? 'purple' : 'primary'}>
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
          draft: { text: '草稿', status: 'warning' as const },
          published: { text: '已上线', status: 'success' as const },
          offline: { text: '已下线', status: 'error' as const },
        }
        const config = statusMap[status] || statusMap.draft
        return <StatusBadge status={config.status}>{config.text}</StatusBadge>
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