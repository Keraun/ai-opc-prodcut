import { useState, useCallback } from 'react'
import { toast } from 'sonner'

export function useSaveConfig() {
  const [saving, setSaving] = useState(false)

  const saveConfig = useCallback(async (type: string, data: any) => {
    try {
      setSaving(true)
      
      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, data }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || '保存失败')
      }

      toast.success('配置保存成功')
      return true
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '保存失败')
      return false
    } finally {
      setSaving(false)
    }
  }, [])

  return { saveConfig, saving }
}
