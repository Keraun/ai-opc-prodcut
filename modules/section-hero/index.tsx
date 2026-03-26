"use client"

import { Button } from "@arco-design/web-react"
import { IconArrowRight, IconCommand, IconStar, IconThunderbolt } from "@arco-design/web-react/icon"
import Link from "next/link"
import { Logo } from "@/components/common/logo"
import { useTheme } from "@/components/theme-provider"
import type { ModuleProps } from "@/modules/types"
import type { HeroData } from "./types"
import styles from "./index.module.css"

export function HeroModule({ data }: ModuleProps) {
  const { themeConfig } = useTheme()
  const config: HeroData = (data as HeroData) || {}

  const primaryColor = themeConfig?.colors?.primary || "#1e40af"
  const accentColor = themeConfig?.colors?.accent || "#06b6d4"

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
              type="primary"
              size="large"
              style={{
                backgroundColor: primaryColor,
                color: 'white',
                height: '3.5rem',
                paddingLeft: '2.5rem',
                paddingRight: '2.5rem',
                fontSize: '1rem',
                borderRadius: '0.75rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease'
              }}
            >
              <IconCommand style={{ marginRight: '0.5rem', fontSize: '1.125rem' }} />
              {config.buttons.primary.text}
            </Button>
          </Link>
        )}

        {config.buttons?.secondary?.text && (
          <Button
            type="secondary"
            size="large"
            style={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              color: '#374151',
              height: '3.5rem',
              paddingLeft: '2.5rem',
              paddingRight: '2.5rem',
              fontSize: '1rem',
              borderRadius: '0.75rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease'
            }}
          >
            {config.buttons.secondary.text}
            <IconArrowRight style={{ marginLeft: '0.5rem' }} />
          </Button>
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
              <Link href={config.buttons.primary.href}>
                <Button
                  type="primary"
                  size="large"
                  style={{
                    backgroundColor: primaryColor,
                    color: 'white',
                    height: '3.5rem',
                    paddingLeft: '2.5rem',
                    paddingRight: '2.5rem',
                    fontSize: '1rem',
                    borderRadius: '0.75rem',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <IconStar style={{ marginRight: '0.5rem', fontSize: '1.125rem' }} />
                  {config.buttons.primary.text}
                </Button>
              </Link>
            )}

            {config.buttons?.secondary?.text && (
              <Button
                type="secondary"
                size="large"
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  color: '#374151',
                  height: '3.5rem',
                  paddingLeft: '2.5rem',
                  paddingRight: '2.5rem',
                  fontSize: '1rem',
                  borderRadius: '0.75rem',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease'
                }}
              >
                {config.buttons.secondary.text}
                <IconArrowRight style={{ marginLeft: '0.5rem' }} />
              </Button>
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
                <IconThunderbolt className={styles.layout2ImageIcon} />
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
              <Link href={config.buttons.primary.href}>
                <Button
                  type="primary"
                  size="large"
                  style={{
                    backgroundColor: primaryColor,
                    color: 'white',
                    height: '3.5rem',
                    paddingLeft: '2.5rem',
                    paddingRight: '2.5rem',
                    fontSize: '1rem',
                    borderRadius: '0.75rem',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <IconCommand style={{ marginRight: '0.5rem', fontSize: '1.125rem' }} />
                  {config.buttons.primary.text}
                </Button>
              </Link>
            )}

            {config.buttons?.secondary?.text && (
              <Button
                type="secondary"
                size="large"
                style={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  color: '#374151',
                  height: '3.5rem',
                  paddingLeft: '2.5rem',
                  paddingRight: '2.5rem',
                  fontSize: '1rem',
                  borderRadius: '0.75rem',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease'
                }}
              >
                {config.buttons.secondary.text}
                <IconArrowRight style={{ marginLeft: '0.5rem' }} />
              </Button>
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
