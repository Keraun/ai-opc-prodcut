"use client"

import { IconLocation, IconPhone, IconEmail, IconSettings } from "@arco-design/web-react/icon"
import { Logo } from "@/components/common/logo"
import { siteConfig, footerConfig } from "@/config/client"

const contactInfo = [
  {
    icon: IconLocation,
    title: "公司地址",
    content: siteConfig.contact.address,
  },
  {
    icon: IconPhone,
    title: "联系电话",
    content: siteConfig.contact.phone,
  },
  {
    icon: IconEmail,
    title: "电子邮箱",
    content: siteConfig.contact.email,
  },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <Logo className="w-10 h-10 flex-shrink-0" />
              <span className="text-xl font-bold text-gray-900 leading-none">{siteConfig.name}</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {footerConfig.description}
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">联系方式</h4>
            <ul className="space-y-3">
              {contactInfo.map((info, index) => {
                const Icon = info.icon
                return (
                  <li key={index} className="flex items-start gap-3">
                    <Icon className="text-blue-600 text-lg flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">{info.title}</p>
                      <p className="text-sm text-gray-700">{info.content}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* QR Codes */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">关注我们</h4>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-200 mb-2">
                  <div className="w-20 h-20 bg-white rounded flex items-center justify-center">
                    <span className="text-xs text-gray-400">微信二维码</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">扫码关注</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-200 mb-2">
                  <div className="w-20 h-20 bg-white rounded flex items-center justify-center">
                    <span className="text-xs text-gray-400">公众号二维码</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">扫码关注</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              &copy; {currentYear} {siteConfig.name}. All rights reserved.
            </p>
            <p className="text-sm text-gray-500">
              {siteConfig.icp}
            </p>
            <a 
              href="/admin" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1"
            >
              <IconSettings className="text-sm" />
              管理后台
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
