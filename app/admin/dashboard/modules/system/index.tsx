import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Modal, Input } from '@arco-design/web-react'
import { useAuth } from '../../common/hooks/useAuth'
import { useConfig } from '../../common/hooks/useConfig'
import { handleExportConfig, handleImportConfig, handleResetWebsite } from '../../common/utils/config-utils'
import { SystemManagement } from '../../components'
import { ChangePasswordModal } from '../auth'
import { getSystemInfo, restartSystem } from '@/lib/api-client'
import styles from './system.module.css'

export function SystemManager() {
  const { currentUser, updateCurrentUser } = useAuth()
  const { configs } = useConfig()
  const [importing, setImporting] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [systemInfo, setSystemInfo] = useState<any>(null)
  const [restarting, setRestarting] = useState(false)
  const [showRestartConfirm, setShowRestartConfirm] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [superAdminToken, setSuperAdminToken] = useState('')
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    loadSystemInfo()
  }, [])

  const loadSystemInfo = async () => {
    try {
      const result = await getSystemInfo()
      if (result.success && result.data) {
        setSystemInfo(result.data)
      }
    } catch (error) {
      console.error('加载系统信息失败:', error)
    }
  }

  const handleRestart = async () => {
    setShowRestartConfirm(true)
  }

  const confirmRestart = async () => {
    setShowRestartConfirm(false)
    setRestarting(true)
    try {
      const result = await restartSystem()
      if (result.success) {
        toast.success(result.message || '正在重启服务，请稍候...')
      } else {
        toast.error(result.message || '重启服务失败')
      }
    } catch (error) {
      console.error('重启服务失败:', error)
      toast.error('重启服务失败')
    } finally {
      setRestarting(false)
    }
  }

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

  const handleResetClick = () => {
    setShowResetConfirm(true)
    setSuperAdminToken('')
  }

  const confirmReset = async () => {
    if (!superAdminToken) {
      toast.error('请输入超级管理员口令')
      return
    }

    setResetting(true)
    try {
      const success = await handleResetWebsite(superAdminToken)
      if (success) {
        setShowResetConfirm(false)
      }
    } catch (error) {
      console.error('还原配置失败:', error)
    } finally {
      setResetting(false)
    }
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
        onResetWebsite={handleResetClick}
        currentUser={currentUser}
        onChangePassword={handleChangePassword}
        systemInfo={systemInfo}
        onRestartSystem={handleRestart}
        restarting={restarting}
      />
      <ChangePasswordModal
        visible={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        mustChange={false}
      />
      <Modal
        title="确认重启服务"
        visible={showRestartConfirm}
        onOk={confirmRestart}
        onCancel={() => setShowRestartConfirm(false)}
        okText="确认重启"
        cancelText="取消"
      >
        <p>确定要重启服务吗？这将终止占用当前端口的进程并重新启动服务。</p>
      </Modal>
      <Modal
        title="确认还原网站配置"
        visible={showResetConfirm}
        onOk={confirmReset}
        onCancel={() => {
          setShowResetConfirm(false)
          setSuperAdminToken('')
        }}
        okText="确认还原"
        cancelText="取消"
        confirmLoading={resetting}
      >
        <div style={{ padding: '16px 0' }}>
          <p style={{ marginBottom: '16px' }}>请输入超级管理员口令以继续：</p>
          <Input.Password
            placeholder="请输入超级管理员口令"
            value={superAdminToken}
            onChange={(value) => setSuperAdminToken(value)}
            onPressEnter={confirmReset}
            size="large"
            style={{ width: '100%' }}
          />
        </div>
      </Modal>
    </>
  )
}
