import { HomeIcon, ProductsIcon, ServicesIcon, AboutIcon, ContactIcon } from "../icons"
import type { ModuleProps } from "@/modules/types"
import { Header } from "@/components/common/header"
import type { HeaderData } from "./types"

// 默认导航项
const defaultNavItems = [
  { label: '首页', href: '/' },
  { label: '产品', href: '/products' },
]

export function HeaderModule({ data }: ModuleProps) {
  const config: HeaderData = (data as HeaderData) || {}

  const navItems = config?.navItems || defaultNavItems

  // 转换为Menu组件需要的格式
  const menuItems = navItems.map((item) => ({
    id: item.href,
    label: item.label,
    href: item.href,
  }))

  return (
    <Header 
      navItems={menuItems}
      showContactButton={config?.showContactButton}
      showCtaButton={config?.showCtaButton}
      ctaButtonText={config?.ctaButtonText}
      ctaButtonLink={config?.ctaButtonLink}
    />
  )
}
