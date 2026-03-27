"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

interface ThemeColors {
  primary: string
  primaryHover: string
  secondary: string
  accent: string
  background: string
  backgroundSecondary: string
  text: string
  textSecondary: string
  border: string
  success: string
  warning: string
  error: string
}

interface ThemeLayout {
  headerStyle: string
  footerStyle: string
  cardStyle: string
  buttonStyle: string
}

interface ThemeEffects {
  shadow: string
  borderRadius: string
  animation: string
}

interface ThemeConfig {
  id: string
  name: string
  description: string
  colors: ThemeColors
  layout: ThemeLayout
  effects: ThemeEffects
  darkMode: {
    colors: ThemeColors
  }
}

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
        const response = await fetch('/api/config')
        if (response.ok) {
          const result = await response.json()
          const data = result.data
          if (data.theme && data.theme.themes) {
            setThemes(data.theme.themes)
            const themeId = savedTheme || data.theme.currentTheme || "modern"
            if (data.theme.themes[themeId]) {
              setCurrentTheme(themeId)
              setThemeConfig(data.theme.themes[themeId])
            } else if (data.theme.themes["modern"]) {
              setCurrentTheme("modern")
              setThemeConfig(data.theme.themes["modern"])
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

  function getDefaultThemeConfig(themeId?: string | null): ThemeConfig {
    return {
      id: themeId || "modern",
      name: "现代简约",
      description: "简洁大方的设计风格，蓝色系配色，适合企业官网",
      colors: {
        primary: "#1e40af",
        primaryHover: "#1e3a8a",
        secondary: "#3b82f6",
        accent: "#06b6d4",
        background: "#ffffff",
        backgroundSecondary: "#f3f4f6",
        text: "#1f2937",
        textSecondary: "#6b7280",
        border: "#e5e7eb",
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444"
      },
      layout: {
        headerStyle: "gradient",
        footerStyle: "gradient",
        cardStyle: "rounded",
        buttonStyle: "rounded"
      },
      effects: {
        shadow: "medium",
        borderRadius: "medium",
        animation: "smooth"
      },
      darkMode: {
        colors: {
          primary: "#60a5fa",
          primaryHover: "#3b82f6",
          secondary: "#93c5fd",
          accent: "#22d3ee",
          background: "#111827",
          backgroundSecondary: "#1f2937",
          text: "#f3f4f6",
          textSecondary: "#9ca3af",
          border: "#374151",
          success: "#34d399",
          warning: "#fbbf24",
          error: "#f87171"
        }
      }
    }
  }

  useEffect(() => {
    if (!mounted) return
    
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    localStorage.setItem("darkMode", String(isDark))
    applyThemeColors()
  }, [isDark, currentTheme, themeConfig, mounted])

  useEffect(() => {
    if (mounted && themeConfig) {
      applyThemeColors()
    }
  }, [mounted, themeConfig])



  const applyThemeColors = () => {
    if (!themeConfig) return

    const colors = isDark ? themeConfig.darkMode.colors : themeConfig.colors
    
    const root = document.documentElement
    root.style.setProperty("--theme-primary", colors.primary)
    root.style.setProperty("--theme-primary-hover", colors.primaryHover)
    root.style.setProperty("--theme-secondary", colors.secondary)
    root.style.setProperty("--theme-accent", colors.accent)
    root.style.setProperty("--theme-background", colors.background)
    root.style.setProperty("--theme-background-secondary", colors.backgroundSecondary)
    root.style.setProperty("--theme-text", colors.text)
    root.style.setProperty("--theme-text-secondary", colors.textSecondary)
    root.style.setProperty("--theme-border", colors.border)
    root.style.setProperty("--theme-success", colors.success)
    root.style.setProperty("--theme-warning", colors.warning)
    root.style.setProperty("--theme-error", colors.error)

    const effects = themeConfig.effects
    const radiusMap: Record<string, string> = {
      small: "0.25rem",
      medium: "0.5rem",
      large: "1rem"
    }
    const shadowMap: Record<string, string> = {
      small: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      medium: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      large: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      soft: "0 2px 8px 0 rgba(0, 0, 0, 0.08)"
    }
    
    root.style.setProperty("--theme-radius", radiusMap[effects.borderRadius] || "0.5rem")
    root.style.setProperty("--theme-shadow", shadowMap[effects.shadow] || "0 4px 6px -1px rgba(0, 0, 0, 0.1)")
  }

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
