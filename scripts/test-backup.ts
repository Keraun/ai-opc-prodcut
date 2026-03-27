import {
  getBackupFiles,
  createBackup,
  restoreBackup,
  restoreLatestBackup,
  validateDatabase,
  deleteBackup
} from '../lib/backup-utils'

async function testBackupFunctions() {
  console.log('=== 测试备份工具函数 ===\n')

  console.log('1. 测试获取备份文件列表')
  const backups = getBackupFiles()
  console.log(`   找到 ${backups.length} 个备份文件`)
  backups.forEach((backup, index) => {
    console.log(`   ${index + 1}. ${backup.filename} (${backup.formattedSize})`)
  })

  console.log('\n2. 测试验证数据库')
  const validation = validateDatabase()
  console.log(`   数据库状态: ${validation.valid ? '✅ 有效' : '❌ 无效'}`)
  if (validation.tables) {
    console.log(`   表数量: ${validation.tables.length}`)
  }
  if (validation.error) {
    console.log(`   错误: ${validation.error}`)
  }

  console.log('\n3. 测试创建备份')
  const newBackup = createBackup('test')
  console.log(`   ✅ 备份创建成功: ${newBackup.filename}`)
  console.log(`   文件大小: ${newBackup.formattedSize}`)

  console.log('\n4. 测试删除备份')
  const deleted = deleteBackup(newBackup.filename)
  console.log(`   ${deleted ? '✅ 删除成功' : '❌ 删除失败'}`)

  console.log('\n=== 测试完成 ===')
}

testBackupFunctions().catch(console.error)
