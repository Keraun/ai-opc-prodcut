"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { 
  getDefaultThemeConfig, 
  applyThemeToElement,
  type ThemeConfig 
} from "@/lib/theme-utils"
import { getThemeConfig } from "@/lib/api-client"

interface ThemeContextType {
  currentTheme: string
  themeConfig: ThemeConfig | null
  themes: Record<string, ThemeConfig>
  setTheme: (themeId: string) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<string>("modern")
  const [themeConfig, setThemeConfig] = useState<ThemeConfig | null>(null)
  const [themes, setThemes] = useState<Record<string, ThemeConfig>>({})

  useEffect(() => {
    setMounted(true)
    
    const savedTheme = localStorage.getItem("theme")
    
    
    async function fetchThemeConfig() {
      try {
        const themeConfig = await getThemeConfig()
        if (themeConfig && themeConfig.themes) {
          setThemes(themeConfig.themes)
          const themeId = savedTheme || themeConfig.currentTheme || "modern"
          if (themeConfig.themes[themeId]) {
            setCurrentTheme(themeId)
            setThemeConfig(themeConfig.themes[themeId])
          } else if (themeConfig.themes["modern"]) {
            setCurrentTheme("modern")
            setThemeConfig(themeConfig.themes["modern"])
          } else {
            // No themes available, use default
            const defaultTheme = getDefaultThemeConfig(savedTheme)
            setThemes({ [defaultTheme.id]: defaultTheme })
            setCurrentTheme(defaultTheme.id)
            setThemeConfig(defaultTheme)
          }
        } else {
          // API call failed or returned null, use default theme
          const defaultTheme = getDefaultThemeConfig(savedTheme)
          setThemes({ [defaultTheme.id]: defaultTheme })
          setCurrentTheme(defaultTheme.id)
          setThemeConfig(defaultTheme)
        }
      } catch (error) {
        console.error('Failed to fetch theme config:', error)
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

    if (themeConfig) {
      applyThemeToElement(document.documentElement, themeConfig)
    }
  }, [currentTheme, themeConfig, mounted])

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


  return (
    <ThemeContext.Provider value={{ currentTheme, themeConfig, themes, setTheme }}>
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
