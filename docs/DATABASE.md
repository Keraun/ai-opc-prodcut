# SQLite 数据库使用说明

## 概述

项目已从JSON文件数据库迁移到SQLite数据库（使用 better-sqlite3），提供更好的性能、数据完整性和并发安全性。

## 数据库文件

- **数据库文件**: `database/app.db`
- **模板文件**: `database/templates/` (保留用于初始化和重置)
- **备份目录**: `database/backup/` (导出JSON备份时使用)

## 数据库结构

### 表结构

1. **accounts** - 管理员账号表
2. **system_config** - 系统配置表（键值对存储）
3. **system_logs** - 系统日志表
4. **site_config** - 站点配置表（键值对存储）
5. **theme_config** - 主题配置表
6. **pages** - 页面列表表
7. **page_modules** - 页面模块关联表
8. **module_data** - 模块数据表

## API 接口

### 数据库管理接口

**POST /api/admin/database**

```typescript
// 导出数据库到JSON
{
  "action": "export"
}

// 从JSON迁移数据
{
  "action": "migrate",
  "useTemplates": false  // true表示从templates迁移，false表示从runtime迁移
}
```

**GET /api/admin/database?action=export**

导出数据库到JSON备份文件

## 命令行工具

### 数据迁移

```bash
# 从runtime JSON文件迁移数据
pnpm exec tsx scripts/migrate-database.ts

# 或使用npx tsx
npx tsx scripts/migrate-database.ts
```

### 数据备份

```bash
# 通过API导出
curl -X POST http://localhost:3000/api/admin/database \
  -H "Content-Type: application/json" \
  -d '{"action": "export"}'
```

## 代码使用

### 读取配置

```typescript
import { readConfig, readSystemConfig, readPageData } from '@/lib/config-manager'

// 读取系统配置
const feishuConfig = readSystemConfig('feishu-app')
const accounts = readSystemConfig('account')

// 读取页面数据
const heroData = readPageData('section-hero')
const themeData = readConfig('theme')
```

### 写入配置

```typescript
import { writeConfig, writeSystemConfig, writePageData } from '@/lib/config-manager'

// 写入系统配置
writeSystemConfig('feishu-app', {
  appId: 'xxx',
  appSecret: 'xxx',
  appToken: 'xxx'
})

// 写入页面数据
writePageData('section-hero', {
  title: 'New Title',
  subtitle: 'New Subtitle'
})
```

### 页面响应

```typescript
import { getPageResponse } from '@/lib/config-manager'

// 获取页面完整数据（包含模块和通用配置）
const pageData = getPageResponse('home')
```

## 数据迁移映射

| JSON文件 | SQLite表 | 说明 |
|---------|---------|------|
| system-account.json | accounts | 管理员账号 |
| system-feishu-app.json | system_config | 飞书配置（key='feishu_app'） |
| system-token.json | system_config | Token配置（key='super_admin_token'） |
| system-logs.json | system_logs | 系统日志 |
| site-config.json | site_config | 站点配置 |
| theme-config.json | theme_config | 主题配置 |
| page-list.json | pages + page_modules | 页面列表和模块关联 |
| data-*.json | module_data | 各模块数据 |

## 性能优势

1. **更快的读取速度**: SQLite比JSON文件读取更快
2. **数据完整性**: 支持外键约束和事务
3. **查询灵活性**: 支持复杂SQL查询
4. **备份简单**: 单个.db文件，易于备份和恢复
5. **并发安全**: better-sqlite3提供线程安全的操作

## 备份策略

### 自动备份

建议定期备份数据库文件：

```bash
# 复制数据库文件
cp database/app.db database/backup/app-$(date +%Y%m%d).db

# 或导出为JSON
curl -X POST http://localhost:3000/api/admin/database \
  -H "Content-Type: application/json" \
  -d '{"action": "export"}'
```

### 恢复数据

1. **从.db文件恢复**: 直接替换 `database/app.db` 文件
2. **从JSON恢复**: 使用迁移脚本导入JSON数据

```bash
# 从JSON迁移
pnpm exec tsx scripts/migrate-database.ts
```

## 注意事项

1. **数据库文件位置**: `database/app.db` 已添加到 `.gitignore`
2. **首次部署**: 需要运行迁移脚本创建数据库
3. **模板文件**: `database/templates/` 保留用于初始化
4. **并发访问**: better-sqlite3 是同步的，适合单进程应用

## 开发环境设置

```bash
# 1. 安装依赖
pnpm install

# 2. 运行数据库迁移
pnpm exec tsx scripts/migrate-database.ts

# 3. 启动开发服务器
pnpm dev
```

## 生产环境部署

```bash
# 1. 安装依赖
pnpm install --prod

# 2. 如果没有数据库，从模板创建
pnpm exec tsx scripts/migrate-database.ts

# 3. 启动应用
pnpm start
```

## 故障排除

### 数据库文件损坏

```bash
# 从备份恢复
cp database/backup/app-YYYYMMDD.db database/app.db

# 或从JSON重新迁移
pnpm exec tsx scripts/migrate-database.ts
```

### 权限问题

```bash
# 确保数据库目录有写权限
chmod 755 database/
chmod 644 database/app.db
```

### better-sqlite3 编译问题

```bash
# 重新编译 better-sqlite3
cd node_modules/.pnpm/better-sqlite3@*/node_modules/better-sqlite3
npm run build-release
```

## 相关文件

- [lib/database.ts](file:///Users/wulingyang/Documents/workspace/ai-opc-prodcut/lib/database.ts) - 数据库初始化和管理
- [lib/config-manager.ts](file:///Users/wulingyang/Documents/workspace/ai-opc-prodcut/lib/config-manager.ts) - 配置管理器
- [lib/migrate.ts](file:///Users/wulingyang/Documents/workspace/ai-opc-prodcut/lib/migrate.ts) - 数据迁移工具
- [scripts/migrate-database.ts](file:///Users/wulingyang/Documents/workspace/ai-opc-prodcut/scripts/migrate-database.ts) - 迁移脚本
- [app/api/admin/database/route.ts](file:///Users/wulingyang/Documents/workspace/ai-opc-prodcut/app/api/admin/database/route.ts) - 数据库API接口
