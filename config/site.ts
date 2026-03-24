/**
 * 网站配置文件
 * 集中管理网站的所有文案和配置信息
 */

/**
 * 网站基本信息配置
 * 包含网站名称、描述、联系方式等基础信息
 */
export const siteConfig = {
  // 网站名称，显示在Header、Footer等位置
  name: "创客AI",
  
  // 网站描述，用于SEO和网站介绍
  description: "专注AI一人公司服务，助力个人创业者实现AI赋能",
  
  // 网站域名
  url: "https://makerai.com",
  
  // Logo配置
  logo: {
    // Logo文字，显示在Logo图标旁边
    text: "创",
  },
  
  // 联系方式配置
  contact: {
    // 联系电话
    phone: "***-***-****",
    // 联系邮箱
    email: "wuly93@163.com",
    // 公司地址
    address: "浙江省杭州市西湖区三墩镇西园八路3号浙大森林",
    // 微信号
    wechat: "makerai_official",
  },
  
  // 社交媒体配置
  social: {
    wechat: {
      // 公众号名称
      name: "微信公众号",
      // 公众号二维码图片路径
      qrcode: "/images/wechat-qr.jpg",
    },
  },
  
  // ICP备案号，显示在Footer底部
  icp: "京ICP备XXXXXXXX号-1",
}

/**
 * SEO配置
 * 搜索引擎优化相关配置
 */
export const seoConfig = {
  // 网站关键词，用于SEO优化
  keywords: [
    'AI一人公司',
    'AI工具',
    'AI课程',
    'AI工作流',
    'AI赋能',
    '个人创业',
    '一人公司',
    'AI GEO课程',
    'AI解决方案',
    '创业者服务',
  ],
  
  // OpenGraph配置（社交媒体分享）
  openGraph: {
    // 网站类型
    type: 'website',
    // 语言
    locale: 'zh_CN',
    // 网站名称
    siteName: '创客AI',
    // 分享图片配置
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '创客AI - 专注AI一人公司服务',
      },
    ],
  },
  
  // Twitter卡片配置
  twitter: {
    // 卡片类型
    card: 'summary_large_image',
    // Twitter账号
    creator: '@makerai',
  },
  
  // 主题颜色
  themeColor: '#1e40af',
  
  // Robots配置（搜索引擎爬虫规则）
  robots: {
    // 是否允许索引
    index: true,
    // 是否允许跟踪链接
    follow: true,
    // 禁止访问的路径
    disallow: ['/api/', '/_next/', '/static/'],
  },
}

/**
 * 产品页面SEO配置
 * 产品页面的SEO相关信息
 */
export const productsSeoConfig = {
  // 页面标题
  title: '产品服务',
  // 页面描述
  description: '探索创客AI的产品服务，包括AI工具站、AI GEO课程、AI工作流定制、AI咨询服务等，助力个人创业者实现AI赋能。',
  // 页面关键词
  keywords: ['AI产品', 'AI工具站', 'AI课程', 'AI工作流', 'AI咨询', '一人公司服务'],
}

/**
 * 首页Hero区域配置
 * 控制首页顶部大标题、副标题、按钮等内容
 */
export const heroConfig = {
  // 顶部徽章文字
  badge: "AI一人公司服务专家",
  
  // 主标题配置
  title: {
    // 主标题第一行
    main: "AI赋能",
    // 主标题第二行
    sub: "一人公司",
  },
  
  // 副标题文字
  subtitle: "专注AI工具、课程、工作流服务",
  
  // 按钮配置
  buttons: {
    // 主按钮（立即体验）
    primary: {
      text: "立即体验",
      href: "/products",
    },
    // 次按钮（了解更多）
    secondary: {
      text: "了解更多",
    },
  },
}

/**
 * 产品配置
 * 首页产品展示区域和产品页面的产品信息
 */
