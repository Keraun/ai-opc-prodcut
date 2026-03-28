import { useState } from 'react'
import { toast } from 'sonner'
import { useTheme } from '@/components/theme-provider'
import { useConfig } from '../../common/hooks/useConfig'
import { ThemeSelector } from '../../components'
import styles from './theme.module.css'

export function ThemeManager() {
  const { setTheme } = useTheme()
  const { configs, saveConfig } = useConfig()
  const [loading, setLoading] = useState(false)

  const handleThemeChange = async (themeId: string) => {
    const updatedTheme = {
      ...configs.theme,
      currentTheme: themeId
    }
    
    setLoading(true)
    try {
      const result = await saveConfig("theme", updatedTheme)

      if (result) {
        toast.success("主题切换成功")
        setTheme(themeId)
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
        themeData={configs.theme}
        onThemeChange={handleThemeChange}
      />
    </div>
  )
}
