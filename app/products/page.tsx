"use client"

import { useState, useEffect, useRef } from "react"
import { Button, Tag, Card, Input } from "@arco-design/web-react"
import { IconSearch, IconAt, IconEye } from "@arco-design/web-react/icon"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/common/header"
import { Footer } from "@/components/common/footer"

interface Product {
  id: string
  title: string
  description: string
  price: number
  originalPrice?: number
  image: string
  tags: string[]
  category: string
}

const products: Product[] = [
  {
    id: "workflow-1",
    title: "自动化内容创作工作流",
    description: "从选题到发布的全流程自动化，一键生成文章、配图、社交媒体内容。",
    price: 299,
    originalPrice: 499,
    image: "/images/products/workflow-ai.jpg",
    tags: ["企业版", "热销"],
    category: "tools"
  },
  {
    id: "workflow-2",
    title: "智能客服工作流模板",
    description: "多渠道客服自动化解决方案，支持微信、网站、APP 等平台接入。",
    price: 599,
    image: "/images/products/workflow-ai.jpg",
    tags: ["企业版"],
    category: "tools"
  },
  {
    id: "workflow-3",
    title: "数据分析自动化流程",
    description: "自动收集、清洗、分析数据并生成可视化报告，支持定时任务。",
    price: 399,
    originalPrice: 699,
    image: "/images/products/workflow-ai.jpg",
    tags: ["新品"],
    category: "tools"
  },
  {
    id: "nav-1",
    title: "AI 工具导航 Pro",
    description: "精选 1000+ AI 工具网站，按类别智能分类，每周更新最新工具推荐。",
    price: 0,
    image: "/images/products/ai-nav.jpg",
    tags: ["免费", "持续更新"],
    category: "navigation"
  },
  {
    id: "nav-2",
    title: "AI 资源聚合平台",
    description: "整合全网 AI 学习资源、开源项目、论文解读，一站式获取前沿资讯。",
    price: 49,
    image: "/images/products/ai-nav.jpg",
    tags: ["会员专属"],
    category: "navigation"
  },
  {
    id: "course-1",
    title: "AI 零基础入门实战课",
    description: "从零开始学习 AI 应用，包含 ChatGPT、Midjourney、Stable Diffusion 等主流工具使用。",
    price: 199,
    originalPrice: 399,
    image: "/images/products/ai-course.jpg",
    tags: ["新手推荐", "视频课程"],
    category: "courses"
  },
  {
    id: "course-2",
    title: "AI 绘画进阶大师课",
    description: "深入学习 AI 绘画技巧，掌握 LoRA 训练、ControlNet 高级用法，创作商业级作品。",
    price: 499,
    image: "/images/products/ai-course.jpg",
    tags: ["进阶课程"],
    category: "courses"
  },
  {
    id: "course-3",
    title: "企业 AI 转型实战指南",
    description: "面向企业管理者的 AI 战略课程，包含落地案例分析和实施路径规划。",
    price: 999,
    image: "/images/products/ai-course.jpg",
    tags: ["企业培训", "直播答疑"],
    category: "courses"
  },
  {
    id: "service-1",
    title: "AI 应用定制开发",
    description: "根据您的业务需求，定制开发专属 AI 应用，包括聊天机器人、智能助手等。",
    price: 9999,
    image: "/images/products/ai-service.jpg",
    tags: ["1对1服务", "企业定制"],
    category: "services"
  },
  {
    id: "service-2",
    title: "AI 技术咨询服务",
    description: "资深 AI 专家一对一咨询，帮助您规划 AI 战略，解决技术难题。",
    price: 1999,
    image: "/images/products/ai-service.jpg",
    tags: ["专家咨询"],
    category: "services"
  },
  {
    id: "service-3",
    title: "AI 模型微调服务",
    description: "基于您的数据和场景，对大模型进行微调优化，提升特定任务的表现。",
    price: 4999,
    image: "/images/products/ai-service.jpg",
    tags: ["技术服务"],
    category: "services"
  }
]

const categories = [
  { key: "all", title: "全部产品" },
  { key: "tools", title: "AI 工具" },
  { key: "courses", title: "AI 课程" },
  { key: "services", title: "AI 服务" },
]

