import { Header } from "@/components/common/header"
import { SidebarNav } from "@/components/home/sidebar-nav"
import { Footer } from "@/components/common/footer"
import { loadInitialData } from "@/lib/initial-data"
import { ModuleRenderer } from "@/modules/renderer"
import { initializeModules } from "@/modules/init"
import styles from "./home.module.css"

initializeModules()

export default function Home() {
  const initialData = loadInitialData()
  const { data } = initialData
  const modules = data.modules || []

  return (
    <div className={styles.homeContainer}>
      <Header />
      <SidebarNav />
      <main>
        <ModuleRenderer modules={modules} />
      </main>
      <Footer />
    </div>
  )
}
