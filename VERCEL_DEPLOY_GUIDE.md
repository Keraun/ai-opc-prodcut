# Vercel Build-Only 部署指南

## 概述

本文档说明如何在本地构建项目后，将构建产物直接部署到 Vercel，而不暴露源代码。

---

## 方案一：使用 Vercel CLI 预构建部署（推荐）

### 1. 安装 Vercel CLI

```bash
npm install -g vercel
```

或使用 pnpm：

```bash
pnpm add -g vercel
```

### 2. 登录 Vercel

```bash
vercel login
```

按照提示完成登录。

### 3. 在本地构建项目

```bash
pnpm install
pnpm build
```

### 4. 部署构建产物

```bash
vercel deploy --prebuilt
```

### 5. 生产环境部署（可选）

```bash
vercel deploy --prebuilt --prod
```

---

## 方案二：创建独立的部署仓库

### 1. 创建部署目录

在项目根目录创建一个 `deploy` 文件夹用于存放部署文件：

```bash
mkdir -p deploy
```

### 2. 创建部署用的 package.json

在 `deploy` 目录下创建 `package.json`：

```json
{
  "name": "ai-opc-deploy",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "next": "16.2.0",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "engines": {
    "node": ">=18"
  }
}
```

### 3. 创建 vercel.json

在项目根目录创建 `vercel.json`：

```json
{
  "buildCommand": "echo 'Pre-built, skipping build'",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "pnpm install --prod",
  "regions": ["hkg1"]
}
```

### 4. 创建 .vercelignore

在项目根目录创建 `.vercelignore`：

```
# 忽略源代码
src/
components/
lib/
app/
*.tsx
*.ts
*.jsx
!*.js
node_modules/
.git/
.gitignore
README*.md
PROJECT_GUIDE.md
项目卖点说明.md
.trae/
.env.example
content/
database/init_database.zip
*.test.*
*.spec.*
.eslintrc*
.prettierrc*
tsconfig.json
components.json

# 只保留构建产物和必要文件
!.next/
!public/
!package.json
!pnpm-lock.yaml
!.env
!database/runtime/
```

### 5. 构建项目

```bash
pnpm install
pnpm build
```

### 6. 部署到 Vercel

```bash
vercel
```

---

## 方案三：使用 Docker 容器

### 1. 创建 Dockerfile

在项目根目录创建 `Dockerfile`：

```dockerfile
# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制依赖文件
COPY package.json pnpm-lock.yaml* ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建项目
RUN pnpm build

# 生产阶段
FROM node:20-alpine AS runner

WORKDIR /app

# 设置生产环境
ENV NODE_ENV production

# 安装 pnpm
RUN npm install -g pnpm

# 复制必要文件
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml* ./
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/database/runtime ./database/runtime

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# 更改文件权限
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT 3000

# 启动应用
CMD ["node", "server.js"]
```

### 2. 修改 next.config.js

确保 Next.js 配置支持 standalone 输出：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // 其他配置...
}

module.exports = nextConfig
```

### 3. 构建 Docker 镜像

```bash
docker build -t ai-opc .
```

### 4. 部署到 Vercel

使用 Vercel 的 Docker 部署功能，或者部署到其他支持 Docker 的平台。

---

## 推荐配置

### 1. 创建 vercel.json

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "pnpm install",
  "regions": ["hkg1"],
  "env": {
    "SMTP_HOST": "@smtp-host",
    "SMTP_PORT": "@smtp-port",
    "SMTP_USER": "@smtp-user",
    "SMTP_PASS": "@smtp-pass"
  },
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "nodejs20.x"
    }
  }
}
```

### 2. 创建 .gitignore（部署专用）

如果创建专门的部署仓库，使用以下 `.gitignore`：

```
# 忽略源码文件
*.ts
*.tsx
*.jsx
src/
components/
lib/
app/
database/init_database.zip

# 保留的文件
!.next/
!public/
!package.json
!pnpm-lock.yaml
!database/runtime/
!.env
!vercel.json
```

---

## 环境变量配置

在 Vercel Dashboard 中配置以下环境变量：

```
SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_USER=your-email@163.com
SMTP_PASS=your-authorization-code
```

---

## 注意事项

1. **数据库文件**：确保 `database/runtime/` 目录被正确包含在部署中
2. **图片上传**：如果使用本地存储，需要配置 Vercel Blob 或其他云存储
3. **环境变量**：在 Vercel Dashboard 中配置所有必要的环境变量
4. **Node.js 版本**：确保 Vercel 使用正确的 Node.js 版本（推荐 18+）

---

## 快速开始（推荐方案一）

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录
vercel login

# 3. 构建项目
pnpm install
pnpm build

# 4. 部署
vercel deploy --prebuilt

# 5. 生产环境部署
vercel deploy --prebuilt --prod
```

这样就可以在不暴露源代码的情况下部署到 Vercel 了！
