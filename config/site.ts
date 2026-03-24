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
    phone: "400-888-9999",
    // 联系邮箱
    email: "contact@makerai.com",
    // 公司地址
    address: "北京市海淀区中关村科技园区 创客AI工作室",
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
