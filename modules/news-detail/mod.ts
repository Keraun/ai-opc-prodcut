import { NewsDetailModule } from './index'
import schema from './schema.json'
import defaultData from './default.json'

export const module = {
  id: 'news-detail',
  name: '资讯详情',
  component: NewsDetailModule,
  schema,
  defaultData
}