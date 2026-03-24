"use client"

import { Button, Space, Link } from "@arco-design/web-react"
import { IconArrowRight, IconPlayArrowFill } from "@arco-design/web-react/icon"


export function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-background/70" />

      {/* Animated Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-sm text-accent">全新AI平台正式发布</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          <span className="text-foreground">用AI重新定义</span>
          <br />
          <span className="bg-gradient-to-r from-accent via-teal-400 to-emerald-400 bg-clip-text text-transparent">
            企业智能未来
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 text-balance leading-relaxed">
          NexusAI为企业提供领先的人工智能解决方案，助力数字化转型升级。
          从智能对话到数据分析，让AI成为您业务增长的核心驱动力。
        </p>

        {/* CTA Buttons */}
        <Space size="large" className="mb-16">
          <Link href="/products">
            <Button
              type="primary"
              size="large"
              className="!bg-accent !text-accent-foreground hover:!bg-accent/90 !h-12 !px-8 !text-base !rounded-lg"
            >
             开始使用
              <IconArrowRight className="ml-2" />
            </Button>
          </Link>

          <Button
            type="secondary"
            size="large"
            className="!bg-transparent !border-border !text-foreground hover:!bg-secondary !h-12 !px-8 !text-base !rounded-lg"
          >
            <IconPlayArrowFill className="mr-2" />
            观看演示
          </Button>
        </Space>
        
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-xs text-muted-foreground">向下滚动</span>
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-accent rounded-full animate-bounce" />
        </div>
      </div>

    </section>
  )
}
