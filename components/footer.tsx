"use client"

import { IconLocation, IconPhone, IconEmail } from "@arco-design/web-react/icon"
import { Logo } from "@/components/logo"

const contactInfo = [
  {
    icon: IconLocation,
    title: "公司地址",
    content: "北京市海淀区中关村科技园区 创客AI工作室",
  },
  {
    icon: IconPhone,
    title: "联系电话",
    content: "400-888-9999",
  },
  {
    icon: IconEmail,
    title: "电子邮箱",
    content: "contact@makerai.com",
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
              <span className="text-xl font-bold text-gray-900 leading-none">创客AI</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              专注AI一人公司服务，助力个人创业者实现AI赋能。
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
            &copy; {currentYear} 创客AI. All rights reserved.
          </p>
            <p className="text-sm text-gray-500">
              京ICP备XXXXXXXX号-1
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
