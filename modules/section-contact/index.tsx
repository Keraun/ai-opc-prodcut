import type { ModuleProps } from "@/modules/types"
import type { ContactData } from "./types"
import { Section } from "@/components/ui"
import styles from "./index.module.css"
import { ContactFormClient } from "./contact-form"

export function ContactModule({ data }: ModuleProps) {
  const config: ContactData = (data as ContactData) || {}

  // 从 data 中获取主题颜色，如果没有则使用默认颜色
  const primaryColor = (data as any)?.themeColor || "#1e40af"

  return (
    <Section
      id="contact"
      badge={config.sectionTag}
      title={config.title}
      description={config.description}
      className={styles.section}
      badgeType="yellow"
      centered
    >
      <div className={styles.bgPattern} />
      <div className={styles.decorativeOrb1} />
      <div className={styles.decorativeOrb2} />

      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.cardContent}>
            <ContactFormClient
              primaryColor={primaryColor}
              contactPreferences={config.contactPreferences}
            />
          </div>
        </div>
      </div>
    </Section>
  )
}
