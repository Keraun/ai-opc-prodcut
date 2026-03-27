"use client"

import { useEffect, useState, useMemo } from "react"
import { getModuleComponent, registerModule } from "./registry"
import { getModuleLoaderConfig, validateModuleId } from "./module-loader"
import type { ModuleData } from "./types"

interface ModuleRendererProps {
  modules: ModuleData[]
}

export function ModuleRenderer({ modules }: ModuleRendererProps) {
  const [isClient, setIsClient] = useState(false)
  const [allLoaded, setAllLoaded] = useState(false)
  const moduleIds = useMemo(() => [...new Set(modules.map(m => m.moduleId))], [modules])
  const { loaders, componentNames } = getModuleLoaderConfig()

  useEffect(() => {
    setIsClient(true)
    
    const loadModules = async () => {
      for (const moduleId of moduleIds) {
        const existingComponent = getModuleComponent(moduleId)
        if (existingComponent) {
          continue
        }

        const validation = validateModuleId(moduleId)
        if (!validation.valid) {
          console.warn(validation.error)
          continue
        }

        const loader = loaders[moduleId]
        if (loader) {
          try {
            const moduleExports = await loader()
            const componentName = componentNames[moduleId]
            const Component = moduleExports[componentName]
            
            if (Component) {
              registerModule({
                moduleName: moduleId,
                moduleId,
                component: Component,
                schema: moduleExports.schema,
                defaultData: moduleExports.defaultData
              })
            } else {
              console.error(`Component "${componentName}" not found in module "${moduleId}"`)
            }
          } catch (error) {
            console.error(`Failed to load module "${moduleId}":`, error)
          }
        }
      }

      setAllLoaded(true)
    }

    loadModules()
  }, [moduleIds, loaders, componentNames])

  if (!isClient || !allLoaded) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>
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
