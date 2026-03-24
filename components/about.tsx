"use client"

import { Card } from "@arco-design/web-react"
import { IconStar, IconCompass, IconHeart, IconThunderbolt, IconUser, IconCheckCircle } from "@arco-design/web-react/icon"

const values = [
  {
    icon: IconStar,
    title: "使命",
    description: "让AI技术普惠每一家企业，降低AI应用门槛，推动产业智能化升级。",
    color: "blue",
  },
  {
    icon: IconCompass,
    title: "愿景",
    description: "成为全球领先的企业级AI解决方案提供商，引领智能时代的技术创新。",
    color: "purple",
  },
  {
    icon: IconHeart,
    title: "价值观",
    description: "客户至上、技术驱动、开放协作、追求卓越，与客户共同成长。",
    color: "green",
  },
]

const stats = [
  { icon: IconThunderbolt, value: "5+", label: "年行业经验", color: "text-blue-600" },
  { icon: IconUser, value: "200+", label: "技术专家", color: "text-purple-600" },
  { icon: IconCheckCircle, value: "30+", label: "技术专利", color: "text-green-600" },
]

const colorMap: Record<string, { bg: string; text: string; light: string }> = {
  blue: { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50" },
  purple: { bg: "bg-purple-500", text: "text-purple-600", light: "bg-purple-50" },
  green: { bg: "bg-green-500", text: "text-green-600", light: "bg-green-50" },
}

export function About() {
  return (
    <section id="about" className="relative py-24 md:py-32 bg-gradient-to-b from-white to-gray-50/50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      
      {/* Decorative Orbs */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-blue-100/50 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-100/50 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-6 border border-blue-100">
              关于我们
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              用技术创新
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                赋能企业智能化
              </span>
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                NexusAI成立于2020年，是一家专注于企业级AI解决方案的科技公司。我们汇聚了来自全球顶尖科技公司和研究机构的AI专家，致力于将前沿AI技术转化为实际商业价值。
              </p>
              <p>
                从智能对话到计算机视觉，从自然语言处理到机器学习平台，我们为金融、医疗、零售、制造等行业的10,000+企业提供了定制化AI解决方案，累计服务用户超过1亿。
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-10 pt-8 border-t border-gray-100">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="text-center">
                    <div className={`w-12 h-12 rounded-xl ${stat.color.replace('text-', 'bg-').replace('600', '100')} flex items-center justify-center mx-auto mb-3`}>
                      <Icon className={`text-xl ${stat.color}`} />
                    </div>
                    <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right - Values Cards */}
          <div className="space-y-5">
            {values.map((value, index) => {
              const Icon = value.icon
              const colors = colorMap[value.color]
              return (
                <Card
                  key={index}
                  className="group !bg-white !border-gray-100 hover:!border-gray-200 hover:!shadow-xl transition-all duration-300 hover:-translate-y-1"
                  hoverable
                >
                  <div className="flex gap-4 p-5">
                    <div className="shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="text-2xl text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{value.description}</p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
