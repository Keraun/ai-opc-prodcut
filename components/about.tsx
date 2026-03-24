"use client"

import { Card } from "@arco-design/web-react"
import { IconStar, IconCompass, IconHeart, IconThunderbolt, IconUser, IconCheckCircle } from "@arco-design/web-react/icon"

const values = [
  {
    icon: IconStar,
    title: "使命",
    description: "让AI技术赋能每一个创业者，降低AI应用门槛，实现一人公司的无限可能。",
    color: "orange",
  },
  {
    icon: IconCompass,
    title: "愿景",
    description: "成为最受信赖的AI一人公司服务平台，引领个人创业者的AI时代。",
    color: "blue",
  },
  {
    icon: IconHeart,
    title: "价值观",
    description: "专注、实用、高效、共赢，与创业者一起成长，创造价值。",
    color: "green",
  },
]

const stats = [
  { icon: IconThunderbolt, value: "100+", label: "AI工具", color: "text-cyan-500" },
  { icon: IconUser, value: "1000+", label: "学员用户", color: "text-blue-800" },
  { icon: IconCheckCircle, value: "50+", label: "工作流案例", color: "text-green-600" },
]

const colorMap: Record<string, { bg: string; text: string; light: string }> = {
  orange: { bg: "bg-cyan-500", text: "text-cyan-600", light: "bg-cyan-50" },
  blue: { bg: "bg-blue-800", text: "text-blue-600", light: "bg-blue-50" },
  green: { bg: "bg-green-500", text: "text-green-600", light: "bg-green-50" },
}

export function About() {
  return (
    <section id="about" className="relative py-24 md:py-32 bg-gradient-to-b from-white to-gray-50/50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(30,64,175,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(30,64,175,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      
      {/* Decorative Orbs */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-blue-100/50 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-cyan-100/50 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-50 text-cyan-600 text-sm font-medium mb-6 border border-cyan-100">
              关于我们
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              专注AI
              <br />
              <span className="text-blue-800">
                一人公司服务
              </span>
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                创客AI专注于为个人创业者提供AI赋能服务。我们深知一人公司的挑战与机遇，致力于通过AI工具、课程和工作流，帮助创业者提升效率、降低成本、实现增长。
              </p>
              <p>
                从AI工具站到GEO课程，从工作流定制到咨询服务，我们为1000+个人创业者提供了实用的AI解决方案，帮助他们实现一人公司的无限可能。
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-10 pt-8 border-t border-gray-100">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="text-center">
                    <div className={`w-12 h-12 rounded-xl ${stat.color.replace('text-', 'bg-').replace('500', '100').replace('800', '100')} flex items-center justify-center mx-auto mb-3`}>
                      <Icon className={`text-xl ${stat.color}`} />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Content - Values */}
          <div className="space-y-6">
            {values.map((value, index) => {
              const Icon = value.icon
              const colors = colorMap[value.color]
              return (
                <Card
                  key={index}
                  className="group !bg-white !border-gray-100 hover:!border-gray-200 hover:!shadow-lg transition-all duration-300"
                  hoverable
                >
                  <div className="flex gap-4 p-5">
                    <div className={`shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${colors.bg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="text-2xl text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{value.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{value.description}</p>
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
