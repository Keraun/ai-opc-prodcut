"use client"

import { Button, Space } from "@arco-design/web-react"
import { IconArrowRight, IconCommand } from "@arco-design/web-react/icon"
import Link from "next/link"
import { Logo } from "@/components/logo"

export function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-cyan-50"
    >
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-100/40 to-cyan-100/40 rounded-full blur-3xl" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,64,175,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(30,64,175,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-cyan-100 shadow-sm mb-8">
          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          <span className="text-sm text-gray-600 font-medium">AI一人公司服务专家</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-[1.1] tracking-tight">
          <span className="text-blue-800 block mb-2">
            AI赋能
          </span>
          <span className="text-gray-900 block">
            一人公司
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-gray-500 mb-12 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-sm border border-gray-100 shadow-sm">
          <Logo className="w-6 h-6" />
          <span>专注AI工具、课程、工作流服务</span>
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <Link href="/products">
            <Button
              type="primary"
              size="large"
              className="!bg-blue-800 !text-white hover:!bg-blue-900 !h-14 !px-10 !text-base !rounded-xl shadow-lg shadow-blue-800/25 hover:shadow-xl hover:shadow-blue-800/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              <IconCommand className="mr-2 text-lg" />
              立即体验
            </Button>
          </Link>

          <Button
            type="secondary"
            size="large"
            className="!bg-white !border-gray-200 !text-gray-700 hover:!bg-gray-50 hover:!border-gray-300 !h-14 !px-10 !text-base !rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
          >
            了解更多
            <IconArrowRight className="ml-2" />
          </Button>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-500">
          {['AI工具站', 'GEO课程', '工作流定制', '一人公司'].map((item, index) => (
            <span 
              key={index}
              className="px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-gray-100"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-xs text-gray-400">向下滚动</span>
        <div className="w-6 h-10 rounded-full border-2 border-gray-300 flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-cyan-500 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  )
}
