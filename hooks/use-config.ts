import { useState, useEffect } from 'react'

interface Configs {
  site: any
  common: any
  seo: any
  navigation: any
  footer: any
  home: any
  homeOrder: any
  homeBanner: any
  homePartners: any
  homeProducts: any
  homeServices: any
  homePricing: any
  homeAbout: any
  homeContact: any
  products: any
  otherPages: any
  custom: any
  theme: any
}

export function useConfig() {
  const [configs, setConfigs] = useState<Configs | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/config')
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
    }

    fetchConfig()
  }, [])

  return { configs, loading, error }
}
