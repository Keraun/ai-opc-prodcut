import { BaseRepository } from './BaseRepository'

export interface Prompt {
  id?: number
  name: string
  prompt_content: string
  is_default: boolean
  created_at?: string
  updated_at?: string
}

export class PromptRepository extends BaseRepository<Prompt> {
  constructor() {
    super('prompts', 'id')
  }

  protected mapRowToEntity(row: any): Prompt {
    return {
      id: row.id,
      name: row.name,
      prompt_content: row.prompt_content,
      is_default: row.is_default,
      created_at: row.created_at,
      updated_at: row.updated_at
    }
  }

  protected mapEntityToRow(entity: Partial<Prompt>): Record<string, any> {
    const row: Record<string, any> = {
      updated_at: new Date().toISOString()
    }
    
    if (entity.name !== undefined) {
      row.name = entity.name
    }
    if (entity.prompt_content !== undefined) {
      row.prompt_content = entity.prompt_content
    }
    if (entity.is_default !== undefined) {
      row.is_default = entity.is_default
    }
    if (!entity.id) {
      row.created_at = new Date().toISOString()
    }
    
    return row
  }

  findDefaultPrompt(): Prompt | null {
    return this.findByField('is_default', true)
  }

  setDefaultPrompt(id: number): boolean {
    const allPrompts = this.findAll()
    for (const prompt of allPrompts) {
      this.update(prompt.id!, { is_default: false })
    }
    return this.update(id, { is_default: true })
  }

  findByName(name: string): Prompt | null {
    return this.findByField('name', name)
  }
}
