import { LocationIcon, PhoneIcon, EmailIcon, SettingsGearIcon } from "../icons"
import { Logo } from "@/components/common/logo"
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
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.companyInfo}>
            <div className={styles.logoSection}>
              <Logo className={styles.logo} />
              <span className={styles.logoText}>{defaultSiteConfig.name}</span>
            </div>
            <p className={styles.description}>
              {config?.description || defaultFooterConfig.description}
            </p>
          </div>

          <div>
            <h4 className={styles.sectionTitle}>联系方式</h4>
            <ul className={styles.contactList}>
              {contactInfo.map((info, index) => {
                const Icon = info.icon
                return (
                  <li key={index} className={styles.contactItem}>
                    <span className={styles.contactIcon}>{Icon}</span>
                    <div className={styles.contactContent}>
                      <p className={styles.contactLabel}>{info.title}</p>
                      <p className={styles.contactText}>{info.content}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          <div>
            <h4 className={styles.sectionTitle}>关注我们</h4>
            <div className={styles.qrSection}>
              <div className={styles.qrItem}>
                <div className={styles.qrContainer}>
                  <div className={styles.qrPlaceholder}>
                    <span className={styles.qrText}>微信二维码</span>
                  </div>
                </div>
                <p className={styles.qrLabel}>扫码关注</p>
              </div>
              <div className={styles.qrItem}>
                <div className={styles.qrContainer}>
                  <div className={styles.qrPlaceholder}>
                    <span className={styles.qrText}>公众号二维码</span>
                  </div>
                </div>
                <p className={styles.qrLabel}>扫码关注</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.bottomSection}>
          <div className={styles.bottomContent}>
            <p className={styles.copyright}>
              &copy; {currentYear} {defaultSiteConfig.name}. All rights reserved.
            </p>
            <p className={styles.icp}>
              {defaultSiteConfig.icp}
            </p>
            <a 
              href="/admin" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.adminLink}
            >
              <span className={styles.adminIcon}><SettingsGearIcon /></span>
              管理后台
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
