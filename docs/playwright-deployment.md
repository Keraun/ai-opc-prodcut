# Playwright 自动Cookie抓取部署说明

## 功能概述

GEO工具的Cookie自动抓取功能使用Playwright自动化浏览器，实现了一键自动抓取Cookie的功能。

## 本地开发

### 安装依赖

```bash
npm install
```

`postinstall` 脚本会自动运行并安装Chromium浏览器。

### 手动安装浏览器（可选）

如果需要手动安装：

```bash
npx playwright install chromium --with-deps
```

## 部署配置

### 方案一：有图形界面的服务器（推荐用于开发环境）

适用于：
- 本地开发机器
- 有桌面环境的服务器
- VNC/RDP可访问的服务器

部署步骤：
1. 正常部署项目
2. `npm install` 会自动安装浏览器
3. 直接使用自动抓取功能

### 方案二：无图形界面的服务器（生产环境推荐）

适用于：
- 云服务器
- Docker容器
- 无头服务器

在这种环境下，自动抓取功能会自动降级为手动模式，用户可以继续使用传统的手动复制Cookie方式。

**重要说明：**
- 系统会自动检测服务器环境
- 如果检测到不支持浏览器自动化，会返回501状态码
- 前端会自动弹出手动输入Cookie的对话框
- 所有现有功能完全不受影响

### 方案三：Docker部署

如果需要在Docker中支持浏览器自动化，需要：

```dockerfile
# 在你的Dockerfile中添加
FROM node:18-slim

# 安装Playwright依赖
RUN apt-get update && apt-get install -y \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
RUN npx playwright install chromium --with-deps

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## 环境变量（可选）

可以通过环境变量控制Playwright行为：

```bash
# 设置Playwright浏览器安装路径
PLAYWRIGHT_BROWSERS_PATH=./ms-playwright

# 禁用自动下载（需要提前安装）
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
```

## 故障排查

### 问题1：浏览器启动失败

**错误信息**：`Server environment does not support browser automation`

**原因**：服务器没有图形界面或缺少必要的系统依赖

**解决**：使用手动模式输入Cookie

### 问题2：postinstall脚本失败

**解决**：
```bash
# 手动安装浏览器
npx playwright install chromium --with-deps

# 或者跳过浏览器安装（只使用手动模式）
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install
```

### 问题3：权限问题

**错误**：`Permission denied`

**解决**：
```bash
# 确保项目目录有写权限
chmod -R 755 /path/to/project

# 或者使用非root用户运行
```

## 功能对比

| 特性 | 自动抓取模式 | 手动模式 |
|------|------------|---------|
| 操作复杂度 | 一键操作 | 需要手动复制 |
| 本地开发 | ✅ 支持 | ✅ 支持 |
| 无头服务器 | ❌ 不支持 | ✅ 支持 |
| Docker | ⚠️ 需特殊配置 | ✅ 支持 |

## 架构说明

### 前端
- 提供"自动抓取"和"手动添加"两种方式
- 自动检测服务器环境支持情况
- 501错误时自动降级到手动模式

### 后端API
- `/api/admin/geo-tools/cookie-extract`
- POST: 启动浏览器会话
- GET: 轮询状态
- DELETE: 关闭会话
- 动态导入Playwright，避免启动时错误
- 优雅降级，返回501表示不支持

## 总结

这套方案的优势：
1. **渐进增强**：支持时提供高级功能，不支持时回退基础功能
2. **零配置**：自动检测环境，无需手动配置
3. **向后兼容**：手动模式永远可用
4. **部署友好**：各种环境都能正常工作
