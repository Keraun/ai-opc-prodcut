"use client"

import { getModuleComponent } from "./registry"
import type { ModuleData } from "./types"

interface ModuleRendererProps {
  modules: ModuleData[]
}

export function ModuleRenderer({ modules }: ModuleRendererProps) {
  return (
    <>
      {modules.map((module) => {
        const Component = getModuleComponent(module.moduleId)
        
        if (!Component) {
          console.warn(`Module "${module.moduleId}" is not registered`)
          return null
        }

        return (
          <Component
            key={module.moduleInstanceId}
            moduleName={module.moduleName}
            moduleId={module.moduleId}
            moduleInstanceId={module.moduleInstanceId}
            data={module.data}
          />
        )
      })}
    </>
  )
}
