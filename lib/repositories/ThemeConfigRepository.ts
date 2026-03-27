import { BaseRepository } from './BaseRepository'
import { safeJsonParse } from '../json-utils'

export interface ThemeConfig {
  id?: number
  themeId: string
  themeName: string
  themeConfig: any
  createdAt?: string
  updatedAt?: string
}

export class ThemeConfigRepository extends BaseRepository<ThemeConfig> {
  constructor() {
    super('theme_config', 'id')
  }

  protected mapRowToEntity(row: any): ThemeConfig {
    return {
      id: row.id,
      themeId: row.theme_id,
      themeName: row.theme_name,
      themeConfig: safeJsonParse(row.theme_config, {}),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }

  protected mapEntityToRow(entity: Partial<ThemeConfig>): Record<string, any> {
    return {
      theme_id: entity.themeId,
      theme_name: entity.themeName,
      theme_config: typeof entity.themeConfig === 'string' 
        ? entity.themeConfig 
        : JSON.stringify(entity.themeConfig)
    }
  }

  findByThemeId(themeId: string): ThemeConfig | null {
    return this.findByField('theme_id', themeId)
  }

  findAllThemes(): Record<string, any> {
    const themes = this.findAll()
    const themesMap: Record<string, any> = {}
    themes.forEach(theme => {
      themesMap[theme.themeId] = theme.themeConfig
    })
    return themesMap
  }

  saveThemes(themes: Record<string, any>): void {
    this.withDatabase(db => {
      db.prepare('DELETE FROM theme_config').run()
      
      const insertStmt = db.prepare(`
        INSERT INTO theme_config (theme_id, theme_name, theme_config)
        VALUES (?, ?, ?)
      `)
      
      for (const [themeId, themeData] of Object.entries(themes)) {
        const theme = themeData as any
        insertStmt.run(
          themeId,
          theme.name || themeId,
          JSON.stringify(theme)
        )
      }
    })
  }
}
