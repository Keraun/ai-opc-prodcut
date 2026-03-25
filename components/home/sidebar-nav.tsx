"use client"

import { useState, useEffect } from "react"
import { IconHome, IconThunderbolt, IconUserGroup, IconPhone, IconGift, IconStar } from "@arco-design/web-react/icon"
import { useTheme } from "@/components/theme-provider"
import { fetchConfig } from "@/config/client"

// 图标映射
const iconMap: Record<string, any> = {
  hero: IconHome,
  partner: IconStar,
  products: IconGift,
  services: IconThunderbolt,
  pricing: IconGift,
  about: IconUserGroup,
  contact: IconPhone,
}

// 标签映射
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
  const secondaryColor = themeConfig?.colors?.secondary || "#3b82f6"
  const accentColor = themeConfig?.colors?.accent || "#06b6d4"

  // 加载动态配置
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await fetchConfig()
        if (config.homeOrder?.sections) {
          const items = config.homeOrder.sections
            .filter((section: any) => section.visible !== false)
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
    <div className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden lg:block">
      <div className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-xl p-3 space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id
          return (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.href)}
              className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group ${
                isActive
                  ? "text-white shadow-lg"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
              style={isActive ? { backgroundColor: primaryColor } : undefined}
              title={item.label}
            >
              <Icon className="text-xl" />
              <span className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
