import { BaseRepository } from './BaseRepository'
import { safeJsonParse, safeJsonStringify } from '../json-utils'

export interface ThemeConfig {
  id?: number
  themeId: string
  themeName: string
  themeSetting: any
  isCurrent: boolean
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
      themeSetting: safeJsonParse(row.theme_setting, {}),
      isCurrent: row.is_current === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }

  protected mapEntityToRow(entity: Partial<ThemeConfig>): Record<string, any> {
    return {
      theme_id: entity.themeId,
      theme_name: entity.themeName,
      theme_setting: entity.themeSetting ? safeJsonStringify(entity.themeSetting) : '{}',
      is_current: entity.isCurrent ? 1 : 0
    }
  }

  findByThemeId(themeId: string): ThemeConfig | null {
    return this.findByField('theme_id', themeId)
  }

  getCurrentTheme(): ThemeConfig | null {
    return this.findByField('is_current', 1)
  }

  setCurrentTheme(themeId: string): boolean {
    const themes = this.findAll()
    for (const theme of themes) {
      this.update(theme.id!, { isCurrent: theme.themeId === themeId })
    }
    return true
  }

  getAllThemes(): ThemeConfig[] {
    return this.findAll()
  }
}
