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
    <div className="flex flex-col items-center justify-center gap-4 " style={{ padding: '0 24px 24px 24px' }}>
      <div className="mt-12 text-xl sm:text-2xl font-bold text-gray-900">来自优秀伙伴的信任</div>
      <ul className="flex flex-wrap gap-4">
        {images?.map((imgSrc, index) => (
          <li className="flex items-center justify-center" style={{ width: 110 }} key={index} >
            <Image
              src={imgSrc}
              alt=""
              width={1}    // 随便填，会被样式覆盖
              height={1}   // 随便填，会被样式覆盖
              style={{
                height: '48px',   // 你要的固定高度
                width: 'auto',    // 宽度自动（关键）
              }}
            /></li>

        ))}
      </ul>
    </div>
  )
}
