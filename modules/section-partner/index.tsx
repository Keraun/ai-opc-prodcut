import Image from 'next/image'
import type { ModuleProps } from "@/modules/types"
import type { PartnerData, PartnerItem } from "./types"
import styles from "./index.module.css"

export function PartnerModule({ data }: ModuleProps) {
  const config: PartnerData = (data as PartnerData) || {}
  const items: PartnerItem[] = config.items || []

  return (
    <div id="partner" className={styles.container}>
      <div className={styles.header}>
        {config.sectionTag && (
          <span className={styles.tag}>
            {config.sectionTag}
          </span>
        )}
        <div className={styles.title}>
          {config.title}
        </div>
        {config.description && (
          <p className={styles.description}>
            {config.description}
          </p>
        )}
      </div>
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
    </div>
  )
}
