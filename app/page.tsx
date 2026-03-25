import { Header } from "@/components/common/header"
import { SidebarNav } from "@/components/home/sidebar-nav"
import { Hero } from "@/components/home/hero"
import { Partner } from "@/components/home/partner"
import { Products } from "@/components/home/products"
import { Services } from "@/components/home/services"
import { Pricing } from "@/components/home/pricing"
import { About } from "@/components/home/about"
import { Contact } from "@/components/home/contact"
import { Footer } from "@/components/common/footer"
import { loadInitialData } from "@/lib/initial-data"

// 区块组件映射
const sectionComponents: Record<string, React.ComponentType<{ data: any }>> = {
  hero: Hero,
  partner: Partner,
  products: Products,
  services: Services,
  pricing: Pricing,
  about: About,
  contact: Contact
}

export default function Home() {
  // 服务端直接读取配置（SSR）
  const initialData = loadInitialData()
  const { data } = initialData
  
  // 获取模块顺序和数据
  const module = data.module || []
  const moduleData = data.moduleData || []

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SidebarNav />
      <main>
        {module.map((moduleId: string, index: number) => {
          const Component = sectionComponents[moduleId]
          if (!Component) return null
          
          // 获取对应模块的数据
          const moduleConfig = moduleData[index]?.data || {}
          
          return (
            <div key={moduleId}>
              <Component data={moduleConfig} />
            </div>
          )
        })}
      </main>
      <Footer />
    </div>
  )
}
