import { LocationIcon, PhoneIcon, EmailIcon } from "../icons"
import { Footer } from "@/components/common/footer"
import type { ModuleProps } from "@/modules/types"
import type { FooterData } from "./types"
import styles from "./index.module.css"

// 默认配置
const defaultSiteConfig = {
  name: "AI 一人公司",
  contact: {
    address: "北京市朝阳区科技园区",
    phone: "138-0013-8000",
    email: "contact@ai-company.com"
  },
  icp: "京ICP备12345678号"
}

const defaultFooterConfig = {
  description: "AI 一人公司，为个人创业者提供全方位的AI解决方案"
}

export function FooterModule({ data }: ModuleProps) {
  const config: FooterData = (data as FooterData) || {}
  const currentYear = new Date().getFullYear()

  const contactInfo = [
    {
      icon: <LocationIcon />,
      title: "公司地址",
      content: config?.address || defaultSiteConfig.contact.address,
    },
    {
      icon: <PhoneIcon />,
      title: "联系电话",
      content: config?.phone || defaultSiteConfig.contact.phone,
    },
    {
      icon: <EmailIcon />,
      title: "电子邮箱",
      content: config?.email || defaultSiteConfig.contact.email,
    },
  ]

  return (
   <Footer/>
  )
}
