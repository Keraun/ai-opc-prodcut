import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { 
  getAdminConfig, 
  saveAdminConfigApi, 
  getSchema,
  getThemeConfig
} from '@/lib/api-client'

export interface Configs {
  site_config: any
  super_admin_token: string
  notification: any
  site_footer_config:any
  product_categories: any
  site_header_config: any
}

export function useConfig() {
  const [configs, setConfigs] = useState<Configs>({
    site_config: {},
    super_admin_token: '',
    notification: {},
    site_footer_config:{},
    product_categories: {},
    site_header_config: {}
  })
  const [originalConfigs, setOriginalConfigs] = useState<Configs>({
    site_config: {},
    super_admin_token: '',
    notification: {},
    site_footer_config:{},
    product_categories: {},
    site_header_config: {}
  })
  const [loading, setLoading] = useState(false)
  const [schema, setSchema] = useState<any>({})

  const fetchConfigs = useCallback(async () => {
    setLoading(true)
    try {
      const adminConfig = await getAdminConfig() as unknown as Configs
      
      setConfigs(adminConfig)
      setOriginalConfigs(adminConfig)
    } catch (error) {
      console.error('获取配置失败:', error)
      toast.error("获取配置失败")
    } finally {
      setLoading(false)
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
      const configData = data || configs[configType as keyof Configs]
      const result = await saveAdminConfigApi(configType, configData)

      if (result.success) {
        toast.success("配置保存成功")
        setConfigs(prev => ({
          ...prev,
          [configType]: { ...configData }
        }))
        setOriginalConfigs(prev => ({
          ...prev,
          [configType]: { ...configData }
        }))
        return true
      } else {
        toast.error("配置保存失败")
        return false
      }
    } catch (error) {
      console.error('保存配置失败:', error)
      toast.error("配置保存失败")
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
    return JSON.stringify(configs[configType as keyof Configs]) !==
      JSON.stringify(originalConfigs[configType as keyof Configs])
  }, [configs, originalConfigs])

  return {
    configs,
    loading,
    schema,
    fetchConfigs,
    fetchSchema,
    saveConfig,
    updateConfig,
    hasChanges
  }
}
