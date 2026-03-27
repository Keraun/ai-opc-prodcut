# 数据库规则

本项目使用 SQLite 数据库（better-sqlite3）作为数据存储方案，替代原有的 JSON 文件存储。

## 数据库架构

### 数据库文件
- **主数据库**: `database/app.db` - 运行时数据库文件
- **模板文件**: `database/templates/` - 初始化模板（保留用于重置）
- **备份目录**: `database/backup/` - 数据备份目录（导出JSON时创建）

### 数据表结构

#### 1. accounts - 管理员账号表
```sql
CREATE TABLE accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email TEXT,
  remark TEXT,
  must_change_password INTEGER DEFAULT 0,
  last_login_time TEXT,
  last_login_ip TEXT,
  current_login_ip TEXT,
  current_login_time TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. system_config - 系统配置表
```sql
CREATE TABLE system_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  config_key TEXT UNIQUE NOT NULL,
  config_value TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

**存储内容**:
- `feishu_app` - 飞书应用配置
- `super_admin_token` - 超级管理员 Token, STRING 字符串
- `site_config` - 站点配置（JSON 格式，包含站点基本信息、SEO配置、社交媒体链接、当前主题等）

**site_config 配置结构**:
```json
{
  "name": "站点名称",
  "description": "站点描述",
  "url": "https://example.com",
  "ogImage": "/og-image.png",
  "links": {"email": "...", "wechat": "..."},
  "creator": {"name": "...", "url": "..."},
  "contact": {"address": "...", "phone": "..."},
  "support": {"customerServiceQRCode": "..."},
  "icp": "浙ICP备XXXXXXXX号",
  "features": {"enableTOC": true},
  "seo": {"keywords": []},
  "currentTheme": "modern"
}
```

#### 3. system_logs - 系统日志表
```sql
CREATE TABLE system_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  log_id INTEGER UNIQUE,
  username TEXT,
  type TEXT NOT NULL,
  description TEXT,
  ip TEXT,
  timestamp TEXT,
  details TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. theme_config - 主题配置表
```sql
CREATE TABLE theme_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  theme_id TEXT UNIQUE NOT NULL,
  theme_name TEXT NOT NULL,
  theme_config TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

**字段说明**:
- `theme_id`: 主题唯一标识符（如：`modern`、`tech`、`minimal`）
- `theme_name`: 主题显示名称（如：`现代简约`、`科技深色`、`极简主义`）
- `theme_config`: 主题配置数据（JSON 格式，包含颜色、样式等配置）

**设计说明**:
- 每个主题存储为一条独立记录
- 支持动态添加和删除主题
- 当前使用的主题存储在 `system_config` 表的 `site_config` 配置项中

#### 5. pages - 页面表
```sql
CREATE TABLE pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  type TEXT DEFAULT 'static',
  description TEXT,
  status TEXT DEFAULT 'draft',
  is_system INTEGER DEFAULT 0,
  is_deletable INTEGER DEFAULT 1,
  route TEXT,
  dynamic_param TEXT,
  module_instance_ids TEXT DEFAULT '[]',
  created_at TEXT,
  updated_at TEXT,
  published_at TEXT
);
```

**字段说明**:
- `page_id`: 页面唯一标识符
- `name`: 页面名称
- `slug`: 页面别名
- `type`: 页面类型（static/dynamic）
- `status`: 页面状态（draft/published）
- `is_system`: 是否为系统页面
- `is_deletable`: 是否可删除
- `route`: 页面路由
- `dynamic_param`: 动态路由参数
- `module_instance_ids`: **模块实例ID数组（JSON格式）**，格式为 `["模块实例ID1", "模块实例ID2", ...]`

**模块实例ID规则**:
- 格式：`模块ID-时间戳-序号`
- 示例：`section-hero-1774641692508-0`、`site-header-1774641692508-1`
- 同一模块可以在同一页面多次使用，每次使用生成不同的实例ID
- **重要**：模块实例ID的前缀部分（去掉时间戳和序号）必须与 `module_registry.module_id` 匹配

