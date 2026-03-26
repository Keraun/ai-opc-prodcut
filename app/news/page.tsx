import { ModuleRenderer } from '@/modules/renderer'
import { loadInitialData } from '@/lib/initial-data'

export default async function NewsPage() {
  const initialData = await loadInitialData()

  // Create news list module data
  const newsListModule = {
    moduleName: '新闻列表',
    moduleId: 'news-list',
    moduleInstanceId: `news-list-${Date.now()}`,
    data: {
      title: '资讯中心',
      subtitle: '最新行业动态、深度分析与实战案例',
      showDate: true,
      showSummary: true,
      itemsPerPage: 10
    }
  }

  return (
    <div>
      <ModuleRenderer modules={[newsListModule]} />
    </div>
  )
}