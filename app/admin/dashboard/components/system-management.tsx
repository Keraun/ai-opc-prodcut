"use client"

import { Button, Card, Switch } from "@arco-design/web-react"
import { IconExport, IconSettings } from "@arco-design/web-react/icon"
import styles from "../dashboard.module.css"

interface SystemManagementProps {
  siteConfig: any
  onExportConfig: () => void
  onImportConfig: (e: React.ChangeEvent<HTMLInputElement>) => void
  onResetWebsite: () => void
  onUpdateCache: (enabled: boolean) => void
}

export function SystemManagement({
  siteConfig,
  onExportConfig,
  onImportConfig,
  onResetWebsite,
  onUpdateCache
}: SystemManagementProps) {
  return (
    <div className={styles.systemManagement}>
      <Card
        title={
          <div className={styles.sectionTitleContainer}>
            <IconSettings className={styles.sectionTitleIcon} />
            <span className={styles.sectionTitle}>系统管理</span>
          </div>
        }
      >
        <div className={styles.spaceY6}>
          <div className={styles.performanceSection}>
            <h3 className={styles.sectionTitle}>性能配置</h3>
            <div className={styles.spaceY4}>
              <div className={styles.performanceItem}>
                <div className={styles.performanceItemLeft}>
                  <h4 className={styles.performanceItemTitle}>配置缓存</h4>
                  <p className={styles.performanceItemDescription}>启用配置缓存可以提高系统性能,但可能导致配置更新延迟</p>
                </div>
                <Switch
                  checked={siteConfig?.cache?.enabled ?? true}
                  onChange={onUpdateCache}
                />
              </div>
            </div>
          </div>

          <div className={styles.configSection}>
            <h3 className={styles.sectionTitle}>配置管理</h3>
            <div className={styles.spaceY4}>
              <p className={styles.configSectionDescription}>通过以下功能可以导出或导入配置,用于备份和恢复系统配置。</p>
              <div className={styles.configSectionActions}>
                <Button
                  type="primary"
                  icon={<IconExport />}
                  onClick={onExportConfig}
                >
                  导出配置
                </Button>
                <input
                  type="file"
                  accept=".zip"
                  onChange={onImportConfig}
                  className={styles.importInput}
                  id="config-import"
                />
                <label htmlFor="config-import" className={styles.importLabel}>
                  <IconExport className={styles.importLabelIcon} />
                  导入配置
                </label>
              </div>
            </div>
          </div>

          <div className={styles.dangerSection}>
            <h3 className={styles.dangerSectionTitle}>危险操作</h3>
            <div className={styles.dangerSectionAlert}>
              <p>以下操作具有不可逆性,请谨慎操作!</p>
            </div>
            <div className={styles.dangerSectionActions}>
              <Button
                type="primary"
                status="danger"
                onClick={onResetWebsite}
              >
                一键还原网站配置
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
