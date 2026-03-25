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

export interface ThemeLayout {
  headerStyle: string
  footerStyle: string
  cardStyle: string
  buttonStyle: string
}

export interface ThemeEffects {
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

export interface ThemeData {
  currentTheme: string
  themes: Record<string, ThemeConfig>
}

export interface Configs {
  site: any
  common: any
  seo: any
  navigation: any
  footer: any
  home: any
  homeOrder: any
  homeBanner: any
  homePartners: any
  homeProducts: any
  homeServices: any
  homePricing: any
  homeAbout: any
  homeContact: any
  products: any
  otherPages: any
  custom: any
  account: any
  loginLogs: any
  theme: ThemeData
}

export interface ConfigType {
  key: string
  name: string
  icon: string
  description: string
}

export interface VersionData {
  timestamp: string
  data: any
}

export interface DiffLine {
  lineNumber: number
  content: string
  type: 'added' | 'removed' | 'unchanged' | 'modified'
}

export interface CompareResult {
  oldLines: DiffLine[]
  newLines: DiffLine[]
}
