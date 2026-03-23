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
    title: "AI战略咨询",
    description: "资深AI专家团队为您量身定制数字化转型方案，从需求分析到落地实施，全程专业指导。",
    highlights: ["行业洞察", "方案设计", "ROI分析"],
  },
  {
    icon: IconSettings,
    number: "02",
    title: "定制化开发",
    description: "根据企业特定需求，提供AI模型定制训练、系统集成开发等一站式技术服务。",
    highlights: ["模型定制", "系统集成", "二次开发"],
  },
  {
    icon: IconBook,
    number: "03",
    title: "技术培训",
    description: "面向企业技术团队，提供AI技术培训课程，助力团队快速掌握前沿AI技能。",
    highlights: ["实战课程", "认证体系", "持续学习"],
  },
  {
    icon: IconCustomerService,
    number: "04",
    title: "运维支持",
    description: "7x24小时技术支持，确保AI系统稳定运行。提供性能优化、安全加固等增值服务。",
    highlights: ["全天候响应", "性能优化", "安全保障"],
  },
]

export function Services() {
  return (
    <section id="services" className="relative py-24 md:py-32 bg-card/30">
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:80px_80px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            专业服务
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            端到端的AI服务体系
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            从咨询到实施，从培训到运维，为您提供全生命周期的AI服务支持
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <Card
                key={index}
                className="group !bg-card/50 !border-border hover:!border-accent/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 relative overflow-hidden"
                hoverable
              >
                {/* Number Watermark */}
                <span className="absolute -top-4 -right-2 text-8xl font-bold text-foreground/5 select-none group-hover:text-accent/10 transition-colors">
                  {service.number}
                </span>

                <div className="relative p-2">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                    <Icon className="text-xl text-accent" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-foreground mb-2">{service.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Highlights */}
                  <div className="flex flex-wrap gap-2">
                    {service.highlights.map((highlight, i) => (
                      <span
                        key={i}
                        className="text-xs text-accent/80"
                      >
                        {highlight}
                        {i < service.highlights.length - 1 && (
                          <span className="ml-2 text-border">|</span>
                        )}
                      </span>
                    ))}
                  </div>

                  {/* Bottom Accent Line */}
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300" />
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
