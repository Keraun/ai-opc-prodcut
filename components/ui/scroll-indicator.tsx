"use client"

import styles from "./scroll-indicator.module.css"

interface ScrollIndicatorProps {
  primaryColor?: string
  onClick?: () => void
  className?: string
}

export function ScrollIndicator({
  primaryColor = "#1e40af",
  onClick,
  className = "",
}: ScrollIndicatorProps) {
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      // 默认行为：滚动到下一个区块
      const currentSection = document.activeElement?.closest("section") ||
        document.querySelector("section")
      if (currentSection?.nextElementSibling) {
        currentSection.nextElementSibling.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  return (
    <div
      className={`${styles.scrollIndicator} ${className}`}
      onClick={handleClick}
      style={{ cursor: "pointer" }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick()
        }
      }}
      aria-label="向下滚动"
    >
      <div className={styles.scrollMouse} style={{ borderColor: primaryColor }}>
        <div className={styles.scrollDot} style={{ backgroundColor: primaryColor }} />
      </div>
      <svg
        className={styles.scrollArrow}
        fill="none"
        viewBox="0 0 24 24"
        stroke={primaryColor}
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </div>
  )
}
