// 为客户端提供的默认系统页面列表
export const defaultSystemPages = ['home', '404']

export function isSystemPage(pageId: string, systemPages: string[]): boolean {
  return systemPages.includes(pageId)
}
