import { HomeIcon, ThunderboltIcon, UserGroupIcon, PhoneIcon, GiftIcon, StarIcon } from "../icons"
import type { ModuleProps } from "@/modules/types"
import type { SidebarNavData } from "./types"
import styles from "./index.module.css"

const defaultSidebarItems = [
  { id: 'hero', label: '介绍', icon: <HomeIcon />, href: '#hero' },
  { id: 'products', label: '产品', icon: <GiftIcon />, href: '#products' },
  { id: 'services', label: '服务', icon: <ThunderboltIcon />, href: '#services' },
  { id: 'pricing', label: '价格', icon: <GiftIcon />, href: '#pricing' },
  { id: 'about', label: '关于我们', icon: <UserGroupIcon />, href: '#about' },
  { id: 'contact', label: '联系我们', icon: <PhoneIcon />, href: '#contact' },
  { id: 'partner', label: '合作伙伴', icon: <StarIcon />, href: '#partner' },
]

export function SidebarNavModule({ data }: ModuleProps) {
  const config: SidebarNavData = (data as SidebarNavData) || {}
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
              <span className={styles.navIcon}>{Icon}</span>
              <span className={styles.tooltip}>{item.label}</span>
              <span className={styles.activeIndicator} />
            </a>
          )
        })}
      </nav>
    </div>
  )
}
