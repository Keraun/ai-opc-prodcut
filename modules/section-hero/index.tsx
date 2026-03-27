import Link from "next/link"
import { Logo } from "@/components/common/logo"
import { Section, Button } from "@/components/ui"
import { useTheme } from "@/components/theme-provider"
import { ArrowRightIcon, CommandIcon, StarIcon, ThunderboltIcon } from "@/modules/icons"
import type { ModuleProps } from "@/modules/types"
import type { HeroData } from "./types"
import styles from "./index.module.css"

export function HeroModule({ data }: ModuleProps) {
  const config: HeroData = (data as HeroData) || {}
  const { themeConfig } = useTheme()

  const primaryColor = themeConfig?.colors.primary || "#1e40af" // 默认主色
  const accentColor = themeConfig?.colors.accent || "#06b6d4" // 默认强调色

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
            <Link href={config.buttons.primary.href}>
              <Button 
                variant="primary" 
                size="lg" 
                icon={<CommandIcon />} 
                iconPosition="left"
                style={{ 
                  backgroundColor: primaryColor, 
                  borderColor: primaryColor,
                  color: '#ffffff'
                }}
              >
                {config.buttons.primary.text}
              </Button>
            </Link>
          )}

          {config.buttons?.secondary?.text && (
            config.buttons?.secondary?.href ? (
              <Link href={config.buttons.secondary.href}>
                <Button 
                  variant="secondary" 
                  size="lg" 
                  icon={<ArrowRightIcon />} 
                  iconPosition="right"
                  style={{ 
                    borderColor: primaryColor, 
                    color: primaryColor
                  }}
                >
                  {config.buttons.secondary.text}
                </Button>
              </Link>
            ) : (
              <Button 
                variant="secondary" 
                size="lg" 
                icon={<ArrowRightIcon />} 
                iconPosition="right" 
                disabled
                style={{ 
                  borderColor: primaryColor, 
                  color: primaryColor
                }}
              >
                {config.buttons.secondary.text}
              </Button>
            )
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
            <span style={{ color: primaryColor }}>
              {config.title.main}
            </span>
          )}
          {config.title?.sub && (
            <span style={{ color: '#111827' }}>
              {config.title.sub}
            </span>
          )}
        </h1>

        {config.subtitle && (
          <p className={styles.subtitlePlain}>
            {config.subtitle}
          </p>
        )}

        <div className={`${styles.ctaButtons} ${styles.ctaButtonsLeft}`}>
          {config.buttons?.primary?.href && config.buttons?.primary?.text && (
            <Link href={config.buttons.primary.href}>
              <Button 
                variant="primary" 
                size="lg" 
                icon={<StarIcon />} 
                iconPosition="left"
                style={{ 
                  background: primaryColor, 
                  borderColor: primaryColor,
                  color: '#ffffff',
                  boxShadow: `0 8px 25px -8px ${primaryColor}`
                }}
              >
                {config.buttons.primary.text}
              </Button>
            </Link>
          )}

          {config.buttons?.secondary?.text && (
            config.buttons?.secondary?.href ? (
              <Link href={config.buttons.secondary.href}>
                <Button 
                  variant="secondary" 
                  size="lg" 
                  icon={<ArrowRightIcon />} 
                  iconPosition="right"
                  style={{ 
                    borderColor: primaryColor, 
                    color: primaryColor
                  }}
                >
                  {config.buttons.secondary.text}
                </Button>
              </Link>
            ) : (
              <Button 
                variant="secondary" 
                size="lg" 
                icon={<ArrowRightIcon />} 
                iconPosition="right" 
                disabled
                style={{ 
                  borderColor: primaryColor, 
                  color: primaryColor
                }}
              >
                {config.buttons.secondary.text}
              </Button>
            )
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
              <ThunderboltIcon />
              <h3 className={styles.layout2ImageTitle}>AI 赋能</h3>
              <p className={styles.layout2ImageDesc}>提升业务效率</p>
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
              <span style={{ color: primaryColor }}>
                {config.title.main}
              </span>
            )}
            {config.title?.sub && (
              <span style={{ color: '#111827' }}>
                {config.title.sub}
              </span>
            )}
          </h1>

          {config.subtitle && (
            <p className={styles.subtitlePlain}>
              {config.subtitle}
            </p>
          )}

          <div className={styles.ctaButtons}>
            {config.buttons?.primary?.href && config.buttons?.primary?.text && (
              <Link href={config.buttons.primary.href}>
                <Button 
                  variant="primary" 
                  size="lg" 
                  icon={<CommandIcon />} 
                  iconPosition="left"
                  style={{ 
                    backgroundColor: primaryColor, 
                    borderColor: primaryColor,
                    color: '#ffffff'
                  }}
                >
                  {config.buttons.primary.text}
                </Button>
              </Link>
            )}

            {config.buttons?.secondary?.text && (
              config.buttons?.secondary?.href ? (
                <Link href={config.buttons.secondary.href}>
                  <Button 
                    variant="secondary" 
                    size="lg" 
                    icon={<ArrowRightIcon />} 
                    iconPosition="right"
                    style={{ 
                      borderColor: primaryColor, 
                      color: primaryColor
                    }}
                  >
                    {config.buttons.secondary.text}
                  </Button>
                </Link>
              ) : (
                <Button 
                  variant="secondary" 
                  size="lg" 
                  icon={<ArrowRightIcon />} 
                  iconPosition="right" 
                  disabled
                  style={{ 
                    borderColor: primaryColor, 
                    color: primaryColor
                  }}
                >
                  {config.buttons.secondary.text}
                </Button>
              )
            )}
          </div>

          <div className={styles.featurePills}>
            {['AI工具站', 'GEO课程', '工作流定制', '一人公司'].map((item, index) => (
              <span key={index} className={styles.featurePill}>
                {item}
              </span>
            ))}
          </div>
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
