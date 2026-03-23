"use client"

import { Card } from "@arco-design/web-react"
import { IconStar, IconCompass, IconHeart } from "@arco-design/web-react/icon"

const values = [
  {
    icon: IconStar,
    title: "使命",
    description: "让AI技术普惠每一家企业，降低AI应用门槛，推动产业智能化升级。",
  },
  {
    icon: IconCompass,
    title: "愿景",
    description: "成为全球领先的企业级AI解决方案提供商，引领智能时代的技术创新。",
  },
  {
    icon: IconHeart,
    title: "价值观",
    description: "客户至上、技术驱动、开放协作、追求卓越，与客户共同成长。",
  },
]

const quickStats = [
  { value: "5+", label: "年行业经验" },
  { value: "200+", label: "技术专家" },
  { value: "30+", label: "技术专利" },
]

export function About() {
  return (
    <section id="about" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: "url('/images/about-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
              关于我们
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              用技术创新
              <br />
              <span className="bg-gradient-to-r from-accent to-emerald-400 bg-clip-text text-transparent">
                赋能企业智能化
              </span>
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                NexusAI成立于2020年，是一家专注于企业级AI解决方案的科技公司。我们汇聚了来自全球顶尖科技公司和研究机构的AI专家，致力于将前沿AI技术转化为实际商业价值。
              </p>
              <p>
                从智能对话到计算机视觉，从自然语言处理到机器学习平台，我们为金融、医疗、零售、制造等行业的10,000+企业提供了定制化AI解决方案，累计服务用户超过1亿。
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-border">
              {quickStats.map((stat, index) => (
                <div key={index}>
                  <div className="text-3xl font-bold text-accent">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Values Cards */}
          <div className="space-y-6">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <Card
                  key={index}
                  className="group !bg-card/50 !border-border hover:!border-accent/50 backdrop-blur-sm transition-all duration-300 hover:translate-x-2"
                  hoverable
                >
                  <div className="flex gap-4 p-2">
                    <div className="shrink-0 w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                      <Icon className="text-xl text-accent" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-1">{value.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
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
