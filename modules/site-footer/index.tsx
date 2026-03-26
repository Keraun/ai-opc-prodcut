"use client"

import { IconLocation, IconPhone, IconEmail, IconSettings } from "@arco-design/web-react/icon"
import { Logo } from "@/components/common/logo"
import { siteConfig, footerConfig } from "@/config/client"
import type { ModuleProps } from "@/modules/types"
import type { FooterData } from "./types"
import styles from "./index.module.css"

export function FooterModule({ data }: ModuleProps) {
  const config: FooterData = (data as FooterData) || {}
  const currentYear = new Date().getFullYear()

  const contactInfo = [
    {
      icon: IconLocation,
      title: "公司地址",
      content: config?.address || siteConfig.contact.address,
    },
    {
      icon: IconPhone,
      title: "联系电话",
      content: config?.phone || siteConfig.contact.phone,
    },
    {
      icon: IconEmail,
      title: "电子邮箱",
      content: config?.email || siteConfig.contact.email,
    },
  ]

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.companyInfo}>
            <div className={styles.logoSection}>
              <Logo className={styles.logo} />
              <span className={styles.logoText}>{siteConfig.name}</span>
            </div>
            <p className={styles.description}>
              {config?.description || footerConfig.description}
            </p>
          </div>

          <div>
            <h4 className={styles.sectionTitle}>联系方式</h4>
            <ul className={styles.contactList}>
              {contactInfo.map((info, index) => {
                const Icon = info.icon
                return (
                  <li key={index} className={styles.contactItem}>
                    <Icon className={styles.contactIcon} />
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
              &copy; {currentYear} {siteConfig.name}. All rights reserved.
            </p>
            <p className={styles.icp}>
              {siteConfig.icp}
            </p>
            <a 
              href="/admin" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.adminLink}
            >
              <IconSettings className={styles.adminIcon} />
              管理后台
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