#### 6. module_registry - 模块注册表
```sql
CREATE TABLE module_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_id TEXT UNIQUE NOT NULL,
  module_name TEXT NOT NULL,
  schema TEXT,
  default_data TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

**字段说明**:
- `module_id`: 模块唯一标识符（如：`section-hero`、`site-header`）
- `module_name`: 模块显示名称
- `schema`: 模块配置的 Schema 定义（JSON 格式）
- `default_data`: 模块默认数据（JSON 格式）

**设计说明**:
- 前端页面注册模块时写入此表
- 重新注册模块时会覆盖数据（使用 `INSERT OR REPLACE`）
- 用于页面编辑时左侧面板显示可用模块列表
- 存储模块的默认配置和 Schema 信息

#### 7. page_modules - 页面模块实例表
```sql
CREATE TABLE page_modules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_instance_id TEXT UNIQUE NOT NULL,
  page_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  module_name TEXT NOT NULL,
  module_order INTEGER NOT NULL,
  data TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (page_id) REFERENCES pages(page_id) ON DELETE CASCADE
);
```

**字段说明**:
- `module_instance_id`: 模块实例ID（唯一），格式为 `模块ID-时间戳-序号`
- `page_id`: 关联的页面 ID（外键，关联 pages 表）
- `module_id`: **原始模块ID**（关联 module_registry.module_id，不带时间戳）
- `module_name`: 原始模块名称
- `module_order`: 模块在页面中的显示顺序
- `data`: 模块实例的独立数据（JSON 格式，可为空）

**设计说明**:
- 存储页面上每个模块实例的具体数据
- 如果 `data` 为空，则使用 `module_registry` 表中的默认数据
- 支持同一模块在同一页面上多次使用（通过不同的实例ID区分）
- 页面编辑时右侧显示的模块列表从此表获取
- **重要**：`module_id` 字段必须存储原始模块ID（如 `section-hero`），而不是带时间戳的实例ID

## 数据关系图

```
┌─────────────────────┐
│       pages         │
│─────────────────────│
│ page_id (PK)        │
│ name                │
│ module_instance_ids │◄─────────────────────────────────────┐
│ ...                 │                                      │
└────────┬────────────┘                                      │
         │                                                   │
         │ 1:N                                               │
         ▼                                                   │
┌─────────────────────┐                                      │
│   page_modules      │                                      │
│─────────────────────│                                      │
│ module_instance_id  │◄───── 模块实例ID存储在 pages.module_instance_ids 中
│ page_id (FK)        │                                      │
│ module_id           │                                      │
│ module_name         │                                      │
│ data                │                                      │
└────────┬────────────┘                                      │
         │                                                   │
         │ N:1                                               │
         ▼                                                   │
┌─────────────────────┐                                      │
│  module_registry    │◄─── 前端注册模块时写入               │
│─────────────────────│                                      │
│ module_id (PK)      │                                      │
│ module_name         │                                      │
│ schema              │                                      │
│ default_data        │                                      │
└─────────────────────┘                                      │
                                                             │
页面编辑时数据流：                                            │
├─ 左侧面板：从 module_registry 获取可用模块列表              │
└─ 右侧面板：从 page_modules 获取当前页面的模块实例 ──────────┘
```

## 数据访问规则

### 1. 服务器端专用
- **所有数据库操作必须在服务器端进行**
- 使用 `server-only` 包确保模块不会被客户端代码导入
- 客户端通过 API 路由访问数据

### 2. 页面列表数据访问
```typescript
import { getPagesList } from '@/lib/config-manager'

// 获取页面列表（从 pages 表）
const pages = getPagesList()
```

### 3. 模块注册表访问
```typescript
import { getModuleRegistryList, registerModule } from '@/lib/module-service'

// 获取所有已注册的模块（用于页面编辑左侧面板）
const modules = getModuleRegistryList()

// 注册新模块（前端调用）
registerModule('section-hero', '英雄区块', schema, defaultData)
```

### 4. 页面模块实例访问
```typescript
import { getPageModules, createModuleInstance } from '@/lib/module-service'

// 获取页面的所有模块实例（用于页面编辑右侧面板）
const pageModules = getPageModules('home')

