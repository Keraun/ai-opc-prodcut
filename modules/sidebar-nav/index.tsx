import { HomeIcon, ThunderboltIcon, UserGroupIcon, PhoneIcon, GiftIcon, StarIcon } from "../icons"
import type { ModuleProps } from "@/modules/types"
import type { SidebarNavData } from "./types"
import styles from "./index.module.css"

// 模块ID到标签和图标的映射
const moduleMapping: Record<string, { label: string; icon: React.ReactNode }> = {
  'section-hero': { label: '介绍', icon: <HomeIcon /> },
  'section-products': { label: '产品', icon: <GiftIcon /> },
  'section-services': { label: '服务', icon: <ThunderboltIcon /> },
  'section-pricing': { label: '价格', icon: <GiftIcon /> },
  'section-about': { label: '关于我们', icon: <UserGroupIcon /> },
  'section-contact': { label: '联系我们', icon: <PhoneIcon /> },
  'section-partner': { label: '合作伙伴', icon: <StarIcon /> },

}

interface SidebarItem {
  id: string
  label: string
  icon: React.ReactNode
  href: string
}

export function SidebarNavModule({ data, moduleInstanceId }: ModuleProps) {
  const config: SidebarNavData = (data as SidebarNavData) || {}
  
  // 支持小、中、大三种尺寸，默认使用small
  const size = config?.size || 'small'

  // 从moduleInstanceId中提取页面ID，格式为：moduleId-pageId-timestamp
  const pageId = moduleInstanceId.split('-')[1] || ''
  
  // 从props中获取页面模块列表（如果有的话）
  const pageModules = (data as any)?.pageModules || []
  
  // 根据页面模块列表生成导航项
  const sidebarItems: SidebarItem[] = []
  
  if (pageModules && pageModules.length > 0) {
    for (const moduleId of pageModules) {
      if (moduleMapping[moduleId]) {
        const { label, icon } = moduleMapping[moduleId]
        sidebarItems.push({
          id: moduleId,
          label,
          icon,
          href: `#${moduleId.replace('section-', '')}`
        })
      }
    }
  }

  return (
    <div className={styles.sidebar}>
      <nav className={`${styles.navList} ${styles[`navList_${size}`]}`}>
        {sidebarItems.map((item) => {
          const Icon = item.icon
          
          return (
            <a
              key={item.id}
              href={item.href}
              className={`${styles.navItem} ${styles[`navItem_${size}`]}`}
              title={item.label}
            >
              <span className={`${styles.navIcon} ${styles[`navIcon_${size}`]}`}>{Icon}</span>
              <span className={styles.tooltip}>{item.label}</span>
            </a>
          )
        })}
      </nav>
    </div>
  )
}