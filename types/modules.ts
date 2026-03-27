import { ReactNode } from 'react'

export interface ModuleData {
  moduleName: string
  moduleId: string
  moduleInstanceId: string
  data: Record<string, unknown>
}

export interface ModuleProps {
  moduleName: string
  moduleId: string
  moduleInstanceId: string
  data: Record<string, unknown>
}

export interface ModuleRegistration {
  moduleName: string
  moduleId: string
  component: React.ComponentType<ModuleProps>
  schema: Record<string, unknown>
  defaultData: Record<string, unknown>
}

export interface ModuleConfig {
  id: string
  name: string
  visible: boolean
  order: number
}

export interface ModuleRegistry {
  register: (module: ModuleRegistration) => void
  unregister: (moduleId: string) => void
  getModule: (moduleId: string) => ModuleRegistration | undefined
  getAllModules: () => ModuleRegistration[]
  getModuleComponent: (moduleId: string) => React.ComponentType<ModuleProps> | null
}

export type ModuleComponentProps = ModuleProps & {
  children?: ReactNode
}
