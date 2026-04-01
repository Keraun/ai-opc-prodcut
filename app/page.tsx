import { GenericPage } from '@/components/common/GenericPage'
import styles from './home.module.css'

export default function Home() {
  return <GenericPage 
    pageId="home" 
    wrapperClassName={styles.homeContainer}
  />
}
