import type { ModuleRegistration, ModuleRegistry, ModuleProps } from './types'

const moduleMap = new Map<string, ModuleRegistration>()

export const moduleRegistry: ModuleRegistry = {
  register: (module: ModuleRegistration) => {
    if (moduleMap.has(module.moduleId)) {
      return
    }
    moduleMap.set(module.moduleId, module)
    
    if (typeof window !== 'undefined') {
      (window as any).__MODULE_REGISTRY__ = Array.from(moduleMap.values())
    }
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
    if (!module || !module.component) {
      return null
    }
    return module.component
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
