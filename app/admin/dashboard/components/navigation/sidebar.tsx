"use client"

import { useMemo } from "react"
import styles from "../../dashboard.module.css"

interface SidebarProps {
  collapsed: boolean
  activeMenu: string
  onMenuClick: (menu: string) => void
  onToggleCollapse: () => void
}

interface MenuItem {
  id: string
  label: string
  icon: string
  category?: string
}

const MENU_STRUCTURE: MenuItem[] = [
  { id: 'pages', label: '页面管理', icon: '📄' },
  { id: 'feishu-app', label: '飞书管理', icon: '💬' },
  { id: 'theme', label: '主题管理', icon: '🎨' },
  { id: 'accounts', label: '账号管理', icon: '👥' },
  { id: 'system', label: '系统管理', icon: '🔧' },
]

const CATEGORY_ORDER = ['']

export function Sidebar({
  collapsed,
  activeMenu,
  onMenuClick,
  onToggleCollapse
}: SidebarProps) {
  const menuByCategory = useMemo(() => {
    const categories: Record<string, MenuItem[]> = {}

    MENU_STRUCTURE.forEach(item => {
      const category = item.category || ''
      if (!categories[category]) {
        categories[category] = []
      }
      categories[category].push(item)
    })

    return CATEGORY_ORDER
      .filter(cat => categories[cat])
      .map(cat => ({
        name: cat,
        items: categories[cat]
      }))
  }, [])

  return (
    <div className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : styles.sidebarExpanded}`}>
      <div className={styles.sidebarContent}>
        <div className={styles.sidebarPadding}>
          <nav className={styles.navList}>
            {menuByCategory.map((category, catIndex) => (
              <div key={catIndex}>
                {category.name && (
                  <div className={styles.navSection}>
                    <span className={styles.navSectionTitle}>{category.name}</span>
                  </div>
                )}
                {category.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onMenuClick(item.id)}
                    className={`${styles.navItem} ${activeMenu === item.id ? styles.navItemActive : styles.navItemInactive}`}
                  >
                    <span className={styles.navItemIcon}>{item.icon}</span>
                    {!collapsed && <span className={styles.navItemText}>{item.label}</span>}
                  </button>
                ))}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}
