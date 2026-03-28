import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { getConfigVersion, restoreConfigVersion } from '@/lib/api-client'
import { ConfigVersionInfo } from '../types'

export function useVersion() {
  const [viewingPreviousVersion, setViewingPreviousVersion] = useState<string | null>(null)
  const [previousVersionData, setPreviousVersionData] = useState<any>(null)
  const [previousVersionInfo, setPreviousVersionInfo] = useState<ConfigVersionInfo | null>(null)
  const [restoringVersion, setRestoringVersion] = useState(false)

  const viewPreviousVersion = useCallback(async (configType: string) => {
    try {
      const result = await getConfigVersion(configType)

      if (result.success) {
        setPreviousVersionData(result.data)
        setPreviousVersionInfo(result.version)
        setViewingPreviousVersion(configType)
      } else {
        toast.info("当前配置项还没有历史版本记录,提交配置后将创建第一个版本。")
      }
    } catch (error) {
      toast.error("获取上一版本失败")
    }
  }, [])

  const restoreVersion = useCallback(async (configType: string) => {
    const confirmed = window.confirm("确定要还原到上一版本吗?当前配置将被覆盖。")
    
    if (!confirmed) {
      return false
    }

    setRestoringVersion(true)
    try {
      const result = await restoreConfigVersion(configType)

      if (result.success) {
        toast.success("版本还原成功")
        return true
      } else {
        toast.error(result.message || "版本还原失败")
        return false
      }
    } catch (error) {
      toast.error("版本还原失败")
      return false
    } finally {
      setRestoringVersion(false)
    }
  }, [])

  const closeVersionView = useCallback(() => {
    setViewingPreviousVersion(null)
    setPreviousVersionData(null)
    setPreviousVersionInfo(null)
  }, [])

  return {
    viewingPreviousVersion,
    previousVersionData,
    previousVersionInfo,
    restoringVersion,
    viewPreviousVersion,
    restoreVersion,
    closeVersionView
  }
}
