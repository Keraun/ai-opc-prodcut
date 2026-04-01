import type { ModuleRegistration, ModuleRegistry, ModuleProps } from './types'

const moduleMap = new Map<string, ModuleRegistration>()

export const moduleRegistry: ModuleRegistry = {
  register: (module: ModuleRegistration) => {
    if (moduleMap.has(module.moduleId)) {
      console.warn(`Module with ID "${module.moduleId}" is already registered. Overwriting.`)
    }
    console.log(`[ModuleRegistry] Registering module:`, {
      moduleId: module.moduleId,
      moduleName: module.moduleName,
      hasComponent: !!module.component,
      hasSchema: !!module.schema,
      hasDefaultData: !!module.defaultData
    })
    moduleMap.set(module.moduleId, module)
    
    if (typeof window !== 'undefined') {
      (window as any).__MODULE_REGISTRY__ = Array.from(moduleMap.values())
    }
  },


  unregister: (moduleId: string) => {
    console.log(`[ModuleRegistry] Unregistering module:`, moduleId)
    moduleMap.delete(moduleId)
  },

  getModule: (moduleId: string) => {
    const module = moduleMap.get(moduleId)
    if (!module) {
      console.warn(`[ModuleRegistry] Module not found:`, moduleId)
    }
    return module
  },

  getAllModules: () => {
    console.log(`[ModuleRegistry] Getting all modules, count:`, moduleMap.size)
    return Array.from(moduleMap.values())
  },

  getModuleComponent: (moduleId: string) => {
    const module = moduleMap.get(moduleId)
    if (!module) {
      console.warn(`[ModuleRegistry] Module component not found:`, moduleId, `Available modules:`, Array.from(moduleMap.keys()))
      return null
    }
    if (!module.component) {
      console.warn(`[ModuleRegistry] Module has no component:`, moduleId)
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
