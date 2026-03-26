import fs from "fs"
import path from "path"
import { getRuntimePath } from "./config-manager"

const databaseDir = path.join(process.cwd(), "database")
const versionsDir = path.join(databaseDir, "versions")
const versionsIndexFile = path.join(versionsDir, "index.json")

interface VersionInfo {
  timestamp: string
  filename: string
  createdAt: string
}

interface VersionsIndex {
  [configType: string]: VersionInfo[]
}

const ensureVersionsDir = () => {
  if (!fs.existsSync(versionsDir)) {
    fs.mkdirSync(versionsDir, { recursive: true })
  }
}

const ensureConfigTypeDir = (configType: string) => {
  ensureVersionsDir()
  const configTypeDir = path.join(versionsDir, configType)
  if (!fs.existsSync(configTypeDir)) {
    fs.mkdirSync(configTypeDir, { recursive: true })
  }
  return configTypeDir
}

const loadVersionsIndex = (): VersionsIndex => {
  ensureVersionsDir()
  try {
    if (fs.existsSync(versionsIndexFile)) {
      const content = fs.readFileSync(versionsIndexFile, "utf-8")
      return JSON.parse(content)
    }
  } catch (error) {
    console.error("Failed to load versions index:", error)
  }
  return {}
}

const saveVersionsIndex = (index: VersionsIndex) => {
  ensureVersionsDir()
  fs.writeFileSync(versionsIndexFile, JSON.stringify(index, null, 2))
}

export const createVersion = (configType: string, data: any): VersionInfo => {
  const configTypeDir = ensureConfigTypeDir(configType)
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const filename = `${timestamp}.json`
  const versionFilePath = path.join(configTypeDir, filename)
  
  fs.writeFileSync(versionFilePath, JSON.stringify(data, null, 2))
  
  const versionInfo: VersionInfo = {
    timestamp,
    filename,
    createdAt: new Date().toISOString()
  }
  
  const index = loadVersionsIndex()
  if (!index[configType]) {
    index[configType] = []
  }
  index[configType].unshift(versionInfo)
  
  if (index[configType].length > 2) {
    const oldVersions = index[configType].splice(2)
    oldVersions.forEach(oldVersion => {
      const oldFilePath = path.join(configTypeDir, oldVersion.filename)
      try {
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath)
        }
      } catch (error) {
        console.error(`Failed to delete old version file: ${oldFilePath}`, error)
      }
    })
  }
  
  saveVersionsIndex(index)
  
  return versionInfo
}

export const getVersionHistory = (configType: string): VersionInfo[] => {
  const index = loadVersionsIndex()
  return index[configType] || []
}

export const getVersionData = (configType: string, filename: string): any => {
  const configTypeDir = path.join(versionsDir, configType)
  const versionFilePath = path.join(configTypeDir, filename)
  
  try {
    if (fs.existsSync(versionFilePath)) {
      const content = fs.readFileSync(versionFilePath, "utf-8")
      return JSON.parse(content)
    }
  } catch (error) {
    console.error(`Failed to load version data: ${versionFilePath}`, error)
  }
  
  return null
}

export const getLatestVersion = (configType: string): { info: VersionInfo | null; data: any } => {
  const history = getVersionHistory(configType)
  
  if (history.length === 0) {
    return { info: null, data: null }
  }
  
  const latestInfo = history[0]
  const data = getVersionData(configType, latestInfo.filename)
  
  return { info: latestInfo, data }
}

export const getPreviousVersion = (configType: string): { info: VersionInfo | null; data: any } => {
  const history = getVersionHistory(configType)
  
  if (history.length < 2) {
    return { info: null, data: null }
  }
  
  const previousInfo = history[1]
  const data = getVersionData(configType, previousInfo.filename)
  
  return { info: previousInfo, data }
}

export const restoreVersion = (configType: string, filename: string): boolean => {
  const data = getVersionData(configType, filename)
  
  if (!data) {
    return false
  }
  
  const runtimePath = getRuntimePath(configType)
  const runtimeDir = path.dirname(runtimePath)
  
  if (!fs.existsSync(runtimeDir)) {
    fs.mkdirSync(runtimeDir, { recursive: true })
  }
  
  try {
    fs.writeFileSync(runtimePath, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error(`Failed to restore version: ${configType}`, error)
    return false
  }
}
