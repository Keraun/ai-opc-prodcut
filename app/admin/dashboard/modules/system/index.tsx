import { useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../../common/hooks/useAuth'
import { useConfig } from '../../common/hooks/useConfig'
import { handleExportConfig, handleImportConfig, handleResetWebsite } from '../../common/utils/config-utils'
import { SystemManagement } from '../../components'
import { ChangePasswordModal } from '../auth'
import styles from './system.module.css'

export function SystemManager() {
  const { currentUser, updateCurrentUser } = useAuth()
  const { configs } = useConfig()
  const [importing, setImporting] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)

  const handleExport = async () => {
    await handleExportConfig()
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const confirmed = window.confirm('确定要导入配置吗?这将覆盖当前的配置版本。')
    
    if (confirmed) {
      setImporting(true)
      try {
        await handleImportConfig(file)
      } finally {
        setImporting(false)
      }
    }
  }

  const handleReset = async () => {
    if (!currentUser) {
      toast.error("未找到用户信息,请重新登录")
      return
    }

    await handleResetWebsite(currentUser.username)
  }

  const handleChangePassword = () => {
    setShowChangePassword(true)
  }

  return (
    <>
      <SystemManagement
        siteConfig={configs.site_config}
        onExportConfig={handleExport}
        onImportConfig={handleImport}
        onResetWebsite={handleReset}
        currentUser={currentUser}
        onChangePassword={handleChangePassword}
      />
      <ChangePasswordModal
        visible={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        mustChange={false}
      />
    </>
  )
}
