import { DiffLine } from '../types/config'
import { compareJSON, getLineClass } from '@/lib/json-compare'
import styles from '../dashboard/dashboard.module.css'

interface JSONDiffViewerProps {
  oldContent: string
  newContent: string
  oldTitle?: string
  newTitle?: string
  maxHeight?: string
}

export function JSONDiffViewer({
  oldContent,
  newContent,
  oldTitle = '旧版本',
  newTitle = '新版本',
  maxHeight = '60vh'
}: JSONDiffViewerProps) {
  const oldObj = JSON.parse(oldContent)
  const newObj = JSON.parse(newContent)
  const { oldLines, newLines } = compareJSON(oldObj, newObj)

  return (
    <div className={styles.diffContainer}>
      <div>
        <div className={styles.diffTitle}>{oldTitle}</div>
        <div className={styles.jsonViewer} style={{ maxHeight }}>
          {oldLines.map((line: DiffLine, index: number) => (
            <div key={index} className={`${styles.jsonLine} ${getLineClass(line.type)}`}>
              <div className={styles.jsonLineNumber}>
                {line.lineNumber}
              </div>
              <div className={styles.jsonLineContent}>
                {line.content || ' '}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className={styles.diffTitle}>{newTitle}</div>
        <div className={styles.jsonViewer} style={{ maxHeight }}>
          {newLines.map((line: DiffLine, index: number) => (
            <div key={index} className={`${styles.jsonLine} ${getLineClass(line.type)}`}>
              <div className={styles.jsonLineNumber}>
                {line.lineNumber}
              </div>
              <div className={styles.jsonLineContent}>
                {line.content || ' '}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