export const productsConfig = [
  {
    // 产品唯一标识
    id: "tools",
    // 图标名称（对应Arco Design图标库）
    icon: "IconApps",
    // 产品名称
    name: "AI工具站",
    // 产品标签
    tag: "核心产品",
    // 标签颜色（Arco Design颜色）
    tagColor: "orange",
    // 产品描述
    description: "精选优质AI工具集合，涵盖写作、设计、编程、营销等多个领域，助力个人创业者快速上手AI工具。",
    // 产品特性列表
    features: ["工具精选", "分类清晰", "持续更新", "免费使用"],
  },
  {
    id: "courses",
    icon: "IconBook",
    name: "AI GEO课程",
    tag: "热门",
    tagColor: "red",
    description: "系统化AI学习课程，从入门到精通，帮助创业者掌握AI技能，提升工作效率和竞争力。",
    features: ["系统课程", "实战案例", "社群答疑", "终身学习"],
  },
  {
    id: "workflows",
    icon: "IconThunderbolt",
    name: "AI工作流",
    tag: "定制服务",
    tagColor: "blue",
    description: "定制化AI工作流解决方案，自动化处理重复性工作，让一人公司也能高效运转。",
    features: ["流程定制", "自动化执行", "效率提升", "降低成本"],
  },
  {
    id: "consulting",
    icon: "IconCustomerService",
    name: "AI咨询服务",
    tag: "专业支持",
    tagColor: "purple",
    description: "一对一AI应用咨询，帮助创业者制定AI赋能策略，解决实际业务问题，实现快速增长。",
    features: ["专业咨询", "方案定制", "持续支持", "效果保障"],
  },
]

/**
 * 服务配置
 * 首页服务展示区域的服务信息
 */
export const servicesConfig = [
  {
    // 服务唯一标识
    id: "tools",
    // 服务名称
    title: "AI工具推荐",
    // 服务描述
    description: "精选优质AI工具，涵盖写作、设计、编程、营销等领域，帮助创业者快速找到合适的工具。",
    // 服务亮点列表
    highlights: ["工具精选", "分类清晰", "免费使用"],
  },
  {
    id: "courses",
    title: "GEO课程培训",
    description: "系统化AI学习课程，从入门到精通，帮助创业者掌握AI技能，提升工作效率。",
    highlights: ["系统课程", "实战案例", "社群答疑"],
  },
  {
    id: "workflows",
    title: "工作流定制",
    description: "根据业务需求定制AI工作流，自动化处理重复性工作，让一人公司高效运转。",
    highlights: ["流程定制", "自动化执行", "效率提升"],
  },
  {
    id: "consulting",
    title: "咨询服务",
    description: "一对一AI应用咨询，帮助创业者制定AI赋能策略，解决实际业务问题。",
    highlights: ["专业咨询", "方案定制", "持续支持"],
  },
]

/**
 * 关于我们配置
 * 首页关于我们区域的内容
 */
export const aboutConfig = {
  // 标题配置
  title: {
    // 主标题
    main: "专注AI",
    // 高亮文字
    highlight: "一人公司服务",
  },
  
  // 描述文字（数组，每段一个元素）
  description: [
    "创客AI专注于为个人创业者提供AI赋能服务。我们深知一人公司的挑战与机遇，致力于通过AI工具、课程和工作流，帮助创业者提升效率、降低成本、实现增长。",
    "从AI工具站到GEO课程，从工作流定制到咨询服务，我们为1000+个人创业者提供了实用的AI解决方案，帮助他们实现一人公司的无限可能。",
  ],
  
  // 使命
  mission: {
    title: "使命",
    description: "让每一位创业者都能轻松驾驭AI，实现一人公司的无限可能。",
  },
  
  // 愿景
  vision: {
    title: "愿景",
    description: "成为最受信赖的AI一人公司服务平台，助力10万+创业者实现梦想。",
  },
  
  // 价值观
  values: {
    title: "价值观",
    description: "专注、实用、高效、共赢，与创业者一起成长，创造价值。",
  },
  
  // 统计数据
  stats: [
    { value: "100+", label: "AI工具" },
    { value: "1000+", label: "学员用户" },
    { value: "50+", label: "工作流案例" },
  ],
}

/**
 * 联系我们配置
 * 联系表单的配置信息
 */
export const contactConfig = {
  // 标题
  title: "联系我们",
  // 副标题
  subtitle: "有任何问题或需求，欢迎随时联系我们",
  
  // 表单配置
  form: {
    // 表单字段配置
    fields: [
      { name: "name", label: "您的姓名", required: true, placeholder: "请输入姓名" },
      { name: "phone", label: "联系电话", required: true, placeholder: "请输入电话" },
      { name: "wechat", label: "微信号", required: false, placeholder: "请输入微信号（选填）" },
      { name: "email", label: "电子邮箱", required: false, placeholder: "请输入邮箱（选填）" },
    ],
    // 偏好联系方式选项
    preferences: [
      { value: "phone", label: "电话" },
      { value: "wechat", label: "微信" },
      { value: "email", label: "邮箱" },
    ],
    // 提交按钮文字
    submitText: "提交留言",
  },
}

/**
 * 页脚配置
 * Footer区域的内容配置
 */
