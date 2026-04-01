"use client"

import { useTheme } from "@/components/theme-provider"
import { getThemeColor, DEFAULT_THEME_COLORS } from "@/lib/theme-utils"

export function useModuleTheme() {
  const { themeConfig } = useTheme()

  const getColor = (colorType: 'primary' | 'secondary' | 'accent' | 'warning' | 'error' | 'success' | 'text' | 'textSecondary' | 'background' | 'backgroundSecondary' | 'border') => {
    return getThemeColor(themeConfig, colorType)
  }

  const primaryColor = getColor('primary')
  const secondaryColor = getColor('secondary')
  const accentColor = getColor('accent')
  const warningColor = getColor('warning')
  const errorColor = getColor('error')
  const successColor = getColor('success')

  const getColorByType = (colorType: string) => {
    switch (colorType) {
      case 'primary': return primaryColor
      case 'secondary': return secondaryColor
      case 'accent': return accentColor
      case 'warning': return warningColor
      case 'error': return errorColor
      case 'success': return successColor
      default: return primaryColor
    }
  }

  return {
    themeConfig,
    getColor,
    getColorByType,
    primaryColor,
    secondaryColor,
    accentColor,
    warningColor,
    errorColor,
    successColor
  }
}
