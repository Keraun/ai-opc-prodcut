"use client"

import { Button, Card, Modal } from "@arco-design/web-react"
import { IconCheck, IconArrowRight, IconQrcode } from "@arco-design/web-react/icon"
import { useTheme } from "@/components/theme-provider"
import { useState } from "react"

interface PricingProps {
  data?: any
}

export function Pricing({ data }: PricingProps) {
  const { themeConfig } = useTheme()
  const pricingConfig = data || {}

  const [qrModalVisible, setQrModalVisible] = useState(false)

  const primaryColor = themeConfig?.colors?.primary || "#1e40af"

  const pricingPlans = pricingConfig?.plans || [
    {
      title: "免费版",
      price: "¥0",
      description: "适合个人用户和小型项目",
      features: [
        "1000+ AI工具访问",
        "基础工作流模板",
        "社区支持",
        "每月100次API调用"
      ],
      buttonText: "开始免费使用",
      link: "/products"
    },
    {
      title: "专业版",
      price: "¥999",
      description: "适合专业用户和小型企业",
      features: [
        "全部AI工具访问",
        "高级工作流定制",
        "优先技术支持",
        "每月1000次API调用",
        "AI GEO课程访问"
      ],
      buttonText: "升级专业版",
      isPopular: true,
      link: "/products"
    },
    {
      title: "企业版",
      price: "¥2999",
      description: "适合企业级用户和团队",
      features: [
        "全部AI工具访问",
        "企业级工作流定制",
        "专属技术支持",
        "无限制API调用",
        "AI GEO课程访问",
        "企业级安全保障"
      ],
      buttonText: "联系销售"
    }
  ]

  const handleButtonClick = (plan: any) => {
    if (plan.link) {
      window.location.href = plan.link
    } else {
      setQrModalVisible(true)
    }
  }

  return (
    <section
      id="pricing"
      className="py-20 bg-gradient-to-b from-white to-slate-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{pricingConfig?.title || '选择适合你的计划'}</h2>
          <p className="text-lg text-gray-500 max-w-3xl mx-auto">
            {pricingConfig?.description || '无论你是个人创业者还是企业用户，我们都有适合你的AI解决方案'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan: any, index: number) => (
            <Card
              key={index}
              className={`overflow-hidden transition-all duration-300 hover:shadow-xl ${plan.isPopular ? 'border-2' : 'border'}`}
              style={{
                borderColor: plan.isPopular ? primaryColor : '#e5e7eb',
                transform: plan.isPopular ? 'translateY(-10px)' : 'none'
              }}
            >
              {plan.isPopular && (
                <div
                  className="text-white text-center py-2 text-sm font-medium"
                  style={{
                    backgroundColor: primaryColor,
                  }}
                >
                  {pricingConfig?.popularLabel || "最受欢迎"}
                </div>
              )}

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.title}</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.price !== '¥0' && <span className="text-gray-500 ml-2">/年</span>}
                </div>
                <p className="text-gray-500 mb-6">{plan.description}</p>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature: string, featureIndex: number) => (
                    <li key={featureIndex} className="flex items-start">
                      <IconCheck className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  type={plan.isPopular ? 'primary' : 'secondary'}
                  long
                  onClick={() => handleButtonClick(plan)}
                  style={plan.isPopular ? { backgroundColor: primaryColor } : {}}
                >
                  {plan.buttonText}
                  <IconArrowRight className="ml-2" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Modal
        title="联系销售"
        visible={qrModalVisible}
        onCancel={() => setQrModalVisible(false)}
        footer={null}
        style={{ maxWidth: 400 }}
      >
        <div className="text-center py-8">
          <div className="w-48 h-48 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <IconQrcode className="text-6xl text-gray-400" />
          </div>
          <p className="text-gray-600">扫描二维码添加客服微信</p>
          <p className="text-gray-500 text-sm mt-2">或拨打客服电话：400-888-4889</p>
        </div>
      </Modal>
    </section>
  )
}
