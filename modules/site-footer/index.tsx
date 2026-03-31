import { Footer } from "@/components/common/footer"
import type { ModuleProps } from "@/modules/types"
import type { FooterData } from "./types"

export function FooterModule({ data }: ModuleProps) {
  const config: FooterData = (data as FooterData) || {}

  return (
    <Footer footerData={config} />
  )
}
