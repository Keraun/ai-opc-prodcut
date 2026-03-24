"use client"

import { useState, useEffect } from "react"
import { Button, Drawer, Dropdown, Menu } from "@arco-design/web-react"
import { IconMenu } from "@arco-design/web-react/icon"
import Link from "next/link"
import { useRouter } from "next/navigation"

const navItems = [
  { label: "首页", href: "/" },
  { label: "产品", href: "/products" },
  { label: "工具", href: "/tools" },
  { label: "AI导航", href: "/ai-nav" },
]

export function Header() {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("scroll", handleScroll)
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const handleNavClick = (href: string) => {
    router.push(href)
    setDrawerVisible(false)
  }

  const dropdownMenu = (
    <Menu className="!bg-white !border-gray-100 min-w-[160px] rounded-xl shadow-lg">
      {navItems.map((item) => (
        <Menu.Item
          key={item?.href}
          onClick={() => handleNavClick(item?.href)}
          className="!text-gray-700 hover:!bg-gray-50 cursor-pointer rounded-lg mx-1"
        >{item?.label}

        </Menu.Item>
      ))}
      <Menu.Item key="trial" className="!text-blue-600 hover:!bg-blue-50 cursor-pointer rounded-lg mx-1">
       开始使用
      </Menu.Item>
    </Menu>
  )

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? "bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm"
        : "bg-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <span className="text-white font-bold text-lg md:text-xl">N</span>
            </div>
            <span className="text-lg md:text-xl font-bold text-gray-900">NexusAI</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium cursor-pointer relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300" />
              </button>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <Link href="/products">
              <Button
                type="primary"
                className="!bg-blue-600 !text-white hover:!bg-blue-700 !px-6 !h-10 !rounded-full shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300"
              >
               开始使用
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex-shrink-0 ml-auto">
            <Button
              type="text"
              className="!text-gray-700"
              icon={<IconMenu className="text-xl" />}
              onClick={() => setDrawerVisible(true)}
            />
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        width={320}
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">NexusAI</span>
          </div>
        }
        visible={drawerVisible}
        placement="right"
        closable
        onCancel={() => setDrawerVisible(false)}
        footer={null}
        className="[&_.arco-drawer-content]:!bg-gradient-to-br [&_.arco-drawer-content]:from-gray-50 [&_.arco-drawer-content]:to-white [&_.arco-drawer-header]:!bg-white [&_.arco-drawer-header]:!border-gray-100 [&_.arco-drawer-close-btn]:!text-gray-500 [&_.arco-drawer-close-btn]:hover:!text-gray-900"
      >
        <div className="flex flex-col gap-2 py-6">
          {navItems.map((item, index) => (
            <button
              key={item.href}
              onClick={() => handleNavClick(item.href)}
              className="group flex items-center gap-4 px-4 py-4 rounded-xl text-left text-gray-700 hover:bg-white hover:shadow-md hover:shadow-blue-500/5 transition-all duration-300 border border-transparent hover:border-gray-100"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center group-hover:from-blue-500 group-hover:to-blue-600 transition-all duration-300">
                <span className="text-blue-600 group-hover:text-white font-semibold text-sm">
                  {item.label[0]}
                </span>
              </div>
              <span className="text-base font-medium group-hover:text-blue-600 transition-colors">
                {item.label}
              </span>
            </button>
          ))}
          
          <div className="mt-8 pt-8 border-t border-gray-200">
            <Link href="/products" onClick={() => setDrawerVisible(false)}>
              <Button 
                type="primary" 
                long 
                className="!bg-gradient-to-r !from-blue-600 !to-blue-700 !text-white hover:!from-blue-700 hover:!to-blue-800 !h-12 !rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 !font-semibold !text-base"
              >
                立即开始使用
              </Button>
            </Link>
            <p className="text-center text-xs text-gray-400 mt-4">
              免费试用 · 无需信用卡
            </p>
          </div>
        </div>
      </Drawer>
    </header>
  )
}
