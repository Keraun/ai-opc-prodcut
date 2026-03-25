import { DiffLine } from '../types/config'
import { getLineClass } from '@/lib/json-compare'
import styles from '../dashboard/dashboard.module.css'

interface JSONViewerProps {
  content: string
  diffLines?: DiffLine[] | null
  maxHeight?: string
}

export function JSONViewer({ 
  content, 
  diffLines = null, 
  maxHeight = '60vh' 
}: JSONViewerProps) {
  const lines = content.split('\n')

  return (
    <div className={styles.jsonViewer} style={{ maxHeight }}>
      {lines.map((line, index) => {
        const lineNumber = index + 1
        const diffLine = diffLines?.find(d => d.lineNumber === lineNumber)
        const lineClass = diffLine ? getLineClass(diffLine.type) : ''

        return (
          <div key={index} className={`${styles.jsonLine} ${lineClass}`}>
            <div className={styles.jsonLineNumber}>
              {lineNumber}
            </div>
            <div className={styles.jsonLineContent}>
              {line || ' '}
            </div>
          </div>
        )
      })}
    </div>
  )
}
