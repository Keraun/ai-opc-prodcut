"use client"

import styles from "../dashboard.module.css"

interface SidebarProps {
  collapsed: boolean
  activeMenu: string
  onMenuClick: (menu: string) => void
  onToggleCollapse: () => void
}

export function Sidebar({
  collapsed,
  activeMenu,
  onMenuClick,
  onToggleCollapse
}: SidebarProps) {
  return (
    <div className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : styles.sidebarExpanded}`}>
      <div className={styles.sidebarContent}>
        <div className={styles.sidebarPadding}>
          <nav className={styles.navList}>
            <button
              onClick={() => onMenuClick('accountInfo')}
              className={`${styles.navItem} ${activeMenu === 'accountInfo' ? styles.navItemActive : styles.navItemInactive}`}
            >
              <span className={styles.navItemIcon}>👤</span>
              {!collapsed && <span className={styles.navItemText}>账户信息</span>}
            </button>

            <div className={styles.navSection}>
              <span className={styles.navSectionTitle}>配置管理</span>
            </div>

            <button
              onClick={() => onMenuClick('site')}
              className={`${styles.navItem} ${activeMenu === 'site' ? styles.navItemActive : styles.navItemInactive}`}
            >
              <span className={styles.navItemIcon}>🏠</span>
              {!collapsed && <span className={styles.navItemText}>站点配置</span>}
            </button>

            <button
              onClick={() => onMenuClick('navigation')}
              className={`${styles.navItem} ${activeMenu === 'navigation' ? styles.navItemActive : styles.navItemInactive}`}
            >
              <span className={styles.navItemIcon}>🧭</span>
              {!collapsed && <span className={styles.navItemText}>导航配置</span>}
            </button>

            <button
              onClick={() => onMenuClick('footer')}
              className={`${styles.navItem} ${activeMenu === 'footer' ? styles.navItemActive : styles.navItemInactive}`}
            >
              <span className={styles.navItemIcon}>📋</span>
              {!collapsed && <span className={styles.navItemText}>页脚配置</span>}
            </button>

            <div className={styles.navSection}>
              <span className={styles.navSectionTitle}>首页配置</span>
            </div>

            <button
              onClick={() => onMenuClick('home')}
              className={`${styles.navItem} ${activeMenu === 'home' ? styles.navItemActive : styles.navItemInactive}`}
            >
              <span className={styles.navItemIcon}>📄</span>
              {!collapsed && <span className={styles.navItemText}>首页配置</span>}
            </button>

            <button
              onClick={() => onMenuClick('homeBanner')}
              className={`${styles.navItem} ${activeMenu === 'homeBanner' ? styles.navItemActive : styles.navItemInactive}`}
            >
              <span className={styles.navItemIcon}>🎯</span>
              {!collapsed && <span className={styles.navItemText}>Banner配置</span>}
            </button>

            <button
              onClick={() => onMenuClick('homePartners')}
              className={`${styles.navItem} ${activeMenu === 'homePartners' ? styles.navItemActive : styles.navItemInactive}`}
            >
              <span className={styles.navItemIcon}>🤝</span>
              {!collapsed && <span className={styles.navItemText}>合作伙伴</span>}
            </button>

            <button
              onClick={() => onMenuClick('homeProducts')}
              className={`${styles.navItem} ${activeMenu === 'homeProducts' ? styles.navItemActive : styles.navItemInactive}`}
            >
              <span className={styles.navItemIcon}>📦</span>
              {!collapsed && <span className={styles.navItemText}>产品展示</span>}
            </button>

            <button
              onClick={() => onMenuClick('homeServices')}
              className={`${styles.navItem} ${activeMenu === 'homeServices' ? styles.navItemActive : styles.navItemInactive}`}
            >
              <span className={styles.navItemIcon}>🛠️</span>
              {!collapsed && <span className={styles.navItemText}>服务信息</span>}
            </button>

            <button
              onClick={() => onMenuClick('homePricing')}
              className={`${styles.navItem} ${activeMenu === 'homePricing' ? styles.navItemActive : styles.navItemInactive}`}
            >
              <span className={styles.navItemIcon}>💰</span>
              {!collapsed && <span className={styles.navItemText}>价格信息</span>}
            </button>

            <button
              onClick={() => onMenuClick('homeAbout')}
              className={`${styles.navItem} ${activeMenu === 'homeAbout' ? styles.navItemActive : styles.navItemInactive}`}
            >
              <span className={styles.navItemIcon}>ℹ️</span>
              {!collapsed && <span className={styles.navItemText}>关于我们</span>}
            </button>

            <button
              onClick={() => onMenuClick('homeContact')}
              className={`${styles.navItem} ${activeMenu === 'homeContact' ? styles.navItemActive : styles.navItemInactive}`}
            >
              <span className={styles.navItemIcon}>📧</span>
              {!collapsed && <span className={styles.navItemText}>联系我们</span>}
            </button>

            <div className={styles.navSection}>
              <span className={styles.navSectionTitle}>内容管理</span>
            </div>

            <button
              onClick={() => onMenuClick('articles')}
              className={`${styles.navItem} ${activeMenu === 'articles' ? styles.navItemActive : styles.navItemInactive}`}
            >
              <span className={styles.navItemIcon}>📝</span>
              {!collapsed && <span className={styles.navItemText}>文章管理</span>}
            </button>

            <div className={styles.navSection}>
              <span className={styles.navSectionTitle}>其他配置</span>
            </div>

            <button
              onClick={() => onMenuClick('products')}
              className={`${styles.navItem} ${activeMenu === 'products' ? styles.navItemActive : styles.navItemInactive}`}
            >
              <span className={styles.navItemIcon}>🛍️</span>
              {!collapsed && <span className={styles.navItemText}>产品列表</span>}
            </button>

            <button
              onClick={() => onMenuClick('custom')}
              className={`${styles.navItem} ${activeMenu === 'custom' ? styles.navItemActive : styles.navItemInactive}`}
            >
              <span className={styles.navItemIcon}>🎨</span>
              {!collapsed && <span className={styles.navItemText}>个性化</span>}
            </button>

            <button
              onClick={() => onMenuClick('theme')}
              className={`${styles.navItem} ${activeMenu === 'theme' ? styles.navItemActive : styles.navItemInactive}`}
            >
              <span className={styles.navItemIcon}>🎭</span>
              {!collapsed && <span className={styles.navItemText}>主题皮肤</span>}
            </button>

            <button
              onClick={() => onMenuClick('otherPages')}
              className={`${styles.navItem} ${activeMenu === 'otherPages' ? styles.navItemActive : styles.navItemInactive}`}
            >
              <span className={styles.navItemIcon}>📑</span>
              {!collapsed && <span className={styles.navItemText}>自定义页面</span>}
            </button>

            <div className={styles.navSection}>
              <span className={styles.navSectionTitle}>系统</span>
            </div>

            <button
              onClick={() => onMenuClick('system')}
              className={`${styles.navItem} ${activeMenu === 'system' ? styles.navItemActive : styles.navItemInactive}`}
            >
              <span className={styles.navItemIcon}>🔧</span>
              {!collapsed && <span className={styles.navItemText}>系统管理</span>}
            </button>

            <button
              onClick={() => onMenuClick('operationLogs')}
              className={`${styles.navItem} ${activeMenu === 'operationLogs' ? styles.navItemActive : styles.navItemInactive}`}
            >
              <span className={styles.navItemIcon}>📊</span>
              {!collapsed && <span className={styles.navItemText}>操作记录</span>}
            </button>
          </nav>
        </div>
      </div>
    </div>
  )
}
