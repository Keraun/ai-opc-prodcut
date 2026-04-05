import { GenericPage } from '@/components/common/GenericPage'
import styles from './home.module.css'

// 设置页面缓存为2小时
export const revalidate = 7200

export default function Home() {
   return <GenericPage 
    pageId="home" 
    wrapperClassName={styles.homeContainer}
  />
}
