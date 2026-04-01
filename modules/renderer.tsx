"use client"

import { useEffect, useState, ComponentType, ReactNode } from "react"
import { getModuleComponent } from "./registry"
import type { ModuleData, ModuleProps } from "./types"



interface ModuleErrorBoundaryProps {
  children: ReactNode
  moduleId: string
  moduleInstanceId: string
  fallback?: ReactNode
}

function ModuleErrorBoundary({ 
  children, 
  moduleId, 
  moduleInstanceId,
  fallback 
}: ModuleErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('[ModuleErrorBoundary] Uncaught error:', {
        moduleId,
        moduleInstanceId,
        error: event.error?.message || event.message,
        stack: event.error?.stack
      })
    }
    
    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [moduleId, moduleInstanceId])

  if (hasError) {
    return fallback || (
      <div style={{ 
        padding: '20px', 
        background: '#fee', 
        border: '1px solid #f00',
        borderRadius: '4px',
        margin: '10px 0'
      }}>
        <p style={{ color: '#c00', margin: 0 }}>
          模块渲染错误: {moduleId}
        </p>
        {error && (
          <p style={{ color: '#666', margin: '5px 0 0', fontSize: '12px' }}>
            {error.message}
          </p>
        )}
      </div>
    )
  }

  return <>{children}</>
}

interface ModuleWrapperProps extends ModuleProps {
  Component: ComponentType<ModuleProps> | null
}

function ModuleWrapper({ Component, ...props }: ModuleWrapperProps) {
  const [error, setError] = useState<Error | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    console.log('[ModuleWrapper] Module mounting:', {
      moduleId: props.moduleId,
      moduleInstanceId: props.moduleInstanceId,
      hasData: !!props.data,
      dataKeys: props.data ? Object.keys(props.data) : []
    })
    
    return () => {
      console.log('[ModuleWrapper] Module unmounting:', {
        moduleId: props.moduleId,
        moduleInstanceId: props.moduleInstanceId
      })
    }
  }, [props.moduleId, props.moduleInstanceId, props.data])

  useEffect(() => {
    if (error) {
      console.error('[ModuleWrapper] Module render error:', {
        moduleId: props.moduleId,
        moduleInstanceId: props.moduleInstanceId,
        error: error.message,
        stack: error.stack
      })
    }
  }, [error, props.moduleId, props.moduleInstanceId])

  if (!Component) {
    console.warn('[ModuleWrapper] Component not found:', props.moduleId)
    return null
  }

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        background: '#fee', 
        border: '1px solid #f00',
        borderRadius: '4px',
        margin: '10px 0'
      }}>
        <p style={{ color: '#c00', margin: 0 }}>
          模块渲染错误: {props.moduleId}
        </p>
        <p style={{ color: '#666', margin: '5px 0 0', fontSize: '12px' }}>
          {error.message}
        </p>
      </div>
    )
  }

  try {
    return <Component {...props} />
  } catch (err: any) {
    console.error('[ModuleWrapper] Sync render error:', {
      moduleId: props.moduleId,
      error: err?.message || String(err)
    })
    setError(err)
    return null
  }
}

interface ModuleRendererProps {
  modules: ModuleData[]
}

export function ModuleRenderer({ modules }: ModuleRendererProps) {

  return (
    <>
      {modules.map((module) => {
        const Component = getModuleComponent(module?.moduleId)
        
        if (!Component) {
          console.warn('[ModuleRenderer] Module not registered:', {
            moduleId: module.moduleId,
            moduleInstanceId: module.moduleInstanceId
          })
          return null
        }

        return (
          <ModuleErrorBoundary
            key={module.moduleInstanceId}
            moduleId={module.moduleId}
            moduleInstanceId={module.moduleInstanceId}
          >
            <ModuleWrapper
              key={module.moduleInstanceId}
              moduleName={module.moduleName}
              moduleId={module.moduleId}
              moduleInstanceId={module.moduleInstanceId}
              data={module.data}
              Component={Component}
            />
          </ModuleErrorBoundary>
        )
      })}
    </>
  )
}
