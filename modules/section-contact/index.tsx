import type { ModuleProps } from "@/modules/types"
import type { ContactData } from "./types"
import { Section } from "@/components/ui"
import styles from "./index.module.css"
import { ContactFormClient } from "./contact-form"

export function ContactModule({ data }: ModuleProps) {
  const config: ContactData = (data as ContactData) || {}

  return (
    <Section
      id="contact"
      badge={config.sectionTag}
      title={config.title}
      description={config.description}
      className={styles.section}
      useThemeBadgeColor
      centered
    >
      <div className={styles.bgPattern} />
      <div className={styles.decorativeOrb1} />
      <div className={styles.decorativeOrb2} />

      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.cardContent}>
            <ContactFormClient
              contactPreferences={config.contactPreferences}
            />
          </div>
        </div>
      </div>
    </Section>
  )
}
