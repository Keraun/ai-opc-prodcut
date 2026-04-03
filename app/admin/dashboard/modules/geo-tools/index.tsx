"use client"

import { useState } from "react"
import { Tabs } from "@arco-design/web-react"
import { ArticleGenerator } from "./article-generator"
import { SessionManager } from "./session-manager"
import styles from "./geo-tools.module.css"

const TabPane = Tabs.TabPane

export function GeoTools() {
  const [activeTab, setActiveTab] = useState("article-generator")

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h2 className={styles.title}>GEO 工具</h2>
          <p className={styles.description}>
            针对企业的高捕获率内容创作工具集，支持文章生成和大模型 会话管理
          </p>
        </div>
      </div>

      <div className={styles.tabsContainer}>
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          type="card-gutter"
        >
          <TabPane key="article-generator" title="文章生成器">
            <div className={styles.tabContent}>
              <ArticleGenerator />
            </div>
          </TabPane>
          <TabPane key="session-manager" title="会话管理">
            <div className={styles.tabContent}>
              <SessionManager />
            </div>
          </TabPane>
        </Tabs>
      </div>
    </div>
  )
}
