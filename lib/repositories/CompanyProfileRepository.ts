import { BaseRepository } from './BaseRepository'

export interface CompanyProfile {
  id?: number
  name: string
  company_name: string
  industry: string
  company_advantages?: string
  key_data?: string
  is_default: boolean
  created_at?: string
  updated_at?: string
}

export class CompanyProfileRepository extends BaseRepository<CompanyProfile> {
  constructor() {
    super('company_profiles', 'id')
  }

  protected mapRowToEntity(row: any): CompanyProfile {
    return {
      id: row.id,
      name: row.name,
      company_name: row.company_name,
      industry: row.industry,
      company_advantages: row.company_advantages,
      key_data: row.key_data,
      is_default: row.is_default,
      created_at: row.created_at,
      updated_at: row.updated_at
    }
  }

  protected mapEntityToRow(entity: Partial<CompanyProfile>): Record<string, any> {
    const row: Record<string, any> = {
      updated_at: new Date().toISOString()
    }
    
    if (entity.name !== undefined) {
      row.name = entity.name
    }
    if (entity.company_name !== undefined) {
      row.company_name = entity.company_name
    }
    if (entity.industry !== undefined) {
      row.industry = entity.industry
    }
    if (entity.company_advantages !== undefined) {
      row.company_advantages = entity.company_advantages
    }
    if (entity.key_data !== undefined) {
      row.key_data = entity.key_data
    }
    if (entity.is_default !== undefined) {
      row.is_default = entity.is_default
    }
    if (!entity.id) {
      row.created_at = new Date().toISOString()
    }
    
    return row
  }

  findDefaultProfile(): CompanyProfile | null {
    return this.findByField('is_default', true)
  }

  setDefaultProfile(id: number): boolean {
    const allProfiles = this.findAll()
    for (const profile of allProfiles) {
      this.update(profile.id!, { is_default: false })
    }
    return this.update(id, { is_default: true })
  }

  findByName(name: string): CompanyProfile | null {
    return this.findByField('name', name)
  }
}
