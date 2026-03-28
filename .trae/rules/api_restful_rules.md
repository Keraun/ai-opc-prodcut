# API RESTful 规范

本文档定义了项目中所有 API 接口的 RESTful 规范，所有 API 接口必须遵循以下规范。

## 核心原则

### 只使用 GET 和 POST 方法

**禁止使用 PUT、DELETE、PATCH 等其他 HTTP 方法**，只使用以下两种方法：

- **GET**：用于获取数据，幂等操作
- **POST**：用于创建、更新、删除数据，非幂等操作

### 通过接口名称区分语义

使用查询参数 `action` 来区分不同的操作语义，例如：

- `GET /api/admin/themes` - 获取主题列表
- `POST /api/admin/themes?action=create` - 创建主题
- `POST /api/admin/themes?action=update` - 更新主题
- `POST /api/admin/themes?action=delete` - 删除主题
- `POST /api/admin/themes?action=setCurrent` - 设置当前主题

## 接口设计规范

### 1. 路径命名

- 使用小写字母和连字符（-）
- 路径应该反映资源的层级关系
- 避免使用动词，使用名词表示资源

**示例：**
- `GET /api/admin/themes` - 获取主题列表
- `GET /api/admin/config` - 获取配置信息

### 2. 查询参数

- 使用 `action` 参数来区分操作类型
- 其他参数根据具体业务需求添加

**示例：**
- `POST /api/admin/themes?action=create` - 创建主题
- `GET /api/admin/themes?onlyCurrent=true` - 获取当前主题

### 3. 请求体格式

- 使用 JSON 格式
- 所有请求体参数应该是明确的、有意义的

**示例：**
```json
{
  "themeId": "modern",
  "name": "现代主题",
  "colors": {
    "primary": "#007bff",
    "secondary": "#6c757d"
  }
}
```

### 4. 响应格式

遵循统一的响应格式，详见 [API 响应格式规则](api_response_rules.md)。

## 接口示例

### 主题管理接口

| 接口路径 | 方法 | action 参数 | 功能描述 | 请求体 |
|---------|------|------------|----------|--------|
| `/api/admin/themes` | GET | 无 | 获取主题列表 | 无 |
| `/api/admin/themes` | POST | `create` | 创建主题 | `{"themeId": "...", "name": "...", ...}` |
| `/api/admin/themes` | POST | `update` | 更新主题 | `{"themeId": "...", "name": "...", ...}` |
| `/api/admin/themes` | POST | `delete` | 删除主题 | `{"themeId": "..."}` |
| `/api/admin/themes` | POST | `setCurrent` | 设置当前主题 | `{"themeId": "..."}` |

### 配置管理接口

| 接口路径 | 方法 | action 参数 | 功能描述 | 请求体 |
|---------|------|------------|----------|--------|
| `/api/admin/config` | GET | 无 | 获取配置信息 | 无 |
| `/api/admin/config` | POST | `save` | 保存配置 | `{"type": "...", "data": {...}}` |

## 最佳实践

1. **语义清晰**：通过 `action` 参数明确操作语义
2. **参数最小化**：只传递必要的参数
3. **错误处理**：统一的错误处理机制
4. **响应格式**：遵循统一的响应格式
5. **安全性**：所有管理接口必须进行认证检查

## 相关文件

- [API 响应格式规则](api_response_rules.md) - API 响应格式规范
- [API 客户端使用规则](api_client_rules.md) - API 客户端使用规范
