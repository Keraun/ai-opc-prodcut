"use client"

import { useState } from "react"
import { Button, Card, Typography, Space, Statistic, Tag, Avatar, Divider, Badge, Tooltip, Modal, Input, Message } from "@arco-design/web-react"
import { 
  IconExport, 
  IconDownload, 
  IconExclamationCircle, 
  IconUser, 
  IconDesktop, 
  IconLock, 
  IconSettings,
  IconSync,
  IconCheckCircle,
  IconCloseCircle,
  IconInfoCircle,
  IconSafe,
  IconFile,
  IconEye,
  IconCopy
} from "@arco-design/web-react/icon"
import { getSuperAdminToken } from "@/lib/api-client"
import { ManagementHeader } from "../ManagementHeader"
import styles from "../../dashboard.module.css"

interface SystemManagementProps {
  siteConfig: any
  onExportConfig: () => void
  onImportConfig: (e: React.ChangeEvent<HTMLInputElement>) => void
  onResetWebsite: () => void
  currentUser: any
  onChangePassword: () => void
  systemInfo?: any
  onRestartSystem?: () => void
  restarting?: boolean
}

export function SystemManagement({
  siteConfig,
  onExportConfig,
  onImportConfig,
  onResetWebsite,
  currentUser,
  onChangePassword,
  systemInfo,
  onRestartSystem,
  restarting
}: SystemManagementProps) {
  const [showSuperAdminTokenModal, setShowSuperAdminTokenModal] = useState(false)
  const [superAdminPassword, setSuperAdminPassword] = useState("")
  const [superAdminToken, setSuperAdminToken] = useState("")
  const [loadingToken, setLoadingToken] = useState(false)
  const [passwordError, setPasswordError] = useState("")

  function formatUptime(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    return `${hours}h ${minutes}m ${secs}s`
  }
  return (
    <div className={styles.systemManagementNew}>
      <ManagementHeader
        title="系统管理"
        description="管理系统配置、账户安全和数据备份"
      />

      {/* 主要内容区域 */}
      <div className={styles.systemContent}>
        {/* 左侧：账户和系统信息 */}
        <div className={styles.systemLeftColumn}>
          {/* 账户信息卡片 */}
          <Card 
            className={styles.systemCardNew}
            bordered={false}
          >
            <div className={styles.accountCardHeader}>
              <div className={styles.accountCardAvatar}>
                <Avatar size={64} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <IconUser style={{ fontSize: 32 }} />
                </Avatar>
                <div className={styles.accountCardStatus}>
                  <Badge status="success" />
                </div>
              </div>
              <div className={styles.accountCardInfo}>
                <h3 className={styles.accountCardName}>{currentUser?.username || 'Admin'}</h3>
                <Tag color="arcoblue" size="small">管理员</Tag>
              </div>
            </div>
            
            <Divider style={{ margin: '20px 0' }} />
            
            <div className={styles.accountCardDetails}>
              <div className={styles.accountDetailItem}>
                <span className={styles.accountDetailLabel}>账户状态</span>
                <span className={styles.accountDetailValue}>
                  <Tag color="green" icon={<IconCheckCircle />}>正常</Tag>
                </span>
              </div>
              <div className={styles.accountDetailItem}>
                <span className={styles.accountDetailLabel}>安全设置</span>
                <span className={styles.accountDetailValue}>
                  <Tag color="arcoblue" icon={<IconSafe />}>已设置密码</Tag>
                </span>
              </div>
            </div>

            <div className={styles.accountCardActions} style={{ display: 'flex', gap: 8 }}>
              <Button type="primary" onClick={onChangePassword} icon={<IconLock />} style={{ flex: 1 }}>
                修改密码
              </Button>
              <Button 
                type="secondary" 
                onClick={() => {
                  setShowSuperAdminTokenModal(true)
                  setSuperAdminPassword("")
                  setSuperAdminToken("")
                  setPasswordError("")
                }} 
                icon={<IconEye />}
                style={{ flex: 1 }}
              >
                查看口令
              </Button>
            </div>
          </Card>

          {/* 系统概览卡片 */}
          <Card 
            className={styles.systemCardNew}
            bordered={false}
          >
            <div className={styles.overviewCardHeader}>
              <IconDesktop className={styles.overviewCardIcon} />
              <span className={styles.overviewCardTitle}>系统概览</span>
            </div>
            
            <div className={styles.overviewStats}>
              <div className={styles.overviewStatItem}>
                <span className={styles.overviewStatLabel}>站点名称</span>
                <span className={styles.overviewStatValue}>{siteConfig?.name || ''}</span>
              </div>
              <div className={styles.overviewStatItem}>
                <span className={styles.overviewStatLabel}>系统版本</span>
                <Tag color="arcoblue" size="small">v1.0.0</Tag>
              </div>
              <div className={styles.overviewStatItem}>
                <span className={styles.overviewStatLabel}>运行状态</span>
                <Badge status="success" text="运行正常" />
              </div>
              {systemInfo && (
                <>
                  <div className={styles.overviewStatItem}>
                    <span className={styles.overviewStatLabel}>运行端口</span>
                    <Tag color="green" size="small">{systemInfo.port}</Tag>
                  </div>
                  <div className={styles.overviewStatItem}>
                    <span className={styles.overviewStatLabel}>IP 地址</span>
                    <span className={styles.overviewStatValue}>{systemInfo.ipAddress}</span>
                  </div>
                  <div className={styles.overviewStatItem}>
                    <span className={styles.overviewStatLabel}>运行环境</span>
                    <Tag color={systemInfo.environment === 'production' ? 'red' : 'arcoblue'} size="small">
                      {systemInfo.environment === 'production' ? '生产环境' : '开发环境'}
                    </Tag>
                  </div>
                  <div className={styles.overviewStatItem}>
                    <span className={styles.overviewStatLabel}>主机名</span>
                    <span className={styles.overviewStatValue}>{systemInfo.hostname}</span>
                  </div>
                  <div className={styles.overviewStatItem}>
                    <span className={styles.overviewStatLabel}>Node 版本</span>
                    <span className={styles.overviewStatValue}>{systemInfo.nodeVersion}</span>
                  </div>
                  <div className={styles.overviewStatItem}>
                    <span className={styles.overviewStatLabel}>运行时间</span>
                    <span className={styles.overviewStatValue}>{formatUptime(systemInfo.uptime)}</span>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* 右侧：配置管理和操作 */}
        <div className={styles.systemRightColumn}>
          {/* 配置管理卡片 */}
          <Card 
            className={styles.systemCardNew}
            bordered={false}
          >
            <div className={styles.configCardHeader}>
              <div className={styles.configCardIconWrapper}>
                <IconFile className={styles.configCardIcon} />
              </div>
              <div className={styles.configCardHeaderText}>
                <h3 className={styles.configCardTitle}>配置管理</h3>
                <p className={styles.configCardSubtitle}>导出或导入系统配置，用于备份和恢复</p>
              </div>
            </div>

            <Divider style={{ margin: '20px 0' }} />

            <div className={styles.configCardActions}>
              <div className={styles.configActionItem}>
                <div className={styles.configActionInfo}>
                  <h4 className={styles.configActionTitle}>导出数据库</h4>
                  <p className={styles.configActionDesc}>将所有系统配置数据导出为ZIP文件，用于备份</p>
                </div>
                <Button 
                  type="primary" 
                  icon={<IconExport />}
                  onClick={onExportConfig}
                >
                  导出
                </Button>
              </div>

              <Divider style={{ margin: '16px 0' }} />

              <div className={styles.configActionItem}>
                <div className={styles.configActionInfo}>
                  <h4 className={styles.configActionTitle}>导入数据库</h4>
                  <p className={styles.configActionDesc}>从ZIP文件导入系统配置，恢复系统状态</p>
                </div>
                <input
                  type="file"
                  accept=".zip"
                  onChange={onImportConfig}
                  className={styles.importInput}
                  id="config-import"
                />
                <Button 
                  type="secondary" 
                  icon={<IconDownload />}
                  onClick={() => document.getElementById('config-import')?.click()}
                >
                  导入
                </Button>
              </div>
            </div>
          </Card>

          {/* 危险操作卡片 */}
          <Card 
            className={`${styles.systemCardNew} ${styles.dangerCard}`}
            bordered={false}
          >
            <div className={styles.dangerCardHeader}>
              <div className={styles.dangerCardIconWrapper}>
                <IconExclamationCircle className={styles.dangerCardIcon} />
              </div>
              <div className={styles.dangerCardHeaderText}>
                <h3 className={styles.dangerCardTitle}>危险操作</h3>
                <p className={styles.dangerCardSubtitle}>以下操作不可逆，请谨慎操作</p>
              </div>
            </div>

            <Divider style={{ margin: '20px 0' }} />

            <div className={styles.dangerCardContent}>
              <div className={styles.dangerAlert}>
                <IconInfoCircle className={styles.dangerAlertIcon} />
                <span className={styles.dangerAlertText}>
                  以下操作不可逆，请谨慎操作
                </span>
              </div>

              {onRestartSystem && (
                <div className={styles.dangerAction}>
                  <div className={styles.dangerActionInfo}>
                    <h4 className={styles.dangerActionTitle}>重启服务</h4>
                    <p className={styles.dangerActionDesc}>终止占用端口的进程并重新启动服务</p>
                  </div>
                  <Tooltip content="重启服务">
                    <Button 
                      type="primary" 
                      status="warning"
                      icon={<IconSync />}
                      onClick={onRestartSystem}
                      loading={restarting}
                    >
                      重启服务
                    </Button>
                  </Tooltip>
                </div>
              )}

              <Divider style={{ margin: '16px 0' }} />

              <div className={styles.dangerAction}>
                <div className={styles.dangerActionInfo}>
                  <h4 className={styles.dangerActionTitle}>一键还原网站配置</h4>
                  <p className={styles.dangerActionDesc}>将所有配置还原到出厂状态</p>
                </div>
                <Tooltip content="请先导出配置备份">
                  <Button 
                    type="primary" 
                    status="danger"
                    icon={<IconSync />}
                    onClick={onResetWebsite}
                  >
                    还原配置
                  </Button>
                </Tooltip>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 查看超级管理员口令弹窗 */}
      <Modal
        title="查看超级管理员口令"
        visible={showSuperAdminTokenModal}
        onCancel={() => {
          setShowSuperAdminTokenModal(false)
          setSuperAdminPassword("")
          setSuperAdminToken("")
          setPasswordError("")
        }}
        footer={
          superAdminToken ? (
            <Button onClick={() => setShowSuperAdminTokenModal(false)}>
              关闭
            </Button>
          ) : (
            <>
              <Button 
                onClick={() => {
                  setShowSuperAdminTokenModal(false)
                  setSuperAdminPassword("")
                  setPasswordError("")
                }}
              >
                取消
              </Button>
              <Button
                type="primary"
                loading={loadingToken}
                onClick={async () => {
                  if (!superAdminPassword) {
                    setPasswordError("请输入当前账户密码")
                    return
                  }
                  setLoadingToken(true)
                  setPasswordError("")
                  try {
                    const result = await getSuperAdminToken(superAdminPassword)
                    if (result.success && result.token) {
                      setSuperAdminToken(result.token)
                    } else {
                      setPasswordError(result.message || "密码错误")
                    }
                  } catch (error) {
                    setPasswordError("获取口令失败")
                  } finally {
                    setLoadingToken(false)
                  }
                }}
              >
                确认
              </Button>
            </>
          )
        }
      >
        {superAdminToken ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ 
              background: '#f5f5f5', 
              padding: '16px', 
              borderRadius: '8px',
              marginBottom: '16px',
              fontFamily: 'monospace',
              fontSize: '14px',
              wordBreak: 'break-all'
            }}>
              {superAdminToken}
            </div>
            <Button 
              type="primary" 
              icon={<IconCopy />}
              onClick={() => {
                navigator.clipboard.writeText(superAdminToken)
                Message.success('口令已复制到剪贴板')
              }}
            >
              复制口令
            </Button>
          </div>
        ) : (
          <div style={{ padding: '20px 0' }}>
            <Typography.Paragraph style={{ marginBottom: '16px' }}>
              请输入当前账户密码以查看超级管理员口令
            </Typography.Paragraph>
            <Input.Password
              placeholder="请输入当前账户密码"
              value={superAdminPassword}
              onChange={(value) => {
                setSuperAdminPassword(value)
                setPasswordError("")
              }}
              error={!!passwordError}
            />
            {passwordError && (
              <Typography.Text type="error" style={{ display: 'block', marginTop: '8px' }}>
                {passwordError}
              </Typography.Text>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
