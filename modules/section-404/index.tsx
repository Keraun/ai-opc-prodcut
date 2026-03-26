import type { ModuleProps } from "@/modules/types"
import { NotFoundResult } from "@/components/ui"
import styles from "./index.module.css"

export function NotFoundModule({ data }: ModuleProps) {
  return  <div className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          <div className={styles.animationWrapper}>
         <NotFoundResult/>
          </div>
        </div>
      </div>
}
