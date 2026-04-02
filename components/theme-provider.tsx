"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from "react"
import { 
  getDefaultThemeConfig, 
  applyThemeToElement,
  type ThemeConfig 
} from "@/lib/theme-utils"
import { getThemeConfig as getClientThemeConfig } from "@/lib/client-api"

interface ThemeContextType {
  currentTheme: string
  themeConfig: ThemeConfig
  themes: Record<string, ThemeConfig>
  setTheme: (themeId: string) => void
  isLoading: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<string>("modern")
  const [themeConfig, setThemeConfig] = useState<ThemeConfig | null>(null)
  const [themes, setThemes] = useState<Record<string, ThemeConfig>>({})
  const [isLoading, setIsLoading] = useState(true)

  const defaultTheme = useMemo(() => getDefaultThemeConfig(), [])
  
  const defaultThemes = useMemo(() => ({
    [defaultTheme.id]: defaultTheme
  }), [defaultTheme])

  const contextValue = useMemo<ThemeContextType>(() => ({
    currentTheme,
    themeConfig: themeConfig || defaultTheme,
    themes: Object.keys(themes).length > 0 ? themes : defaultThemes,
    setTheme: (themeId: string) => {
      const allThemes = Object.keys(themes).length > 0 ? themes : defaultThemes
      if (allThemes[themeId]) {
        console.log('Setting theme to:', themeId, 'with primary color:', allThemes[themeId].colors.primary)
        setCurrentTheme(themeId)
        setThemeConfig(allThemes[themeId])
        if (typeof window !== 'undefined') {
          localStorage.setItem("theme", themeId)
        }
      } else {
        console.error('Theme not found:', themeId)
      }
    },
    isLoading
  }), [currentTheme, themeConfig, themes, defaultTheme, defaultThemes, isLoading])

  useEffect(() => {
    setMounted(true)
    
    // 先从localStorage获取主题，提高首屏加载速度
    const savedTheme = typeof window !== 'undefined' ? localStorage.getItem("theme") : null
    
    // 立即应用本地存储的主题（如果有）
    if (savedTheme) {
      const defaultTheme = getDefaultThemeConfig(savedTheme)
      setThemes({ [defaultTheme.id]: defaultTheme })
      setCurrentTheme(defaultTheme.id)
      setThemeConfig(defaultTheme)
    }
    
    // 异步拉取服务端数据并同步
    async function fetchThemeConfig() {
      try {
        const response = await getClientThemeConfig()
        if (response.success && response.data) {
          const themeConfig = response.data
          if (themeConfig.themes) {
            setThemes(themeConfig.themes)
            const themeId = themeConfig.currentTheme || savedTheme || "modern"
            if (themeConfig.themes[themeId]) {
              setCurrentTheme(themeId)
              setThemeConfig(themeConfig.themes[themeId])
              if (typeof window !== 'undefined') {
                localStorage.setItem("theme", themeId)
              }
            } else if (themeConfig.themes["modern"]) {
              setCurrentTheme("modern")
              setThemeConfig(themeConfig.themes["modern"])
              if (typeof window !== 'undefined') {
                localStorage.setItem("theme", "modern")
              }
            } else {
              const defaultTheme = getDefaultThemeConfig(savedTheme)
              setThemes({ [defaultTheme.id]: defaultTheme })
              setCurrentTheme(defaultTheme.id)
              setThemeConfig(defaultTheme)
              if (typeof window !== 'undefined') {
                localStorage.setItem("theme", defaultTheme.id)
              }
            }
          } else {
            const defaultTheme = getDefaultThemeConfig(savedTheme)
            setThemes({ [defaultTheme.id]: defaultTheme })
            setCurrentTheme(defaultTheme.id)
            setThemeConfig(defaultTheme)
            if (typeof window !== 'undefined') {
              localStorage.setItem("theme", defaultTheme.id)
            }
          }
        } else {
          const defaultTheme = getDefaultThemeConfig(savedTheme)
          setThemes({ [defaultTheme.id]: defaultTheme })
          setCurrentTheme(defaultTheme.id)
          setThemeConfig(defaultTheme)
          if (typeof window !== 'undefined') {
            localStorage.setItem("theme", defaultTheme.id)
          }
        }
      } catch (error) {
        console.error('Failed to fetch theme config:', error)
        const defaultTheme = getDefaultThemeConfig(savedTheme)
        setThemes({ [defaultTheme.id]: defaultTheme })
        setCurrentTheme(defaultTheme.id)
        setThemeConfig(defaultTheme)
        if (typeof window !== 'undefined') {
          localStorage.setItem("theme", defaultTheme.id)
        }
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchThemeConfig()
  }, [])

  useEffect(() => {
    if (!mounted) return

    if (themeConfig) {
      applyThemeToElement(document.documentElement, themeConfig)
    }
  }, [currentTheme, themeConfig, mounted])

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
