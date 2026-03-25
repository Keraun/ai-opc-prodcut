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
import { sectionsConfig } from "@/config/client"

export default function Home() {
  // 区块组件映射
  const sectionComponents: Record<string, React.ReactNode> = {
    hero: <Hero />,
    partner: <Partner />,
    products: <Products />,
    services: <Services />,
    pricing: <Pricing />,
    about: <About />,
    contact: <Contact />
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SidebarNav />
      <main>
        {sectionsConfig
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .filter(section => section.visible !== false)
          .map(section => (
            <div key={section.id}>
              {sectionComponents[section.id]}
            </div>
          ))}
      </main>
      <Footer />
    </div>
  )
}
