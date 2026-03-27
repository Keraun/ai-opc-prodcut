# 数据库表结构更新总结

## 📊 更新概述

根据用户需求，对数据库表结构进行了以下重要更新：

1. **theme_config 表重构** - 重新设计主题配置表结构
2. **currentTheme 字段迁移** - 将当前主题字段移到 site_config 表
3. **代码适配更新** - 更新所有相关代码以适配新表结构

## 🔧 详细变更

### 1. theme_config 表结构变更

#### 旧结构
```sql
CREATE TABLE theme_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  current_theme TEXT NOT NULL,
  themes_config TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

**问题**:
- 所有主题配置存储在一个 JSON 字段中，不便于管理
- `current_theme` 字段应该在站点配置中，而不是主题配置表

#### 新结构
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

**改进**:
- ✅ 每个主题存储为一条独立记录
- ✅ 支持动态添加和删除主题
- ✅ 便于查询和管理单个主题
- ✅ 支持主题的独立更新

### 2. currentTheme 字段迁移

#### 迁移前
- 存储位置：`theme_config.current_theme`
- 数据类型：单个字段

#### 迁移后
- 存储位置：`site_config` 表（config_key='current_theme'）
- 数据类型：配置项
- 优势：与站点其他配置统一管理

### 3. 数据迁移结果

```
✅ 迁移主题: modern (现代简约)
✅ 迁移主题: tech (科技深色)
✅ 迁移主题: nature (自然清新)
✅ 迁移主题: dark (暗黑模式)
✅ 迁移主题: luxury (奢华风格)
✅ 迁移主题: minimal (极简主义)

共迁移 6 个主题
```

## 📝 代码更新

### 1. lib/database.ts
- 更新 `theme_config` 表创建语句
- 使用新的字段结构

### 2. lib/config-manager.ts

#### readConfig('theme')
```typescript
// 旧实现
const config = db.prepare('SELECT * FROM theme_config LIMIT 1').get()
return {
  currentTheme: config.current_theme,
  themes: JSON.parse(config.themes_config)
}

// 新实现
const currentThemeConfig = db.prepare(`
  SELECT config_value FROM site_config WHERE config_key = 'current_theme'
`).get()

const themes = db.prepare('SELECT * FROM theme_config').all()

const themesMap: Record<string, any> = {}
themes.forEach(theme => {
  themesMap[theme.theme_id] = JSON.parse(theme.theme_config)
})

return {
  currentTheme: currentThemeConfig?.config_value || 'modern',
  themes: themesMap
}
```

#### writeConfig('theme', data)
```typescript
// 旧实现
INSERT OR REPLACE INTO theme_config (id, current_theme, themes_config)
VALUES (1, ?, ?)

// 新实现
// 1. 保存 currentTheme 到 site_config
INSERT OR REPLACE INTO site_config (config_key, config_value)
VALUES ('current_theme', ?)

// 2. 删除旧主题数据
DELETE FROM theme_config

// 3. 插入新的主题数据
INSERT INTO theme_config (theme_id, theme_name, theme_config)
VALUES (?, ?, ?)
```

### 3. lib/migrate.ts

#### 导入主题配置
```typescript
// 旧实现
INSERT OR REPLACE INTO theme_config (current_theme, themes_config)
VALUES (?, ?)

// 新实现
// 1. 保存 currentTheme
INSERT OR REPLACE INTO site_config (config_key, config_value)
VALUES ('current_theme', ?)

// 2. 保存每个主题
INSERT OR REPLACE INTO theme_config (theme_id, theme_name, theme_config)
VALUES (?, ?, ?)
```

#### 导出主题配置
```typescript
// 旧实现
const themeConfig = db.prepare('SELECT * FROM theme_config LIMIT 1').get()
const themeData = {
  currentTheme: themeConfig.current_theme,
  themes: JSON.parse(themeConfig.themes_config)
}

// 新实现
const currentThemeConfig = db.prepare(`
  SELECT config_value FROM site_config WHERE config_key = 'current_theme'
`).get()

const themes = db.prepare('SELECT * FROM theme_config').all()

const themesMap: Record<string, any> = {}
themes.forEach(theme => {
  themesMap[theme.theme_id] = JSON.parse(theme.theme_config)
})

