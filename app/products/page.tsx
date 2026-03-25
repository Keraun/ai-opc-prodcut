"use client"

import { useState, useEffect, useRef } from "react"
import { Button, Tag, Card, Input, Tooltip, Modal } from "@arco-design/web-react"
import { IconSearch, IconAt, IconEye, IconClose } from "@arco-design/web-react/icon"
import { Header } from "@/components/common/header"
import { Footer } from "@/components/common/footer"
import { products, productCategories, Product } from "@/config/client"
import { useTheme } from "@/components/theme-provider"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import styles from "./products.module.css"

function ProductCard({ product }: { product: Product }) {
  const [visible, setVisible] = useState(false)
  const { themeConfig } = useTheme()
  
  const primaryColor = themeConfig?.colors?.primary || "#1e40af"
  
  const hasDetails = product.details && (product.details.type === 'markdown' || product.details.type === 'html')
  const hasLink = product.details && product.details.type === 'link' && product.details.link
  
  return (
    <>
      <Card
        hoverable
        className={styles.productCard}
        bodyStyle={{ padding: 0 }}
        cover={
          <div className={styles.productCover}>
            <div className={styles.productCoverPlaceholder}>
              <span>产品图片</span>
            </div>
            <div className={styles.productCoverOverlay} />
          </div>
        }
      >
        <div className={styles.productContent}>
          <div className={styles.productTags}>
            {product.tags.map((tag) => (
              <Tag
                key={tag}
                size="small"
                style={{
                  border: 'none',
                  fontSize: '0.75rem',
                  backgroundColor: tag === "热销" || tag === "限时特惠" 
                    ? 'rgba(239, 68, 68, 0.2)' 
                    : tag === "新品" 
                    ? 'rgba(59, 130, 246, 0.2)'
                    : tag === "免费"
                    ? 'rgba(34, 197, 94, 0.2)'
                    : '#f3f4f6',
                  color: tag === "热销" || tag === "限时特惠"
                    ? '#dc2626'
                    : tag === "新品"
                    ? '#2563eb'
                    : tag === "免费"
                    ? '#16a34a'
                    : '#4b5563'
                }}
              >
                {tag}
              </Tag>
            ))}
          </div>
          
          <Tooltip content={product.title} position="top">
            <h3 className={styles.productTitle}>
              {product.title}
            </h3>
          </Tooltip>
          
          <Tooltip content={product.description} position="top">
            <p className={styles.productDescription}>
              {product.description}
            </p>
          </Tooltip>
          
          <div className={styles.productFooter}>
            <div className={styles.productPriceRow}>
              <div className={styles.productPriceWrapper}>
                {product.price === 0 ? (
                  <span className={styles.productPriceFree}>免费</span>
                ) : (
                  <>
                    <span 
                      className={styles.productPrice}
                      style={{ color: primaryColor }}
                    >
                      ¥{product.price}
                    </span>
                    {product.originalPrice && (
                      <span className={styles.productOriginalPrice}>
                        ¥{product.originalPrice}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
            
            <div className={styles.productButtons}>
              <Button
                type="primary"
                size="small"
                icon={<IconAt />}
                style={{ 
                  backgroundColor: primaryColor,
                  color: 'white'
                }}
                className={`${styles.productButton} ${styles.productButtonPrimary}`}
                onClick={() => setVisible(true)}
              >
                {product.price === 0 ? "获取" : "购买"}
              </Button>
              {hasDetails && (
                <Button
                  type="outline"
                  size="small"
                  icon={<IconEye />}
                  style={{ 
                    borderColor: primaryColor,
                    color: primaryColor
                  }}
                  className={styles.productButton}
                  onClick={() => setVisible(true)}
                >
                  详情
                </Button>
              )}
              {hasLink && (
                <Button
                  type="outline"
                  size="small"
                  icon={<IconEye />}
                  style={{ 
                    borderColor: primaryColor,
                    color: primaryColor
                  }}
                  className={styles.productButton}
                  onClick={() => window.open(product.details?.link, '_blank')}
                >
                  详情
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
      
      {hasDetails && (
        <Modal
          title={product.title}
          visible={visible}
          onCancel={() => setVisible(false)}
          footer={null}
          style={{ width: '80%', maxWidth: '800px' }}
        >
          <div className={styles.modalContent}>
            {product.details?.type === 'markdown' && (
              <div>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {product.details.content}
                </ReactMarkdown>
              </div>
            )}
            {product.details?.type === 'html' && (
              <div dangerouslySetInnerHTML={{ __html: product.details.content || '' }} />
            )}
          </div>
        </Modal>
      )}
      
      {!hasDetails && !hasLink && (
        <Modal
          title={product.price === 0 ? "获取方式" : "购买方式"}
          visible={visible}
          onCancel={() => setVisible(false)}
          footer={null}
          style={{ width: '60%', maxWidth: '500px' }}
        >
          <div className={styles.modalQRContainer}>
            <div className={styles.modalQRWrapper}>
              <div className={styles.modalQRInner}>
                <div className={styles.modalQRPlaceholder}>
                  <span>扫码咨询</span>
                </div>
              </div>
            </div>
            <p className={styles.modalQRText}>
              {product.price === 0 ? "扫描二维码免费获取" : "扫描二维码咨询购买"}
            </p>
            <p className={styles.modalQRSubtext}>
              工作时间：9:00-18:00
            </p>
          </div>
        </Modal>
      )}
    </>
  )
}

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchText, setSearchText] = useState("")
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({})
  const { themeConfig } = useTheme()
  
  const primaryColor = themeConfig?.colors?.primary || "#1e40af"
  const accentColor = themeConfig?.colors?.accent || "#06b6d4"

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
    if (!searchText.trim()) return true
    
    const searchLower = searchText.toLowerCase().trim()
    const keywords = searchLower.split(/\s+/).filter(k => k.length > 0)
    
    const matchesTitle = keywords.some(keyword => 
      product.title.toLowerCase().includes(keyword)
    )
    const matchesDescription = keywords.some(keyword => 
      product.description.toLowerCase().includes(keyword)
    )
    const matchesTags = keywords.some(keyword => 
      product.tags.some(tag => tag.toLowerCase().includes(keyword))
    )
    const matchesCategory = keywords.some(keyword => 
      product.category.toLowerCase().includes(keyword)
    )
    const matchesPrice = keywords.some(keyword => {
      if (product.price === 0 && keyword === "免费") return true
      return product.price.toString().includes(keyword)
    })
    
    return matchesTitle || matchesDescription || matchesTags || matchesCategory || matchesPrice
  })

  const scrollToSection = (key: string) => {
    const section = sectionRefs.current[key]
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
        <section className={styles.searchSection}>
          <div className={styles.searchBackground}>
            <div className={styles.searchBgCircle1} />
            <div className={styles.searchBgCircle2} />
          </div>
          
          <div className={styles.searchContent}>
            <div className={styles.searchHeader}>
              <div>
                <h1 className={styles.searchTitle}>
                  探索 <span 
                    className={styles.searchTitleGradient}
                    style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${accentColor})` }}
                  >
                    AI 产品
                  </span>
                </h1>
                <p className={styles.searchSubtitle}>
                  精选优质 AI 工具、课程和服务
                </p>
                <p className={styles.searchResult}>
                  {searchText.trim() ? (
                    <span>
                      筛选结果：共找到 <span style={{ fontWeight: 600, color: primaryColor }}>{filteredProducts.length}</span> 个产品
                    </span>
                  ) : (
                    <span className={styles.searchResultHidden}>筛选结果：共找到 0 个产品</span>
                  )}
                </p>
              </div>
              
              <div className={styles.searchInputWrapper}>
                <Input
                  prefix={<IconSearch />}
                  placeholder="搜索产品..."
                  value={searchText}
                  onChange={setSearchText}
                  suffix={
                    searchText.trim() && (
                      <div 
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSearchText("")}
                      >
                        <IconClose />
                      </div>
                    )
                  }
                />
              </div>
            </div>
          </div>
        </section>

        <section className={styles.productsSection}>
          <div className={styles.productsContainer}>
            <div className={styles.productsLayout}>
              <div className={styles.sidebar}>
                <div className={styles.sidebarContent}>
                  {productCategories.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => scrollToSection(cat.key)}
                      className={`${styles.categoryButton} ${activeTab === cat.key ? styles.categoryButtonActive : styles.categoryButtonInactive}`}
                      style={activeTab === cat.key ? { backgroundColor: primaryColor } : undefined}
                    >
                      {activeTab === cat.key && (
                        <div className={styles.categoryButtonIndicator} />
                      )}
                      {cat.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.productsContent}>
                {productCategories.map((cat) => {
                  const categoryProducts = filteredProducts.filter((p) => cat.key === "all" || p.category === cat.key)
                  if (cat.key === "all") return null
                  
                  return (
                    <div
                      key={cat.key}
                      ref={(el) => {
                        sectionRefs.current[cat.key] = el
                      }}
                      id={cat.key}
                      className={styles.categorySection}
                    >
                      <h2 className={styles.categoryHeader}>
                        <div 
                          className={styles.categoryIndicator}
                          style={{ backgroundColor: primaryColor }}
                        />
                        {cat.title}
                        <span className={styles.categoryCount}>
                          ({categoryProducts.length})
                        </span>
                      </h2>
                      
                      {categoryProducts.length > 0 ? (
                        <div className={styles.productsGrid}>
                          {categoryProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                          ))}
                        </div>
                      ) : (
                        <div className={styles.emptyState}>
                          <p className={styles.emptyText}>暂无{cat.title}</p>
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
