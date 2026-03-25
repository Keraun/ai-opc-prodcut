"use client"

import { useState, useEffect } from "react"
import { IconHome, IconThunderbolt, IconUserGroup, IconPhone, IconGift, IconStar } from "@arco-design/web-react/icon"
import { useTheme } from "@/components/theme-provider"
import { fetchConfig } from "@/config/client"
import styles from "./sidebar-nav.module.css"

const iconMap: Record<string, any> = {
  hero: IconHome,
  partner: IconStar,
  products: IconGift,
  services: IconThunderbolt,
  pricing: IconGift,
  about: IconUserGroup,
  contact: IconPhone,
}

const labelMap: Record<string, string> = {
  hero: "介绍",
  partner: "合作伙伴",
  products: "产品",
  services: "服务",
  pricing: "价格",
  about: "关于我们",
  contact: "联系我们",
}

export function SidebarNav() {
  const [activeSection, setActiveSection] = useState("hero")
  const [sidebarItems, setSidebarItems] = useState<any[]>([])
  const { themeConfig } = useTheme()
  
  const primaryColor = themeConfig?.colors?.primary || "#1e40af"

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await fetchConfig()
        if (config.homeOrder?.sections) {
          const items = config.homeOrder.sections
            .filter((section: any) => section.visible !== false && section.sidebar !== false)
            .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
            .map((section: any) => ({
              id: section.id,
              label: labelMap[section.id] || section.name || section.id,
              icon: iconMap[section.id] || IconStar,
              href: `#${section.id}`
            }))
          setSidebarItems(items)
        }
      } catch (error) {
        console.error('Failed to load sidebar config:', error)
      }
    }

    loadConfig()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (sidebarItems.length === 0) return
      
      const sections = sidebarItems.map((item) => item.href)
      const scrollPosition = window.scrollY + 100

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.querySelector(sections[i]) as HTMLElement
        if (section) {
          const sectionTop = section.offsetTop
          if (scrollPosition >= sectionTop) {
            setActiveSection(sidebarItems[i].id)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [sidebarItems])

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  if (sidebarItems.length === 0) {
    return null
  }

  return (
    <div className={styles.sidebar}>
      <nav className={styles.navList}>
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id

          return (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.href)}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              title={item.label}
            >
              <Icon className={styles.navIcon} style={isActive ? { color: primaryColor } : {}} />
              <span className={styles.tooltip}>{item.label}</span>
              {isActive && (
                <div 
                  className={styles.activeIndicator}
                  style={{ backgroundColor: primaryColor }}
                />
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
