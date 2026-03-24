"use client"

import { useState, useEffect } from "react"
import { IconHome, IconApps, IconThunderbolt, IconUserGroup, IconPhone } from "@arco-design/web-react/icon"

const sidebarItems = [
  { id: "home", label: "介绍", icon: IconHome, href: "#home" },
  { id: "products", label: "产品", icon: IconApps, href: "#products" },
  { id: "services", label: "服务", icon: IconThunderbolt, href: "#services" },
  { id: "about", label: "关于我们", icon: IconUserGroup, href: "#about" },
  { id: "contact", label: "联系我们", icon: IconPhone, href: "#contact" },
]

export function SidebarNav() {
  const [activeSection, setActiveSection] = useState("home")

  useEffect(() => {
    const handleScroll = () => {
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
  }, [])

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
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
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
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