export const footerConfig = {
  // 公司简介描述
  description: "专注AI一人公司服务，助力个人创业者实现AI赋能。",
  
  // 链接配置
  links: {
    // 产品服务链接
    products: {
      title: "产品服务",
      items: [
        { label: "AI工具站", href: "/products#tools" },
        { label: "AI GEO课程", href: "/products#courses" },
        { label: "AI工作流", href: "/products#workflows" },
        { label: "AI咨询服务", href: "/products#consulting" },
      ],
    },
    // 公司信息链接
    company: {
      title: "关于我们",
      items: [
        { label: "公司介绍", href: "/#about" },
        { label: "服务案例", href: "/#services" },
        { label: "联系我们", href: "/#contact" },
      ],
    },
  },
}

/**
 * 导航配置
 * 顶部导航和侧边导航的配置
 */
export const navigationConfig = {
  // 顶部导航栏配置
  main: [
    { label: "首页", href: "/" },
    { label: "产品", href: "/products" },
    { label: "关于我们", href: "/about" },
  ],
  
  // 首页侧边导航配置
  sidebar: [
    { label: "介绍", href: "home" },
    { label: "产品", href: "products" },
    { label: "服务", href: "services" },
    { label: "关于我们", href: "about" },
    { label: "联系我们", href: "contact" },
  ],
}

/**
 * 通用页面配置
 * 用于动态路由页面，支持markdown和html内容渲染
 */
export const pagesConfig: Record<string, {
  title: string
  description?: string
  contentType: 'markdown' | 'html'
  content: string
  showTOC?: boolean
}> = {
  // 示例：关于我们页面
  about: {
    title: '关于我们',
    description: '了解创客AI的使命和愿景',
    contentType: 'markdown',
    showTOC: true,
    content: `
# 关于创客AI

## 我们的使命

创客AI专注于为个人创业者提供AI赋能服务。我们深知一人公司的挑战与机遇，致力于通过AI工具、课程和工作流，帮助创业者提升效率、降低成本、实现增长。

## 我们的愿景

成为最受信赖的AI一人公司服务平台，助力10万+创业者实现梦想。

## 我们的服务

- **AI工具站**：精选优质AI工具集合
- **AI GEO课程**：系统化AI学习课程
- **AI工作流**：定制化AI工作流解决方案
- **AI咨询服务**：一对一AI应用咨询

## 联系我们

- 邮箱：wuly93@163.com
- 微信：makerai_official
- 地址：浙江省杭州市西湖区三墩镇西园八路3号浙大森林
    `.trim(),
  },
  
  // 示例：服务条款页面
  terms: {
    title: '服务条款',
    description: '创客AI服务条款',
    contentType: 'html',
    showTOC: false,
    content: `
<h1>服务条款</h1>
<h2>1. 服务说明</h2>
<p>创客AI为个人创业者提供AI赋能服务，包括但不限于AI工具推荐、课程培训、工作流定制等服务。</p>
<h2>2. 用户责任</h2>
<p>用户应遵守相关法律法规，不得利用本平台从事违法违规活动。</p>
<h2>3. 知识产权</h2>
<p>本平台的所有内容（包括但不限于文字、图片、音频、视频等）的知识产权归创客AI所有。</p>
<h2>4. 免责声明</h2>
<p>本平台提供的服务仅供参考，用户应根据自身情况谨慎决策。</p>
    `.trim(),
  },
  
  // 示例：隐私政策页面
  privacy: {
    title: '隐私政策',
    description: '创客AI隐私政策',
    contentType: 'markdown',
    showTOC: true,
    content: `
# 隐私政策

## 信息收集

我们收集以下信息：
- 联系方式（姓名、电话、邮箱、微信）
- 使用记录
- 设备信息

## 信息使用

我们使用收集的信息用于：
- 提供服务
- 改进用户体验
- 发送通知

## 信息保护

我们采取以下措施保护您的信息：
- 数据加密
- 访问控制
- 安全审计

## Cookie使用

我们使用Cookie来：
- 记住您的偏好
- 分析网站流量
- 改善用户体验

## 联系我们

如有任何隐私相关问题，请联系：
- 邮箱：wuly93@163.com
- 微信：makerai_official
    `.trim(),
  },
}

/**
 * 产品配置
 * 产品页面的产品数据和分类配置
 */
export interface Product {
  id: string
  title: string
  description: string
  price: number
  originalPrice?: number
  image: string
  tags: string[]
  category: string
}

export interface ProductCategory {
  key: string
  title: string
}

export const productCategories: ProductCategory[] = [
  { key: "all", title: "全部产品" },
  { key: "tools", title: "AI 工具" },
  { key: "courses", title: "AI 课程" },
  { key: "services", title: "AI 服务" },
]

export const products: Product[] = [
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
