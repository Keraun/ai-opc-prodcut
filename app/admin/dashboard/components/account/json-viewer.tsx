"use client"

import { getLineClass } from "@/lib/json-compare"
import { compareJSON } from "@/lib/json-compare"
import styles from "../../dashboard.module.css"

interface JSONViewerWithLineNumbersProps {
  content: string
  diffLines?: any[] | null
  maxHeight?: string
}

export function JSONViewerWithLineNumbers({
  content,
  diffLines = null,
  maxHeight = '60vh'
}: JSONViewerWithLineNumbersProps) {
  const lines = content.split('\n')

  return (
    <div className={styles.jsonViewerContainer} style={{ maxHeight }}>
      {lines.map((line, index) => {
        const lineNumber = index + 1
        const diffLine = diffLines?.find(d => d.lineNumber === lineNumber)
        const lineClass = diffLine ? getLineClass(diffLine.type) : ''

        return (
          <div key={index} className={`${styles.jsonViewerLine} ${lineClass}`}>
            <div className={styles.jsonViewerLineNumber}>
              {lineNumber}
            </div>
            <div className={styles.jsonViewerLineContent}>
              {line || ' '}
            </div>
          </div>
        )
      })}
    </div>
  )
}

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
    <div className={styles.diffGrid}>
      <div>
        <div className={styles.diffTitle}>{oldTitle}</div>
        <div className={styles.jsonViewerContainer} style={{ maxHeight }}>
          {oldLines.map((line, index) => (
            <div key={index} className={`${styles.jsonViewerLine} ${getLineClass(line.type)}`}>
              <div className={styles.jsonViewerLineNumber}>
                {line.lineNumber}
              </div>
              <div className={styles.jsonViewerLineContent}>
                {line.content || ' '}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className={styles.diffTitle}>{newTitle}</div>
        <div className={styles.jsonViewerContainer} style={{ maxHeight }}>
          {newLines.map((line, index) => (
            <div key={index} className={`${styles.jsonViewerLine} ${getLineClass(line.type)}`}>
              <div className={styles.jsonViewerLineNumber}>
                {line.lineNumber}
              </div>
              <div className={styles.jsonViewerLineContent}>
                {line.content || ' '}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
