import { toast } from 'sonner'

export function validateJson(value: string): { valid: boolean; error?: string } {
  if (!value.trim()) {
    return { valid: false, error: "JSON内容不能为空" }
  }
  try {
    JSON.parse(value)
    return { valid: true }
  } catch (error: any) {
    const errorMessage = error.message || "JSON格式错误"
    return { valid: false, error: errorMessage }
  }
}

export function formatJson(value: string): { success: boolean; formatted?: string; error?: string } {
  try {
    const parsed = JSON.parse(value)
    const formatted = JSON.stringify(parsed, null, 2)
    return { success: true, formatted }
  } catch (error: any) {
    const errorMessage = error.message || "JSON格式错误"
    return { success: false, error: errorMessage }
  }
}

export function parseJson(value: string): any | null {
  try {
    return JSON.parse(value)
  } catch (error) {
    return null
  }
}

export function stringifyJson(data: any, pretty: boolean = true): string {
  return JSON.stringify(data, null, pretty ? 2 : 0)
}

export function compareJson(obj1: any, obj2: any): boolean {
  return JSON.stringify(obj1) === JSON.stringify(obj2)
}

export function deepCloneJson<T>(data: T): T {
  return JSON.parse(JSON.stringify(data))
}
