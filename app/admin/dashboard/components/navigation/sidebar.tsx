"use client"

import { useMemo } from "react"
import { 
  FileText, 
  Package, 
  Newspaper, 
  MessageCircle, 
  Palette, 
  Users, 
  Settings,
  Globe,
  Image,
  BookOpen
} from "lucide-react"
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
  icon: React.ComponentType<{ className?: string }>
  category?: string
}

const MENU_STRUCTURE: MenuItem[] = [
  { id: 'site-config', label: '全局配置', icon: Globe },
  { id: 'pages', label: '页面管理', icon: FileText },
  { id: 'products', label: '产品管理', icon: Package },
  { id: 'articles', label: '资讯管理', icon: Newspaper },
  { id: 'messages', label: '留言管理', icon: MessageCircle },
  { id: 'images', label: '图片管理', icon: Image },
  { id: 'theme', label: '主题管理', icon: Palette },
  { id: 'accounts', label: '账号管理', icon: Users },
  { id: 'system', label: '系统管理', icon: Settings },
  { id: 'project-guide', label: '项目手册', icon: BookOpen },
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
                {category.items.map((item) => {
                  const IconComponent = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => onMenuClick(item.id)}
                      className={`${styles.navItem} ${activeMenu === item.id ? styles.navItemActive : styles.navItemInactive}`}
                    >
                      <IconComponent className={styles.navItemIcon} />
                      {!collapsed && <span className={styles.navItemText}>{item.label}</span>}
                    </button>
                  )
                })}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}
