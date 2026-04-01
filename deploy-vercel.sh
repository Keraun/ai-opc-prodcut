#!/bin/bash

# AI-OPC Vercel 快速部署脚本
# 用法: ./deploy-vercel.sh [--prod]

set -e

echo "=========================================="
echo "   AI-OPC Vercel 部署脚本"
echo "=========================================="
echo ""

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "错误: 未找到 Vercel CLI"
    echo "请先运行: npm install -g vercel"
    exit 1
fi

# 检查是否登录
if ! vercel whoami &> /dev/null; then
    echo "请先登录 Vercel..."
    vercel login
fi

# 安装依赖
echo ""
echo "📦 安装依赖..."
pnpm install

# 构建项目
echo ""
echo "🔨 构建项目..."
pnpm build

# 检查是否使用生产环境
if [ "$1" == "--prod" ]; then
    echo ""
    echo "🚀 部署到生产环境..."
    vercel deploy --prebuilt --prod
else
    echo ""
    echo "🚀 部署到预览环境..."
    vercel deploy --prebuilt
fi

echo ""
echo "✅ 部署完成！"
echo "=========================================="
