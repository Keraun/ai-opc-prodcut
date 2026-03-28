import Image from 'next/image'
import type { ModuleProps } from "@/modules/types"
import type { PartnerData, PartnerItem } from "./types"
import { Section } from "@/components/ui"
import styles from "./index.module.css"

export function PartnerModule({ data }: ModuleProps) {
  const config: PartnerData = (data as PartnerData) || {}
  const items: PartnerItem[] = config.items || []

  return (
    <Section
      id="partner"
      badge={config.sectionTag}
      title={config.title}
      description={config.description}
      className={styles.container}
      useThemeBadgeColor
      centered
    >
      <ul className={styles.partnerList}>
        {items.map((item: PartnerItem, index: number) => (
          <li className={styles.partnerItem} key={index}>
            <Image
              src={item.src || ''}
              alt={item.alt || ''}
              width={1}
              height={1}
              className={styles.partnerImage}
            />
          </li>
        ))}
      </ul>
    </Section>
  )
}
