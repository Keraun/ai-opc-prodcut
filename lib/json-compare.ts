interface DiffLine {
  lineNumber: number
  content: string
  type: 'unchanged' | 'added' | 'removed' | 'modified'
  oldValue?: string
  newValue?: string
}

export const compareJSON = (oldObj: any, newObj: any): {
  oldLines: DiffLine[]
  newLines: DiffLine[]
} => {
  const oldStr = JSON.stringify(oldObj, null, 2)
  const newStr = JSON.stringify(newObj, null, 2)
  
  const oldLinesArray = oldStr.split('\n')
  const newLinesArray = newStr.split('\n')
  
  const oldLines: DiffLine[] = []
  const newLines: DiffLine[] = []
  
  const maxLines = Math.max(oldLinesArray.length, newLinesArray.length)
  
  for (let i = 0; i < maxLines; i++) {
    const oldLine = oldLinesArray[i] || ''
    const newLine = newLinesArray[i] || ''
    
    if (oldLine === newLine) {
      oldLines.push({
        lineNumber: i + 1,
        content: oldLine,
        type: 'unchanged'
      })
      newLines.push({
        lineNumber: i + 1,
        content: newLine,
        type: 'unchanged'
      })
    } else {
      if (oldLine && !newLine) {
        oldLines.push({
          lineNumber: i + 1,
          content: oldLine,
          type: 'removed'
        })
      } else if (!oldLine && newLine) {
        newLines.push({
          lineNumber: i + 1,
          content: newLine,
          type: 'added'
        })
      } else {
        oldLines.push({
          lineNumber: i + 1,
          content: oldLine,
          type: 'removed',
          oldValue: oldLine,
          newValue: newLine
        })
        newLines.push({
          lineNumber: i + 1,
          content: newLine,
          type: 'added',
          oldValue: oldLine,
          newValue: newLine
        })
      }
    }
  }
  
  return { oldLines, newLines }
}

export const getLineClass = (type: 'unchanged' | 'added' | 'removed' | 'modified'): string => {
  switch (type) {
    case 'added':
      return 'bg-green-50 border-l-4 border-green-500'
    case 'removed':
      return 'bg-red-50 border-l-4 border-red-500'
    case 'modified':
      return 'bg-yellow-50 border-l-4 border-yellow-500'
    default:
      return ''
  }
}

export const hasChanges = (oldObj: any, newObj: any): boolean => {
  return JSON.stringify(oldObj) !== JSON.stringify(newObj)
}
