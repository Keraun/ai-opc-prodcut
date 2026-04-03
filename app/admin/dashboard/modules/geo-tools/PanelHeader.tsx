import React, { ReactNode, ElementType } from 'react'
import styles from './panel-header.module.css'

interface PanelHeaderProps {
  icon: ElementType
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
      <div className={styles.actionContainer} onClick={(e) => e.stopPropagation()}>{action ? <div className={styles.actionContainer}>{action}</div> : ' '}</div>
    </div>
  )
}