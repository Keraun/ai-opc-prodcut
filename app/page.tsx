import { loadPageData } from "@/lib/initial-data"
import { ModuleRenderer } from "@/modules/renderer"
import styles from "./home.module.css"

export default function Home() {
  const pageData = loadPageData('home', 'homeOrder')
  const { data } = pageData
  const modules = data.modules || []

  return (
    <div className={styles.homeContainer}>
      <ModuleRenderer modules={modules} />
    </div>
  )
}
