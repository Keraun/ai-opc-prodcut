"use client"

import { useState, useEffect } from "react"
import { Button, Drawer, Dropdown, Menu } from "@arco-design/web-react"
import { IconMenu, IconPhone } from "@arco-design/web-react/icon"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/logo"
import { siteConfig, navigationConfig } from "@/config/site"

const navItems = navigationConfig.main

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
          {siteConfig?.name && (
            <div className="flex items-center gap-2.5 w-[200px]">
              <Logo className="w-9 h-9 md:w-10 md:h-10 flex-shrink-0" />
              <span className="text-lg md:text-xl font-bold text-gray-900 leading-none">{siteConfig.name}</span>
            </div>
          )}
            {/* Desktop Navigation */}
            {navItems && navItems.length > 0 && (
              <nav className="hidden md:flex items-center justify-center gap-8 flex-1">
                {navItems.map((item) => (
                  <button
                    key={item?.href}
                    onClick={() => handleNavClick(item?.href)}
                    className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium cursor-pointer relative group"
                  >
                    {item?.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-500 group-hover:w-full transition-all duration-300" />
                  </button>
                ))}
              </nav>
            )}
          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3 w-[200px] justify-end">
            <Dropdown
              droplist={
                <div className="p-4">
                  <div className="w-32 h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center border-2 border-gray-200">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center">
                        <span className="text-xs text-gray-400">客服二维码</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-xs text-gray-500 mt-2">扫码联系客服</p>
                </div>
              }
              trigger="hover"
              position="br"
            >
              <Button
                type="text"
                className="!text-gray-700 hover:!text-cyan-500 !px-4 !h-10 !rounded-full transition-all duration-300"
              >
                <IconPhone className="mr-1.5" />
                联系我们
              </Button>
            </Dropdown>
            <Link href="/products">
              <Button
                type="primary"
                className="!bg-blue-800 !text-white hover:!bg-blue-900 !px-6 !h-10 !rounded-full shadow-lg shadow-blue-800/25 hover:shadow-xl hover:shadow-blue-800/30 transition-all duration-300"
              >
                开始使用
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden ml-auto">
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
                className="!bg-blue-800 !text-white hover:!bg-blue-900 !h-12 !rounded-xl shadow-lg shadow-blue-800/25 hover:shadow-xl hover:shadow-blue-800/30 transition-all duration-300 !font-semibold !text-base"
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
