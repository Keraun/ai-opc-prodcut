import { useState, useEffect, useCallback } from 'react'
import { Configs } from '../types/config'

export function useConfigs() {
  const [configs, setConfigs] = useState<Configs>({
    site: {},
    common: {},
    seo: {},
    navigation: {},
    footer: {},
    home: {},
    homeOrder: {},
    homeBanner: {},
    homePartners: {},
    homeProducts: {},
    homeServices: {},
    homePricing: {},
    homeAbout: {},
    homeContact: {},
    products: {},
    otherPages: {},
    custom: {},
    account: {},
    loginLogs: {},
    theme: {
      currentTheme: 'modern',
      themes: {}
    }
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConfigs = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/config')
      
      if (!response.ok) {
        throw new Error('获取配置失败')
      }
      
      const data = await response.json()
      setConfigs(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取配置失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConfigs()
  }, [fetchConfigs])

  return { configs, loading, error, refetch: fetchConfigs }
}
