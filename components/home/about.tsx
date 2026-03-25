"use client"

import { IconStar, IconCompass, IconHeart, IconThunderbolt, IconUser, IconCheckCircle } from "@arco-design/web-react/icon"
import { aboutConfig } from "@/config/client"

const values = [
  {
    icon: IconStar,
    title: aboutConfig?.mission?.title,
    description: aboutConfig?.mission?.description,
  },
  {
    icon: IconCompass,
    title: aboutConfig?.vision?.title,
    description: aboutConfig?.vision?.description,
  },
  {
    icon: IconHeart,
    title: aboutConfig?.values?.title,
    description: aboutConfig?.values?.description,
  },
]

const stats = aboutConfig?.stats?.map((stat, index) => ({
  icon: index === 0 ? IconThunderbolt : index === 1 ? IconUser : IconCheckCircle,
  value: stat?.value,
  label: stat?.label,
  color: index === 0 ? "text-cyan-500" : index === 1 ? "text-blue-800" : "text-green-600",
  bgColor: index === 0 ? "bg-cyan-100" : index === 1 ? "bg-blue-100" : "bg-green-100",
})) || []

export function About() {
  return (
    <section id="about" className="relative py-24 md:py-32 bg-gradient-to-b from-white to-gray-50/50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(30,64,175,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(30,64,175,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      
      {/* Decorative Orbs */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-blue-100/50 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-cyan-100/50 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div>
            {aboutConfig?.title && (
              <>
                <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-50 text-cyan-600 text-sm font-medium mb-6 border border-cyan-100">
                  {aboutConfig?.sectionTag || "关于我们"}
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  {aboutConfig.title?.main}
                  <br />
                  {aboutConfig.title?.highlight && (
                    <span className="text-blue-800">
                      {aboutConfig.title.highlight}
                    </span>
                  )}
                </h2>
              </>
            )}
            {aboutConfig?.description && aboutConfig.description.length > 0 && (
              <div className="space-y-4 text-gray-600 leading-relaxed">
                {aboutConfig.description.map((desc, index) => (
                  <p key={index}>{desc}</p>
                ))}
              </div>
            )}

            {/* Stats */}
            {stats.length > 0 && (
              <div className="grid grid-cols-3 gap-6 mt-10 pt-8 border-t border-gray-100">
                {stats.map((stat, index) => {
                  const Icon = stat?.icon
                  if (!Icon) return null
                  
                  return (
                    <div key={index} className="text-center">
                      <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center mx-auto mb-3`}>
                        <Icon className={`text-xl ${stat.color}`} />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                      <div className="text-sm text-gray-500">{stat.label}</div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right Content - Values */}
          <div className="space-y-4">
            {values.map((value, index) => {
              const Icon = value?.icon
              if (!Icon || !value?.title || !value?.description) return null
              
              return (
                <div
                  key={index}
                  className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:shadow-sm transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                      <Icon className="text-xl text-gray-700" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 mb-2">
                        {value.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
