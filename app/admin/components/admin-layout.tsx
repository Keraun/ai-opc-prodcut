"use client"

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Dropdown } from '@arco-design/web-react'
import { IconUser, IconLogout } from '@arco-design/web-react/icon'
import { AdminSidebar } from './admin-sidebar'
import styles from './admin-layout.module.css'

interface AdminLayoutProps {
  children: ReactNode
  title?: string
}

export function AdminLayout({ children, title = '管理后台' }: AdminLayoutProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const userMenu = (
    <Dropdown.Menu>
      <Dropdown.Item onClick={() => router.push('/admin/change-password')}>
        <IconLock />
        修改密码
      </Dropdown.Item>
      <Dropdown.Item onClick={handleLogout}>
        <IconLogout />
        退出登录
      </Dropdown.Item>
    </Dropdown.Menu>
  )

  return (
    <div className={styles.container}>
      <AdminSidebar />
      <div className={styles.main}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>{title}</div>
          <div className={styles.headerActions}>
            <Dropdown droplist={userMenu} position="br">
              <Button type="text" icon={<IconUser />}>
                管理员
              </Button>
            </Dropdown>
          </div>
        </div>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  )
}

import { IconLock } from '@arco-design/web-react/icon'
