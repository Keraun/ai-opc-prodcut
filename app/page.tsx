import { Header } from "@/components/common/header"
import { SidebarNav } from "@/components/home/sidebar-nav"
import { Hero } from "@/components/home/hero"
import { Partner } from "@/components/home/partner"
import { Products } from "@/components/home/products"
import { Services } from "@/components/home/services"
import { About } from "@/components/home/about"
import { Contact } from "@/components/home/contact"
import { Footer } from "@/components/common/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SidebarNav />
      <main>
        <Hero />
        <Partner />
        <Products />
        <Services />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
