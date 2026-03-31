import { toast } from 'sonner'
import { exportConfig, importConfig, resetWebsite } from '@/lib/api-client'

export async function handleExportConfig(): Promise<boolean> {
  try {
    const blob = await exportConfig()
    if (blob) {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `config-export-${new Date().toISOString().split('T')[0]}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success('配置导出成功')
      return true
    } else {
      toast.error('配置导出失败')
      return false
    }
  } catch (error) {
    toast.error('配置导出失败')
    return false
  }
}

export async function handleImportConfig(file: File): Promise<boolean> {
  try {
    const success = await importConfig(file)

    if (success) {
      toast.success('配置导入成功,正在刷新页面...')
      setTimeout(() => {
        window.location.reload()
      }, 1500)
      return true
    } else {
      toast.error('配置导入失败')
      return false
    }
  } catch (error) {
    toast.error('配置导入失败')
    return false
  }
}

export async function handleResetWebsite(superAdminToken: string): Promise<boolean> {
  const backupConfirmed = window.confirm(
    "⚠️ 一键还原网站配置\n\n" +
    "此操作将把所有配置还原到模版文件状态,建议先备份当前配置。\n\n" +
    "点击'确定'先下载配置备份,点击'取消'放弃操作。"
  )

  if (!backupConfirmed) {
    return false
  }

  await handleExportConfig()

  const resetConfirmed = window.confirm(
    "✅ 配置已备份完成\n\n" +
    "现在可以安全地执行一键还原操作。\n\n" +
    "此操作将把所有配置还原到模版文件状态,无法恢复!\n\n" +
    "点击'确定'继续还原,点击'取消'放弃操作。"
  )

  if (!resetConfirmed) {
    return false
  }

  try {
    const success = await resetWebsite(superAdminToken)

    if (success) {
      toast.success("网站配置已成功还原到初始状态,正在跳转到登录页...")
      setTimeout(() => {
        sessionStorage.removeItem('currentUser')
        window.location.href = '/admin'
      }, 1500)
      return true
    } else {
      toast.error("还原失败")
      return false
    }
  } catch (error) {
    toast.error("还原失败,请重试")
    return false
  }
}
