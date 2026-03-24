"use client"

import { Card, Tag, Button } from "@arco-design/web-react"
import {
  IconRobot,
  IconMessage,
  IconEye,
  IconCode,
  IconArrowRight,
} from "@arco-design/web-react/icon"

const products = [
  {
    icon: IconRobot,
    name: "NexusGPT",
    tag: "旗舰产品",
    tagColor: "arcoblue",
    description: "企业级大语言模型，支持私有化部署，为您的业务提供定制化AI能力。具备强大的理解、推理和生成能力。",
    features: ["私有化部署", "定制训练", "多语言支持", "API接口"],
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: IconMessage,
    name: "NexusChat",
    tag: "热门",
    tagColor: "red",
    description: "智能客服对话系统，7x24小时自动响应，显著降低人工成本，提升客户满意度。",
    features: ["多渠道接入", "意图识别", "知识库管理", "人机协作"],
    gradient: "from-red-500 to-pink-500",
  },
  {
    icon: IconEye,
    name: "NexusVision",
    tag: "新品",
    tagColor: "green",
    description: "计算机视觉AI平台，支持图像识别、目标检测、OCR文字识别等多种视觉AI能力。",
    features: ["图像分类", "目标检测", "人脸识别", "OCR识别"],
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: IconCode,
    name: "NexusCode",
    tag: "开发者",
    tagColor: "purple",
    description: "AI编程助手，智能代码补全、代码审查、Bug检测，让开发效率提升数倍。",
    features: ["代码补全", "代码审查", "Bug检测", "文档生成"],
    gradient: "from-purple-500 to-violet-500",
  },
]

export function Products() {
  return (
    <section id="products" className="relative py-24 md:py-32 overflow-hidden bg-white">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-50 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-50 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-4 border border-blue-100">
            产品矩阵
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-balance">
            全方位AI产品解决方案
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            从对话AI到视觉AI，从智能编程到企业大模型，满足您的一切AI需求
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {products.map((product, index) => {
            const Icon = product.icon
            return (
              <Card
                key={index}
                className="group !bg-white !border-gray-100 hover:!border-gray-200 hover:!shadow-xl transition-all duration-300 hover:-translate-y-1"
                hoverable
              >
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${product.gradient} flex items-center justify-center shadow-lg shadow-gray-200 group-hover:shadow-xl transition-shadow`}>
                      <Icon className="text-2xl text-white" />
                    </div>
                    <Tag color={product.tagColor} className="!rounded-full !px-3 !py-1">
                      {product.tag}
                    </Tag>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{product.name}</h3>
                  <p className="text-gray-500 mb-6 leading-relaxed">{product.description}</p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {product.features.map((feature, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-full bg-gray-50 text-gray-600 text-xs font-medium border border-gray-100"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <Button
                    type="text"
                    className="!text-blue-600 !p-0 hover:!text-blue-700 font-medium"
                  >
                    了解更多
                    <IconArrowRight className="ml-1 group-hover:translate-x-1 transition-transform" />
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
