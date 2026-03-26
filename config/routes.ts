import "server-only"
import fs from 'fs'
import path from 'path'

export interface RouteConfig {
  slug: string
  pageId: string
  orderConfigKey?: string
  title?: string
  description?: string
}

let routesCache: RouteConfig[] | null = null

function loadRoutesFromConfig(): RouteConfig[] {
  if (routesCache) {
    return routesCache
  }

  try {
    const configPath = path.join(
      process.cwd(),
      'config/json/runtime/routes.json'
    )

    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf-8')
      const data = JSON.parse(content)
      routesCache = data.routes || []
      return routesCache
    }
  } catch (error) {
    console.error('Error loading routes config:', error)
  }

  return []
}

export const routeConfigs: RouteConfig[] = loadRoutesFromConfig()

export function getRouteConfig(slug: string): RouteConfig | undefined {
  const routes = loadRoutesFromConfig()
  return routes.find(route => route.slug === slug)
}

export function getAllSlugs(): string[] {
  const routes = loadRoutesFromConfig()
  return routes.map(route => route.slug)
}
