"use client"

import { useState } from "react"
import { ManagementHeader } from "./index"
import { Tabs } from '@arco-design/web-react'
import styles from "./BaseManagement.module.css"
import { useRouter, useSearchParams } from "next/navigation"
import { MessageList } from "./messages/MessageList"
import { NotificationSettings } from "./messages/NotificationSettings"
import { PushRecords } from "./messages/PushRecords"

const TabPane = Tabs.TabPane

export function MessagesManagement() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'messages')

  // 处理 Tab 切换，同时更新 URL
  const handleTabChange = (key: string) => {
    setActiveTab(key)
    // 更新 URL，保留当前 Tab 状态
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', key)
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div className={styles.management}>
      <ManagementHeader
        title="留言管理"
        description="查看和管理用户提交的留言信息"
      />

      <Tabs activeTab={activeTab} onChange={handleTabChange} type="card">
        <TabPane key="messages" title="留言列表">
          <MessageList />
        </TabPane>
        <TabPane key="notification" title="通知管理">
          <NotificationSettings />
        </TabPane>
        <TabPane key="push-records" title="推送记录">
          <PushRecords />
        </TabPane>
      </Tabs>
    </div>
  )
}