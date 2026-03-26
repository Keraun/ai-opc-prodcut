"use client"

import Image from 'next/image'
import type { ModuleProps } from "@/modules/types"
import type { PartnerData, PartnerItem } from "./types"
import styles from "./index.module.css"

const defaultImages: PartnerItem[] = [
  { src: '/partner/partner_01.png', alt: '' },
  { src: '/partner/partner_02.png', alt: '' },
  { src: '/partner/partner_03.png', alt: '' },
  { src: '/partner/partner_04.png', alt: '' },
  { src: '/partner/partner_05.png', alt: '' },
  { src: '/partner/partner_06.png', alt: '' },
  { src: '/partner/partner_07.png', alt: '' },
  { src: '/partner/partner_08.png', alt: '' },
]

export function PartnerModule({ data }: ModuleProps) {
  const config: PartnerData = (data as PartnerData) || {}
  const items: PartnerItem[] = config.items || defaultImages

  return (
    <div id="partner" className={styles.container}>
      <div className={styles.title}>
        {config.title || "来自优秀伙伴的信任"}
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
