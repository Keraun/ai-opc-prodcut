import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useTheme } from '@/components/theme-provider'
import { getThemeConfig, saveAdminConfigApi } from '@/lib/api-client'
import { ThemeSelector } from '../../components'
import styles from './theme.module.css'

export function ThemeManager() {
  const { setTheme } = useTheme()
  const [themeData, setThemeData] = useState({
    currentTheme: 'modern',
    themes: {}
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchThemeData = async () => {
      try {
        const data = await getThemeConfig()
        if (data) {
          setThemeData(data)
        }
      } catch (error) {
        console.error('获取主题数据失败:', error)
        toast.error("获取主题数据失败")
      }
    }

    fetchThemeData()
  }, [])

  const handleThemeChange = async (themeId: string) => {
    const updatedTheme = {
      ...themeData,
      currentTheme: themeId
    }
    
    setLoading(true)
    try {
      const result = await saveAdminConfigApi("theme", updatedTheme)

      if (result.success) {
        toast.success("主题切换成功")
        setTheme(themeId)
        setThemeData(updatedTheme)
      } else {
        toast.error("主题切换失败")
      }
    } catch (error) {
      toast.error("主题切换失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.themeManager}>
      <ThemeSelector
        themeData={themeData}
        onThemeChange={handleThemeChange}
      />
    </div>
  )
}
