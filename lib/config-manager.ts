import fs from "fs"
import path from "path"

const CONFIG_DIR = path.join(process.cwd(), "config", "json")
const TEMPLATES_DIR = path.join(CONFIG_DIR, "templates")
const RUNTIME_DIR = path.join(CONFIG_DIR, "runtime")
const VERSIONS_DIR = path.join(CONFIG_DIR, "versions")

export function getConfigPath(configType: string): string {
  const runtimePath = path.join(RUNTIME_DIR, `${configType}.json`)
  const templatePath = path.join(TEMPLATES_DIR, `${configType}.json`)

  if (fs.existsSync(runtimePath)) {
    return runtimePath
  }
  return templatePath
}

export function getTemplatePath(configType: string): string {
  return path.join(TEMPLATES_DIR, `${configType}.json`)
}

export function getRuntimePath(configType: string): string {
  return path.join(RUNTIME_DIR, `${configType}.json`)
}

export function readConfig(configType: string): any {
  const runtimePath = getRuntimePath(configType)
  const templatePath = getTemplatePath(configType)
  
  // 如果runtime配置存在，直接读取
  if (fs.existsSync(runtimePath)) {
    return JSON.parse(fs.readFileSync(runtimePath, "utf-8"))
  }
  
  // 如果runtime配置不存在但template存在，复制到runtime再读取
  if (fs.existsSync(templatePath)) {
    const templateData = JSON.parse(fs.readFileSync(templatePath, "utf-8"))
    
    // 确保runtime目录存在
    if (!fs.existsSync(RUNTIME_DIR)) {
      fs.mkdirSync(RUNTIME_DIR, { recursive: true })
    }
    
    // 复制template到runtime
    fs.writeFileSync(runtimePath, JSON.stringify(templateData, null, 2), "utf-8")
    
    return templateData
  }
  
  // 都不存在时返回空对象
  return {}
}

export function writeConfig(configType: string, data: any): void {
  if (!fs.existsSync(RUNTIME_DIR)) {
    fs.mkdirSync(RUNTIME_DIR, { recursive: true })
  }
  
  const runtimePath = getRuntimePath(configType)
  fs.writeFileSync(runtimePath, JSON.stringify(data, null, 2), "utf-8")
}

export function readTemplate(configType: string): any {
  const templatePath = getTemplatePath(configType)
  
  if (!fs.existsSync(templatePath)) {
    return {}
  }
  
  return JSON.parse(fs.readFileSync(templatePath, "utf-8"))
}

export function readAllConfigs(): Record<string, any> {
  const configs: Record<string, any> = {}
  
  if (fs.existsSync(TEMPLATES_DIR)) {
    const templateFiles = fs.readdirSync(TEMPLATES_DIR).filter(file => file.endsWith('.json'))
    
    for (const file of templateFiles) {
      const configType = file.replace('.json', '')
      configs[configType] = readConfig(configType)
    }
  }
  
  return configs
}

export function resetToTemplate(configType: string): void {
  const templateData = readTemplate(configType)
  writeConfig(configType, templateData)
}

export function resetAllToTemplates(): void {
  const configs = readAllConfigs()
  
  for (const configType of Object.keys(configs)) {
    resetToTemplate(configType)
  }
}