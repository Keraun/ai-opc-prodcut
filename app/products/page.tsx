"use client"

import { useState } from "react"
import { Button, Tabs, Tag, Card, Input } from "@arco-design/web-react"
import { IconArrowLeft, IconSearch, IconAt, IconEye } from "@arco-design/web-react/icon"
import Image from "next/image"
import Link from "next/link"

const TabPane = Tabs.TabPane

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
  // AI 提示词
  {
    id: "prompt-1",
    title: "ChatGPT 高级提示词库",
    description: "包含 500+ 精选提示词模板，覆盖写作、编程、营销、教育等多个领域，让你快速上手 AI 对话。",
    price: 99,
    originalPrice: 199,
    image: "/images/products/prompt-master.jpg",
    tags: ["热销", "新品"],
    category: "prompts"
  },
  {
    id: "prompt-2",
    title: "Midjourney 绘画提示词大全",
    description: "专为 Midjourney 设计的提示词合集，包含风格、构图、光影等专业参数指南。",
    price: 79,
    originalPrice: 149,
    image: "/images/products/prompt-master.jpg",
    tags: ["限时特惠"],
    category: "prompts"
  },
  {
    id: "prompt-3",
    title: "AI 编程助手提示词包",
    description: "针对代码生成、调试、重构优化的专业提示词，支持多种编程语言和框架。",
    price: 129,
    image: "/images/products/prompt-master.jpg",
    tags: ["程序员必备"],
    category: "prompts"
  },
  // AI 工作流
  {
    id: "workflow-1",
    title: "自动化内容创作工作流",
    description: "从选题到发布的全流程自动化，一键生成文章、配图、社交媒体内容。",
    price: 299,
    originalPrice: 499,
    image: "/images/products/workflow-ai.jpg",
    tags: ["企业版", "热销"],
    category: "workflows"
  },
  {
    id: "workflow-2",
    title: "智能客服工作流模板",
    description: "多渠道客服自动化解决方案，支持微信、网站、APP 等平台接入。",
    price: 599,
    image: "/images/products/workflow-ai.jpg",
    tags: ["企业版"],
    category: "workflows"
  },
  {
    id: "workflow-3",
    title: "数据分析自动化流程",
    description: "自动收集、清洗、分析数据并生成可视化报告，支持定时任务。",
    price: 399,
    originalPrice: 699,
    image: "/images/products/workflow-ai.jpg",
    tags: ["新品"],
    category: "workflows"
  },
  // AI 网站导航
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
  // AI 课程
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
  // AI 服务
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
  { key: "prompts", title: "AI 提示词" },
  { key: "workflows", title: "AI 工作流" },
  { key: "navigation", title: "AI 网站导航" },
  { key: "courses", title: "AI 课程" },
  { key: "services", title: "AI 服务" },
]

function ProductCard({ product }: { product: Product }) {
  return (
    <Card
      hoverable
      className="!bg-card !border-border overflow-hidden group"
      cover={
        <div className="relative h-48 overflow-hidden">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      }
    >
      <div className="flex flex-wrap gap-2 mb-3">
        {product.tags.map((tag) => (
          <Tag
            key={tag}
            size="small"
            className={`!border-0 ${
              tag === "热销" || tag === "限时特惠"
                ? "!bg-red-500/20 !text-red-400"
                : tag === "新品"
                ? "!bg-accent/20 !text-accent"
                : tag === "免费"
                ? "!bg-green-500/20 !text-green-400"
                : "!bg-secondary !text-muted-foreground"
            }`}
          >
            {tag}
          </Tag>
        ))}
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-1">
        {product.title}
      </h3>
      
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {product.description}
      </p>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-baseline gap-2">
          {product.price === 0 ? (
            <span className="text-2xl font-bold text-green-400">免费</span>
          ) : (
            <>
              <span className="text-2xl font-bold text-accent">¥{product.price}</span>
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
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
          icon={<IconAt />}
          className="flex-1 !bg-accent !text-accent-foreground hover:!bg-accent/90"
        >
          {product.price === 0 ? "立即获取" : "立即购买"}
        </Button>
        <Button
          type="secondary"
          icon={<IconEye />}
          className="!bg-secondary !border-border !text-foreground hover:!bg-secondary/80"
        >
          详情
        </Button>
      </div>
    </Card>
  )
}

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchText, setSearchText] = useState("")

  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeTab === "all" || product.category === activeTab
    const matchesSearch = product.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchText.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
              <IconArrowLeft className="text-xl" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                  <span className="text-accent-foreground font-bold">N</span>
                </div>
                <span className="font-bold text-foreground">NexusAI</span>
              </div>
            </Link>
            
            <div className="w-72">
              <Input
                prefix={<IconSearch />}
                placeholder="搜索产品..."
                value={searchText}
                onChange={setSearchText}
                className="!bg-secondary !border-border [&_input]:!text-foreground [&_input]:placeholder:!text-muted-foreground [&_.arco-input-prefix]:!text-muted-foreground"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            探索 <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-cyan-400">AI 产品</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            精选优质 AI 工具、课程和服务，助力您的 AI 学习和业务增长
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs
            activeTab={activeTab}
            onChange={setActiveTab}
            type="capsule"
            className="mb-8 [&_.arco-tabs-header]:!border-0 [&_.arco-tabs-header-nav-capsule]:!bg-secondary [&_.arco-tabs-header-nav-capsule_.arco-tabs-header-title]:!text-muted-foreground [&_.arco-tabs-header-nav-capsule_.arco-tabs-header-title-active]:!text-foreground [&_.arco-tabs-header-nav-capsule_.arco-tabs-header-title-active]:!bg-accent [&_.arco-tabs-header-nav-capsule_.arco-tabs-header-ink]:!bg-transparent"
          >
            {categories.map((cat) => (
              <TabPane key={cat.key} title={cat.title} />
            ))}
          </Tabs>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">暂无相关产品</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-muted-foreground text-sm">
            © 2026 NexusAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
