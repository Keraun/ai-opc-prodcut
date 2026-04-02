"use client"

import React from 'react'
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
  rowSelection?: {
    selectedRowKeys?: (string | number)[]
    onChange?: (selectedRowKeys: (string | number)[], selectedRows: T[]) => void
    type?: 'checkbox' | 'radio'
  }
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
  rowSelection,
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
            rowSelection={rowSelection}
            className={styles.table}

          />
        )}
      </Card>
    </div>
  )
}

export const ActionButton = React.forwardRef<HTMLButtonElement, {
  children?: React.ReactNode
  type?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  onClick?: () => void
  disabled?: boolean
  icon?: React.ReactNode
  className?: string
}>(({ 
  children,
  type = 'default',
  onClick,
  disabled = false,
  icon,
  className = ''
}, ref) => {
  const typeClass = {
    default: '',
    primary: styles.actionButtonPrimary,
    success: styles.actionButtonSuccess,
    warning: styles.actionButtonWarning,
    danger: styles.actionButtonDanger,
  }[type]

  return (
    <button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      className={`${styles.actionButton} ${typeClass} ${disabled ? styles.actionButtonDisabled : ''} ${className}`}
    >
      {icon}
      {children}
    </button>
  )
})

ActionButton.displayName = 'ActionButton'