function ProductCard({ product }: { product: Product }) {
  return (
    <Card
      hoverable
      className="!bg-white !border-gray-100 overflow-hidden group hover:!border-gray-200 hover:!shadow-lg transition-all duration-300"
      cover={
        <div className="relative h-32 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-gray-300 text-xs">产品图片</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      }
    >
      <div className="p-4">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {product.tags.map((tag) => (
            <Tag
              key={tag}
              size="small"
              className={`!border-0 !text-xs ${
                tag === "热销" || tag === "限时特惠"
                  ? "!bg-red-500/20 !text-red-600"
                  : tag === "新品"
                  ? "!bg-blue-500/20 !text-blue-600"
                  : tag === "免费"
                  ? "!bg-green-500/20 !text-green-600"
                  : "!bg-gray-100 !text-gray-600"
              }`}
            >
              {tag}
            </Tag>
          ))}
        </div>
        
        <h3 className="text-base font-semibold text-gray-900 mb-1.5 line-clamp-1">
          {product.title}
        </h3>
        
        <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-baseline gap-1.5">
            {product.price === 0 ? (
              <span className="text-lg font-bold text-green-600">免费</span>
            ) : (
              <>
                <span className="text-lg font-bold text-blue-600">¥{product.price}</span>
                {product.originalPrice && (
                  <span className="text-xs text-gray-400 line-through">
                    ¥{product.originalPrice}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            type="primary"
            size="small"
            icon={<IconAt />}
            className="flex-1 !bg-blue-600 !text-white hover:!bg-blue-700 !h-8"
          >
            {product.price === 0 ? "获取" : "购买"}
          </Button>
          <Button
            type="outline"
            size="small"
            icon={<IconEye />}
            className="!border-gray-200 !text-gray-600 hover:!border-blue-500 hover:!text-blue-600 !h-8"
          >
            详情
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchText, setSearchText] = useState("")
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({})

  useEffect(() => {
    const handleScroll = () => {
      const sections = categories.map((cat) => cat.key)
      const scrollPosition = window.scrollY + 300

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sectionRefs.current[sections[i]]
        if (section) {
          const sectionTop = section.offsetTop
          if (scrollPosition >= sectionTop) {
            setActiveTab(sections[i])
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchText.toLowerCase())
    return matchesSearch
  })

  const scrollToSection = (key: string) => {
    const section = sectionRefs.current[key]
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20">
        {/* Search Section */}
        <section className="relative py-8 md:py-12 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-10 left-10 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl" />
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  探索 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">AI 产品</span>
                </h1>
                <p className="text-sm text-gray-600">
                  精选优质 AI 工具、课程和服务
                </p>
              </div>
              
              <div className="w-80">
                <Input
                  prefix={<IconSearch />}
                  placeholder="搜索产品..."
                  value={searchText}
                  onChange={setSearchText}
                  className="!bg-white !border-gray-200 !h-10 !rounded-lg shadow-sm [&_input]:!text-gray-900 [&_input]:placeholder:!text-gray-400 [&_.arco-input-prefix]:!text-gray-400"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left Sidebar - Tabs */}
              <div className="md:w-56 flex-shrink-0">
                <div className="sticky top-24 space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => scrollToSection(cat.key)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg transition-all duration-300 relative text-sm ${
                        activeTab === cat.key
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      {activeTab === cat.key && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r" />
                      )}
                      {cat.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Content - Products */}
              <div className="flex-1">
                {categories.map((cat) => {
                  const categoryProducts = products.filter((p) => cat.key === "all" || p.category === cat.key)
                  if (cat.key === "all") return null
                  
                  return (
                    <div
                      key={cat.key}
                      ref={(el) => {
                        sectionRefs.current[cat.key] = el
                      }}
                      id={cat.key}
                      className="mb-12 scroll-mt-24"
                    >
                      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                        <div className="w-1 h-6 bg-blue-600 rounded-full" />
                        {cat.title}
                        <span className="text-xs font-normal text-gray-500">
                          ({categoryProducts.length})
                        </span>
                      </h2>
                      
                      {categoryProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {categoryProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                          <p className="text-gray-500">暂无{cat.title}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}
