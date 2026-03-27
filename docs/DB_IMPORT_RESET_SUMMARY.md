# 数据库导入导出和一键恢复功能重构总结

## 📋 完成的工作

### 1. 创建 default.db 默认数据库文件
- ✅ 将当前的 `app.db` 复制为 `database/default.db`
- ✅ 作为网站一键恢复的默认数据库

---

### 2. 重写配置导出功能 (`app/api/admin/config/export/route.ts`)

**功能说明**：
- 简化为直接下载 `app.db` 数据库文件
- 文件名格式：`app-database-YYYY-MM-DDTHH-MM-SS-MMMZ.db`

**API 调用**：
```
GET /api/admin/config/export
```

**响应**：直接下载 `.db` 数据库文件

**安全措施**：
- ✅ 管理员认证保护
- ✅ 检查数据库文件是否存在
- ✅ 统一的错误响应格式

---

### 3. 重写配置导入功能 (`app/api/admin/config/import/route.ts`)

**功能说明**：
- 直接用上传的数据库文件覆盖 `app.db`
- 仅支持 `.db` 文件

**API 调用**：
```
POST /api/admin/config/import
Content-Type: multipart/form-data

file: [上传的 .db 文件]
```

**响应**：
```json
{
  "code": 200,
  "success": true,
  "message": "数据库导入成功",
  "data": {
    "message": "数据库导入成功",
    "backupCreated": {
      "filename": "app-backup-xxx-before-import.db",
      ...
    }
  }
}
```

**安全措施**：
- ✅ 管理员认证保护
- ✅ 导入前自动备份当前数据库
- ✅ 清理 WAL 和 SHM 临时文件
- ✅ 验证文件类型（仅 .db）
- ✅ 统一的错误响应格式

---

### 4. 重写一键恢复网站功能 (`app/api/admin/reset-website/route.ts`)

**功能说明**：
- 用 `database/default.db` 覆盖当前 `app.db`
- 恢复网站到初始状态

**API 调用**：
```
POST /api/admin/reset-website
Content-Type: application/json

{
  "username": "admin"
}
```

**响应**：
```json
{
  "code": 200,
  "success": true,
  "message": "网站配置已成功还原",
  "data": {
    "message": "网站配置已成功还原到初始状态",
    "backupCreated": {
      "filename": "app-backup-xxx-before-reset.db",
      ...
    },
    "tables": ["accounts", "system_config", ...]
  }
}
```

**GET 接口 - 验证数据库**：
```
GET /api/admin/reset-website?action=validate
```

**GET 接口 - 检查 default.db**：
```
GET /api/admin/reset-website?action=check-default
```

**安全措施**：
- ✅ 管理员认证保护
- ✅ 还原前自动备份当前数据库
- ✅ 检查 default.db 是否存在
- ✅ 清理 WAL 和 SHM 临时文件
- ✅ 还原后验证数据库完整性
- ✅ 统一的错误响应格式

---

## 📁 文件清单

### 新增文件
```
database/
└── default.db                    # 默认数据库文件

docs/
└── DB_IMPORT_RESET_SUMMARY.md    # 本文档
```

### 修改文件
```
app/api/admin/config/
├── export/route.ts               # 重写导出功能
└── import/route.ts               # 重写导入功能

app/api/admin/
└── reset-website/route.ts        # 重写一键恢复功能
```

---

## 🎯 核心特性

### 1. 简单直接
- 导出 = 下载 `app.db`
- 导入 = 上传文件覆盖 `app.db`
- 一键恢复 = 用 `default.db` 覆盖 `app.db`

### 2. 安全可靠
- 所有操作前自动备份
- 清理临时文件避免冲突
- 数据库完整性验证
- 管理员认证保护

### 3. 易于使用
- 简单的 API 接口
- 统一的响应格式
- 详细的错误信息

---

## 🚀 使用示例

### 前端调用示例

```typescript
// 1. 导出数据库
async function exportDatabase() {
  window.location.href = '/api/admin/config/export'
}

// 2. 导入数据库
async function importDatabase(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await fetch('/api/admin/config/import', {
    method: 'POST',
    body: formData
  })
  return response.json()
}

// 3. 一键恢复网站
async function resetWebsite(username: string) {
  const response = await fetch('/api/admin/reset-website', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  })
  return response.json()
}

// 4. 检查 default.db
async function checkDefaultDb() {
  const response = await fetch('/api/admin/reset-website?action=check-default')
  return response.json()
}

// 5. 验证数据库
async function validateDatabase() {
  const response = await fetch('/api/admin/reset-website?action=validate')
  return response.json()
}
```

---

## ⚠️ 注意事项

1. **数据安全**：
   - 所有操作都会自动备份当前数据库
   - 备份文件保存在 `database/backup/` 目录
   - 可以随时从备份恢复

2. **default.db 管理**：
   - `database/default.db` 是网站的默认数据库
   - 如需更新默认数据库，直接替换该文件
   - 确保该文件始终存在

3. **生产环境**：
   - 建议在生产环境使用前先在测试环境验证
   - 定期备份重要数据
   - 谨慎使用一键恢复功能

---

## 📌 备份文件命名规则

备份文件采用以下命名格式：

```
app-backup-YYYY-MM-DDTHH-MM-SS-MMMZ[-suffix].db
```

示例：
- `app-backup-2026-03-28T07-20-00-000Z.db` - 自动备份
- `app-backup-2026-03-28T07-20-00-000Z-before-import.db` - 导入前备份
- `app-backup-2026-03-28T07-20-00-000Z-before-reset.db` - 恢复前备份

---

## 🎉 总结

本次重构完成了数据库导入导出和一键恢复功能的全面简化：

- ✅ 导出 = 直接下载 app.db
- ✅ 导入 = 上传文件覆盖 app.db
- ✅ 一键恢复 = 用 default.db 覆盖 app.db
- ✅ 所有操作自动备份
- ✅ 完善的安全措施
- ✅ 统一的 API 响应格式

所有功能已就绪，可以直接使用！
