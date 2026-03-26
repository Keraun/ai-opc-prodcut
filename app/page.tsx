import { Header } from "@/components/common/header"
import { Footer } from "@/components/common/footer"
import { loadInitialData } from "@/lib/initial-data"
import { ModuleRenderer } from "@/modules/renderer"
import { initializeModules } from "@/modules/init"
import { SidebarNavModule } from "@/modules/sidebar-nav/register"
import styles from "./home.module.css"

initializeModules()

export default function Home() {
  const initialData = loadInitialData()
  const { data } = initialData
  const modules = data.modules || []

  return (
    <div className={styles.homeContainer}>
      <Header />
      <SidebarNavModule data={{}} />
      <main>
        <ModuleRenderer modules={modules} />
      </main>
      <Footer />
    </div>
  )
}
