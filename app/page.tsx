import { Header } from "@/components/header"
import { SidebarNav } from "@/components/sidebar-nav"
import { Hero } from "@/components/hero"
import { Partner } from "@/components/partner"
import { Products } from "@/components/products"
import { Services } from "@/components/services"
import { About } from "@/components/about"
import { Contact } from "@/components/contact"
import { Footer } from "@/components/footer"

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
