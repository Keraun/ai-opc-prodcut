import { MenuIcon, CustomerServiceIcon } from "../icons"
import Link from "next/link"
import { Logo } from "@/components/common/logo"
import type { ModuleProps } from "@/modules/types"
import type { NavigationData } from "./types"
import styles from "./index.module.css"
// 默认配置
const defaultSiteConfig = {
  name: "AI 一人公司"
}

// 默认导航项
const defaultNavItems = [
  { label: '首页', href: '/' },
]

export function NavigationModule({ data }: ModuleProps) {
  const config: NavigationData = (data as NavigationData) || {}
  const primaryColor = "#1e40af" // 默认主色
  const accentColor = "#06b6d4" // 默认强调色

  const navItems = config?.main || defaultNavItems

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
            <Link href="/contact" className={styles.textButton}>
              <CustomerServiceIcon />
              联系我们
            </Link>
            <Link 
              href="/products" 
              className={styles.primaryButton}
              style={{ 
                backgroundColor: primaryColor,
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}
            >
              开始使用
            </Link>
          </div>

          <Link href="#" className={styles.mobileMenuButton}>
            <MenuIcon />
          </Link>
        </div>
      </div>
    </header>
  )
}
