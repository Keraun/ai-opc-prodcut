"use client"

import { Button, Space } from "@arco-design/web-react"
import { IconArrowRight, IconCommand, IconStar, IconThunderbolt } from "@arco-design/web-react/icon"
import Link from "next/link"
import { Logo } from "@/components/common/logo"
import { heroConfig } from "@/config/client"
import { useTheme } from "@/components/theme-provider"
import { useState, useEffect } from "react"

export function Hero() {
  const { themeConfig } = useTheme()
  const [config, setConfig] = useState<any>(heroConfig)
  
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/config')
        if (response.ok) {
          const data = await response.json()
          if (data.homeBanner?.hero) {
            setConfig(data.homeBanner.hero)
          }
        }
      } catch (error) {
        console.error('Failed to load hero config:', error)
      }
    }
    
    loadConfig()
  }, [])
  
  const primaryColor = themeConfig?.colors?.primary || "#1e40af"
  const secondaryColor = themeConfig?.colors?.secondary || "#3b82f6"
  const accentColor = themeConfig?.colors?.accent || "#06b6d4"
  
  // 获取布局类型，默认为 layout1
  const layoutType = config?.layout || 'layout1'

  // 布局1：默认布局
  const renderLayout1 = () => (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      {/* Badge */}
      {config?.badge && (
        <div 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border shadow-sm mb-8"
          style={{ borderColor: `${accentColor}33` }}
        >
          <span 
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: accentColor }}
          />
          <span className="text-sm text-gray-600 font-medium">{config.badge}</span>
        </div>
      )}

      {/* Main Heading */}
      <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-[1.1] tracking-tight">
        {config?.title?.main && (
          <span 
            className="block mb-2"
            style={{ color: primaryColor }}
          >
            {config.title.main}
          </span>
        )}
        {config?.title?.sub && (
          <span className="text-gray-900 block">
            {config.title.sub}
          </span>
        )}
      </h1>

      {/* Subtitle */}
      {config?.subtitle && (
        <p className="text-lg text-gray-500 mb-12 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-sm border border-gray-100 shadow-sm">
          <Logo className="w-6 h-6" />
          <span>{config.subtitle}</span>
        </p>
      )}

      {/* CTA Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-16">
        {config?.buttons?.primary?.href && config?.buttons?.primary?.text && (
          <Link href={config.buttons.primary.href}>
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
              {config.buttons.primary.text}
            </Button>
          </Link>
        )}

        {config?.buttons?.secondary?.text && (
          <Button
            type="secondary"
            size="large"
            className="!bg-white !border-gray-200 !text-gray-700 hover:!bg-gray-50 hover:!border-gray-300 !h-14 !px-10 !text-base !rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
          >
            {config.buttons.secondary.text}
            <IconArrowRight className="ml-2" />
          </Button>
        )}
      </div>

      {/* Feature Pills */}
      <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-500">
        {(config?.featurePills || ['AI工具站', 'GEO课程', '工作流定制', '一人公司']).map((item: string, index: number) => (
          <span 
            key={index}
            className="px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-gray-100"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )

  // 布局2：左侧文字，右侧图像
  const renderLayout2 = () => (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="text-left">
          {/* Badge */}
          {config?.badge && (
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border shadow-sm mb-6"
              style={{ borderColor: `${accentColor}33` }}
            >
              <span 
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: accentColor }}
              />
              <span className="text-sm text-gray-600 font-medium">{config.badge}</span>
            </div>
          )}

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-[1.1] tracking-tight">
            {config?.title?.main && (
              <span 
                className="block mb-2"
                style={{ color: primaryColor }}
              >
                {config.title.main}
              </span>
            )}
            {config?.title?.sub && (
              <span className="text-gray-900 block">
                {config.title.sub}
              </span>
            )}
          </h1>

          {/* Subtitle */}
          {config?.subtitle && (
            <p className="text-lg text-gray-500 mb-8">
              {config.subtitle}
            </p>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            {config?.buttons?.primary?.href && config?.buttons?.primary?.text && (
              <Link href={config.buttons.primary.href}>
                <Button
                  type="primary"
                  size="large"
                  style={{ 
                    backgroundColor: primaryColor,
                    color: 'white'
                  }}
                  className="!h-14 !px-10 !text-base !rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                >
                  <IconStar className="mr-2 text-lg" />
                  {config.buttons.primary.text}
                </Button>
              </Link>
            )}

            {config?.buttons?.secondary?.text && (
              <Button
                type="secondary"
                size="large"
                className="!bg-white !border-gray-200 !text-gray-700 hover:!bg-gray-50 hover:!border-gray-300 !h-14 !px-10 !text-base !rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
              >
                {config.buttons.secondary.text}
                <IconArrowRight className="ml-2" />
              </Button>
            )}
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-3 text-sm text-gray-500">
            {(config?.featurePills || ['AI工具站', 'GEO课程', '工作流定制', '一人公司']).map((item: string, index: number) => (
              <span 
                key={index}
                className="px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-gray-100"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="hidden lg:block">
          <div className="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <IconThunderbolt className="w-24 h-24 text-blue-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-800">AI 赋能</h3>
                <p className="text-gray-500">提升业务效率</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // 布局3：居中卡片式布局
  const renderLayout3 = () => (
    <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100">
        <div className="text-center">
          {/* Badge */}
          {config?.badge && (
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border shadow-sm mb-6"
              style={{ borderColor: `${accentColor}33` }}
            >
              <span 
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: accentColor }}
              />
              <span className="text-sm text-gray-600 font-medium">{config.badge}</span>
            </div>
          )}

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-[1.1] tracking-tight">
            {config?.title?.main && (
              <span 
                className="block mb-2"
                style={{ color: primaryColor }}
              >
                {config.title.main}
              </span>
            )}
            {config?.title?.sub && (
              <span className="text-gray-900 block">
                {config.title.sub}
              </span>
            )}
          </h1>

          {/* Subtitle */}
          {config?.subtitle && (
            <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
              {config.subtitle}
            </p>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {config?.buttons?.primary?.href && config?.buttons?.primary?.text && (
              <Link href={config.buttons.primary.href}>
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
                  {config.buttons.primary.text}
                </Button>
              </Link>
            )}

            {config?.buttons?.secondary?.text && (
              <Button
                type="secondary"
                size="large"
                className="!bg-gray-50 !border-gray-200 !text-gray-700 hover:!bg-gray-100 hover:!border-gray-300 !h-14 !px-10 !text-base !rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
              >
                {config.buttons.secondary.text}
                <IconArrowRight className="ml-2" />
              </Button>
            )}
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-500">
            {['AI工具站', 'GEO课程', '工作流定制', '一人公司'].map((item, index) => (
              <span 
                key={index}
                className="px-4 py-2 rounded-full bg-gray-50 border border-gray-100"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <section
      id="hero"
      className={`relative min-h-screen flex items-center justify-center overflow-hidden ${layoutType === 'layout3' ? 'bg-gradient-to-br from-slate-100 via-white to-slate-100' : 'bg-gradient-to-br from-slate-50 via-white to-cyan-50'}`}
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

      {/* Render selected layout */}
      {layoutType === 'layout1' && renderLayout1()}
      {layoutType === 'layout2' && renderLayout2()}
      {layoutType === 'layout3' && renderLayout3()}

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
