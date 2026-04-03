import { BaseRepository } from './BaseRepository'

export interface LLMModel {
  id?: number
  name: string
  value: string
  is_default: boolean
  created_at?: string
  updated_at?: string
}

export class LLMModelRepository extends BaseRepository<LLMModel> {
  constructor() {
    super('llm_models', 'id')
  }

  protected mapRowToEntity(row: any): LLMModel {
    return {
      id: row.id,
      name: row.name,
      value: row.value,
      is_default: row.is_default,
      created_at: row.created_at,
      updated_at: row.updated_at
    }
  }

  protected mapEntityToRow(entity: Partial<LLMModel>): Record<string, any> {
    const row: Record<string, any> = {
      updated_at: new Date().toISOString()
    }
    
    if (entity.name !== undefined) {
      row.name = entity.name
    }
    if (entity.value !== undefined) {
      row.value = entity.value
    }
    if (entity.is_default !== undefined) {
      row.is_default = entity.is_default
    }
    
    return row
  }

  findDefaultModel(): LLMModel | null {
    return this.findByField('is_default', true)
  }

  setDefaultModel(id: number): boolean {
    // 先将所有模型的is_default设置为false
    const allModels = this.findAll()
    for (const model of allModels) {
      this.update(model.id!, { is_default: false })
    }
    // 然后将指定模型的is_default设置为true
    return this.update(id, { is_default: true })
  }

  findByValue(value: string): LLMModel | null {
    return this.findByField('value', value)
  }
}