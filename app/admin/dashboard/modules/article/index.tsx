import { ArticlesManagement } from '../../components'
import styles from './article.module.css'

export function ArticleManager() {
  return (
    <div className={styles.articleManager}>
      <ArticlesManagement />
    </div>
  )
}
