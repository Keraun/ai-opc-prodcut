"use client"

import { useMemo } from "react"
import styles from "../dashboard.module.css"
import { getRegisteredModules } from "@/modules/registry"

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
  { id: 'accountInfo', label: '账户信息', icon: '👤' },
  { id: 'site', label: '站点配置', icon: '🏠', category: '基础配置' },
  { id: 'theme', label: '主题皮肤', icon: '🎭', category: '基础配置' },
  { id: 'header', label: '顶部导航', icon: '🧭', category: '页面模块' },
  { id: 'sidebar-nav', label: '侧边栏导航', icon: '📑', category: '页面模块' },
  { id: 'section-hero', label: 'Hero 区块', icon: '🎯', category: '首页区块' },
  { id: 'section-partner', label: '合作伙伴', icon: '🤝', category: '首页区块' },
  { id: 'section-products', label: '产品展示', icon: '📦', category: '首页区块' },
  { id: 'section-services', label: '服务信息', icon: '🛠️', category: '首页区块' },
  { id: 'section-pricing', label: '价格信息', icon: '💰', category: '首页区块' },
  { id: 'section-about', label: '关于我们', icon: 'ℹ️', category: '首页区块' },
  { id: 'section-contact', label: '联系我们', icon: '📧', category: '首页区块' },
  { id: 'footer', label: '页脚配置', icon: '📋', category: '页面模块' },
  { id: 'articles', label: '文章管理', icon: '📝', category: '内容管理' },
  { id: 'products', label: '产品列表', icon: '🛍️', category: '内容管理' },
  { id: 'custom', label: '个性化', icon: '🎨', category: '其他配置' },
  { id: 'otherPages', label: '自定义页面', icon: '📑', category: '其他配置' },
  { id: 'system', label: '系统管理', icon: '🔧', category: '系统' },
  { id: 'operationLogs', label: '操作记录', icon: '📊', category: '系统' },
]

const CATEGORY_ORDER = ['', '基础配置', '页面模块', '首页区块', '内容管理', '其他配置', '系统']

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
