"use client"

import { useRouter } from 'next/navigation'
import { Home, ArrowLeft } from 'lucide-react'
import { Button, Result } from '@arco-design/web-react'
import { Header } from "@/components/common/header"
import { Footer } from "@/components/common/footer"

export default function NotFoundPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          {/* 404 Animation */}
          <div className="mb-8">
            <Result
              status="404"
              title="页面不存在"
              subTitle="抱歉，您访问的页面不存在或已被移除"
            />
          </div>

         

       
        </div>
      </div>

      <Footer />
    </div>
  )
}
