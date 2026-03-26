import { NewsListModule } from './index'
import schema from './schema.json'
import defaultData from './default.json'

export const module = {
  id: 'news-list',
  name: '资讯列表',
  component: NewsListModule,
  schema,
  defaultData
}