"use client"

import { useState, useEffect } from "react"
import { Button, Drawer, Dropdown, Menu } from "@arco-design/web-react"
import { IconMenu } from "@arco-design/web-react/icon"
import Link from "next/link"

const navItems = [
  { label: "首页", href: "#home" },
  { label: "产品", href: "#products" },
  { label: "服务", href: "#services" },
  { label: "关于我们", href: "#about" },
  { label: "联系我们", href: "#contact" },
]

export function Header() {
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

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setDrawerVisible(false)
  }

  const dropdownMenu = (
    <Menu className="!bg-white !border-gray-100 min-w-[160px] rounded-xl shadow-lg">
      {navItems.map((item) => (
        <Menu.Item
          key={item?.href}
          onClick={() => scrollToSection(item?.href)}
          className="!text-gray-700 hover:!bg-gray-50 cursor-pointer rounded-lg mx-1"
        >{item?.label}

        </Menu.Item>
      ))}
      <Menu.Divider className="!bg-gray-100" />
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
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <span className="text-white font-bold text-lg md:text-xl">N</span>
            </div>
            <span className="text-lg md:text-xl font-bold text-gray-900">NexusAI</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => scrollToSection(item.href)}
                className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium cursor-pointer relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300" />
              </button>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/products">
              <Button
                type="primary"
                className="!bg-blue-600 !text-white hover:!bg-blue-700 !px-6 !h-10 !rounded-full shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300"
              >
               开始使用
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button - uses Drawer */}
          {isMobile && (
            <Button
              type="text"
              className="md:hidden !text-gray-700"
              icon={<IconMenu className="text-xl" />}
              onClick={() => setDrawerVisible(true)}
            />
          )}

          {/* Tablet/Small Desktop Menu - uses Dropdown */}
          {!isMobile && (
            <div className="md:hidden">
              <Dropdown
                droplist={dropdownMenu}
                trigger="click"
                position="br"
              >
                <Button
                  type="text"
                  className="!text-gray-700"
                  icon={<IconMenu className="text-xl" />}
                />
              </Dropdown>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer - only for mobile */}
      <Drawer
        width={280}
        title={
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold">N</span>
            </div>
            <span className="font-bold text-gray-900">NexusAI</span>
          </div>
        }
        visible={drawerVisible}
        placement="right"
        closable
        onCancel={() => setDrawerVisible(false)}
        footer={null}
        className="[&_.arco-drawer-content]:!bg-white [&_.arco-drawer-header]:!bg-white [&_.arco-drawer-header]:!border-gray-100"
      >
        <div className="flex flex-col gap-4 py-4">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => scrollToSection(item.href)}
              className="text-left text-lg text-gray-600 hover:text-gray-900 transition-colors py-2"
            >
              {item.label}
            </button>
          ))}
          <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-gray-100">
            <Link href="/products" onClick={() => setDrawerVisible(false)}>
              <Button type="primary" long className="!bg-blue-600 !text-white hover:!bg-blue-700 !rounded-full">
               开始使用
              </Button>
            </Link>
          </div>
        </div>
      </Drawer>
    </header>
  )
}
