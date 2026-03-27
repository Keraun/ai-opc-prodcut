"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { 
  validateThemeConfig, 
  getDefaultThemeConfig, 
  applyThemeToElement,
  type ThemeConfig 
} from "@/lib/theme-utils"

interface ThemeContextType {
  currentTheme: string
  themeConfig: ThemeConfig | null
  themes: Record<string, ThemeConfig>
  setTheme: (themeId: string) => void
  isDark: boolean
  toggleDark: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<string>("modern")
  const [themeConfig, setThemeConfig] = useState<ThemeConfig | null>(null)
  const [themes, setThemes] = useState<Record<string, ThemeConfig>>({})
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const savedTheme = localStorage.getItem("theme")
    const savedDarkMode = localStorage.getItem("darkMode")
    
    if (savedDarkMode) {
      setIsDark(savedDarkMode === "true")
    } else {
      setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches)
    }
    
    // 从API获取主题配置
    async function fetchThemeConfig() {
      try {
        const response = await fetch('/api/config?type=theme')
        if (response.ok) {
          const result = await response.json()
          const themeConfig = result.data
          if (themeConfig && themeConfig.themes) {
            setThemes(themeConfig.themes)
            const themeId = savedTheme || themeConfig.currentTheme || "modern"
            if (themeConfig.themes[themeId]) {
              setCurrentTheme(themeId)
              setThemeConfig(themeConfig.themes[themeId])
            } else if (themeConfig.themes["modern"]) {
              setCurrentTheme("modern")
              setThemeConfig(themeConfig.themes["modern"])
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch theme config:', error)
        // 降级到默认主题
        const defaultTheme = getDefaultThemeConfig(savedTheme)
        setThemes({ [defaultTheme.id]: defaultTheme })
        setCurrentTheme(defaultTheme.id)
        setThemeConfig(defaultTheme)
      }
    }
    
    fetchThemeConfig()
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    localStorage.setItem("darkMode", String(isDark))
    if (themeConfig) {
      applyThemeToElement(document.documentElement, themeConfig, isDark)
    }
  }, [isDark, currentTheme, themeConfig, mounted])

  useEffect(() => {
    if (mounted && themeConfig) {
      applyThemeToElement(document.documentElement, themeConfig, isDark)
    }
  }, [mounted, themeConfig, isDark])

  const setTheme = (themeId: string) => {
    if (themes[themeId]) {
      console.log('Setting theme to:', themeId, 'with primary color:', themes[themeId].colors.primary)
      setCurrentTheme(themeId)
      setThemeConfig(themes[themeId])
      localStorage.setItem("theme", themeId)
    } else {
      console.error('Theme not found:', themeId)
    }
  }

  const toggleDark = () => {
    setIsDark(!isDark)
  }

  return (
    <ThemeContext.Provider value={{ currentTheme, themeConfig, themes, setTheme, isDark, toggleDark }}>
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
