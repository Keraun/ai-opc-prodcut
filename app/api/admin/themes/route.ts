import { NextRequest } from "next/server"
import { 
  getThemeList, 
  writeConfig 
} from "@/lib/config-manager"
import { 
  wrapAuthApiHandler, 
  wrapApiHandler,
  successResponse, 
  badRequestResponse, 
  errorResponse
} from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  return wrapApiHandler(async () => {
    const { searchParams } = new URL(request.url)
    const onlyCurrent = searchParams.get('onlyCurrent') === 'true'
    
    try {
      const themes = getThemeList(onlyCurrent)
      return successResponse(themes)
    } catch (error) {
      console.error('获取主题列表失败:', error)
      return errorResponse('获取主题列表失败')
    }
  })
}

export async function POST(request: NextRequest) {
  return wrapAuthApiHandler(async () => {
    try {
      const { searchParams } = new URL(request.url)
      const action = searchParams.get('action') || 'create'
      const body = await request.json()
      
      switch (action) {
        case 'create':
          return handleCreateTheme(body)
        case 'update':
          return handleUpdateTheme(body)
        case 'delete':
          return handleDeleteTheme(body)
        case 'setCurrent':
          return handleSetCurrentTheme(body)
        default:
          return badRequestResponse('无效的操作类型')
      }
    } catch (error) {
      console.error('主题操作失败:', error)
      return errorResponse('主题操作失败')
    }
  })
}

async function handleCreateTheme(body: any) {
  const { themeId, themeName, ...configData } = body
  
  if (!themeId) {
    return badRequestResponse('缺少主题ID')
  }
  
  const existingThemes = getThemeList()
  
  if (existingThemes.find(t => t.themeId === themeId)) {
    return badRequestResponse('主题ID已存在')
  }
  
  const themesMap: Record<string, any> = {}
  let currentTheme = existingThemes.find(t => t.isCurrent)?.themeId || 'modern'
  
  existingThemes.forEach(theme => {
    themesMap[theme.themeId] = {
      ...theme.themeConfig,
      themeName: theme.themeName
    }
  })
  
  themesMap[themeId] = {
    ...configData,
    themeName: themeName || themeId
  }
  
  writeConfig('theme', {
    currentTheme,
    themes: themesMap
  })
  
  return successResponse({ themeId }, '主题创建成功', 201)
}

async function handleUpdateTheme(body: any) {
  const { themeId, themeName, isCurrent, ...configData } = body
  
  if (!themeId) {
    return badRequestResponse('缺少主题ID')
  }
  
  const existingThemes = getThemeList()
  const existingTheme = existingThemes.find(t => t.themeId === themeId)
  
  if (!existingTheme) {
    return badRequestResponse('主题不存在')
  }
  
  const themesMap: Record<string, any> = {}
  let currentTheme = existingThemes.find(t => t.isCurrent)?.themeId || 'modern'
  
  existingThemes.forEach(theme => {
    if (theme.themeId === themeId) {
      themesMap[theme.themeId] = {
        ...configData,
        themeName: themeName || theme.themeName
      }
    } else {
      themesMap[theme.themeId] = {
        ...theme.themeConfig,
        themeName: theme.themeName
      }
    }
  })
  
  if (isCurrent) {
    currentTheme = themeId
  }
  
  writeConfig('theme', {
    currentTheme,
    themes: themesMap
  })
  
  return successResponse({ themeId }, '主题更新成功')
}

async function handleDeleteTheme(body: any) {
  const { themeId } = body
  
  if (!themeId) {
    return badRequestResponse('缺少主题ID')
  }
  
  const existingThemes = getThemeList()
  const existingTheme = existingThemes.find(t => t.themeId === themeId)
  
  if (!existingTheme) {
    return badRequestResponse('主题不存在')
  }
  
  const themesMap: Record<string, any> = {}
  let currentTheme = existingThemes.find(t => t.isCurrent)?.themeId || 'modern'
  
  existingThemes.forEach(theme => {
    if (theme.themeId !== themeId) {
      themesMap[theme.themeId] = {
        ...theme.themeConfig,
        themeName: theme.themeName
      }
    }
  })
  
  if (currentTheme === themeId && Object.keys(themesMap).length > 0) {
    currentTheme = Object.keys(themesMap)[0]
  }
  
  writeConfig('theme', {
    currentTheme,
    themes: themesMap
  })
  
  return successResponse({ themeId }, '主题删除成功')
}

async function handleSetCurrentTheme(body: any) {
  const { themeId } = body
  
  if (!themeId) {
    return badRequestResponse('缺少主题ID')
  }
  
  const existingThemes = getThemeList()
  const themesMap: Record<string, any> = {}
  
  existingThemes.forEach(theme => {
    themesMap[theme.themeId] = {
      ...theme.themeConfig,
      themeName: theme.themeName
    }
  })
  
  if (!themesMap[themeId]) {
    return badRequestResponse('主题不存在')
  }
  
  writeConfig('theme', {
    currentTheme: themeId,
    themes: themesMap
  })
  
  return successResponse({ themeId }, '主题设置成功')
}
