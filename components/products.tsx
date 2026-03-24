"use client"

import { Card, Tag, Button } from "@arco-design/web-react"
import {
  IconApps,
  IconBook,
  IconThunderbolt,
  IconCustomerService,
  IconArrowRight,
} from "@arco-design/web-react/icon"

const products = [
  {
    icon: IconApps,
    name: "AI工具站",
    tag: "核心产品",
    tagColor: "orange",
    description: "精选优质AI工具集合，涵盖写作、设计、编程、营销等多个领域，助力个人创业者快速上手AI工具。",
    features: ["工具精选", "分类清晰", "持续更新", "免费使用"],
    gradient: "from-blue-800 to-blue-600",
  },
  {
    icon: IconBook,
    name: "AI GEO课程",
    tag: "热门",
    tagColor: "red",
    description: "系统化AI学习课程，从入门到精通，帮助创业者掌握AI技能，提升工作效率和竞争力。",
    features: ["系统课程", "实战案例", "社群答疑", "终身学习"],
    gradient: "from-cyan-600 to-cyan-500",
  },
  {
    icon: IconThunderbolt,
    name: "AI工作流",
    tag: "定制服务",
    tagColor: "blue",
    description: "定制化AI工作流解决方案，自动化处理重复性工作，让一人公司也能高效运转。",
    features: ["流程定制", "自动化执行", "效率提升", "降低成本"],
    gradient: "from-blue-600 to-cyan-500",
  },
  {
    icon: IconCustomerService,
    name: "AI咨询服务",
    tag: "专业支持",
    tagColor: "purple",
    description: "一对一AI应用咨询，帮助创业者制定AI赋能策略，解决实际业务问题，实现快速增长。",
    features: ["专业咨询", "方案定制", "持续支持", "效果保障"],
    gradient: "from-purple-600 to-purple-500",
  },
]

export function Products() {
  return (
    <section id="products" className="relative py-24 md:py-32 overflow-hidden bg-white">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-50 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-50 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-50 text-cyan-600 text-sm font-medium mb-4 border border-cyan-100">
            产品服务
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-balance">
            AI一人公司解决方案
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            从工具到课程，从学习到实践，全方位助力个人创业者实现AI赋能
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((product, index) => {
            const Icon = product.icon
            return (
              <Card
                key={index}
                className="group !bg-white !border-gray-100 hover:!border-gray-200 hover:!shadow-xl transition-all duration-300 hover:-translate-y-1"
                hoverable
              >
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                      <Icon className="text-3xl text-blue-800" />
                    </div>
                    <Tag color={product.tagColor} className="!rounded-full !px-2.5 !py-0.5 !text-xs">
                      {product.tag}
                    </Tag>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-gray-500 text-sm mb-4 leading-relaxed line-clamp-2">{product.description}</p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {product.features.map((feature, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 text-xs font-medium border border-gray-100"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <Button
                    type="text"
                    className="!text-cyan-600 !p-0 hover:!text-cyan-700 font-medium !text-sm"
                  >
                    了解更多
                    <IconArrowRight className="ml-1 group-hover:translate-x-1 transition-transform !text-sm" />
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
