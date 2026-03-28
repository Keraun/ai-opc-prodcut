import { useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../../common/hooks/useAuth'
import { useConfig } from '../../common/hooks/useConfig'
import { handleExportConfig, handleImportConfig, handleResetWebsite } from '../../common/utils/config-utils'
import { SystemManagement } from '../../components'
import styles from './system.module.css'

export function SystemManager() {
  const { currentUser } = useAuth()
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
    <div className={styles.systemManager}>
      <SystemManagement
        siteConfig={configs.site}
        onExportConfig={handleExport}
        onImportConfig={handleImport}
        onResetWebsite={handleReset}
        currentUser={currentUser}
        onChangePassword={handleChangePassword}
      />
      {showChangePassword && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>修改密码</h3>
              <button onClick={() => setShowChangePassword(false)} className={styles.closeButton}>×</button>
            </div>
            <div className={styles.modalBody}>
              <p>密码修改功能已集成到认证模块中</p>
            </div>
            <div className={styles.modalFooter}>
              <button onClick={() => setShowChangePassword(false)} className={styles.closeButton}>关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
