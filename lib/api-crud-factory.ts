import { NextRequest } from 'next/server'
import {
  wrapAuthApiHandler,
  successResponse,
  badRequestResponse,
  notFoundResponse,
  validateRequired
} from './api-utils'

export interface CrudRepository<T> {
  findAll(): T[]
  findById(id: string | number): T | null
  create(data: any): T
  update(id: string | number, data: any): boolean
  delete(id: string | number): boolean
}

export interface CrudOptions<T> {
  entityName: string
  repository: CrudRepository<T>
  idField?: keyof T
  requiredCreateFields?: string[]
  requiredUpdateFields?: string[]
  validateCreate?: (data: any) => { valid: boolean; error?: string }
  validateUpdate?: (id: string | number, data: any) => { valid: boolean; error?: string }
  transformCreateData?: (data: any) => any
  transformUpdateData?: (data: any) => any
  beforeCreate?: (data: any) => Promise<void> | void
  afterCreate?: (entity: T) => Promise<void> | void
  beforeUpdate?: (id: string | number, data: any) => Promise<void> | void
  afterUpdate?: (id: string | number, entity: T) => Promise<void> | void
  beforeDelete?: (id: string | number) => Promise<void> | void
  afterDelete?: (id: string | number) => Promise<void> | void
}

export function createCrudRoutes<T extends { id?: string | number }>(options: CrudOptions<T>) {
  const {
    entityName,
    repository,
    idField = 'id',
    requiredCreateFields = [],
    requiredUpdateFields = [],
    validateCreate,
    validateUpdate,
    transformCreateData = (data) => data,
    transformUpdateData = (data) => data,
    beforeCreate,
    afterCreate,
    beforeUpdate,
    afterUpdate,
    beforeDelete,
    afterDelete
  } = options

  async function GET(request: NextRequest) {
    return wrapAuthApiHandler(async () => {
      const { searchParams } = new URL(request.url)
      const id = searchParams.get('id')
      
      if (id) {
        const entity = repository.findById(id)
        if (!entity) {
          return notFoundResponse(`${entityName} not found`)
        }
        return successResponse(entity)
      }
      
      const entities = repository.findAll()
      return successResponse(entities)
    })
  }

  async function POST(request: NextRequest) {
    return wrapAuthApiHandler(async () => {
      const body = await request.json()
      
      if (requiredCreateFields.length > 0) {
        const validation = validateRequired(body, requiredCreateFields)
        if (!validation.valid) {
          return badRequestResponse(`缺少必填字段: ${validation.missingFields.join(', ')}`)
        }
      }
      
      if (validateCreate) {
        const validation = validateCreate(body)
        if (!validation.valid) {
          return badRequestResponse(validation.error || 'Validation failed')
        }
      }
      
      const data = transformCreateData(body)
      
      if (beforeCreate) {
        await beforeCreate(data)
      }
      
      const entity = repository.create(data)
      
      if (afterCreate) {
        await afterCreate(entity)
      }
      
      return successResponse(entity, `${entityName} created successfully`)
    })
  }

  async function PUT(request: NextRequest) {
    return wrapAuthApiHandler(async () => {
      const body = await request.json()
      const { searchParams } = new URL(request.url)
      const id = searchParams.get('id') || body[idField as string]
      
      if (!id) {
        return badRequestResponse('ID is required')
      }
      
      const existingEntity = repository.findById(id)
      if (!existingEntity) {
        return notFoundResponse(`${entityName} not found`)
      }
      
      if (requiredUpdateFields.length > 0) {
        const validation = validateRequired(body, requiredUpdateFields)
        if (!validation.valid) {
          return badRequestResponse(`缺少必填字段: ${validation.missingFields.join(', ')}`)
        }
      }
      
      if (validateUpdate) {
        const validation = validateUpdate(id, body)
        if (!validation.valid) {
          return badRequestResponse(validation.error || 'Validation failed')
        }
      }
      
      const data = transformUpdateData(body)
      
      if (beforeUpdate) {
        await beforeUpdate(id, data)
      }
      
      const success = repository.update(id, data)
      
      if (!success) {
        return badRequestResponse(`Failed to update ${entityName}`)
      }
      
      const updatedEntity = repository.findById(id)!
      
      if (afterUpdate) {
        await afterUpdate(id, updatedEntity)
      }
      
      return successResponse(updatedEntity, `${entityName} updated successfully`)
    })
  }

  async function DELETE(request: NextRequest) {
    return wrapAuthApiHandler(async () => {
      const { searchParams } = new URL(request.url)
      const id = searchParams.get('id')
      
      if (!id) {
        return badRequestResponse('ID is required')
      }
      
      const existingEntity = repository.findById(id)
      if (!existingEntity) {
        return notFoundResponse(`${entityName} not found`)
      }
      
      if (beforeDelete) {
        await beforeDelete(id)
      }
      
      const success = repository.delete(id)
      
      if (!success) {
        return badRequestResponse(`Failed to delete ${entityName}`)
      }
      
      if (afterDelete) {
        await afterDelete(id)
      }
      
      return successResponse(undefined, `${entityName} deleted successfully`)
    })
  }

  return { GET, POST, PUT, DELETE }
}
