import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { getAdminConfig, saveAdminConfigApi, getSchema } from '@/lib/api-client'
import { Configs } from '../types'

export function useConfig() {
  const [configs, setConfigs] = useState<Configs>({
    site: {},
    footer: {},
    theme: {
      currentTheme: 'dark',
      themes: {}
    },
    header: {},
    'section-hero': {},
    'section-partner': {},
    'section-products': {},
    'section-services': {},
    'section-pricing': {},
    'section-about': {},
    'section-contact': {},
    'feishu-app': {
      appId: '',
      appSecret: '',
      baseLink: '',
      appToken: '',
      tableId: '',
      tableLink: ''
    }
  })
  const [originalConfigs, setOriginalConfigs] = useState<Configs>({
    site: {},
    footer: {},
    theme: {
      currentTheme: 'dark',
      themes: {}
    },
    header: {},
    'section-hero': {},
    'section-partner': {},
    'section-products': {},
    'section-services': {},
    'section-pricing': {},
    'section-about': {},
    'section-contact': {},
    'feishu-app': {
      appId: '',
      appSecret: '',
      baseLink: '',
      appToken: '',
      tableId: '',
      tableLink: ''
    }
  })
  const [schema, setSchema] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const fetchConfigs = useCallback(async () => {
    try {
      const data = await getAdminConfig() as unknown as Configs
      
      const mergedData = {
        ...data,
        theme: data.theme || {
          currentTheme: 'modern',
          themes: {}
        }
      }
      
      setConfigs(mergedData)
      setOriginalConfigs(JSON.parse(JSON.stringify(mergedData)))
    } catch (error) {
      console.error('获取配置失败:', error)
      toast.error("获取配置失败")
    }
  }, [])

  const fetchSchema = useCallback(async () => {
    try {
      const schemaData = await getSchema()
      setSchema(schemaData)
    } catch (error) {
      console.error("获取配置说明失败", error)
    }
  }, [])

  const saveConfig = useCallback(async (configType: string, data?: any) => {
    setLoading(true)
    try {
      const configData = data || configs[configType as keyof typeof configs]
      const result = await saveAdminConfigApi(configType, configData)

      if (result.success) {
        toast.success("配置提交成功")
        setConfigs(prev => ({
          ...prev,
          [configType]: JSON.parse(JSON.stringify(configData))
        }))
        setOriginalConfigs(prev => ({
          ...prev,
          [configType]: JSON.parse(JSON.stringify(configData))
        }))
        return true
      } else {
        toast.error("配置提交失败")
        return false
      }
    } catch (error) {
      toast.error("配置提交失败")
      return false
    } finally {
      setLoading(false)
    }
  }, [configs])

  const updateConfig = useCallback((configType: string, data: any) => {
    setConfigs(prev => ({
      ...prev,
      [configType]: data
    }))
  }, [])

  const hasChanges = useCallback((configType: string) => {
    return JSON.stringify(configs[configType as keyof typeof configs]) !==
      JSON.stringify(originalConfigs[configType as keyof typeof originalConfigs])
  }, [configs, originalConfigs])

  return {
    configs,
    originalConfigs,
    schema,
    loading,
    fetchConfigs,
    fetchSchema,
    saveConfig,
    updateConfig,
    hasChanges
  }
}
