import { AccountManagement } from '../../components'
import styles from './account.module.css'

export function AccountManager() {
  return (
    <div className={styles.accountManager}>
      <AccountManagement />
    </div>
  )
}
