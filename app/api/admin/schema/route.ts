import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

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
  'theme': 'site-schema.json'
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  if (!type || !schemaMap[type]) {
    return NextResponse.json(
      { error: 'Invalid schema type' },
      { status: 400 }
    )
  }

  try {
    const schemaPath = path.join(
      process.cwd(),
      'config/json/form-schema',
      schemaMap[type]
    )
    
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8')
    const schema = JSON.parse(schemaContent)

    return NextResponse.json(schema)
  } catch (error) {
    console.error('Error reading schema:', error)
    return NextResponse.json(
      { error: 'Failed to load schema' },
      { status: 500 }
    )
  }
}
