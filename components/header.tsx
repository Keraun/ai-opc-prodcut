"use client"

import { useState, useEffect } from "react"
import { Button, Drawer, Dropdown, Menu } from "@arco-design/web-react"
import { IconMenu, IconDown, IconUser } from "@arco-design/web-react/icon"
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
    <Menu className="!bg-card !border-border min-w-[160px]">
      {navItems.map((item) => (
        <Menu.Item
          key={item.href}
          onClick={() => scrollToSection(item.href)}
          className="!text-foreground hover:!bg-secondary"
        >
          {item.label}
        </Menu.Item>
      ))}
      <Menu.Divider className="!bg-border" />
      <Menu.Item key="login" className="!text-foreground hover:!bg-secondary">
        登录
      </Menu.Item>
      <Menu.Item key="trial" className="!text-accent hover:!bg-secondary">
        免费试用
      </Menu.Item>
    </Menu>
  )

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-accent-foreground font-bold text-lg md:text-xl">N</span>
            </div>
            <span className="text-lg md:text-xl font-bold text-foreground">NexusAI</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => scrollToSection(item.href)}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              type="text"
              icon={<IconUser />}
              className="!text-muted-foreground hover:!text-foreground !px-4 !h-9"
            >
              登录
            </Button>
            <Link href="/products">
              <Button
                type="primary"
                className="!bg-accent !text-accent-foreground hover:!bg-accent/90 !px-5 !h-9 !rounded-full"
              >
                开始免费试用
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button - uses Drawer */}
          {isMobile && (
            <Button
              type="text"
              className="md:hidden !text-foreground"
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
                  className="!text-foreground"
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
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-accent-foreground font-bold">N</span>
            </div>
            <span className="font-bold text-foreground">NexusAI</span>
          </div>
        }
        visible={drawerVisible}
        placement="right"
        closable
        onCancel={() => setDrawerVisible(false)}
        footer={null}
        className="[&_.arco-drawer-content]:!bg-background [&_.arco-drawer-header]:!bg-background [&_.arco-drawer-header]:!border-border"
      >
        <div className="flex flex-col gap-4 py-4">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => scrollToSection(item.href)}
              className="text-left text-lg text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              {item.label}
            </button>
          ))}
          <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-border">
            <Button type="secondary" long icon={<IconUser />} className="!bg-transparent !border-border !text-foreground">
              登录
            </Button>
            <Link href="/products" onClick={() => setDrawerVisible(false)}>
              <Button type="primary" long className="!bg-accent !text-accent-foreground">
                开始免费试用
              </Button>
            </Link>
          </div>
        </div>
      </Drawer>
    </header>
  )
}
