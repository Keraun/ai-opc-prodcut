import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api-utils'
import { readConfig } from '@/lib/config-manager'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const configType = searchParams.get('type')
  
  const configs: Record<string, any> = {
    site: readConfig('site') || {},
    'site-header': readConfig('site-header') || {},
    'site-footer': readConfig('site-footer') || {}
  }
  
  if (configType && configs[configType]) {
    return successResponse(configs[configType])
  }
  
  return successResponse(configs)
}
