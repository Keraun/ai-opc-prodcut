"use client"

import { Card } from "@arco-design/web-react"
import { IconStar, IconCompass, IconHeart, IconThunderbolt, IconUser, IconCheckCircle } from "@arco-design/web-react/icon"
import { aboutConfig } from "@/config/site"

const values = [
  {
    icon: IconStar,
    title: aboutConfig.mission.title,
    description: aboutConfig.mission.description,
    color: "orange",
  },
  {
    icon: IconCompass,
    title: aboutConfig.vision.title,
    description: aboutConfig.vision.description,
    color: "blue",
  },
  {
    icon: IconHeart,
    title: aboutConfig.values.title,
    description: aboutConfig.values.description,
    color: "green",
  },
]

const stats = aboutConfig.stats.map((stat, index) => ({
  icon: index === 0 ? IconThunderbolt : index === 1 ? IconUser : IconCheckCircle,
  value: stat.value,
  label: stat.label,
  color: index === 0 ? "text-cyan-500" : index === 1 ? "text-blue-800" : "text-green-600",
}))

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
              {aboutConfig.title.main}
              <br />
              <span className="text-blue-800">
                {aboutConfig.title.highlight}
              </span>
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              {aboutConfig.description.map((desc, index) => (
                <p key={index}>{desc}</p>
              ))}
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
