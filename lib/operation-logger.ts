import fs from "fs"
import path from "path"

type OperationType = 'login' | 'update_config' | 'change_password' | 'reset_website'

type OperationLog = {
  id: number
  username: string
  type: OperationType
  description: string
  ip: string
  timestamp: string
  details?: any
}

export function logOperation(
  username: string,
  type: OperationType,
  description: string,
  ip: string = 'unknown',
  details?: any
) {
  try {
    const logsPath = path.join(process.cwd(), "config/json/system-operation-logs.json")
    let operationLogs: { logs: OperationLog[] } = { logs: [] }
    
    if (fs.existsSync(logsPath)) {
      operationLogs = JSON.parse(fs.readFileSync(logsPath, "utf-8"))
    }
    
    const currentTime = new Date().toLocaleString('zh-CN', { 
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    
    const logEntry: OperationLog = {
      id: Date.now(),
      username,
      type,
      description,
      ip,
      timestamp: currentTime,
      details
    }
    
    operationLogs.logs.unshift(logEntry)
    
    if (operationLogs.logs.length > 50) {
      operationLogs.logs = operationLogs.logs.slice(0, 50)
    }
    
    fs.writeFileSync(logsPath, JSON.stringify(operationLogs, null, 2))
  } catch (error) {
    console.error("Failed to log operation:", error)
  }
}