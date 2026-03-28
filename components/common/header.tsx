"use client"

import { useState, useEffect } from "react"
import { Button, Drawer, Dropdown, Menu } from "@arco-design/web-react"
import { IconMenu, IconCustomerService } from "@arco-design/web-react/icon"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/common/logo"
import { useConfig } from "@/components/initial-data-provider"
import { useTheme } from "@/components/theme-provider"
import styles from "./header.module.css"

interface HeaderProps {
  navItems?: Array<{ id: string; label: string; href: string }>
  showContactButton?: boolean
  showCtaButton?: boolean
  ctaButtonText?: string
  ctaButtonLink?: string
  config?: {
    logo?: {
      text?: string
    }
    contact?: {
      text?: string
      qrText?: string
      hintText?: string
    }
    cta?: {
      text?: string
      link?: string
      drawerText?: string
      drawerHint?: string
    }
  }
}

export function Header({
  navItems: propNavItems,
  showContactButton,
  showCtaButton,
  ctaButtonText,
  ctaButtonLink,
  config: propConfig
}: HeaderProps) {
  const router = useRouter()
  const { themeConfig } = useTheme()
  const siteConfig = useConfig('site')
  const headerConfig = useConfig('site-header')

  const config = propConfig || headerConfig || {}
  const [isScrolled, setIsScrolled] = useState(false)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const navItems = propNavItems || (config?.navItems?.map((item: any) => ({
    id: item.href,
    label: item.label,
    href: item.href
  })) || [])

  const primaryColor = themeConfig?.colors?.primary
  const secondaryColor = themeConfig?.colors?.secondary
  const accentColor = themeConfig?.colors?.accent

  const logoText = siteConfig?.name || config?.logo?.text || ""
  const contactText = config?.contact?.text || "联系我们"
  const qrText = config?.contact?.qrText || "客服二维码"
  const hintText = config?.contact?.hintText || "扫码联系客服"
  const ctaText = ctaButtonText || config?.cta?.text || "开始使用"
  const ctaLink = ctaButtonLink || config?.cta?.link || "/product"
  const drawerCtaText = config?.cta?.drawerText || "开始使用"
  const drawerHintText = config?.cta?.drawerHint || "免费试用 · 无需充值"
  const showContact = showContactButton !== undefined ? showContactButton : true
  const showCta = showCtaButton !== undefined ? showCtaButton : true

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
          <div className={styles.logoSection}>
            <Logo className={styles.logo} />
            {logoText && <span className={styles.logoText}>{logoText}</span>}
          </div>
          {navItems && navItems.length > 0 && (
            <nav className={styles.nav}>
              {navItems.map((item: any) => (
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
            {showContact && (
              <Dropdown
                droplist={
                  <div className={styles.dropdownContent}>
                    <div className={styles.dropdownQrContainer}>
                      <div className={styles.dropdownQrInner}>
                        <div className={styles.dropdownQrPlaceholder}>
                          <span className={styles.dropdownQrText}>{qrText}</span>
                        </div>
                      </div>
                    </div>
                    <p className={styles.dropdownHint}>{hintText}</p>
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
                  {contactText}
                </Button>
              </Dropdown>
            )}
            {showCta && (
              <Link href={ctaLink}>
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
                  {ctaText}
                </Button>
              </Link>
            )}
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

        visible={drawerVisible}
        placement="right"
        closable
        onCancel={() => setDrawerVisible(false)}
        footer={null}
      >
        <div className={styles.drawerContent}>
          {navItems.map((item: any) => (
            <button
              key={item.href}
              onClick={() => handleNavClick(item.href)}
              className={styles.drawerNavItem}
              style={{
                '--primary-color': primaryColor,
                '--accent-color': accentColor
              } as React.CSSProperties}
            >
              <div
                className={styles.drawerNavIcon}
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}15 0%, ${primaryColor}30 100%)`
                }}
              >
                <span
                  className={styles.drawerNavIconText}
                  style={{ color: primaryColor }}
                >
                  {item.label[0]}
                </span>
              </div>
              <span className={styles.drawerNavText}>
                {item.label}
              </span>
            </button>
          ))}

          <div className={styles.drawerFooter}>
            <Link href={ctaLink} onClick={() => setDrawerVisible(false)}>
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
                {drawerCtaText}
              </Button>
            </Link>
            <p className={styles.drawerHint}>
              {drawerHintText}
            </p>
          </div>
        </div>
      </Drawer>
    </header>
  )
}
