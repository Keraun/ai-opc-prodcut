"use client"

import { useState, useEffect, useRef } from "react"
import { Button, Tag, Card, Input, Tooltip, Modal } from "@arco-design/web-react"
import { IconSearch, IconAt, IconEye } from "@arco-design/web-react/icon"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/common/header"
import { Footer } from "@/components/common/footer"
import { products, productCategories, Product } from "@/config/client"

function ProductCard({ product }: { product: Product }) {
  const [visible, setVisible] = useState(false)
  
  return (
    <>
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
          
          <Tooltip content={product.title} position="top">
            <h3 className="text-base font-semibold text-gray-900 mb-1.5 line-clamp-1 cursor-pointer">
              {product.title}
            </h3>
          </Tooltip>
          
          <Tooltip content={product.description} position="top">
            <p className="text-xs text-gray-500 mb-3 line-clamp-3 leading-relaxed cursor-pointer">
              {product.description}
            </p>
          </Tooltip>
          
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
              onClick={() => setVisible(true)}
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
      
      <Modal
        title={product.price === 0 ? "获取方式" : "购买方式"}
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        className="!max-w-md"
      >
        <div className="text-center py-6">
          <div className="w-64 h-64 mx-auto mb-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center border-2 border-gray-200">
            <div className="text-center">
              <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center mb-2">
                <span className="text-sm text-gray-400">扫码咨询</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            {product.price === 0 ? "扫描二维码免费获取" : "扫描二维码咨询购买"}
          </p>
          <p className="text-xs text-gray-400">
            工作时间：9:00-18:00
          </p>
        </div>
      </Modal>
    </>
  )
}

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchText, setSearchText] = useState("")
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({})

  useEffect(() => {
    const handleScroll = () => {
      const sections = productCategories.map((cat) => cat.key)
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
                  {productCategories.map((cat) => (
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
                {productCategories.map((cat) => {
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
