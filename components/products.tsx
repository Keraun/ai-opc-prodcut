"use client"

import { Card, Tag, Button } from "@arco-design/web-react"
import {
  IconApps,
  IconBook,
  IconThunderbolt,
  IconCustomerService,
  IconArrowRight,
} from "@arco-design/web-react/icon"
import { productsConfig } from "@/config/site"

const iconMap: Record<string, any> = {
  IconApps,
  IconBook,
  IconThunderbolt,
  IconCustomerService,
}

const products = productsConfig.map((product) => ({
  ...product,
  icon: iconMap[product.icon],
}))

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
        {products && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((product, index) => {
              const Icon = product?.icon
              if (!Icon) return null
              
              return (
                <Card
                  key={product?.id || index}
                  className="group !bg-white !border-gray-100 hover:!border-gray-200 hover:!shadow-xl transition-all duration-300 hover:-translate-y-1"
                  hoverable
                >
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                        <Icon className="text-3xl text-blue-800" />
                      </div>
                      {product?.tag && (
                        <Tag color={product?.tagColor} className="!rounded-full !px-2.5 !py-0.5 !text-xs">
                          {product.tag}
                        </Tag>
                      )}
                    </div>

                    {/* Content */}
                    {product?.name && (
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{product.name}</h3>
                    )}
                    {product?.description && (
                      <p className="text-gray-500 text-sm mb-4 leading-relaxed line-clamp-2">{product.description}</p>
                    )}

                    {/* Features */}
                    {product?.features && product.features.length > 0 && (
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
                    )}

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
        )}
      </div>
    </section>
  )
}
