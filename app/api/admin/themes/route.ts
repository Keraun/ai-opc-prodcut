import { NextRequest } from "next/server"
import { 
  getThemeList, 
  writeConfig 
} from "@/lib/config-manager"
import { 
  wrapAuthApiHandler, 
  successResponse, 
  badRequestResponse, 
  errorResponse
} from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  return wrapAuthApiHandler(async () => {
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
      const body = await request.json()
      const { themeId } = body
      
      if (!themeId) {
        return badRequestResponse('缺少主题ID')
      }
      
      const existingThemes = getThemeList()
      const themesMap: Record<string, any> = {}
      let currentTheme = existingThemes.find(t => t.isCurrent)?.themeId || 'modern'
      
      existingThemes.forEach(theme => {
        themesMap[theme.themeId] = theme.themeConfig
      })
      
      themesMap[themeId] = body
      
      writeConfig('theme', {
        currentTheme,
        themes: themesMap
      })
      
      return successResponse({ themeId }, '主题创建成功', 201)
    } catch (error) {
      console.error('创建主题失败:', error)
      return errorResponse('创建主题失败')
    }
  })
}

export async function PUT(request: NextRequest) {
  return wrapAuthApiHandler(async () => {
    try {
      const body = await request.json()
      const { themeId } = body
      
      if (!themeId) {
        return badRequestResponse('缺少主题ID')
      }
      
      const existingThemes = getThemeList()
      const themesMap: Record<string, any> = {}
      let currentTheme = existingThemes.find(t => t.isCurrent)?.themeId || 'modern'
      
      existingThemes.forEach(theme => {
        themesMap[theme.themeId] = theme.themeConfig
      })
      
      themesMap[themeId] = body
      
      if (body.isCurrent) {
        currentTheme = themeId
      }
      
      writeConfig('theme', {
        currentTheme,
        themes: themesMap
      })
      
      return successResponse({ themeId }, '主题更新成功')
    } catch (error) {
      console.error('更新主题失败:', error)
      return errorResponse('更新主题失败')
    }
  })
}

export async function DELETE(request: NextRequest) {
  return wrapAuthApiHandler(async () => {
    try {
      const { searchParams } = new URL(request.url)
      const themeId = searchParams.get('themeId')
      
      if (!themeId) {
        return badRequestResponse('缺少主题ID')
      }
      
      // 获取现有主题列表
      const existingThemes = getThemeList()
      const themesMap: Record<string, any> = {}
      let currentTheme = existingThemes.find(t => t.isCurrent)?.themeId || 'modern'
      
      // 构建主题映射，排除要删除的主题
      existingThemes.forEach(theme => {
        if (theme.themeId !== themeId) {
          themesMap[theme.themeId] = theme.themeConfig
        }
      })
      
      // 如果删除的是当前主题，设置第一个主题为当前主题
      if (currentTheme === themeId && Object.keys(themesMap).length > 0) {
        currentTheme = Object.keys(themesMap)[0]
      }
      
      // 保存主题配置
      writeConfig('theme', {
        currentTheme,
        themes: themesMap
      })
      
      return successResponse({ themeId }, '主题删除成功')
    } catch (error) {
      console.error('删除主题失败:', error)
      return errorResponse('删除主题失败')
    }
  })
}
