"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuth } from "./common/hooks/useAuth"
import { useConfig } from "./common/hooks/useConfig"
import { Sidebar, Header } from "./components"
import { ConfigFormEditor } from './components/config-editor/ConfigFormEditor'
import { ConfigEditor } from './modules/config/config-editor'
import { 
  ChangePasswordModal, 
  PasswordBanner,
  ThemeManager,
  SystemManager,
  AccountManager,
  PageManager,
  ArticleManager,
  ProductManager,
  SiteConfigManager,
  MessageManager
} from "./modules"
import { ImageManagement } from "./components"
import styles from "./dashboard.module.css"

export default function AdminDashboardPage() {
  const router = useRouter()
  const { currentUser, checkAuth, logout } = useAuth()
  const { fetchConfigs, fetchSchema, configs, saveConfig, hasChanges, loading: configLoading } = useConfig()
  
  const [activeMenu, setActiveMenu] = useState('pages')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [mustChangePassword, setMustChangePassword] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const menu = urlParams.get('menu') || 'pages'
      if (menu !== activeMenu) {
        setActiveMenu(menu)
      }
    }
  }, [])

  const checkMustChangePassword = async () => {
    try {
      const checkAuthRes = await fetch('/api/admin/auth')
      const authResult = await checkAuthRes.json()
      if (authResult.success && authResult.user) {
        setMustChangePassword(authResult.user.mustChangePassword || false)
      }
    } catch (error) {
      console.error('Failed to check must change password:', error)
    }
  }

  useEffect(() => {
    const init = async () => {
      const authenticated = await checkAuth()
      if (authenticated) {
        await checkMustChangePassword()
        await fetchConfigs()
        await fetchSchema()
      }
    }
    
    init()
  }, [])

  useEffect(() => {
    if (!showChangePassword) {
      checkMustChangePassword()
    }
  }, [showChangePassword])

  const handleMenuClick = (menu: string) => {
    setActiveMenu(menu)
    router.push(`/admin/dashboard?menu=${menu}`)
  }

  const handleLogout = async () => {
    const success = await logout()
    if (success) {
      toast.success("退出成功")
    }
  }

  const handleChangePassword = () => {
    setShowChangePassword(true)
  }

  const renderContent = () => {
    switch (activeMenu) {
      case 'site-config':
        return <SiteConfigManager />
      case 'pages':
        return <PageManager />
      case 'articles':
        return <ArticleManager />
      case 'products':
        return <ProductManager />
      case 'messages':
        return <MessageManager />
      case 'images':
        return <ImageManagement />

      case 'theme':
        return <ThemeManager />
      case 'accounts':
        return <AccountManager />
      case 'system':
        return <SystemManager />
      default:
        return <PageManager />
    }
  }

  return (
    <div className={styles.mainContainer}>
      {mustChangePassword && (
        <PasswordBanner onChangePassword={handleChangePassword} />
      )}

      <Header 
        currentUser={currentUser}
        onLogout={handleLogout}
        onChangePassword={handleChangePassword}
      />

      <div className={styles.mainLayout}>
        <Sidebar
          activeMenu={activeMenu}
          collapsed={sidebarCollapsed}
          onMenuClick={handleMenuClick}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <div className={styles.contentArea}>
          <div className={styles.contentPadding}>
            {loading ? (
              <div className={styles.loading}>加载中...</div>
            ) : (
              renderContent()
            )}
          </div>
        </div>
      </div>

      {showChangePassword && (
        <ChangePasswordModal
          visible={showChangePassword}
          onClose={() => {
            setShowChangePassword(false)
          }}
          mustChange={mustChangePassword}
        />
      )}
    </div>
  )
}
