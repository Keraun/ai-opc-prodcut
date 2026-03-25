#!/usr/bin/env node

const { readConfig, writeConfig, resetToTemplate } = require('./lib/config-manager.ts');
const { createVersion, getVersionHistory, getLatestVersion, restoreVersion } = require('./lib/version-manager.ts');
const fs = require('fs');
const path = require('path');

const CONFIG_DIR = path.join(process.cwd(), 'config', 'json');
const RUNTIME_DIR = path.join(CONFIG_DIR, 'runtime');

// 测试1: 当runtime配置不存在时，从templates复制到runtime
console.log('测试1: 当runtime配置不存在时，从templates复制到runtime');

// 先删除一个runtime配置文件
const testConfigType = 'test-config';
const testRuntimePath = path.join(RUNTIME_DIR, `${testConfigType}.json`);

if (fs.existsSync(testRuntimePath)) {
  fs.unlinkSync(testRuntimePath);
  console.log(`已删除 ${testRuntimePath}`);
}

// 确保templates中有这个配置文件
const testTemplatePath = path.join(CONFIG_DIR, 'templates', `${testConfigType}.json`);
if (!fs.existsSync(testTemplatePath)) {
  fs.writeFileSync(testTemplatePath, JSON.stringify({ test: 'value' }, null, 2));
  console.log(`已创建 ${testTemplatePath}`);
}

// 读取配置（应该从templates复制到runtime）
const config1 = readConfig(testConfigType);
console.log('读取的配置:', config1);

// 检查runtime目录是否有了这个文件
if (fs.existsSync(testRuntimePath)) {
  console.log('✓ 成功: runtime配置文件已创建');
} else {
  console.log('✗ 失败: runtime配置文件未创建');
}

// 测试2: 版本管理功能
console.log('\n测试2: 版本管理功能');

// 写入新配置
const newConfig = { test: 'updated value', timestamp: Date.now() };
writeConfig(testConfigType, newConfig);
console.log('已更新配置');

// 创建版本
const versionInfo = createVersion(testConfigType, newConfig);
console.log('创建的版本:', versionInfo);

// 获取版本历史
const history = getVersionHistory(testConfigType);
console.log('版本历史:', history);

// 获取最新版本
const latestVersion = getLatestVersion(testConfigType);
console.log('最新版本:', latestVersion);

// 测试3: 还原版本
console.log('\n测试3: 还原版本');

// 再次更新配置
const anotherConfig = { test: 'another value', timestamp: Date.now() };
writeConfig(testConfigType, anotherConfig);
console.log('已再次更新配置');

// 还原到之前的版本
const restoreResult = restoreVersion(testConfigType, versionInfo.filename);
console.log('还原结果:', restoreResult);

// 读取还原后的配置
const restoredConfig = readConfig(testConfigType);
console.log('还原后的配置:', restoredConfig);

// 清理测试文件
if (fs.existsSync(testRuntimePath)) {
  fs.unlinkSync(testRuntimePath);
}
if (fs.existsSync(testTemplatePath)) {
  fs.unlinkSync(testTemplatePath);
}

const testVersionDir = path.join(CONFIG_DIR, 'versions', testConfigType);
if (fs.existsSync(testVersionDir)) {
  const files = fs.readdirSync(testVersionDir);
  files.forEach(file => {
    fs.unlinkSync(path.join(testVersionDir, file));
  });
  fs.rmdirSync(testVersionDir);
}

console.log('\n测试完成，已清理测试文件');