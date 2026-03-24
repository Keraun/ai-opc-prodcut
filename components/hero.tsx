"use client"

import { Button, Space, Link } from "@arco-design/web-react"
import { IconArrowRight } from "@arco-design/web-react/icon"


export function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 bg-white"
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main Heading */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
          <span className="text-[#165DFF] block mb-2">智能设计体系</span>
          <span className="text-gray-900 block">连接轻盈体验</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-gray-500 mb-12 inline-flex items-center px-4 py-2 rounded-full bg-gray-100">
          <span className="text-gray-400 mr-2">#</span>
          字节跳动出品的企业级设计系统
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <Link href="/products">
            <Button
              type="primary"
              size="large"
              className="!bg-[#165DFF] !text-white hover:!bg-[#165DFF]/90 !h-12 !px-8 !text-base !rounded-lg"
            >
              <IconArrowRight className="mr-2" />
              开始使用
            </Button>
          </Link>

          <Button
            type="secondary"
            size="large"
            className="!bg-gray-100 !border-none !text-gray-700 hover:!bg-gray-200 !h-12 !px-8 !text-base !rounded-lg"
          >
            客户案例
          </Button>
        </div>
        
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
