"use client"

import { Button, Space } from "@arco-design/web-react"
import { IconArrowRight, IconCommand } from "@arco-design/web-react/icon"
import Link from "next/link"
import { Logo } from "@/components/common/logo"
import { heroConfig } from "@/config/client"
import { useTheme } from "@/components/theme-provider"

export function Hero() {
  const { themeConfig } = useTheme()
  
  const primaryColor = themeConfig?.colors?.primary || "#1e40af"
  const secondaryColor = themeConfig?.colors?.secondary || "#3b82f6"
  const accentColor = themeConfig?.colors?.accent || "#06b6d4"

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-cyan-50"
    >
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl animate-pulse"
          style={{ backgroundColor: `${primaryColor}33` }}
        />
        <div 
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse"
          style={{ backgroundColor: `${accentColor}33`, animationDelay: "1s" }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl"
          style={{ 
            background: `linear-gradient(135deg, ${primaryColor}66 0%, ${accentColor}66 100%)`
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        {heroConfig?.badge && (
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border shadow-sm mb-8"
            style={{ borderColor: `${accentColor}33` }}
          >
            <span 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: accentColor }}
            />
            <span className="text-sm text-gray-600 font-medium">{heroConfig.badge}</span>
          </div>
        )}

        {/* Main Heading */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-[1.1] tracking-tight">
          {heroConfig?.title?.main && (
            <span 
              className="block mb-2"
              style={{ color: primaryColor }}
            >
              {heroConfig.title.main}
            </span>
          )}
          {heroConfig?.title?.sub && (
            <span className="text-gray-900 block">
              {heroConfig.title.sub}
            </span>
          )}
        </h1>

        {/* Subtitle */}
        {heroConfig?.subtitle && (
          <p className="text-lg text-gray-500 mb-12 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-sm border border-gray-100 shadow-sm">
            <Logo className="w-6 h-6" />
            <span>{heroConfig.subtitle}</span>
          </p>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {heroConfig?.buttons?.primary?.href && heroConfig?.buttons?.primary?.text && (
            <Link href={heroConfig.buttons.primary.href}>
              <Button
                type="primary"
                size="large"
                style={{ 
                  backgroundColor: primaryColor,
                  color: 'white'
                }}
                className="!h-14 !px-10 !text-base !rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                <IconCommand className="mr-2 text-lg" />
                {heroConfig.buttons.primary.text}
              </Button>
            </Link>
          )}

          {heroConfig?.buttons?.secondary?.text && (
            <Button
              type="secondary"
              size="large"
              className="!bg-white !border-gray-200 !text-gray-700 hover:!bg-gray-50 hover:!border-gray-300 !h-14 !px-10 !text-base !rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
            >
              {heroConfig.buttons.secondary.text}
              <IconArrowRight className="ml-2" />
            </Button>
          )}
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
          <div 
            className="w-1.5 h-3 rounded-full animate-bounce"
            style={{ backgroundColor: accentColor }}
          />
        </div>
      </div>
    </section>
  )
}
