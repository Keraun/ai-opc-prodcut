"use client"

import { Card } from "@arco-design/web-react"
import styles from "../../dashboard.module.css"

interface ThemeConfig {
  id: string
  name: string
  description: string
  colors: {
    primary: string
    secondary: string
    accent: string
    [key: string]: any
  }
  [key: string]: any
}

interface ThemeData {
  currentTheme: string
  themes: Record<string, ThemeConfig>
}

interface ThemeSelectorProps {
  themeData: ThemeData
  onThemeChange: (themeId: string) => void
}

export function ThemeSelector({ themeData, onThemeChange }: ThemeSelectorProps) {
  return (
    <Card title="主题皮肤选择">
      <div className={styles.themeSection}>
        <p className={styles.themeDescription}>选择您喜欢的主题皮肤,不同主题有不同的配色方案和布局风格。</p>
      </div>
      
      <div className={styles.themeGrid}>
        {themeData && themeData.themes && Object.entries(themeData.themes).map(([key, theme]) => (
          <div
            key={key}
            className={`${styles.themeCard} ${themeData.currentTheme === key ? styles.themeCardActive : styles.themeCardInactive}`}
            onClick={() => onThemeChange(key)}
          >
            {themeData.currentTheme === key && (
              <div className={styles.themeCheckmark}>
                <div className={styles.themeCheckmarkCircle}>
                  <svg className={styles.themeCheckmarkSvg} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
            
            <div className={styles.themePreview}>
              <div 
                className={styles.themePreviewBar}
                style={{
                  background: `linear-gradient(135deg, ${theme.colors?.primary || '#1e40af'} 0%, ${theme.colors?.secondary || '#3b82f6'} 100%)`
                }}
              />
            </div>
            
            <div className={styles.themeInfo}>
              <h3 className={styles.themeName}>{theme.themeName || theme.name || key}</h3>
              <div className={styles.themeColors}>
                <div 
                  className={styles.themeColorDot}
                  style={{ backgroundColor: theme.colors?.primary || '#1e40af' }}
                  title="主色"
                />
                <div 
                  className={styles.themeColorDot}
                  style={{ backgroundColor: theme.colors?.secondary || '#3b82f6' }}
                  title="辅助色"
                />
                <div 
                  className={styles.themeColorDot}
                  style={{ backgroundColor: theme.colors?.accent || '#06b6d4' }}
                  title="强调色"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
