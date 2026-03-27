export function safeJsonParse<T>(str: string | null | undefined, defaultValue: T): T {
  if (!str) {
    return defaultValue
  }
  try {
    return JSON.parse(str) as T
  } catch (error) {
    console.warn('JSON parse failed, using default value:', error)
    return defaultValue
  }
}

export function safeJsonStringify(obj: any, defaultValue: string = '{}'): string {
  try {
    return JSON.stringify(obj)
  } catch (error) {
    console.warn('JSON stringify failed, using default value:', error)
    return defaultValue
  }
}

export function safeJsonParseArray<T>(str: string | null | undefined, defaultValue: T[] = []): T[] {
  return safeJsonParse(str, defaultValue)
}

export function safeJsonParseObject<T extends Record<string, any>>(str: string | null | undefined, defaultValue: T = {} as T): T {
  return safeJsonParse(str, defaultValue)
}
