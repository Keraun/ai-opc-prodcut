import { useState, useEffect } from "react"
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
  'hero': { label: '介绍', icon: <HomeIcon /> },
  'products': { label: '产品', icon: <GiftIcon /> },
  'services': { label: '服务', icon: <ThunderboltIcon /> },
  'pricing': { label: '价格', icon: <GiftIcon /> },
  'about': { label: '关于我们', icon: <UserGroupIcon /> },
  'contact': { label: '联系我们', icon: <PhoneIcon /> },
  'partner': { label: '合作伙伴', icon: <StarIcon /> },
}

interface SidebarItem {
  id: string
  label: string
  icon: React.ReactNode
  href: string
}

export function SidebarNavModule({ data, moduleInstanceId }: ModuleProps) {
  const config: SidebarNavData = (data as SidebarNavData) || {}
  const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>([])
  const [loading, setLoading] = useState(true)
  
  // 支持小、中、大三种尺寸，默认使用small
  const size = config?.size || 'small'

  // 从moduleInstanceId中提取页面ID，格式为：moduleId-pageId-timestamp
  const pageId = moduleInstanceId.split('-')[1] || ''
  
  useEffect(() => {
    async function fetchPageModules() {
      try {
        // 从当前URL获取页面ID
        const currentPath = window.location.pathname
        const pathParts = currentPath.split('/').filter(Boolean)
        
        // 尝试从API获取页面列表
        const response = await fetch('/api/admin/pages')
        if (response.ok) {
          const data = await response.json()
          const pages = data.pages || []
          
          // 查找当前页面
          let currentPage = null
          if (pathParts.length === 1) {
            // 静态页面，如 /home
            currentPage = pages.find((p: any) => p.slug === pathParts[0])
          } else if (pathParts.length === 2) {
            // 动态路由页面，如 /news/123
            currentPage = pages.find((p: any) => p.slug === pathParts[0] && p.type === 'dynamic')
          }
          
          if (currentPage && currentPage.modules) {
            const items: SidebarItem[] = []
            for (const moduleId of currentPage.modules) {
              if (moduleMapping[moduleId]) {
                const { label, icon } = moduleMapping[moduleId]
                items.push({
                  id: moduleId,
                  label,
                  icon,
                  href: `#${moduleId.replace('section-', '')}`
                })
              }
            }
            setSidebarItems(items)
          } else {
            // 如果找不到页面或没有模块，使用默认导航项
            setDefaultItems()
          }
        } else {
          setDefaultItems()
        }
      } catch (error) {
        console.error('Failed to fetch page modules:', error)
        setDefaultItems()
      } finally {
        setLoading(false)
      }
    }
    
    fetchPageModules()
  }, [pageId])
  
  function setDefaultItems() {
    setSidebarItems([])
  }

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, id: string) => {
    e.preventDefault()
    
    // 提取目标元素的ID（去掉#前缀）
    const targetId = href.substring(1)
    const targetElement = document.getElementById(targetId)
    
    if (targetElement) {
      // 平滑滚动到目标元素
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      })
    }
  }

  if (loading) {
    return (
      <div className={styles.sidebar}>
        <div className={styles.loading}>加载中...</div>
      </div>
    )
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
              onClick={(e) => handleNavClick(e, item.href, item.id)}
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