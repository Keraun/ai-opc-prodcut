"use client"

import { Button, Card, Divider, Typography, Space, Statistic } from "@arco-design/web-react"
import { IconExport, IconSettings, IconStorage, IconExclamationCircle, IconUser, IconDesktop, IconLock } from "@arco-design/web-react/icon"
import { AccountInfo } from "../account/account-info"
import styles from "../../dashboard.module.css"

interface SystemManagementProps {
  siteConfig: any
  onExportConfig: () => void
  onImportConfig: (e: React.ChangeEvent<HTMLInputElement>) => void
  onResetWebsite: () => void
  currentUser: any
  onChangePassword: () => void
}

export function SystemManagement({
  siteConfig,
  onExportConfig,
  onImportConfig,
  onResetWebsite,
  currentUser,
  onChangePassword
}: SystemManagementProps) {
  return (
    <div className={styles.systemManagement}>
      <div className={styles.systemManagementGrid}>
        {/* 账户信息卡片 */}
        <Card 
          className={styles.systemCard}
          title={
            <div className={styles.sectionTitleContainer}>
              <IconUser className={styles.sectionTitleIcon} />
              <span className={styles.sectionTitle}>账户信息</span>
            </div>
          }
          bordered={false}
          hoverable
        >
          <AccountInfo 
            currentUser={currentUser} 
            onChangePassword={onChangePassword} 
          />
        </Card>

        {/* 系统概览卡片 */}
        <Card 
          className={styles.systemCard}
          title={
            <div className={styles.sectionTitleContainer}>
              <IconDesktop className={styles.sectionTitleIcon} />
              <span className={styles.sectionTitle}>系统概览</span>
            </div>
          }
          bordered={false}
          hoverable
        >
          <div className={styles.systemOverview}>
            <Space size={40} wrap>
              <Statistic 
                title="站点名称" 
                value={siteConfig?.name || '未设置'}
              />
              <Statistic 
                title="管理员" 
                value={currentUser?.username || '未知'}
              />
              <Statistic 
                title="系统版本" 
                value="1.0.0"
              />
            </Space>
          </div>
        </Card>

        {/* 配置管理卡片 */}
        <Card 
          className={styles.systemCard}
          title={
            <div className={styles.sectionTitleContainer}>
              <IconStorage className={styles.sectionTitleIcon} />
              <span className={styles.sectionTitle}>配置管理</span>
            </div>
          }
          bordered={false}
          hoverable
        >
          <div className={styles.configSection}>
            <Typography.Paragraph className={styles.configSectionDescription}>
              通过以下功能可以导出或导入配置,用于备份和恢复系统配置。
            </Typography.Paragraph>
            <div className={styles.configSectionActions}>
              <Button
                type="primary"
                icon={<IconExport />}
                onClick={onExportConfig}
                style={{ marginRight: '12px' }}
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
              <Button
                type="secondary"
                icon={<IconExport />}
                onClick={() => document.getElementById('config-import')?.click()}
              >
                导入配置
              </Button>
            </div>
          </div>
        </Card>

        {/* 安全设置卡片 */}
        <Card 
          className={styles.systemCard}
          title={
            <div className={styles.sectionTitleContainer}>
              <IconLock className={styles.sectionTitleIcon} />
              <span className={styles.sectionTitle}>安全设置</span>
            </div>
          }
          bordered={false}
          hoverable
        >
          <div className={styles.securitySection}>
            <Button
              type="primary"
              onClick={onChangePassword}
            >
              修改密码
            </Button>
          </div>
        </Card>

        {/* 危险操作卡片 */}
        <Card 
          className={styles.systemCard}
          title={
          <div className={styles.sectionTitleContainer}>
            <IconExclamationCircle className={styles.sectionTitleIcon} />
            <span className={styles.sectionTitle}>危险操作</span>
          </div>
        }
          bordered={false}
          hoverable
        >
          <div className={styles.dangerSection}>
            <div className={styles.dangerSectionAlert}>
              <Typography.Paragraph type="warning">
                以下操作具有不可逆性,请谨慎操作!
              </Typography.Paragraph>
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
        </Card>
      </div>
    </div>
  )
}
