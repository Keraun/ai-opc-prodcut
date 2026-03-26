import { IconHome, IconThunderbolt, IconUserGroup, IconPhone, IconGift, IconStar } from "@arco-design/web-react/icon"
import type { ModuleProps } from "@/modules/types"
import type { SidebarNavData } from "./types"
import styles from "./index.module.css"

const iconMap: Record<string, any> = {
  hero: IconHome,
  partner: IconStar,
  products: IconGift,
  services: IconThunderbolt,
  pricing: IconGift,
  about: IconUserGroup,
  contact: IconPhone,
}

const labelMap: Record<string, string> = {
  hero: "介绍",
  partner: "合作伙伴",
  products: "产品",
  services: "服务",
  pricing: "价格",
  about: "关于我们",
  contact: "联系我们",
}

// 默认导航项
const defaultSidebarItems = [
  { id: 'hero', label: '介绍', icon: IconHome, href: '#hero' },
  { id: 'products', label: '产品', icon: IconGift, href: '#products' },
  { id: 'services', label: '服务', icon: IconThunderbolt, href: '#services' },
  { id: 'pricing', label: '价格', icon: IconGift, href: '#pricing' },
  { id: 'about', label: '关于我们', icon: IconUserGroup, href: '#about' },
  { id: 'contact', label: '联系我们', icon: IconPhone, href: '#contact' },
  { id: 'partner', label: '合作伙伴', icon: IconStar, href: '#partner' },
]

export function SidebarNavModule({ data }: ModuleProps) {
  const config: SidebarNavData = (data as SidebarNavData) || {}
  const primaryColor = "#1e40af" // 默认主色

  // 使用默认导航项，服务端渲染
  const sidebarItems = defaultSidebarItems

  return (
    <div className={styles.sidebar}>
      <nav className={styles.navList}>
        {sidebarItems.map((item) => {
          const Icon = item.icon

          return (
            <a
              key={item.id}
              href={item.href}
              className={styles.navItem}
              title={item.label}
            >
              <Icon className={styles.navIcon} />
              <span className={styles.tooltip}>{item.label}</span>
            </a>
          )
        })}
      </nav>
    </div>
  )
}
