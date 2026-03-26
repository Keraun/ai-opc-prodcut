import { loadPageData } from '@/lib/initial-data'
import { ModuleRenderer } from '@/modules/renderer'

interface GenericPageProps {
  pageId: string
  orderConfigKey?: string
  extraConfig?: Record<string, unknown>
  wrapperClassName?: string
}

export async function GenericPage({ 
  pageId, 
  orderConfigKey, 
  extraConfig,
  wrapperClassName 
}: GenericPageProps) {
  const pageData = loadPageData(pageId, orderConfigKey, extraConfig)
  const modules = pageData.data.modules || []
  const content = <ModuleRenderer modules={modules} />
  if (wrapperClassName) {
    return <div className={wrapperClassName}>{content}</div>
  }
  return content
}
