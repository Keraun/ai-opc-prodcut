import { ModuleRenderer } from '@/modules/renderer'
import { loadPageData } from '@/lib/initial-data'

export default function ProductsPage() {
  const pageData = loadPageData('products', 'productsOrder')
  const modules = pageData.data.modules || []

  return <ModuleRenderer modules={modules} />
}
