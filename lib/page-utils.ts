export function isSystemPage(pageId: string, systemPages: string[]): boolean {
  return systemPages.includes(pageId)
}
