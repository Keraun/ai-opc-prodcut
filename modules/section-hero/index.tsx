import Link from "next/link"
import { Logo } from "@/components/common/logo"
import { Section, Button } from "@/components/ui"
import type { ModuleProps } from "@/modules/types"
import type { HeroData } from "./types"
import styles from "./index.module.css"

// SVG 图标组件
const ArrowRightIcon = () => (
  <svg className={styles.svgIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
)

const CommandIcon = () => (
  <svg className={styles.svgIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
  </svg>
)

const StarIcon = () => (
  <svg className={styles.svgIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.78.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
)

const ThunderboltIcon = () => (
  <svg className={styles.svgIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
)

export function HeroModule({ data }: ModuleProps) {
  const config: HeroData = (data as HeroData) || {}

  const primaryColor = "#1e40af" // 默认主色
  const accentColor = "#06b6d4" // 默认强调色

  const layoutType = config.layout || 'layout1'

  const renderLayout1 = () => (
    <div className="text-center">
      {config.badge && (
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6"
          style={{ borderColor: `${accentColor}33`, backgroundColor: `${accentColor}0D` }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
          <span className="text-sm font-medium text-gray-700">{config.badge}</span>
        </div>
      )}

      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
        {config.title?.main && (
          <span style={{ color: primaryColor }}>
            {config.title.main}
          </span>
        )}
        {config.title?.sub && (
          <span className="text-gray-900">
            {config.title.sub}
          </span>
        )}
      </h1>

      {config.subtitle && (
        <p className="text-xl text-gray-600 mb-8 flex items-center justify-center gap-2">
          <Logo className="w-8 h-8" />
          <span>{config.subtitle}</span>
        </p>
      )}

      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {config.buttons?.primary?.href && config.buttons?.primary?.text && (
          <Link href={config.buttons.primary.href}>
            <Button variant="primary" size="lg" icon={<CommandIcon />} iconPosition="left">
              {config.buttons.primary.text}
            </Button>
          </Link>
        )}

        {config.buttons?.secondary?.text && (
          config.buttons?.secondary?.href ? (
            <Link href={config.buttons.secondary.href}>
              <Button variant="secondary" size="lg" icon={<ArrowRightIcon />} iconPosition="right">
                {config.buttons.secondary.text}
              </Button>
            </Link>
          ) : (
            <Button variant="secondary" size="lg" icon={<ArrowRightIcon />} iconPosition="right" disabled>
              {config.buttons.secondary.text}
            </Button>
          )
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {(config.featurePills || ['AI工具站', 'GEO课程', '工作流定制', '一人公司']).map((item: string, index: number) => (
          <span key={index} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
            {item}
          </span>
        ))}
      </div>
    </div>
  )

  const renderLayout2 = () => (
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      <div>
        {config.badge && (
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6"
            style={{ borderColor: `${accentColor}33`, backgroundColor: `${accentColor}0D` }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
            <span className="text-sm font-medium text-gray-700">{config.badge}</span>
          </div>
        )}

        <h1 className="text-4xl sm:text-5xl font-bold mb-6">
          {config.title?.main && (
            <span style={{ color: primaryColor }}>
              {config.title.main}
            </span>
          )}
          {config.title?.sub && (
            <span className="text-gray-900">
              {config.title.sub}
            </span>
          )}
        </h1>

        {config.subtitle && (
          <p className="text-xl text-gray-600 mb-8">
            {config.subtitle}
          </p>
        )}

        <div className="flex flex-wrap gap-4 mb-8">
          {config.buttons?.primary?.href && config.buttons?.primary?.text && (
            <Link href={config.buttons.primary.href}>
              <Button variant="primary" size="lg" icon={<StarIcon />} iconPosition="left">
                {config.buttons.primary.text}
              </Button>
            </Link>
          )}

          {config.buttons?.secondary?.text && (
            config.buttons?.secondary?.href ? (
              <Link href={config.buttons.secondary.href}>
                <Button variant="secondary" size="lg" icon={<ArrowRightIcon />} iconPosition="right">
                  {config.buttons.secondary.text}
                </Button>
              </Link>
            ) : (
              <Button variant="secondary" size="lg" icon={<ArrowRightIcon />} iconPosition="right" disabled>
                {config.buttons.secondary.text}
              </Button>
            )
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {(config.featurePills || ['AI工具站', 'GEO课程', '工作流定制', '一人公司']).map((item: string, index: number) => (
            <span key={index} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="aspect-square rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
          <div className="text-center">
            <ThunderboltIcon />
            <h3 className="text-2xl font-bold text-gray-900 mt-4">AI 赋能</h3>
            <p className="text-gray-600">提升业务效率</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderLayout3 = () => (
    <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
      <div className="text-center">
        {config.badge && (
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6"
            style={{ borderColor: `${accentColor}33`, backgroundColor: '#eff6ff' }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
            <span className="text-sm font-medium text-gray-700">{config.badge}</span>
          </div>
        )}

        <h1 className="text-4xl sm:text-5xl font-bold mb-6">
          {config.title?.main && (
            <span style={{ color: primaryColor }}>
              {config.title.main}
            </span>
          )}
          {config.title?.sub && (
            <span className="text-gray-900">
              {config.title.sub}
            </span>
          )}
        </h1>

        {config.subtitle && (
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {config.subtitle}
          </p>
        )}

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {config.buttons?.primary?.href && config.buttons?.primary?.text && (
            <Link href={config.buttons.primary.href}>
              <Button variant="primary" size="lg" icon={<CommandIcon />} iconPosition="left">
                {config.buttons.primary.text}
              </Button>
            </Link>
          )}

          {config.buttons?.secondary?.text && (
            config.buttons?.secondary?.href ? (
              <Link href={config.buttons.secondary.href}>
                <Button variant="secondary" size="lg" icon={<ArrowRightIcon />} iconPosition="right">
                  {config.buttons.secondary.text}
                </Button>
              </Link>
            ) : (
              <Button variant="secondary" size="lg" icon={<ArrowRightIcon />} iconPosition="right" disabled>
                {config.buttons.secondary.text}
              </Button>
            )
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {['AI工具站', 'GEO课程', '工作流定制', '一人公司'].map((item, index) => (
            <span key={index} className="px-4 py-2 bg-gray-50 text-gray-700 rounded-full text-sm font-medium">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <Section
      id="hero"
      variant={layoutType === 'layout3' ? 'minimal' : 'gradient'}
      padding="lg"
      maxWidth="xl"
    >
      <div className={styles.decorativeBg}>
        <div
          className={`${styles.decorativeCircle} ${styles.decorativeCircle1}`}
          style={{ backgroundColor: `${primaryColor}33` }}
        />
        <div
          className={`${styles.decorativeCircle} ${styles.decorativeCircle2}`}
          style={{ backgroundColor: `${accentColor}33` }}
        />
        <div
          className={`${styles.decorativeCircle} ${styles.decorativeCircle3}`}
          style={{
            background: `linear-gradient(135deg, ${primaryColor}66 0%, ${accentColor}66 100%)`
          }}
        />
      </div>

      {layoutType === 'layout1' && renderLayout1()}
      {layoutType === 'layout2' && renderLayout2()}
      {layoutType === 'layout3' && renderLayout3()}
    </Section>
  )
}
