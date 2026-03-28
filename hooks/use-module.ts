'use client'

import { useState, useEffect } from 'react'
import type { ModuleData, ModuleRegistration } from '@/modules/types'
import { 
  getModuleInstanceData, 
  getModule, 
  getAvailableModuleIds,
  getModuleTemplate,
  updateModuleInstance,
  getPageConfig,
  getPageModules,
  updatePageModules
} from '@/lib/api-client'

export function useModuleInstance(moduleInstanceId: string | null) {
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!moduleInstanceId) {
      setData(null)
      return
    }

    setLoading(true)
    setError(null)

    getModuleInstanceData(moduleInstanceId)
      .then(moduleData => {
        setData(moduleData)
      })
      .catch(err => {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      })
      .finally(() => {
        setLoading(false)
      })
  }, [moduleInstanceId])

  const update = async (newData: Record<string, unknown>) => {
    if (!moduleInstanceId) return false
    
    setLoading(true)
    const success = await updateModuleInstance(moduleInstanceId, newData)
    
    if (success) {
      const updatedData = await getModuleInstanceData(moduleInstanceId)
      setData(updatedData)
    }
    
    setLoading(false)
    return success
  }

  return { data, loading, error, update }
}

export function useModule(moduleId: string | null) {
  const [data, setData] = useState<ModuleData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!moduleId) {
      setData(null)
      return
    }

    setLoading(true)
    setError(null)

    getModule(moduleId)
      .then(moduleData => {
        setData(moduleData)
      })
      .catch(err => {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      })
      .finally(() => {
        setLoading(false)
      })
  }, [moduleId])

  return { data, loading, error }
}

export function useAvailableModules() {
  const [modules, setModules] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    getAvailableModuleIds()
      .then((data: string[]) => {
        setModules(data)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return { modules, loading, error }
}

export function useModuleTemplate(moduleId: string | null) {
  const [template, setTemplate] = useState<ModuleRegistration | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!moduleId) {
      setTemplate(null)
      return
    }

    setLoading(true)
    setError(null)

    getModuleTemplate(moduleId)
      .then(templateData => {
        setTemplate(templateData)
      })
      .catch(err => {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      })
      .finally(() => {
        setLoading(false)
      })
  }, [moduleId])

  return { template, loading, error }
}

export function usePageConfig(pageId: string | null) {
  const [config, setConfig] = useState<{
    pageId: string
    layout: string
    modules: ModuleData[]
    config: Record<string, unknown>
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!pageId) {
      setConfig(null)
      return
    }

    setLoading(true)
    setError(null)

    getPageConfig(pageId)
      .then(pageConfig => {
        setConfig(pageConfig)
      })
      .catch(err => {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      })
      .finally(() => {
        setLoading(false)
      })
  }, [pageId])

  const updateModules = async (modules: ModuleData[]) => {
    if (!pageId) return false
    
    setLoading(true)
    const success = await updatePageModules(pageId, modules)
    
    if (success) {
      const updatedConfig = await getPageConfig(pageId)
      setConfig(updatedConfig)
    }
    
    setLoading(false)
    return success
  }

  return { config, loading, error, updateModules }
}

export function usePageModules(pageId: string | null) {
  const [modules, setModules] = useState<ModuleData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!pageId) {
      setModules([])
      return
    }

    setLoading(true)
    setError(null)

    getPageModules(pageId)
      .then(data => {
        setModules(data)
      })
      .catch(err => {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      })
      .finally(() => {
        setLoading(false)
      })
  }, [pageId])

  const update = async (newModules: ModuleData[]) => {
    if (!pageId) return false
    
    setLoading(true)
    const success = await updatePageModules(pageId, newModules)
    
    if (success) {
      setModules(newModules)
    }
    
    setLoading(false)
    return success
  }

  return { modules, loading, error, update }
}
