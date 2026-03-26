import { ModuleRenderer } from '@/modules/renderer'
import { loadInitialData } from '@/lib/initial-data'

export default async function NewsDetailPage() {
  const initialData = await loadInitialData()

  // Create news detail module data
  const newsDetailModule = {
    moduleName: '新闻详情',
    moduleId: 'news-detail',
    moduleInstanceId: `news-detail-${Date.now()}`,
    data: {
      showAuthor: true,
      showDate: true,
      showRelated: true,
      relatedCount: 3,
      showShare: true,
      showComments: false
    }
  }

  return (
    <div>
      <ModuleRenderer modules={[newsDetailModule]} />
    </div>
  )
}