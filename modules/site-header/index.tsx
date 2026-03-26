import { MenuIcon, CustomerServiceIcon, HomeIcon, ProductsIcon, ServicesIcon, AboutIcon, ContactIcon } from "../icons"
import Link from "next/link"
import { Logo } from "@/components/common/logo"
import { Menu, Button } from "@/components/ui"
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

// 图标映射
const iconMap: Record<string, React.ReactNode> = {
  '/': <HomeIcon />,
  '/products': <ProductsIcon />,
  '/services': <ServicesIcon />,
  '/about': <AboutIcon />,
  '/contact': <ContactIcon />,
}

export function HeaderModule({ data }: ModuleProps) {
  const config: HeaderData = (data as HeaderData) || {}

  const navItems = config?.navItems || defaultNavItems

  // 转换为Menu组件需要的格式
  const menuItems = navItems.map((item) => ({
    id: item.href,
    label: item.label,
    href: item.href,
    icon: iconMap[item.href],
  }))

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
              <Menu 
                items={menuItems}
                orientation="horizontal"
                variant="underline"
                size="md"
              />
            </nav>
          )}
          
          <div className={styles.ctaSection}>
            <Link href="/contact" className={styles.textButton}>
              <CustomerServiceIcon />
              联系我们
            </Link>
            <Link href="/products">
              <Button variant="primary" size="md">
                开始使用
              </Button>
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
