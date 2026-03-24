import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <section className="py-24 md:py-32 bg-gradient-to-br from-slate-50 via-white to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                工具中心
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                探索我们的强大工具集，提升您的工作效率
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">工具开发中</h3>
                <p className="text-gray-600">更多精彩工具即将上线，敬请期待</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
