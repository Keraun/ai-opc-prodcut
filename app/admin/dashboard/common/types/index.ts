export interface ThemeColors {
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

export interface ThemeConfig {
  id: string
  name: string
  description: string
  colors: ThemeColors
  layout: any
  effects: any
  darkMode: {
    colors: ThemeColors
  }
}

export interface ThemeData {
  currentTheme: string
  themes: Record<string, ThemeConfig>
}

export interface Configs {
  site: any
  footer: any
  theme: ThemeData
  header: any
  'section-hero': any
  'section-partner': any
  'section-products': any
  'section-services': any
  'section-pricing': any
  'section-about': any
  'section-contact': any
}

export interface ConfigVersionInfo {
  version: string
  timestamp: string
  author: string
}

export interface User {
  username: string
  role: string
  lastLoginTime?: string
  currentLoginIP?: string
  mustChangePassword?: boolean
}
