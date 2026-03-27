"use client"

import { useState } from "react"
import { HomeIcon, ThunderboltIcon, UserGroupIcon, PhoneIcon, GiftIcon, StarIcon } from "../icons"
import type { ModuleProps } from "@/modules/types"
import type { SidebarNavData } from "./types"
import styles from "./index.module.css"

const defaultSidebarItems = [
  { id: 'hero', label: '介绍', icon: <HomeIcon />, href: '#hero' },
  { id: 'products', label: '产品', icon: <GiftIcon />, href: '#products' },
  { id: 'services', label: '服务', icon: <ThunderboltIcon />, href: '#services' },
  { id: 'pricing', label: '价格', icon: <GiftIcon />, href: '#pricing' },
  { id: 'about', label: '关于我们', icon: <UserGroupIcon />, href: '#about' },
  { id: 'contact', label: '联系我们', icon: <PhoneIcon />, href: '#contact' },
  { id: 'partner', label: '合作伙伴', icon: <StarIcon />, href: '#partner' },
]

export function SidebarNavModule({ data }: ModuleProps) {
  const config: SidebarNavData = (data as SidebarNavData) || {}
  const sidebarItems = defaultSidebarItems
  const [activeItem, setActiveItem] = useState<string | null>(null)
  
  // 支持小、中、大三种尺寸，默认使用small
  const size = config?.size || 'small'

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, id: string) => {
    e.preventDefault()
    
    // 设置激活状态
    setActiveItem(id)
    
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
      
      // 3秒后清除激活状态
      setTimeout(() => {
        setActiveItem(null)
      }, 3000)
    }
  }

  return (
    <div className={styles.sidebar}>
      <nav className={`${styles.navList} ${styles[`navList_${size}`]}`}>
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.id
          
          return (
            <a
              key={item.id}
              href={item.href}
              className={`${styles.navItem} ${styles[`navItem_${size}`]} ${isActive ? styles.navItemActive : ''}`}
              title={item.label}
              onClick={(e) => handleNavClick(e, item.href, item.id)}
            >
              <span className={`${styles.navIcon} ${styles[`navIcon_${size}`]}`}>{Icon}</span>
              <span className={styles.tooltip}>{item.label}</span>
              <span className={styles.activeIndicator} />
            </a>
          )
        })}
      </nav>
    </div>
  )
}