// 创建新的模块实例
const instanceId = createModuleInstance('home', 'section-hero', 0, customData)
```

### 5. 数据库连接管理
- 每次操作获取新的数据库连接
- 操作完成后立即关闭连接
- 使用 `try-finally` 确保连接关闭

```typescript
const db = getDatabase()
try {
  // 数据库操作
} finally {
  db.close()
}
```

## 数据迁移规则

### 首次部署或重置
```bash
# 从模板初始化数据库
pnpm exec tsx scripts/migrate-database.ts
```

### theme_config 表结构迁移
如果需要从旧版本的 theme_config 表结构迁移到新版本：

```bash
# 执行主题配置表迁移
pnpm exec tsx scripts/migrate-theme-config.ts
```

**迁移内容**:
- 将 `current_theme` 字段移到 `site_config` 表
- 将 `themes_config` JSON 拆分为多条记录
- 每个主题存储为一条独立记录

### site_config 表合并到 system_config 表迁移
如果需要将 site_config 表的数据合并到 system_config 表：

```bash
# 执行站点配置表合并迁移
pnpm exec tsx scripts/migrate-site-config.ts
```

**迁移内容**:
- 将 `site_config` 表的所有配置项合并为一个 JSON 对象
- 存储到 `system_config` 表，config_key 为 `site_config`
- 备份旧的 `site_config` 表到 `site_config_backup`
- 删除旧的 `site_config` 表

### 从旧版本 JSON 数据迁移
如果存在旧的 JSON 备份文件（runtime 目录），可以临时恢复后迁移：

```typescript
import { migrateFromJson } from '@/lib/migrate'

// 从 runtime 目录迁移（需要先恢复 runtime 目录）
migrateFromJson(false)

// 从模板迁移（全新初始化）
migrateFromJson(true)
```

## 备份与恢复

### 备份数据库

#### 方式1: 导出 SQLite 数据库文件（推荐）
```bash
# API 方式
GET /api/admin/config/export?format=db

# 或直接复制文件
cp database/app.db database/backup/app-$(date +%Y%m%d).db
```

#### 方式2: 导出为 JSON 格式
```bash
# API 方式
GET /api/admin/config/export?format=json

# 或使用管理接口
POST /api/admin/database
Content-Type: application/json
{
  "action": "export"
}
```

### 恢复数据库

#### 从 .db 文件恢复
```bash
# 方式1: API 上传
POST /api/admin/config/import
Content-Type: multipart/form-data
file: app.db

# 方式2: 直接替换文件
cp database/backup/app-YYYYMMDD.db database/app.db
```

#### 从 JSON 备份恢复
```bash
# 上传包含 runtime 目录的 zip 文件
POST /api/admin/config/import
Content-Type: multipart/form-data
file: config-export.zip

