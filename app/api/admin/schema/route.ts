import { NextRequest } from 'next/server'
import fs from 'fs'
import path from 'path'
import { wrapApiHandler, successResponse, badRequestResponse, errorResponse } from '@/lib/api-utils'

const schemaMap: Record<string, string> = {
  'article': 'article-schema.json',
  'site': 'site-schema.json',
  'navigation': 'navigation-schema.json',
  'footer': 'footer-schema.json',
  'homeBanner': 'homeBanner-schema.json',
  'homeProducts': 'homeProducts-schema.json',
  'homeServices': 'homeServices-schema.json',
  'homeAbout': 'homeAbout-schema.json',
  'homePartners': 'homePartners-schema.json',
  'homePricing': 'homePricing-schema.json',
  'homeContact': 'homeContact-schema.json',
  'products': 'products-schema.json',
  'home': 'site-schema.json',
  'homeOrder': 'site-schema.json',
  'otherPages': 'site-schema.json',
  'custom': 'site-schema.json',
  'theme': 'site-schema.json',
  'feishu-app': 'feishu-app-schema.json'
}

export async function GET(request: NextRequest) {
  return wrapApiHandler(async () => {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    if (!type || !schemaMap[type]) {
      return badRequestResponse('Invalid schema type')
    }

    const schemaPath = path.join(
      process.cwd(),
      'config/json/form-schema',
      schemaMap[type]
    )
    
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8')
    const schema = JSON.parse(schemaContent)

    return successResponse(schema)
  })
}
