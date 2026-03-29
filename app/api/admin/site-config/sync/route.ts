import { NextRequest } from "next/server"
import { syncSiteRootToAllPages, syncSiteFooterToAllPages } from "@/lib/config-manager"
import { wrapAuthApiHandler, successResponse, errorResponse } from "@/lib/api-utils"

export async function POST(request: NextRequest) {
  return wrapAuthApiHandler(async () => {
    try {
      const body = await request.json()
      const { siteRootData, siteFooterData } = body

      const results: {
        siteRoot?: { success: boolean; syncedPages: string[]; message?: string }
        siteFooter?: { success: boolean; syncedPages: string[]; message?: string }
      } = {}

      if (siteRootData) {
        results.siteRoot = syncSiteRootToAllPages(siteRootData)
      }

      if (siteFooterData) {
        results.siteFooter = syncSiteFooterToAllPages(siteFooterData)
      }

      const allSuccess = 
        (!siteRootData || results.siteRoot?.success) && 
        (!siteFooterData || results.siteFooter?.success)

      if (allSuccess) {
        const messages: string[] = []
        if (results.siteRoot) {
          messages.push(`站点配置: ${results.siteRoot.message}`)
        }
        if (results.siteFooter) {
          messages.push(`页脚配置: ${results.siteFooter.message}`)
        }
        
        return successResponse({
          results,
          message: messages.join('；')
        })
      } else {
        return errorResponse('部分同步失败')
      }
    } catch (error) {
      console.error('Error syncing site config:', error)
      return errorResponse('同步站点配置失败')
    }
  })
}
