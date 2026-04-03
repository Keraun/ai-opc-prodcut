import React, { ReactNode } from 'react'
import { IconType } from '@arco-design/web-react/icon'
import styles from './panel-header.module.css'

interface PanelHeaderProps {
  icon: IconType
  title: string
  action?: ReactNode
}

export function PanelHeader({ icon: Icon, title, action }: PanelHeaderProps) {
  return (
    <div className={styles.collapseHeader}>
      <div className={styles.titleContainer}>
        <Icon className={styles.collapseIcon} />
        <span>{title}</span>
      </div>
      <div className={styles.actionContainer}>{action ? <div className={styles.actionContainer}>{action}</div> : ' '}</div>
    </div>
  )
}