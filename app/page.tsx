"use client"

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
import { sectionsConfig, fetchConfig } from "@/config/client"
import { useState, useEffect } from "react"

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

  const [dynamicSectionsConfig, setDynamicSectionsConfig] = useState(sectionsConfig)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await fetchConfig()
        if (config.homeOrder?.sections) {
          setDynamicSectionsConfig(config.homeOrder.sections)
        }
      } catch (error) {
        console.error('Failed to load dynamic config:', error)
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <SidebarNav />
        <main className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">加载中...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SidebarNav />
      <main>
        {dynamicSectionsConfig
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
