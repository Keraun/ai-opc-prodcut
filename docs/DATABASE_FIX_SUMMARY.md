# 数据库修复和优化总结

## 📊 问题分析

### 发现的问题

1. **模块ID关联错误**
   - `page_modules.module_id` 存储的是带时间戳的ID（如 `site-root-1774642127716`）
   - `module_registry.module_id` 存储的是原始模块ID（如 `site-root`）
   - 导致外键关联失败，所有模块被误判为"未使用"

2. **模块实例ID格式不统一**
   - 原格式：`模块ID-时间戳`
   - 问题：同一页面多次使用同一模块时可能产生ID冲突

## 🔧 修复措施

### 1. 数据修复

#### 修复 module_id 字段
- **脚本**: `scripts/fix-module-id.ts`
- **操作**: 从 `module_instance_id` 中提取原始模块ID
- **示例**: `site-root-1774642127716-1774642692903` → `site-root`
- **结果**: 修复了 26 条记录

#### 提取逻辑
```typescript
function extractOriginalModuleId(moduleInstanceId: string): string {
  const parts = moduleInstanceId.split('-')
  
  // 去掉最后两个时间戳部分
  if (parts.length >= 3) {
    const lastTwoParts = parts.slice(-2)
    if (/^\d+$/.test(lastTwoParts[0]) && /^\d+$/.test(lastTwoParts[1])) {
      return parts.slice(0, -2).join('-')
    }
  }
  
  return moduleInstanceId
}
```

### 2. 代码更新

#### 更新 module-service.ts
- **修改**: `updatePageModules` 函数
- **变更**: 模块实例ID生成格式改为 `模块ID-时间戳-序号`
- **原因**: 避免同一页面多次使用同一模块时的ID冲突

```typescript
// 修改前
const moduleInstanceId = `${module.moduleId}-${Date.now()}`

// 修改后
const moduleInstanceId = `${module.moduleId}-${Date.now()}-${index}`
```

### 3. 规则文档更新

#### 更新 database_rules.md
- 明确说明模块实例ID格式：`模块ID-时间戳-序号`
- 强调 `page_modules.module_id` 必须存储原始模块ID
- 添加数据关联关系说明

## 📝 新的数据规范

### 模块实例ID格式
```
格式: 模块ID-时间戳-序号
示例: section-hero-1774641692508-0
```

### 字段存储规则

#### pages.module_instance_ids
- 存储完整的模块实例ID数组
- 示例: `["section-hero-1774641692508-0", "site-header-1774641692508-1"]`

#### page_modules.module_instance_id
- 存储完整的模块实例ID
- 示例: `section-hero-1774641692508-0`

#### page_modules.module_id
- **重要**: 只存储原始模块ID，不带时间戳
- 示例: `section-hero`
- 用途: 关联 `module_registry.module_id`

#### module_registry.module_id
- 存储原始模块ID
- 示例: `section-hero`

## 🛠️ 工具脚本

### 1. 数据库分析
```bash
npx tsx scripts/analyze-database.ts
```
- 分析数据库结构
- 检查数据完整性
- 识别潜在问题

### 2. 模块ID修复
```bash
npx tsx scripts/fix-module-id.ts --fix
```
- 分析 module_id 问题
- 自动修复错误数据
- 验证修复结果

### 3. 数据库清理
```bash
# 交互式清理
npx tsx scripts/clean-database.ts

# 自动清理
npx tsx scripts/clean-database.ts --auto
```
- 清理孤立数据
- 清理过期日志
- 清理未使用模块
- 优化表结构

### 4. 数据库验证
```bash
npx tsx scripts/verify-database.ts
```
- 检查表结构
- 验证外键关系
- 检查数据一致性
- 验证索引完整性

### 5. 备份恢复
```bash
npx tsx scripts/restore-backup.ts
```
- 恢复最新的数据库备份

## ✅ 验证结果

### 数据完整性
- ✅ 8 个数据表
- ✅ 5 个页面
- ✅ 26 个模块实例
- ✅ 15 个注册模块

### 关系完整性
- ✅ 无孤立模块实例
- ✅ 所有模块ID正确关联
- ✅ 页面模块实例ID一致

### 索引完整性
- ✅ 10 个索引
- ✅ 覆盖所有关键查询字段

## 📚 最佳实践

### 1. 创建模块实例
```typescript
// ✅ 正确
const moduleInstanceId = `${moduleId}-${Date.now()}-${index}`
const moduleId = 'section-hero' // 原始模块ID

// ❌ 错误
const moduleInstanceId = `${moduleId}-${Date.now()}`
const moduleId = 'section-hero-1774641692508' // 带时间戳
```

### 2. 查询模块数据
```typescript
// ✅ 正确 - 使用原始模块ID关联
SELECT pm.*, mr.default_data
FROM page_modules pm
LEFT JOIN module_registry mr ON pm.module_id = mr.module_id

// ❌ 错误 - 使用实例ID关联
LEFT JOIN module_registry mr ON pm.module_instance_id = mr.module_id
```

### 3. 数据库操作
- 始终在事务中执行关键操作
- 定期运行验证脚本
- 重要操作前先备份
- 使用参数化查询防止SQL注入

## 🎯 后续建议

1. **定期维护**
   - 每周运行 `verify-database.ts` 检查数据完整性
   - 每月运行 `clean-database.ts` 清理过期数据

2. **监控告警**
   - 监控数据库文件大小
   - 监控查询性能
   - 设置数据一致性检查告警

3. **备份策略**
   - 每日自动备份
   - 保留最近7天的备份
   - 重要操作前手动备份

4. **性能优化**
   - 定期执行 VACUUM 压缩数据库
   - 更新统计信息（ANALYZE）
   - 监控索引使用情况

## 📋 相关文件

- [lib/module-service.ts](../lib/module-service.ts) - 模块服务
- [lib/database.ts](../lib/database.ts) - 数据库初始化
- [scripts/analyze-database.ts](../scripts/analyze-database.ts) - 数据库分析
- [scripts/fix-module-id.ts](../scripts/fix-module-id.ts) - 模块ID修复
- [scripts/clean-database.ts](../scripts/clean-database.ts) - 数据库清理
- [scripts/verify-database.ts](../scripts/verify-database.ts) - 数据库验证
- [scripts/restore-backup.ts](../scripts/restore-backup.ts) - 备份恢复
- [.trae/rules/database_rules.md](../.trae/rules/database_rules.md) - 数据库规则
