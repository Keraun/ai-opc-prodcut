// Feishu utility functions

/**
 * Extracts tableId from Feishu links
 * @param input - Either a Feishu link or a direct tableId
 * @returns Extracted tableId or the original input if no tableId found
 */
export function extractTableId(input: string): string {
  // If input is already a valid tableId (alphanumeric string), return it directly
  if (/^[a-zA-Z0-9_-]+$/.test(input)) {
    return input
  }

  // Try to extract tableId from various Feishu link formats
  const patterns = [
    // Sheets format: https://example.feishu.cn/sheets/{tableId}?sheet={sheetId}
    /\/sheets\/([a-zA-Z0-9_-]+)/,
    // Base format: https://example.feishu.cn/base/{tableId}?view={viewId}
    /\/base\/([a-zA-Z0-9_-]+)/,
    // Other possible formats
    /tableId=([a-zA-Z0-9_-]+)/
  ]

  for (const pattern of patterns) {
    const match = input.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  // If no tableId found, return the original input
  return input
}

/**
 * Validates if a string is a Feishu table link
 * @param input - Input string to check
 * @returns True if input is a Feishu table link, false otherwise
 */
export function isFeishuTableLink(input: string): boolean {
  return (
    input.includes('feishu.cn') &&
    (input.includes('/sheets/') || input.includes('/base/'))
  )
}