const themeData = {
  currentTheme: currentThemeConfig?.config_value || 'modern',
  themes: themesMap
}
```

## 🛠️ 迁移工具

### 迁移脚本
```bash
npx tsx scripts/migrate-theme-config.ts
```

**执行内容**:
1. 备份当前数据库
2. 将 `current_theme` 移到 `site_config` 表
3. 备份旧的 `theme_config` 表到 `theme_config_backup`
4. 删除旧的 `theme_config` 表
5. 创建新的 `theme_config` 表
6. 迁移主题数据（拆分为多条记录）
7. 验证迁移结果

### 验证脚本
```bash
npx tsx scripts/verify-database.ts
```

**验证内容**:
- ✅ 表结构完整性
- ✅ 数据完整性
- ✅ 外键关系
- ✅ 数据一致性
- ✅ 索引完整性

## 📚 数据映射关系

### JSON 到 SQLite 映射

| JSON 文件 | SQLite 表 | 字段映射 |
|-----------|----------|---------|
| theme-config.json | site_config | `currentTheme` → `config_key='current_theme'` |
| theme-config.json | theme_config | `themes.{themeId}` → 每个主题一条记录 |

### 示例数据

#### theme-config.json
```json
{
  "currentTheme": "minimal",
  "themes": {
    "modern": {
      "id": "modern",
      "name": "现代简约",
      "colors": { "primary": "#1e40af" }
    },
    "tech": {
      "id": "tech",
      "name": "科技深色",
      "colors": { "primary": "#7c3aed" }
    }
  }
}
```

#### site_config 表
| config_key | config_value |
|------------|--------------|
| current_theme | minimal |

#### theme_config 表
| theme_id | theme_name | theme_config |
|----------|------------|--------------|
| modern | 现代简约 | `{"id":"modern","name":"现代简约",...}` |
| tech | 科技深色 | `{"id":"tech","name":"科技深色",...}` |

## ✅ 验证结果

```
📄 页面数: 5
📦 模块实例数: 26
🔧 注册模块数: 15

✅ 无孤立模块实例
✅ 所有模块ID都正确关联
✅ 所有页面的模块实例ID一致
✅ 数据库状态良好
```

## 🎯 优势总结

### 1. 更好的数据组织
- 每个主题独立存储，便于管理
- 支持主题的增删改查操作
- 避免大 JSON 字段的性能问题

### 2. 更清晰的职责划分
- `site_config` 负责站点级配置（包括当前主题）
- `theme_config` 负责主题定义和配置
- 职责分离，逻辑更清晰

### 3. 更好的扩展性
- 支持动态添加新主题
- 支持主题的独立更新
- 便于实现主题管理功能

### 4. 更好的性能
- 查询单个主题更快
- 更新单个主题不需要更新整个 JSON
- 支持主题的索引优化

## 📋 相关文件

- [scripts/migrate-theme-config.ts](../scripts/migrate-theme-config.ts) - 主题配置迁移脚本
- [scripts/verify-database.ts](../scripts/verify-database.ts) - 数据库验证脚本
- [lib/database.ts](../lib/database.ts) - 数据库初始化
- [lib/config-manager.ts](../lib/config-manager.ts) - 配置管理器
- [lib/migrate.ts](../lib/migrate.ts) - 数据迁移工具
- [.trae/rules/database_rules.md](../.trae/rules/database_rules.md) - 数据库规则文档

## 🔄 后续建议

1. **测试验证**
   - 测试主题切换功能
   - 测试主题配置保存和读取
   - 测试数据导入导出

2. **前端适配**
   - 更新主题选择器组件
   - 更新主题配置表单
   - 确保向后兼容

3. **文档更新**
   - 更新 API 文档
   - 更新用户手册
   - 更新开发指南

## 📌 注意事项

1. **备份重要**
   - 迁移前务必备份数据库
   - 保留 `theme_config_backup` 表作为备份

2. **向后兼容**
   - 代码已适配新表结构
   - 支持从旧 JSON 格式导入
   - 支持导出为旧 JSON 格式

3. **数据一致性**
   - 确保 `currentTheme` 在 `site_config` 中存在
   - 确保所有主题配置完整
   - 定期运行验证脚本
