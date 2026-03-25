# 管理后台架构说明

## 目录结构

```
app/admin/
├── components/              # 共享组件
│   ├── admin-layout.tsx     # 管理后台布局组件
│   ├── admin-sidebar.tsx    # 侧边栏导航组件
│   ├── config-editor.tsx    # 配置编辑器组件
│   ├── json-viewer.tsx      # JSON查看器组件
│   ├── json-diff-viewer.tsx # JSON差异对比组件
│   ├── version-history.tsx  # 版本历史组件
│   └── index.ts             # 组件导出文件
├── hooks/                   # 自定义Hooks
│   ├── use-configs.ts       # 配置数据管理Hook
│   ├── use-save-config.ts   # 配置保存Hook
│   └── index.ts             # Hook导出文件
├── types/                   # 类型定义
│   ├── config.ts            # 配置相关类型
│   └── index.ts             # 类型导出文件
├── dashboard/               # 控制台页面（原有）
│   ├── page.tsx
│   └── dashboard.module.css
├── dashboard-new/           # 重构后的控制台页面
│   ├── page.tsx
│   └── dashboard.module.css
├── change-password/         # 修改密码页面
│   ├── page.tsx
│   └── change-password.module.css
├── page.tsx                 # 登录页面
└── admin.module.css         # 登录页面样式
```

## 架构特点

### 1. 组件化设计
- **单一职责原则**：每个组件只负责一个功能
- **可复用性**：组件可在不同页面间复用
- **类型安全**：所有组件都有完整的TypeScript类型定义

### 2. 自定义Hooks
- **useConfigs**：统一管理配置数据的获取和状态
- **useSaveConfig**：封装配置保存逻辑和错误处理

### 3. 类型系统
- **完整的类型定义**：所有数据结构都有明确的类型
- **类型导出**：便于在其他模块中使用

### 4. 布局系统
- **统一的布局组件**：AdminLayout提供一致的页面结构
- **侧边栏导航**：AdminSidebar提供清晰的导航结构

## 组件说明

### AdminLayout
管理后台的主布局组件，包含：
- 侧边栏导航
- 顶部标题栏
- 用户操作菜单
- 内容区域

### ConfigEditor
配置编辑器组件，功能包括：
- JSON格式编辑
- 语法验证
- 保存和重置功能
- 变更提示

### VersionHistory
版本历史管理组件，功能包括：
- 查看历史版本
- 版本对比
- 版本恢复

### JSONViewer / JSONDiffViewer
JSON展示和对比组件：
- 语法高亮
- 行号显示
- 差异对比
- 变更标记

## API路由

### /api/admin/auth
- GET: 检查用户认证状态

### /api/admin/login
- POST: 用户登录

### /api/admin/logout
- POST: 用户登出

### /api/admin/change-password
- POST: 修改密码

### /api/admin/config
- GET: 获取所有配置
- POST: 保存配置

### /api/admin/version
- GET: 获取配置版本历史

## 开发规范

### 1. 组件开发
- 使用TypeScript编写所有组件
- 遵循函数式组件设计
- 使用自定义Hooks管理状态
- 保持组件简洁，超过150行需拆分

### 2. 样式规范
- 使用CSS Modules
- 遵循BEM命名规范
- 保持样式的作用域隔离

### 3. 错误处理
- 所有API调用都要有错误处理
- 使用toast提示用户
- 记录错误日志

### 4. 性能优化
- 使用React.memo优化渲染
- 合理使用useMemo和useCallback
- 避免不必要的重新渲染

## 迁移指南

从旧的dashboard迁移到新架构：

1. **替换导入路径**
```typescript
// 旧
import { JSONViewer } from './dashboard/page'

// 新
import { JSONViewer } from '../components'
```

2. **使用新的Hooks**
```typescript
// 旧
const [configs, setConfigs] = useState({})

// 新
const { configs, loading, error, refetch } = useConfigs()
```

3. **使用布局组件**
```typescript
// 旧
<div className={styles.container}>
  {/* 页面内容 */}
</div>

// 新
<AdminLayout title="页面标题">
  {/* 页面内容 */}
</AdminLayout>
```

## 未来扩展

### 1. 文章管理模块
- 文章列表
- 文章编辑器
- 分类管理
- 标签管理

### 2. 用户管理模块
- 用户列表
- 权限管理
- 角色管理

### 3. 系统设置模块
- 系统配置
- 日志查看
- 性能监控

### 4. 数据统计模块
- 访问统计
- 用户行为分析
- 性能指标
