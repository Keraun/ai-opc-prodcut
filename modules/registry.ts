import type { ModuleRegistration, ModuleRegistry, ModuleProps } from './types'

const moduleMap = new Map<string, ModuleRegistration>()

export const moduleRegistry: ModuleRegistry = {
  register: (module: ModuleRegistration) => {
    if (moduleMap.has(module.moduleId)) {
      console.warn(`Module with ID "${module.moduleId}" is already registered. Overwriting.`)
    }
    moduleMap.set(module.moduleId, module)
  },

  unregister: (moduleId: string) => {
    moduleMap.delete(moduleId)
  },

  getModule: (moduleId: string) => {
    return moduleMap.get(moduleId)
  },

  getAllModules: () => {
    return Array.from(moduleMap.values())
  },

  getModuleComponent: (moduleId: string) => {
    const module = moduleMap.get(moduleId)
    return module?.component || null
  }
}

export function registerModule(module: ModuleRegistration): void {
  moduleRegistry.register(module)
}

export function unregisterModule(moduleId: string): void {
  moduleRegistry.unregister(moduleId)
}

export function getModule(moduleId: string): ModuleRegistration | undefined {
  return moduleRegistry.getModule(moduleId)
}

export function getAllModules(): ModuleRegistration[] {
  return moduleRegistry.getAllModules()
}

export function getModuleComponent(moduleId: string): React.ComponentType<ModuleProps> | null {
  return moduleRegistry.getModuleComponent(moduleId)
}

export function getModuleSchema(moduleId: string): Record<string, unknown> | null {
  const module = moduleMap.get(moduleId)
  return module?.schema || null
}

export function getModuleDefaultData(moduleId: string): Record<string, unknown> | null {
  const module = moduleMap.get(moduleId)
  return module?.defaultData || null
}
