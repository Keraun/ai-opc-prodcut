"use client"

import { Divider } from "@arco-design/web-react"

const footerLinks = {
  products: {
    title: "产品",
    links: [
      { label: "NexusGPT", href: "#" },
      { label: "NexusChat", href: "#" },
      { label: "NexusVision", href: "#" },
      { label: "NexusCode", href: "#" },
    ],
  },
  services: {
    title: "服务",
    links: [
      { label: "AI战略咨询", href: "#" },
      { label: "定制化开发", href: "#" },
      { label: "技术培训", href: "#" },
      { label: "运维支持", href: "#" },
    ],
  },
  company: {
    title: "公司",
    links: [
      { label: "关于我们", href: "#about" },
      { label: "加入我们", href: "#" },
      { label: "新闻动态", href: "#" },
      { label: "合作伙伴", href: "#" },
    ],
  },
  resources: {
    title: "资源",
    links: [
      { label: "开发文档", href: "#" },
      { label: "API参考", href: "#" },
      { label: "使用指南", href: "#" },
      { label: "常见问题", href: "#" },
    ],
  },
}

const socialIcons = [
  { label: "微", href: "#" },
  { label: "博", href: "#" },
  { label: "in", href: "#" },
  { label: "G", href: "#" },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-card/50 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <span className="text-accent-foreground font-bold text-xl">N</span>
              </div>
              <span className="text-xl font-bold text-foreground">NexusAI</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              让AI技术普惠每一家企业，助力数字化转型升级。
            </p>
            <div className="flex gap-3">
              {socialIcons.map((icon, i) => (
                <a
                  key={i}
                  href={icon.href}
                  className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-xs text-muted-foreground hover:bg-accent/10 hover:text-accent transition-colors"
                >
                  {icon.label}
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-foreground mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Divider className="!my-8 !border-border" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} NexusAI. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              隐私政策
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              服务条款
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Cookie设置
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
