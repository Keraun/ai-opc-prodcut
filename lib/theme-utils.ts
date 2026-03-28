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

export interface ThemeConfig {
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

export const RADIUS_MAP: Record<string, string> = {
  small: "0.25rem",
  medium: "0.5rem",
  large: "1rem"
}

export const SHADOW_MAP: Record<string, string> = {
  small: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  medium: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  large: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
  soft: "0 2px 8px 0 rgba(0, 0, 0, 0.08)"
}

export const DEFAULT_THEME_COLORS: ThemeColors = {
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
}

export const DEFAULT_DARK_THEME_COLORS: ThemeColors = {
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

export function validateThemeConfig(config: any): config is ThemeConfig {
  if (!config || typeof config !== 'object') return false
  
  const requiredFields = ['id', 'name', 'description', 'colors', 'layout', 'effects', 'darkMode']
  for (const field of requiredFields) {
    if (!(field in config)) {
      console.warn(`Theme config missing required field: ${field}`)
      return false
    }
  }
  
  if (!config.colors || typeof config.colors !== 'object') {
    console.warn('Theme config colors is invalid')
    return false
  }
  
  if (!config.darkMode || !config.darkMode.colors) {
    console.warn('Theme config darkMode is invalid')
    return false
  }
  
  return true
}

export function getThemeColor(
  themeConfig: ThemeConfig | null, 
  colorKey: keyof ThemeColors, 
  isDark: boolean = false
): string {
  if (!themeConfig) {
    const defaults = isDark ? DEFAULT_DARK_THEME_COLORS : DEFAULT_THEME_COLORS
    return defaults[colorKey]
  }
  
  const colors = isDark ? themeConfig.darkMode.colors : themeConfig.colors
  return colors[colorKey] || (isDark ? DEFAULT_DARK_THEME_COLORS : DEFAULT_THEME_COLORS)[colorKey]
}

export function getRadiusValue(effects: ThemeEffects | undefined): string {
  const borderRadius = effects?.borderRadius || 'medium'
  return RADIUS_MAP[borderRadius] || RADIUS_MAP.medium
}

export function getShadowValue(effects: ThemeEffects | undefined): string {
  const shadow = effects?.shadow || 'medium'
  return SHADOW_MAP[shadow] || SHADOW_MAP.medium
}

export function applyThemeToElement(
  element: HTMLElement, 
  themeConfig: ThemeConfig, 
  isDark: boolean = false
): void {
  const colors = isDark ? themeConfig.darkMode.colors : themeConfig.colors
  const effects = themeConfig.effects || {}
  
  const safeColors = {
    primary: colors?.primary || DEFAULT_THEME_COLORS.primary,
    primaryHover: colors?.primaryHover || DEFAULT_THEME_COLORS.primaryHover,
    secondary: colors?.secondary || DEFAULT_THEME_COLORS.secondary,
    accent: colors?.accent || DEFAULT_THEME_COLORS.accent,
    background: colors?.background || DEFAULT_THEME_COLORS.background,
    backgroundSecondary: colors?.backgroundSecondary || DEFAULT_THEME_COLORS.backgroundSecondary,
    text: colors?.text || DEFAULT_THEME_COLORS.text,
    textSecondary: colors?.textSecondary || DEFAULT_THEME_COLORS.textSecondary,
    border: colors?.border || DEFAULT_THEME_COLORS.border,
    success: colors?.success || DEFAULT_THEME_COLORS.success,
    warning: colors?.warning || DEFAULT_THEME_COLORS.warning,
    error: colors?.error || DEFAULT_THEME_COLORS.error
  }
  
  element.style.setProperty("--theme-primary", safeColors.primary)
  element.style.setProperty("--theme-primary-hover", safeColors.primaryHover)
  element.style.setProperty("--theme-secondary", safeColors.secondary)
  element.style.setProperty("--theme-accent", safeColors.accent)
  element.style.setProperty("--theme-background", safeColors.background)
  element.style.setProperty("--theme-background-secondary", safeColors.backgroundSecondary)
  element.style.setProperty("--theme-text", safeColors.text)
  element.style.setProperty("--theme-text-secondary", safeColors.textSecondary)
  element.style.setProperty("--theme-border", safeColors.border)
  element.style.setProperty("--theme-success", safeColors.success)
  element.style.setProperty("--theme-warning", safeColors.warning)
  element.style.setProperty("--theme-error", safeColors.error)
  element.style.setProperty("--theme-radius", getRadiusValue(effects))
  element.style.setProperty("--theme-shadow", getShadowValue(effects))
}

export function getDefaultThemeConfig(themeId?: string | null): ThemeConfig {
  return {
    id: themeId || "modern",
    name: "现代简约",
    description: "简洁大方的设计风格，蓝色系配色，适合企业官网",
    colors: { ...DEFAULT_THEME_COLORS },
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
      colors: { ...DEFAULT_DARK_THEME_COLORS }
    }
  }
}

export function mergeWithDefaultTheme(config: Partial<ThemeConfig>): ThemeConfig {
  const defaultConfig = getDefaultThemeConfig()
  return {
    ...defaultConfig,
    ...config,
    colors: {
      ...defaultConfig.colors,
      ...config.colors
    },
    layout: {
      ...defaultConfig.layout,
      ...config.layout
    },
    effects: {
      ...defaultConfig.effects,
      ...config.effects
    },
    darkMode: {
      colors: {
        ...defaultConfig.darkMode.colors,
        ...config.darkMode?.colors
      }
    }
  }
}
