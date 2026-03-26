import { Button } from "@arco-design/web-react"
import { IconMenu, IconCustomerService } from "@arco-design/web-react/icon"
import Link from "next/link"
import { Logo } from "@/components/common/logo"
import type { ModuleProps } from "@/modules/types"
import type { HeaderData } from "./types"
import styles from "./index.module.css"

// 默认配置
const defaultSiteConfig = {
  name: "AI 一人公司"
}

// 默认导航项
const defaultNavItems = [
  { label: '首页', href: '/' },
  { label: '产品', href: '/products' },
  { label: '服务', href: '/services' },
  { label: '关于我们', href: '/about' },
  { label: '联系我们', href: '/contact' },
]

export function HeaderModule({ data }: ModuleProps) {
  const config: HeaderData = (data as HeaderData) || {}
  const primaryColor = "#1e40af" // 默认主色
  const accentColor = "#06b6d4" // 默认强调色

  const navItems = config?.navItems || defaultNavItems

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.headerInner}>
          {defaultSiteConfig?.name && (
            <div className={styles.logoSection}>
              <Logo className={styles.logo} />
              <span className={styles.logoText}>{defaultSiteConfig.name}</span>
            </div>
          )}
          
          {navItems && navItems.length > 0 && (
            <nav className={styles.nav}>
              {navItems.map((item) => (
                <Link
                  key={item?.href}
                  href={item?.href}
                  className={styles.navLink}
                >
                  {item?.label}
                  <span 
                    className={styles.navUnderline}
                    style={{ backgroundColor: accentColor }}
                  />
                </Link>
              ))}
            </nav>
          )}
          
          <div className={styles.ctaSection}>
            <Link href="/contact">
              <Button
                type="text"
                style={{ color: accentColor, height: '2.5rem', borderRadius: '9999px' }}
              >
                <IconCustomerService style={{ marginRight: '0.375rem' }} />
                联系我们
              </Button>
            </Link>
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
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
              >
                开始使用
              </Button>
            </Link>
          </div>

          <Link href="#" className={styles.mobileMenuButton}>
            <IconMenu style={{ fontSize: '1.25rem', color: '#374151' }} />
          </Link>
        </div>
      </div>
    </header>
  )
}
