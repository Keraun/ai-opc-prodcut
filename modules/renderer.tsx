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
  const [loadedModules, setLoadedModules] = useState<Set<string>>(new Set())
  const [forceShow, setForceShow] = useState(false)
  const moduleIds = useMemo(() => [...new Set(modules.map(m => m.moduleId))], [modules])
  const { loaders, componentNames } = useMemo(() => getModuleLoaderConfig(), [])

  useEffect(() => {
    setIsClient(true)
  }, [])

  // 显示加载状态，但最多等待3秒后强制显示内容
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceShow(true)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isClient) return

    console.log('[ModuleRenderer] Starting to load modules:', moduleIds)

    const loadModules = async () => {
      const loadPromises = moduleIds.map(async (moduleId) => {
        const existingComponent = getModuleComponent(moduleId)
        if (existingComponent) {
          console.log(`[ModuleRenderer] Module "${moduleId}" already registered`)
          return moduleId
        }

        const validation = validateModuleId(moduleId)
        if (!validation.valid) {
          console.warn(`[ModuleRenderer] Validation failed for "${moduleId}":`, validation.error)
          return null
        }

        const loader = loaders[moduleId]
        if (!loader) {
          console.warn(`[ModuleRenderer] No loader found for "${moduleId}"`)
          return null
        }

        console.log(`[ModuleRenderer] Loading module "${moduleId}"...`)
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
            console.log(`[ModuleRenderer] Module "${moduleId}" loaded successfully`)
            return moduleId
          } else {
            console.error(`[ModuleRenderer] Component "${componentName}" not found in module "${moduleId}"`)
            return null
          }
        } catch (error) {
          console.error(`[ModuleRenderer] Failed to load module "${moduleId}":`, error)
          return null
        }
      })

      console.log('[ModuleRenderer] Waiting for all modules to load...')
      const results = await Promise.allSettled(loadPromises)
      const successfullyLoaded = results
        .filter((result): result is PromiseFulfilledResult<string | null> => result.status === 'fulfilled')
        .map(result => result.value)
        .filter((id): id is string => id !== null)
      
      console.log('[ModuleRenderer] Modules loaded:', {
        total: moduleIds.length,
        success: successfullyLoaded.length,
        failed: moduleIds.length - successfullyLoaded.length,
        loadedModules: successfullyLoaded
      })
      
      setLoadedModules(new Set(successfullyLoaded))
    }

    loadModules()
  }, [isClient, moduleIds, loaders, componentNames])

  const allLoaded = useMemo(() => {
    return moduleIds.every(id => {
      const existingComponent = getModuleComponent(id)
      return existingComponent || loadedModules.has(id)
    })
  }, [moduleIds, loadedModules])

  if (!isClient) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>
  }

  if (!allLoaded && !forceShow) {
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
