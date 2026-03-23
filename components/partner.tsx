"use client"

import { Button, Space, Link } from "@arco-design/web-react"
import Image from 'next/image';


const images = [
'/partner/partner_01.png',
  
'/partner/partner_02.png',
'/partner/partner_03.png',
'/partner/partner_04.png',
'/partner/partner_05.png',
'/partner/partner_06.png',
'/partner/partner_07.png',
'/partner/partner_08.png',
]
export function Partner() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 " style={{ padding: '0 24px 0 24px' }}>
      <div className="mt-12">来自优秀伙伴的信任</div>
      <ul className="flex flex-wrap gap-4">
        {images?.map((imgSrc, index) => (
          <li style={{ width: 110, height: 34 }} key={index}>
            <Image
              width={110}
              src={imgSrc}
              height={34}
              alt=""
            /></li>

        ))}
      </ul>
    </div>
  )
}
