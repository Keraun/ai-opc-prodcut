import { useRouter, usePathname } from 'next/navigation'
import { Menu } from '@arco-design/web-react'
import { 
  IconDashboard, 
  IconFile, 
  IconSettings, 
  IconUser,
  IconLock
} from '@arco-design/web-react/icon'
import styles from './admin-layout.module.css'

const MenuItem = Menu.Item

export function AdminSidebar() {
  const router = useRouter()
  const pathname = usePathname()

  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <IconDashboard />,
      label: '控制台'
    },
    {
      key: '/admin/articles',
      icon: <IconFile />,
      label: '文章管理'
    },
    {
      key: '/admin/change-password',
      icon: <IconLock />,
      label: '修改密码'
    }
  ]

  const handleMenuClick = (key: string) => {
    router.push(key)
  }

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2>管理后台</h2>
      </div>
      <Menu
        selectedKeys={[pathname]}
        onClickMenuItem={handleMenuClick}
        className={styles.menu}
      >
        {menuItems.map(item => (
          <MenuItem key={item.key}>
            {item.icon}
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </div>
  )
}
