import { GenericPage } from '@/components/common/GenericPage'
import styles from './home.module.css'

// 明确设置为动态渲染，确保每次请求都获取最新数据
export const dynamic = 'force-dynamic'

export default function Home() {
   return <GenericPage 
    pageId="home" 
    wrapperClassName={styles.homeContainer}
  />
}
