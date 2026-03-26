import Link from "next/link"
import { Card, Section, Button } from "@/components/ui"
import type { ModuleProps } from "@/modules/types"
import type { PricingData, PricingFeature } from "./types"

// SVG 图标组件
const CheckIcon = () => (
  <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
)

const ArrowRightIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
)

export function PricingModule({ data }: ModuleProps) {
  const config: PricingData = (data as PricingData) || {}

  const primaryColor = "#1e40af" // 默认主色

  const defaultPlans: PricingFeature[] = [
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

  const pricingPlans: PricingFeature[] = config?.plans || defaultPlans

  return (
    <Section
      id="pricing"
      title={config?.title || '选择适合你的计划'}
      description={config?.description || '无论你是个人创业者还是企业用户，我们都有适合你的AI解决方案'}
      variant="default"
      padding="lg"
      centered
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        {pricingPlans.map((plan: PricingFeature, index: number) => {
          const cardFooter = plan.link ? (
            <Link href={plan.link} className="w-full">
              <Button
                variant={plan.isPopular ? "primary" : "outline"}
                size="lg"
                fullWidth
                icon={<ArrowRightIcon />}
                iconPosition="right"
              >
                {plan.buttonText}
              </Button>
            </Link>
          ) : (
            <Button
              variant={plan.isPopular ? "primary" : "outline"}
              size="lg"
              fullWidth
              disabled
              icon={<ArrowRightIcon />}
              iconPosition="right"
            >
              {plan.buttonText}
            </Button>
          )

          return (
            <Card
              key={index}
              variant={plan.isPopular ? "elevated" : "default"}
              padding="lg"
              hover
              className={`relative ${plan.isPopular ? 'ring-2 ring-blue-600' : ''}`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                    最受欢迎
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.title}</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  <span style={{ color: plan.isPopular ? primaryColor : undefined }}>{plan.price}</span>
                  <span className="text-base font-normal text-gray-500">/月</span>
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {(plan.features || []).map((feature: string, i: number) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckIcon />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {cardFooter}
            </Card>
          )
        })}
      </div>
    </Section>
  )
}
