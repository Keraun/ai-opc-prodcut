#!/bin/bash

set -e

PROJECT_NAME="ai-opc-prodcut"
OUTPUT_ZIP="${PROJECT_NAME}-vercel-deploy.zip"
TEMP_DIR="dist-temp"

echo "=========================================="
echo "   Vercel 部署包生成脚本"
echo "=========================================="
echo ""

echo "📦 步骤 1/5: 清理旧的构建产物..."
rm -rf .next $TEMP_DIR $OUTPUT_ZIP

echo ""
echo "🔨 步骤 2/5: 安装依赖..."
pnpm install

echo ""
echo "🏗️  步骤 3/5: 构建项目..."
pnpm build

echo ""
echo "📂 步骤 4/5: 准备部署文件..."
mkdir -p $TEMP_DIR

cp -r .next $TEMP_DIR/
cp -r public $TEMP_DIR/ 2>/dev/null || echo "  [提示] public 目录不存在，跳过"
cp package.json $TEMP_DIR/
cp pnpm-lock.yaml $TEMP_DIR/ 2>/dev/null || cp package-lock.json $TEMP_DIR/ 2>/dev/null || echo "  [提示] lock 文件不存在，跳过"
cp vercel.json $TEMP_DIR/ 2>/dev/null || echo "  [提示] vercel.json 不存在，跳过"
cp -r database $TEMP_DIR/ 2>/dev/null || echo "  [提示] database 目录不存在，跳过"
cp -r scripts $TEMP_DIR/ 2>/dev/null || echo "  [提示] scripts 目录不存在，跳过"

if [ -f ".env" ]; then
    cp .env $TEMP_DIR/
    echo "  [提示] 已包含 .env 文件"
else
    echo "  [警告] .env 文件不存在，部署后请在 Vercel Dashboard 中配置环境变量"
fi

echo ""
echo "📦 步骤 5/5: 创建部署包..."
cd $TEMP_DIR
zip -r ../$OUTPUT_ZIP . -x "*.DS_Store" -x "__MACOSX/*"
cd ..

rm -rf $TEMP_DIR

ZIP_SIZE=$(du -h $OUTPUT_ZIP | cut -f1)

echo ""
echo "✅ 部署包创建完成！"
echo ""
echo "=========================================="
echo "   部署包信息"
echo "=========================================="
echo "  文件名: $OUTPUT_ZIP"
echo "  大小:   $ZIP_SIZE"
echo "  路径:   $(pwd)/$OUTPUT_ZIP"
echo ""
echo "=========================================="
echo "   部署步骤"
echo "=========================================="
echo "  1. 登录 Vercel Dashboard: https://vercel.com"
echo "  2. 点击 'Add New...' -> 'Project'"
echo "  3. 选择 'Import Git Repository' 或拖拽上传 zip 文件"
echo "  4. 如果手动上传，选择生成的 $OUTPUT_ZIP 文件"
echo "  5. 配置环境变量（如有需要）"
echo "  6. 点击 'Deploy' 开始部署"
echo ""
echo "⚠️  注意: 部署后请在 Vercel Dashboard 中检查环境变量配置"
echo "=========================================="