# 系统会自动：
# 1. 解压 zip 文件
# 2. 提取 runtime 目录
# 3. 执行 JSON 到 SQLite 的迁移
# 4. 清理临时文件
```

## 数据映射关系

| 原 JSON 文件 | SQLite 表 | 配置类型 | 说明 |
|-------------|----------|---------|------|
| system-account.json | accounts | account | 管理员账号 |
| system-feishu-app.json | system_config | feishu-app | 飞书配置（key='feishu_app'） |
| system-token.json | system_config | token | Token配置（key='super_admin_token'） |
| system-logs.json | system_logs | system-logs | 系统日志 |
| site-config.json | system_config | site | 站点配置（key='site_config'，JSON格式，包含currentTheme） |
| theme-config.json | theme_config | theme | 主题配置（每个主题一条记录） |
| page-list.json | pages | page-list | 页面列表（module_instance_ids字段存储实例ID数组） |
| page-list.json | page_modules | - | 页面模块实例数据 |
| data-*.json | module_registry | - | 模块注册信息（schema和默认数据） |

**注意**:
- `site-config.json` 中的所有配置项合并为一个 JSON 对象，存储在 `system_config` 表中（key='site_config'）
- `theme-config.json` 中的 `currentTheme` 字段包含在 `site_config` 配置对象中
- `theme-config.json` 中的 `themes` 对象拆分为 `theme_config` 表中的多条记录

## 页面编辑数据流

### 获取页面列表
```
前端请求 → API → pages表 → 返回页面列表
```

### 页面编辑 - 左侧面板（可用模块）
```
前端请求 → API → module_registry表 → 返回所有已注册模块
```

### 页面编辑 - 右侧面板（当前页面模块）
```
前端请求 → API → page_modules表（WHERE page_id = ?）→ 返回页面模块实例列表
```

### 添加模块到页面
```
1. 前端选择模块 → API
2. 生成模块实例ID：模块名-时间戳
3. 插入 page_modules 表
4. 更新 pages.module_instance_ids 字段（添加实例ID）
```

### 删除页面模块
```
1. 前端请求删除 → API
2. 从 page_modules 表删除记录
3. 更新 pages.module_instance_ids 字段（移除实例ID）
```

## 性能优化

### 索引策略
- 所有主键自动创建索引
- 常用查询字段创建索引：
  - `accounts.username`
  - `system_config.config_key`
  - `system_logs.type`, `system_logs.username`
  - `site_config.config_key`
  - `pages.page_id`, `pages.status`
  - `page_modules.page_id`, `page_modules.module_instance_id`
  - `module_registry.module_id`

### 查询优化
- 使用参数化查询防止 SQL 注入
- 批量操作使用事务
- 避免 `SELECT *`，只查询需要的字段

## 安全规则

### 1. SQL 注入防护
- **必须使用参数化查询**
- 禁止字符串拼接 SQL

```typescript
// ✅ 正确
const stmt = db.prepare('SELECT * FROM accounts WHERE username = ?')
const user = stmt.get(username)

// ❌ 错误
const user = db.exec(`SELECT * FROM accounts WHERE username = '${username}'`)
```

### 2. 数据验证
- 所有写入数据必须经过验证
- 使用 TypeScript 类型检查
- 敏感数据加密存储（密码使用 bcrypt）

### 3. 访问控制
- API 路由必须验证权限
- 敏感操作需要管理员权限
- 记录所有关键操作日志

## 文件结构说明

### 当前数据库文件结构
```
database/
├── app.db              # SQLite 数据库文件（主数据库）
├── app.db-wal          # SQLite WAL 日志文件
├── app.db-shm          # SQLite 共享内存文件
├── templates/          # 模板文件（用于初始化）
│   ├── page-data/      # 页面模块模板
│   ├── site-info/      # 站点信息模板
│   ├── system/         # 系统配置模板
│   ├── theme/          # 主题配置模板
│   └── page-list.json  # 页面列表模板
└── backup/             # 备份目录（导出JSON时创建）
```

### 已删除的文件
- ✅ `database/runtime/` - 运行时 JSON 文件目录（已迁移到 SQLite）
  - 所有数据现在存储在 `database/app.db` 中
  - 不再需要运行时 JSON 文件

### 必须保留的文件
- ❌ `database/templates/` - 模板文件（用于初始化和重置）
- ❌ `database/app.db` - SQLite 数据库文件
- ❌ `database/app.db-wal` - SQLite WAL 日志文件
- ❌ `database/app.db-shm` - SQLite 共享内存文件

## 错误处理

### 数据库连接失败
```typescript
try {
  const db = getDatabase()
  // 操作
} catch (error) {
  console.error('Database connection failed:', error)
  throw new Error('数据库连接失败')
}
```

### 数据不存在
```typescript
const config = db.prepare('SELECT * FROM site_config WHERE config_key = ?').get(key)
if (!config) {
  return {} // 返回空对象，不抛出错误
}
```

### 事务处理
```typescript
try {
  db.exec('BEGIN TRANSACTION')
  // 多个操作
  db.exec('COMMIT')
} catch (error) {
  db.exec('ROLLBACK')
  throw error
}
```

## 监控与维护

### 数据库健康检查
- 定期检查数据库文件大小
- 监控查询性能
- 清理过期日志

### 数据清理策略
- 系统日志保留最近 30 天
- 定期优化数据库（VACUUM）
- 备份后清理旧备份文件

## 开发环境设置

```bash
# 1. 安装依赖
pnpm install

