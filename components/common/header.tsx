"use client"

import { useState, useEffect } from "react"
import { Button, Drawer, Dropdown, Menu } from "@arco-design/web-react"
import { IconMenu, IconCustomerService } from "@arco-design/web-react/icon"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/common/logo"
import { siteConfig, navigationConfig } from "@/config/client"
import { useTheme } from "@/components/theme-provider"
import styles from "./header.module.css"

const navItems = navigationConfig.main || []

export function Header() {
  const router = useRouter()
  const { themeConfig } = useTheme()
  const [isScrolled, setIsScrolled] = useState(false)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const primaryColor = themeConfig?.colors?.primary || "#1e40af"
  const secondaryColor = themeConfig?.colors?.secondary || "#3b82f6"
  const accentColor = themeConfig?.colors?.accent || "#06b6d4"

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


  return (
    <header
      className={`${styles.header} ${isScrolled ? styles.headerScrolled : styles.headerTransparent}`}
    >
      <div className={styles.container}>
        <div className={styles.headerInner}>
          {siteConfig?.name && (
            <div className={styles.logoSection}>
              <Logo className={styles.logo} />
              <span className={styles.logoText}>{siteConfig.name}</span>
            </div>
          )}
          
          {navItems && navItems.length > 0 && (
            <nav className={styles.nav}>
              {navItems.map((item) => (
                <button
                  key={item?.href}
                  onClick={() => handleNavClick(item?.href)}
                  className={styles.navButton}
                >
                  {item?.label}
                  <span 
                    className={styles.navUnderline}
                    style={{ backgroundColor: accentColor }}
                  />
                </button>
              ))}
            </nav>
          )}
          
          <div className={styles.ctaSection}>
            <Dropdown
              droplist={
                <div className={styles.dropdownContent}>
                  <div className={styles.dropdownQrContainer}>
                    <div className={styles.dropdownQrInner}>
                      <div className={styles.dropdownQrPlaceholder}>
                        <span className={styles.dropdownQrText}>客服二维码</span>
                      </div>
                    </div>
                  </div>
                  <p className={styles.dropdownHint}>扫码联系客服</p>
                </div>
              }
              trigger="hover"
              position="br"
            >
              <Button
                type="text"
                style={{ color: accentColor, height: '2.5rem', borderRadius: '9999px', transition: 'all 0.3s ease' }}
              >
                <IconCustomerService style={{ marginRight: '0.375rem' }} />
                联系我们
              </Button>
            </Dropdown>
            <Link href="/products">
              <Button
                style={{ 
                  backgroundColor: primaryColor,
                  color: 'white',
                  borderColor: primaryColor,
                  height: '2.5rem',
                  paddingLeft: '1.5rem',
                  paddingRight: '1.5rem',
                  borderRadius: '9999px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease'
                }}
              >
                开始使用
              </Button>
            </Link>
          </div>

          <button 
            className={styles.mobileMenuButton}
            onClick={() => setDrawerVisible(true)}
          >
            <IconMenu style={{ fontSize: '1.25rem', color: '#374151' }} />
          </button>
        </div>
      </div>

      <Drawer
        width={320}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div 
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                color: 'white'
              }}
            >
              <span style={{ color: 'white', fontWeight: 700, fontSize: '1.125rem' }}>N</span>
            </div>
            <span style={{ fontWeight: 700, color: '#111827', fontSize: '1.125rem' }}>NexusAI</span>
          </div>
        }
        visible={drawerVisible}
        placement="right"
        closable
        onCancel={() => setDrawerVisible(false)}
        footer={null}
      >
        <div className={styles.drawerContent}>
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => handleNavClick(item.href)}
              className={styles.drawerNavItem}
            >
              <div className={styles.drawerNavIcon}>
                <span className={styles.drawerNavIconText}>
                  {item.label[0]}
                </span>
              </div>
              <span className={styles.drawerNavText}>
                {item.label}
              </span>
            </button>
          ))}

          <div className={styles.drawerFooter}>
            <Link href="/products" onClick={() => setDrawerVisible(false)}>
              <Button
                long
                style={{ 
                  backgroundColor: primaryColor,
                  color: 'white',
                  borderColor: primaryColor,
                  height: '3rem',
                  borderRadius: '0.75rem',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  fontWeight: 600,
                  fontSize: '1rem'
                }}
              >
                立即开始使用
              </Button>
            </Link>
            <p className={styles.drawerHint}>
              免费试用 · 无需充值
            </p>
          </div>
        </div>
      </Drawer>
    </header>
  )
}
