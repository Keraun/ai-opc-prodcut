import { MenuIcon, CustomerServiceIcon, HomeIcon, ProductsIcon, ServicesIcon, AboutIcon, ContactIcon } from "../icons"
import Link from "next/link"
import { Logo } from "@/components/common/logo"
import { Menu } from "@/components/ui"
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
  { label: '产品', href: '/products' },
  { label: '服务', href: '/services' },
  { label: '关于', href: '/about' },
  { label: '联系', href: '/contact' },
]

// 图标映射
const iconMap: Record<string, React.ReactNode> = {
  '/': <HomeIcon />,
  '/products': <ProductsIcon />,
  '/services': <ServicesIcon />,
  '/about': <AboutIcon />,
  '/contact': <ContactIcon />,
}

export function NavigationModule({ data }: ModuleProps) {
  const config: NavigationData = (data as NavigationData) || {}
  const primaryColor = "#1e40af" // 默认主色
  const accentColor = "#06b6d4" // 默认强调色

  const navItems = config?.main || defaultNavItems

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
            <Link href="/contact" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors">
              <CustomerServiceIcon />
              联系我们
            </Link>
            <Link 
              href="/products" 
              className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
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