# 2. 运行数据库迁移（首次运行）
pnpm exec tsx scripts/migrate-database.ts

# 3. 启动开发服务器
pnpm dev
```

## 生产环境部署

```bash
# 1. 安装生产依赖
pnpm install --prod

# 2. 检查数据库是否存在
if [ ! -f "database/app.db" ]; then
  pnpm exec tsx scripts/migrate-database.ts
fi

# 3. 启动应用
pnpm start
```

## 故障排除

### 数据库文件损坏
```bash
# 从备份恢复
cp database/backup/app-YYYYMMDD.db database/app.db

# 或从模板重新初始化
rm database/app.db
pnpm exec tsx scripts/migrate-database.ts
```

### better-sqlite3 编译问题
```bash
# 重新编译
cd node_modules/.pnpm/better-sqlite3@*/node_modules/better-sqlite3
npm run build-release
```

### 权限问题
```bash
# 确保数据库目录有写权限
chmod 755 database/
chmod 644 database/app.db
```

### 客户端导入错误
如果看到 "Could not locate the bindings file" 错误：
- 原因：`better-sqlite3` 是 Node.js 原生模块，不能在浏览器运行
- 解决：确保所有数据库相关文件都导入了 `server-only`
- 检查：`lib/database.ts`, `lib/config-manager.ts`, `lib/migrate.ts` 都应有 `import "server-only"`

## API 接口说明

### 数据库管理接口

#### POST /api/admin/database
管理数据库操作

```typescript
// 导出数据库到 JSON
{
  "action": "export"
}

// 从 JSON 迁移数据
{
  "action": "migrate",
  "useTemplates": false  // true=从模板迁移, false=从runtime迁移
}
```

#### GET /api/admin/database?action=export
导出数据库到 JSON 备份文件

### 配置导入导出接口

#### GET /api/admin/config/export
导出数据库

```typescript
// 导出 SQLite 数据库文件
GET /api/admin/config/export?format=db

// 导出为 JSON 格式
GET /api/admin/config/export?format=json
```

#### POST /api/admin/config/import
导入数据库

```typescript
// 支持 .db 文件直接导入
// 支持 .zip 文件（包含 runtime 目录）自动迁移
Content-Type: multipart/form-data
file: <database-file>
```

### 模块注册接口

#### POST /api/modules/register
注册新模块

```typescript
{
  "moduleId": "section-hero",
  "moduleName": "英雄区块",
  "schema": { /* 配置Schema */ },
  "defaultData": { /* 默认数据 */ }
}
```

#### GET /api/modules/list
获取所有已注册模块

## 相关文件

- [lib/database.ts](file:///Users/wulingyang/Documents/workspace/ai-opc-prodcut/lib/database.ts) - 数据库初始化和管理
- [lib/config-manager.ts](file:///Users/wulingyang/Documents/workspace/ai-opc-prodcut/lib/config-manager.ts) - 配置管理器
- [lib/module-service.ts](file:///Users/wulingyang/Documents/workspace/ai-opc-prodcut/lib/module-service.ts) - 模块服务
- [lib/migrate.ts](file:///Users/wulingyang/Documents/workspace/ai-opc-prodcut/lib/migrate.ts) - 数据迁移工具
- [scripts/migrate-database.ts](file:///Users/wulingyang/Documents/workspace/ai-opc-prodcut/scripts/migrate-database.ts) - 迁移脚本
- [app/api/admin/database/route.ts](file:///Users/wulingyang/Documents/workspace/ai-opc-prodcut/app/api/admin/database/route.ts) - 数据库管理API
- [app/api/admin/config/import/route.ts](file:///Users/wulingyang/Documents/workspace/ai-opc-prodcut/app/api/admin/config/import/route.ts) - 配置导入API
- [app/api/admin/config/export/route.ts](file:///Users/wulingyang/Documents/workspace/ai-opc-prodcut/app/api/admin/config/export/route.ts) - 配置导出API
- [docs/DATABASE.md](file:///Users/wulingyang/Documents/workspace/ai-opc-prodcut/docs/DATABASE.md) - 数据库使用文档
