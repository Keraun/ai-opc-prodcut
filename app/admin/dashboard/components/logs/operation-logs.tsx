"use client"

import { Card } from "@arco-design/web-react"
import styles from "../../dashboard.module.css"

interface OperationLog {
  id: string
  username: string
  type: string
  description: string
  ip: string
  timestamp: string
}

interface OperationLogsProps {
  logs: OperationLog[]
}

export function OperationLogs({ logs }: OperationLogsProps) {
  return (
    <Card title="操作记录">
      <div className={styles.logsInfo}>
        <div className={styles.logsAlert}>
          <div className={styles.logsAlertContent}>
            <div className={styles.logsAlertIcon}>
              <svg className={styles.logsAlertIconSvg} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className={styles.logsAlertText}>
              <p className={styles.logsAlertMessage}>
                系统最多保留最近50条操作记录,超出后将自动删除最早的记录。
              </p>
            </div>
          </div>
        </div>
      </div>
      {logs.length === 0 ? (
        <div className={styles.logsEmpty}>
          <div className={styles.logsEmptyIcon}>
            <svg className={styles.logsEmptyIconSvg} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className={styles.logsEmptyText}>暂无操作记录</p>
        </div>
      ) : (
        <div className={styles.logsTableContainer}>
          <table className={styles.logsTable}>
            <thead>
              <tr className={styles.logsTableHeader}>
                <th className={styles.logsTableHeaderCell}>用户名</th>
                <th className={styles.logsTableHeaderCell}>操作类型</th>
                <th className={styles.logsTableHeaderCell}>描述</th>
                <th className={styles.logsTableHeaderCell}>IP地址</th>
                <th className={styles.logsTableHeaderCell}>时间</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={log.id} className={`${styles.logsTableRow} ${index % 2 === 0 ? styles.logsTableRowEven : styles.logsTableRowOdd}`}>
                  <td className={styles.logsTableCell}>
                    <div className={styles.logsTableCellContent}>
                      <div className={styles.logsUserAvatar}>
                        {log.username.charAt(0).toUpperCase()}
                      </div>
                      <span className={styles.logsUserName}>{log.username}</span>
                    </div>
                  </td>
                  <td className={styles.logsTableCell}>
                    <span className={`${styles.logsTypeBadge} ${log.type === 'login' ? styles.logsTypeBadgeLogin :
                        log.type === 'update_config' ? styles.logsTypeBadgeUpdate :
                          log.type === 'change_password' ? styles.logsTypeBadgePassword :
                            styles.logsTypeBadgeDefault
                      }`}>
                      {log.type === 'login' ? '🔐 登录' :
                        log.type === 'update_config' ? '⚙️ 更新配置' :
                          log.type === 'change_password' ? '🔑 修改密码' :
                            log.type}
                    </span>
                  </td>
                  <td className={`${styles.logsTableCell} ${styles.logsDescription}`}>{log.description}</td>
                  <td className={styles.logsTableCell}>
                    <span className={styles.logsIpBadge}>
                      <svg className={styles.logsIpIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      {log.ip}
                    </span>
                  </td>
                  <td className={styles.logsTableCell}>
                    <span className={styles.logsTimestamp}>{log.timestamp}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
