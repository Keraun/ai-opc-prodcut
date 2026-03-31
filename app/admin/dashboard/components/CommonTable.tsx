"use client"

import { Card, Table, Spin, Empty } from "@arco-design/web-react"
import type { TableColumnProps } from "@arco-design/web-react"
import styles from "./CommonTable.module.css"

export interface CommonTableProps<T = any> {
  columns: TableColumnProps[]
  data: T[]
  loading?: boolean
  rowKey?: string
  scroll?: { x?: number | string; y?: number | string }
  pagination?: any
  emptyText?: string
  emptyIcon?: React.ReactNode
  className?: string
  bordered?: boolean
  stripe?: boolean
}

export function CommonTable<T extends Record<string, any> = any>({
  columns,
  data,
  loading = false,
  rowKey = "id",
  scroll,
  pagination,
  emptyText = "暂无数据",
  emptyIcon,
  className = "",
  bordered = false,
  stripe = false,
}: CommonTableProps<T>) {
  return (
    <div className={`${styles.tableContainer} ${className}`}>
      <Card className={styles.tableCard} bordered={false}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <Spin size={40} />
            <p className={styles.loadingText}>加载中...</p>
          </div>
        ) : (
          <Table
            columns={columns}
            data={data}
            rowKey={rowKey}
            scroll={scroll}
            pagination={pagination}
            border={bordered}
            stripe={stripe}
            className={styles.table}
            locale={{
              emptyText: (
                <div className={styles.emptyContainer}>
                  {emptyIcon && <div className={styles.emptyIcon}>{emptyIcon}</div>}
                  <p className={styles.emptyText}>{emptyText}</p>
                </div>
              )
            }}
          />
        )}
      </Card>
    </div>
  )
}

export function ActionButton({ 
  children,
  type = 'default',
  onClick,
  disabled = false,
  icon,
  className = ''
}: { 
  children?: React.ReactNode
  type?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  onClick?: () => void
  disabled?: boolean
  icon?: React.ReactNode
  className?: string
}) {
  const typeClass = {
    default: '',
    primary: styles.actionButtonPrimary,
    success: styles.actionButtonSuccess,
    warning: styles.actionButtonWarning,
    danger: styles.actionButtonDanger,
  }[type]

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${styles.actionButton} ${typeClass} ${disabled ? styles.actionButtonDisabled : ''} ${className}`}
    >
      {icon}
      {children}
    </button>
  )
}
