"use client"

import { useEffect, useState, useMemo } from "react"
import { getModuleComponent, registerModule } from "./registry"
import type { ModuleData } from "./types"

interface ModuleRendererProps {
  modules: ModuleData[]
}

const MODULE_LOADERS: Record<string, () => Promise<any>> = {
  'site-header': () => import('./site-header/mod'),
  'site-footer': () => import('./site-footer/mod'),
  'sidebar-nav': () => import('./sidebar-nav/mod'),
  'section-hero': () => import('./section-hero/mod'),
  'section-services': () => import('./section-services/mod'),
  'section-partner': () => import('./section-partner/mod'),
  'section-products': () => import('./section-products/mod'),
  'section-pricing': () => import('./section-pricing/mod'),
  'section-about': () => import('./section-about/mod'),
  'section-contact': () => import('./section-contact/mod'),
  'site-root': () => import('./site-root/mod'),
}

const MODULE_COMPONENT_NAMES: Record<string, string> = {
  'site-header': 'HeaderModule',
  'site-footer': 'FooterModule',
  'sidebar-nav': 'SidebarNavModule',
  'section-hero': 'HeroModule',
  'section-services': 'ServicesModule',
  'section-partner': 'PartnerModule',
  'section-products': 'ProductsModule',
  'section-pricing': 'PricingModule',
  'section-about': 'AboutModule',
  'section-contact': 'ContactModule',
  'site-root': 'SiteRootModule',
}

export function ModuleRenderer({ modules }: ModuleRendererProps) {
  const [isClient, setIsClient] = useState(false)
  const [loadedCount, setLoadedCount] = useState(0)
  const moduleIds = useMemo(() => [...new Set(modules.map(m => m.moduleId))], [modules])
  const totalModules = moduleIds.length

  useEffect(() => {
    setIsClient(true)
    
    const loadModules = async () => {
      let count = 0
      
      for (const moduleId of moduleIds) {
        const existingComponent = getModuleComponent(moduleId)
        if (existingComponent) {
          count++
          continue
        }

        const loader = MODULE_LOADERS[moduleId]
        if (loader) {
          try {
            const moduleExports = await loader()
            const componentName = MODULE_COMPONENT_NAMES[moduleId]
            const Component = moduleExports[componentName]
            
            if (Component) {
              registerModule({
                moduleName: moduleId,
                moduleId,
                component: Component,
                schema: moduleExports.schema,
                defaultData: moduleExports.defaultData
              })
              count++
            } else {
              console.error(`Component "${componentName}" not found in module "${moduleId}"`)
            }
          } catch (error) {
            console.error(`Failed to load module "${moduleId}":`, error)
          }
        } else {
          console.warn(`Module "${moduleId}" loader not found`)
        }
      }

      setLoadedCount(count)
    }

    loadModules()
  }, [moduleIds])

  if (!isClient || loadedCount < totalModules) {
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
