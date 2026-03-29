import React from 'react'
import { Button } from '@arco-design/web-react'
import styles from './ManagementHeader.module.css'

interface ManagementHeaderProps {
  title: string
  description?: string
  buttonText?: string
  onButtonClick?: () => void
  buttonIcon?: React.ReactNode
  buttonLoading?: boolean
  buttonDisabled?: boolean
  actions?: React.ReactNode
}

export const ManagementHeader: React.FC<ManagementHeaderProps> = ({
  title,
  description,
  buttonText,
  onButtonClick,
  buttonIcon,
  buttonLoading = false,
  buttonDisabled = false,
  actions,
}) => {
  return (
    <div className={styles.managementHeader}>
      <div className={styles.headerInfo}>
        <h2 className={styles.title}>{title}</h2>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {actions ? (
        <div className={styles.actions}>{actions}</div>
      ) : buttonText && onButtonClick ? (
        <Button
          type="primary"
          icon={buttonIcon}
          onClick={onButtonClick}
          loading={buttonLoading}
          disabled={buttonDisabled}
          className={styles.actionButton}
        >
          {buttonText}
        </Button>
      ) : null}
    </div>
  )
}
