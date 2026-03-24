"use client"

import { Card } from "@arco-design/web-react"
import {
  IconBulb,
  IconSettings,
  IconBook,
  IconCustomerService,
} from "@arco-design/web-react/icon"

const services = [
  {
    icon: IconBulb,
    number: "01",
    title: "AI工具推荐",
    description: "精选优质AI工具，涵盖写作、设计、编程、营销等领域，帮助创业者快速找到合适的工具。",
    highlights: ["工具精选", "分类清晰", "免费使用"],
    color: "orange",
  },
  {
    icon: IconBook,
    number: "02",
    title: "GEO课程培训",
    description: "系统化AI学习课程，从入门到精通，帮助创业者掌握AI技能，提升工作效率。",
    highlights: ["系统课程", "实战案例", "社群答疑"],
    color: "blue",
  },
  {
    icon: IconSettings,
    number: "03",
    title: "工作流定制",
    description: "根据业务需求定制AI工作流，自动化处理重复性工作，让一人公司高效运转。",
    highlights: ["流程定制", "自动化执行", "效率提升"],
    color: "green",
  },
  {
    icon: IconCustomerService,
    number: "04",
    title: "咨询服务",
    description: "一对一AI应用咨询，帮助创业者制定AI赋能策略，解决实际业务问题。",
    highlights: ["专业咨询", "方案定制", "持续支持"],
    color: "purple",
  },
]

const colorMap: Record<string, { bg: string; text: string; light: string }> = {
  orange: { bg: "bg-cyan-500", text: "text-cyan-600", light: "bg-cyan-50" },
  blue: { bg: "bg-blue-800", text: "text-blue-600", light: "bg-blue-50" },
  green: { bg: "bg-green-500", text: "text-green-600", light: "bg-green-50" },
  purple: { bg: "bg-purple-500", text: "text-purple-600", light: "bg-purple-50" },
}

export function Services() {
  return (
    <section id="services" className="relative py-24 md:py-32 bg-gray-50/50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(30,64,175,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(30,64,175,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-50 text-cyan-600 text-sm font-medium mb-4 border border-cyan-100">
            服务内容
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-balance">
            全方位AI赋能服务
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            从工具到课程，从定制到咨询，为个人创业者提供一站式AI服务支持
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon
            const colors = colorMap[service.color]
            return (
              <Card
                key={index}
                className="group !bg-white !border-gray-100 hover:!border-gray-200 hover:!shadow-xl transition-all duration-300 hover:-translate-y-1"
                hoverable
              >
                <div className="p-6">
                  {/* Number Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 rounded-xl ${colors.light} flex items-center justify-center`}>
                      <Icon className={`text-2xl ${colors.text}`} />
                    </div>
                    <span className="text-3xl font-bold text-gray-100 group-hover:text-gray-200 transition-colors">
                      {service.number}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{service.description}</p>

                  {/* Highlights */}
                  <div className="space-y-2">
                    {service.highlights.map((highlight, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                        <div className={`w-1.5 h-1.5 rounded-full ${colors.bg}`} />
                        {highlight}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
