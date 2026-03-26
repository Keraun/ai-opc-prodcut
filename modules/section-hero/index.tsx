import Link from "next/link"
import { Logo } from "@/components/common/logo"
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
    <div className={styles.container}>
      {config.badge && (
        <div
          className={styles.badge}
          style={{ borderColor: `${accentColor}33` }}
        >
          <span
            className={styles.badgeDot}
            style={{ backgroundColor: accentColor }}
          />
          <span className={styles.badgeText}>{config.badge}</span>
        </div>
      )}

      <h1 className={styles.mainTitle}>
        {config.title?.main && (
          <span
            className={styles.titleBlock}
            style={{ color: primaryColor }}
          >
            {config.title.main}
          </span>
        )}
        {config.title?.sub && (
          <span className={styles.titleBlock} style={{ color: '#111827' }}>
            {config.title.sub}
          </span>
        )}
      </h1>

      {config.subtitle && (
        <p className={styles.subtitle}>
          <Logo className={styles.subtitleLogo} />
          <span>{config.subtitle}</span>
        </p>
      )}

      <div className={styles.ctaButtons}>
        {config.buttons?.primary?.href && config.buttons?.primary?.text && (
          <Link href={config.buttons.primary.href} className={styles.primaryButton}>
            <span style={{ marginRight: '0.5rem' }}><CommandIcon /></span>
            {config.buttons.primary.text}
          </Link>
        )}

        {config.buttons?.secondary?.text && (
          <button className={styles.secondaryButton}>
            {config.buttons.secondary.text}
            <span style={{ marginLeft: '0.5rem' }}><ArrowRightIcon /></span>
          </button>
        )}
      </div>

      <div className={styles.featurePills}>
        {(config.featurePills || ['AI工具站', 'GEO课程', '工作流定制', '一人公司']).map((item: string, index: number) => (
          <span key={index} className={styles.featurePill}>
            {item}
          </span>
        ))}
      </div>
    </div>
  )

  const renderLayout2 = () => (
    <div className={styles.container}>
      <div className={styles.layout2Grid}>
        <div className={styles.containerLeft}>
          {config.badge && (
            <div
              className={styles.badge}
              style={{ borderColor: `${accentColor}33` }}
            >
              <span
                className={styles.badgeDot}
                style={{ backgroundColor: accentColor }}
              />
              <span className={styles.badgeText}>{config.badge}</span>
            </div>
          )}

          <h1 className={styles.mainTitle}>
            {config.title?.main && (
              <span
                className={styles.titleBlock}
                style={{ color: primaryColor }}
              >
                {config.title.main}
              </span>
            )}
            {config.title?.sub && (
              <span className={styles.titleBlock} style={{ color: '#111827' }}>
                {config.title.sub}
              </span>
            )}
          </h1>

          {config.subtitle && (
            <p className={`${styles.subtitle} ${styles.subtitlePlain}`}>
              {config.subtitle}
            </p>
          )}

          <div className={`${styles.ctaButtons} ${styles.ctaButtonsLeft}`}>
            {config.buttons?.primary?.href && config.buttons?.primary?.text && (
              <Link href={config.buttons.primary.href} className={styles.primaryButton}>
                <span style={{ marginRight: '0.5rem' }}><StarIcon /></span>
                {config.buttons.primary.text}
              </Link>
            )}

            {config.buttons?.secondary?.text && (
              <button className={styles.secondaryButton}>
                {config.buttons.secondary.text}
                <span style={{ marginLeft: '0.5rem' }}><ArrowRightIcon /></span>
              </button>
            )}
          </div>

          <div className={`${styles.featurePills} ${styles.featurePillsLeft}`}>
            {(config.featurePills || ['AI工具站', 'GEO课程', '工作流定制', '一人公司']).map((item: string, index: number) => (
              <span key={index} className={styles.featurePill}>
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className={styles.layout2Image}>
          <div className={styles.layout2ImageContainer}>
            <div className={styles.layout2ImageBg} />
            <div className={styles.layout2ImageContent}>
              <div className={styles.layout2ImageText}>
                <span className={styles.layout2ImageIcon}><ThunderboltIcon /></span>
                <h3 className={styles.layout2ImageTitle}>AI 赋能</h3>
                <p className={styles.layout2ImageDesc}>提升业务效率</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderLayout3 = () => (
    <div className={styles.layout3Container}>
      <div className={styles.layout3Card}>
        <div className={styles.container}>
          {config.badge && (
            <div
              className={styles.badge}
              style={{ borderColor: `${accentColor}33`, backgroundColor: '#eff6ff' }}
            >
              <span
                className={styles.badgeDot}
                style={{ backgroundColor: accentColor }}
              />
              <span className={styles.badgeText}>{config.badge}</span>
            </div>
          )}

          <h1 className={styles.mainTitle}>
            {config.title?.main && (
              <span
                className={styles.titleBlock}
                style={{ color: primaryColor }}
              >
                {config.title.main}
              </span>
            )}
            {config.title?.sub && (
              <span className={styles.titleBlock} style={{ color: '#111827' }}>
                {config.title.sub}
              </span>
            )}
          </h1>

          {config.subtitle && (
            <p className={`${styles.subtitle} ${styles.subtitlePlain}`} style={{ maxWidth: '42rem', margin: '0 auto 2rem' }}>
              {config.subtitle}
            </p>
          )}

          <div className={styles.ctaButtons}>
            {config.buttons?.primary?.href && config.buttons?.primary?.text && (
              <Link href={config.buttons.primary.href} className={styles.primaryButton}>
                <span style={{ marginRight: '0.5rem' }}><CommandIcon /></span>
                {config.buttons.primary.text}
              </Link>
            )}

            {config.buttons?.secondary?.text && (
              <button className={styles.secondaryButton} style={{ backgroundColor: '#f9fafb' }}>
                {config.buttons.secondary.text}
                <span style={{ marginLeft: '0.5rem' }}><ArrowRightIcon /></span>
              </button>
            )}
          </div>

          <div className={styles.featurePills}>
            {['AI工具站', 'GEO课程', '工作流定制', '一人公司'].map((item, index) => (
              <span key={index} className={styles.featurePill} style={{ backgroundColor: '#f9fafb' }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <section
      id="hero"
      className={`${styles.hero} ${layoutType === 'layout3' ? styles.heroLayout3 : styles.heroLayout1}`}
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

      <div className={styles.scrollIndicator}>
        <span className={styles.scrollText}>向下滚动</span>
        <div className={styles.scrollMouse}>
          <div
            className={styles.scrollDot}
            style={{ backgroundColor: accentColor }}
          />
        </div>
      </div>
    </section>
  )
}
