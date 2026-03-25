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
    
    const themeConfigs: Record<string, ThemeConfig> = {
      tech: {
        id: "tech",
        name: "科技深色",
        description: "充满科技感的设计风格，紫色系配色，适合科技产品展示",
        colors: {
          primary: "#7c3aed",
          primaryHover: "#6d28d9",
          secondary: "#a78bfa",
          accent: "#ec4899",
          background: "#ffffff",
          backgroundSecondary: "#faf5ff",
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
          cardStyle: "sharp",
          buttonStyle: "sharp"
        },
        effects: {
          shadow: "large",
          borderRadius: "small",
          animation: "fast"
        },
        darkMode: {
          colors: {
            primary: "#a78bfa",
            primaryHover: "#8b5cf6",
            secondary: "#c4b5fd",
            accent: "#f472b6",
            background: "#0f0a1a",
            backgroundSecondary: "#1a1025",
            text: "#f3f4f6",
            textSecondary: "#9ca3af",
            border: "#374151",
            success: "#34d399",
            warning: "#fbbf24",
            error: "#f87171"
          }
        }
      },
      nature: {
        id: "nature",
        name: "清新自然",
        description: "明亮清新的设计风格，绿色系配色，适合环保、健康类产品",
        colors: {
          primary: "#059669",
          primaryHover: "#047857",
          secondary: "#10b981",
          accent: "#f59e0b",
          background: "#ffffff",
          backgroundSecondary: "#f0fdf4",
          text: "#1f2937",
          textSecondary: "#6b7280",
          border: "#d1d5db",
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444"
        },
        layout: {
          headerStyle: "floating",
          footerStyle: "minimal",
          cardStyle: "soft",
          buttonStyle: "pill"
        },
        effects: {
          shadow: "soft",
          borderRadius: "large",
          animation: "gentle"
        },
        darkMode: {
          colors: {
            primary: "#34d399",
            primaryHover: "#10b981",
            secondary: "#6ee7b7",
            accent: "#fbbf24",
            background: "#022c22",
            backgroundSecondary: "#064e3b",
            text: "#f0fdf4",
            textSecondary: "#a7f3d0",
            border: "#065f46",
            success: "#34d399",
            warning: "#fbbf24",
            error: "#f87171"
          }
        }
      },
      modern: {
        id: "modern",
        name: "现代简约",
        description: "简洁大方的设计风格，蓝色系配色，适合企业官网",
        colors: {
          primary: "#1e40af",
          primaryHover: "#1e3a8a",
          secondary: "#3b82f6",
          accent: "#06b6d4",
          background: "#ffffff",
          backgroundSecondary: "#f8fafc",
          text: "#1e293b",
          textSecondary: "#64748b",
          border: "#e2e8f0",
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444"
        },
        layout: {
          headerStyle: "default",
          footerStyle: "default",
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
            primary: "#3b82f6",
            primaryHover: "#2563eb",
            secondary: "#60a5fa",
            accent: "#22d3ee",
            background: "#0f172a",
            backgroundSecondary: "#1e293b",
            text: "#f1f5f9",
            textSecondary: "#94a3b8",
            border: "#334155",
            success: "#34d399",
            warning: "#fbbf24",
            error: "#f87171"
          }
        }
      }
    }
    
    setThemes(themeConfigs)
    
    const themeId = savedTheme || "modern"
    
    if (savedTheme && themeConfigs[savedTheme]) {
      setCurrentTheme(savedTheme)
      setThemeConfig(themeConfigs[savedTheme])
    } else {
      setCurrentTheme("modern")
      setThemeConfig(themeConfigs["modern"])
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
    applyThemeColors()
  }, [isDark, currentTheme, themeConfig, mounted])

  useEffect(() => {
    if (mounted && themeConfig) {
      applyThemeColors()
    }
  }, [mounted, themeConfig])

  const fetchThemeConfig = async () => {
    try {
      const response = await fetch("/api/admin/config")
      if (response.ok) {
        const data = await response.json()
        if (data.theme) {
          setThemes(data.theme.themes)
        }
      }
    } catch (error) {
      console.error("Failed to fetch theme config:", error)
    }
  }

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
    const themeConfigs: Record<string, ThemeConfig> = {
      tech: {
        id: "tech",
        name: "科技深色",
        description: "充满科技感的设计风格，紫色系配色，适合科技产品展示",
        colors: {
          primary: "#7c3aed",
          primaryHover: "#6d28d9",
          secondary: "#a78bfa",
          accent: "#ec4899",
          background: "#ffffff",
          backgroundSecondary: "#faf5ff",
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
          cardStyle: "sharp",
          buttonStyle: "sharp"
        },
        effects: {
          shadow: "large",
          borderRadius: "small",
          animation: "fast"
        },
        darkMode: {
          colors: {
            primary: "#a78bfa",
            primaryHover: "#8b5cf6",
            secondary: "#c4b5fd",
            accent: "#f472b6",
            background: "#0f0a1a",
            backgroundSecondary: "#1a1025",
            text: "#f3f4f6",
            textSecondary: "#9ca3af",
            border: "#374151",
            success: "#34d399",
            warning: "#fbbf24",
            error: "#f87171"
          }
        }
      },
      nature: {
        id: "nature",
        name: "清新自然",
        description: "明亮清新的设计风格，绿色系配色，适合环保、健康类产品",
        colors: {
          primary: "#059669",
          primaryHover: "#047857",
          secondary: "#10b981",
          accent: "#f59e0b",
          background: "#ffffff",
          backgroundSecondary: "#f0fdf4",
          text: "#1f2937",
          textSecondary: "#6b7280",
          border: "#d1d5db",
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444"
        },
        layout: {
          headerStyle: "floating",
          footerStyle: "minimal",
          cardStyle: "soft",
          buttonStyle: "pill"
        },
        effects: {
          shadow: "soft",
          borderRadius: "large",
          animation: "gentle"
        },
        darkMode: {
          colors: {
            primary: "#34d399",
            primaryHover: "#10b981",
            secondary: "#6ee7b7",
            accent: "#fbbf24",
            background: "#022c22",
            backgroundSecondary: "#064e3b",
            text: "#f0fdf4",
            textSecondary: "#a7f3d0",
            border: "#065f46",
            success: "#34d399",
            warning: "#fbbf24",
            error: "#f87171"
          }
        }
      },
      modern: {
        id: "modern",
        name: "现代简约",
        description: "简洁大方的设计风格，蓝色系配色，适合企业官网",
        colors: {
          primary: "#1e40af",
          primaryHover: "#1e3a8a",
          secondary: "#3b82f6",
          accent: "#06b6d4",
          background: "#ffffff",
          backgroundSecondary: "#f8fafc",
          text: "#1e293b",
          textSecondary: "#64748b",
          border: "#e2e8f0",
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444"
        },
        layout: {
          headerStyle: "default",
          footerStyle: "default",
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
            primary: "#3b82f6",
            primaryHover: "#2563eb",
            secondary: "#60a5fa",
            accent: "#22d3ee",
            background: "#0f172a",
            backgroundSecondary: "#1e293b",
            text: "#f1f5f9",
            textSecondary: "#94a3b8",
            border: "#334155",
            success: "#34d399",
            warning: "#fbbf24",
            error: "#f87171"
          }
        }
      }
    }
    
    if (themeConfigs[themeId]) {
      console.log('Setting theme to:', themeId, 'with primary color:', themeConfigs[themeId].colors.primary)
      setCurrentTheme(themeId)
      setThemeConfig(themeConfigs[themeId])
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
