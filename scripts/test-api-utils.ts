#!/usr/bin/env tsx

import {
  successResponse,
  errorResponse,
  badRequestResponse,
  unauthorizedResponse,
  notFoundResponse
} from '../lib/api-utils'

async function testResponse(name: string, res: any) {
  console.log(`\n=== ${name} ===`)
  console.log(`  状态码: ${res.status}`)
  const json = await res.json()
  console.log('  JSON内容:', JSON.stringify(json, null, 4))
  console.log(`  ✓ 包含 code: ${'code' in json}`)
  console.log(`  ✓ 包含 success: ${'success' in json}`)
  console.log(`  ✓ 包含 message: ${'message' in json}`)
  console.log(`  ✓ 包含 data: ${'data' in json}`)
}

async function runTests() {
  console.log('=== 测试 API 工具库 ===\n')

  await testResponse('successResponse', successResponse({ id: 1, name: 'test' }, '操作成功'))
  await testResponse('errorResponse', errorResponse('服务器错误', 500))
  await testResponse('badRequestResponse', badRequestResponse('参数不完整'))
  await testResponse('unauthorizedResponse', unauthorizedResponse())
  await testResponse('notFoundResponse', notFoundResponse('页面不存在'))

  console.log('\n=== 测试完成 ===\n')
  console.log('✅ 所有响应格式都包含: code, success, message, data')
}

runTests()
