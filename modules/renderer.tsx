"use client"

import { useEffect, useState } from "react"
import { getModuleComponent } from "./registry"
import { initializeModules } from "./init"
import type { ModuleData } from "./types"

interface ModuleRendererProps {
  modules: ModuleData[]
}

export function ModuleRenderer({ modules }: ModuleRendererProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    initializeModules()
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null
  }

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
