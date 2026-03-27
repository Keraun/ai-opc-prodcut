# 数据库备份与还原 API 文档

## 概述

本文档描述了数据库备份和还原的 API 接口，提供了完整的数据库管理功能。

## API 端点

### 1. 数据库管理 API

**端点**: `/api/admin/database`

#### 1.1 创建备份

```http
POST /api/admin/database
Content-Type: application/json

{
  "action": "backup",
  "suffix": "manual"  // 可选，备份文件后缀
}
```

**响应**:
```json
{
  "code": 200,
  "success": true,
  "message": "数据库备份成功",
  "data": {
    "backup": {
      "filename": "app-backup-2026-03-28T12-00-00-000Z-manual.db",
      "path": "/path/to/backup",
      "size": 102400,
      "createdAt": "2026-03-28T12:00:00.000Z",
      "formattedSize": "100 KB"
    }
  }
}
```

#### 1.2 列出所有备份

```http
POST /api/admin/database
Content-Type: application/json

{
  "action": "list-backups"
}
```

或

```http
GET /api/admin/database?action=list-backups
```

**响应**:
```json
{
  "code": 200,
  "success": true,
  "data": {
    "backups": [
      {
        "filename": "app-backup-2026-03-28T12-00-00-000Z.db",
        "path": "/path/to/backup",
        "size": 102400,
        "createdAt": "2026-03-28T12:00:00.000Z",
        "formattedSize": "100 KB"
      }
    ],
    "total": 1
  }
}
```

#### 1.3 删除备份

```http
POST /api/admin/database
Content-Type: application/json

{
  "action": "delete-backup",
  "filename": "app-backup-2026-03-28T12-00-00-000Z.db"
}
```

#### 1.4 导出数据

```http
POST /api/admin/database
Content-Type: application/json

{
  "action": "export"
}
```

#### 1.5 迁移数据

```http
POST /api/admin/database
Content-Type: application/json

{
  "action": "migrate",
  "useTemplates": false  // 可选，是否使用模板数据
}
```

---

### 2. 网站还原 API

**端点**: `/api/admin/reset-website`

#### 2.1 还原到最新备份

```http
POST /api/admin/reset-website
Content-Type: application/json

{
  "username": "admin"
}
```

**响应**:
```json
{
  "code": 200,
  "success": true,
  "message": "网站配置已成功还原",
  "data": {
    "message": "成功从备份 app-backup-2026-03-28T12-00-00-000Z.db 还原数据库",
    "backupCreated": {
      "filename": "app-backup-2026-03-28T13-00-00-000Z-before-restore.db",
      "size": 102400,
      "formattedSize": "100 KB"
    },
    "restoredFrom": "app-backup-2026-03-28T12-00-00-000Z.db",
    "tables": ["accounts", "system_config", "pages", ...]
  }
}
```

#### 2.2 还原到指定备份

```http
POST /api/admin/reset-website
Content-Type: application/json

{
  "username": "admin",
  "backupFilename": "app-backup-2026-03-27T20-29-02-460Z.db"
}
```

#### 2.3 列出备份文件

```http
GET /api/admin/reset-website?action=list
```

**响应**:
```json
{
  "code": 200,
  "success": true,
  "data": {
    "backups": [
      {
        "filename": "app-backup-2026-03-28T12-00-00-000Z.db",
        "path": "/path/to/backup",
        "size": 102400,
        "createdAt": "2026-03-28T12:00:00.000Z",
        "formattedSize": "100 KB"
      }
    ],
    "total": 1
  }
}
```

#### 2.4 验证数据库

```http
GET /api/admin/reset-website?action=validate
```

**响应**:
```json
{
  "code": 200,
  "success": true,
  "data": {
    "valid": true,
    "tables": ["accounts", "system_config", "system_logs", ...]
  }
}
```

---

## 功能特性

### 1. 自动备份

- 还原前自动创建当前数据库的备份（命名为 `before-restore`）
- 确保操作可回滚

### 2. 数据库验证

- 还原后自动验证数据库完整性
- 检查所有必需的表是否存在
- 返回详细的验证结果

### 3. 安全措施

- 所有操作需要管理员认证
- 删除 WAL 和 SHM 文件以避免冲突
- 设置正确的数据库模式（WAL）

### 4. 错误处理

- 统一的错误响应格式
- 详细的错误信息
- 操作失败时的回滚机制

---

## 使用示例

### 前端调用示例

```typescript
// 创建备份
async function createBackup() {
  const response = await fetch('/api/admin/database', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'backup', suffix: 'manual' })
  })
  return response.json()
}

// 列出备份
async function listBackups() {
  const response = await fetch('/api/admin/database?action=list-backups')
  return response.json()
}

// 还原到最新备份
async function restoreLatestBackup() {
  const response = await fetch('/api/admin/reset-website', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin' })
  })
  return response.json()
}

// 还原到指定备份
async function restoreSpecificBackup(filename: string) {
  const response = await fetch('/api/admin/reset-website', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      username: 'admin',
      backupFilename: filename 
    })
  })
  return response.json()
}
```

---

## 备份文件命名规则

备份文件采用以下命名格式：

```
app-backup-YYYY-MM-DDTHH-MM-SS-MMMZ[-suffix].db
```

示例：
- `app-backup-2026-03-28T12-00-00-000Z.db` - 自动备份
- `app-backup-2026-03-28T12-00-00-000Z-manual.db` - 手动备份
- `app-backup-2026-03-28T12-00-00-000Z-before-restore.db` - 还原前自动备份

---

## 注意事项

1. **权限要求**: 所有操作都需要管理员权限
2. **备份目录**: 备份文件存储在 `database/backup/` 目录
3. **磁盘空间**: 定期清理旧备份以节省磁盘空间
4. **生产环境**: 在生产环境中使用前，建议先在测试环境验证
5. **数据丢失**: 还原操作会覆盖当前数据库，请谨慎操作

---

## 工具函数

项目还提供了可直接调用的工具函数：

```typescript
import {
  createBackup,
  getBackupFiles,
  restoreBackup,
  restoreLatestBackup,
  validateDatabase,
  deleteBackup
} from '@/lib/backup-utils'

// 创建备份
const backup = createBackup('my-backup')

// 获取备份列表
const backups = getBackupFiles()

// 还原到指定备份
const result = restoreBackup('app-backup-xxx.db')

// 还原到最新备份
const result = restoreLatestBackup()

// 验证数据库
const validation = validateDatabase()

// 删除备份
const deleted = deleteBackup('app-backup-xxx.db')
```
