import { headers } from 'next/headers'
import { loadPageData } from '@/lib/initial-data'
import { ModuleRenderer } from '@/modules/renderer'
import { serverLogger } from '@/lib/server-logger'
import { parseUserAgent } from '@/lib/device-utils'

interface GenericPageProps {
  pageId: string
  orderConfigKey?: string
  extraConfig?: Record<string, unknown>
  wrapperClassName?: string
}

export async function GenericPage({ 
  pageId, 
  extraConfig,
  wrapperClassName 
}: GenericPageProps) {
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || ''
  const deviceInfo = parseUserAgent(userAgent)
  
  serverLogger.info('GenericPage rendering started', { 
    pageId, 
    deviceInfo,
    userAgent
  })
  
  try {
    const pageData = loadPageData(pageId, extraConfig)
    
    serverLogger.info('GenericPage pageData loaded', {
      pageId,
      moduleCount: pageData.data?.length || 0,
      moduleIds: pageData.data?.map((m: any) => m.moduleId) || []
    })
    
    const modules = pageData.data || []
    const content = <ModuleRenderer modules={modules} />
    
    serverLogger.info('GenericPage rendering completed', { pageId })
    
    if (wrapperClassName) {
      return <div className={wrapperClassName}>{content}</div>
    }
    return content
  } catch (error: any) {
    serverLogger.error('GenericPage rendering failed', {
      pageId,
      error: error?.message || String(error),
      stack: error?.stack,
      deviceInfo,
      userAgent
    })
    throw error
  }
}
