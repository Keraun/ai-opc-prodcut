import { useState } from 'react'
import { PageManagement, PageEditor } from '../../components'
import styles from './page.module.css'

export function PageManager() {
  const [editingPageId, setEditingPageId] = useState<string | null>(null)

  if (editingPageId) {
    return (
      <div className={styles.pageManager}>
        <PageEditor
          pageId={editingPageId}
          onBack={() => setEditingPageId(null)}
        />
      </div>
    )
  }

  return (
    <div className={styles.pageManager}>
      <PageManagement
        onEditPage={(pageId) => setEditingPageId(pageId)}
      />
    </div>
  )
}
