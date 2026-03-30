import { NextRequest } from "next/server"
import { readConfig } from "@/lib/config-manager"
import { createFeishuAPI } from "@/lib/feishu-api"
import { jsonDb } from "@/lib/json-database"
import { 
  successResponse, 
  errorResponse, 
  badRequestResponse 
} from "@/lib/api-utils"

interface Message {
  id: number
  name: string
  phone: string
  wechat: string
  email: string
  preference: string
  message: string
  ip: string
  region: string
  os: string
  osVersion: string
  browser: string
  browserVersion: string
  deviceModel: string
  userAgent: string
  status: string
  note: string
  feishuRecordId?: string
  created_at: string
  updated_at: string
}

export async function POST(request: NextRequest) {
  try {
    const feishuConfig = readConfig('feishu-app')

    if (!feishuConfig?.appId || !feishuConfig?.appSecret || !feishuConfig?.appToken || !feishuConfig?.tableId) {
      return badRequestResponse("请先配置飞书应用信息")
    }

    const feishuAPI = createFeishuAPI({
      appId: feishuConfig.appId,
      appSecret: feishuConfig.appSecret,
      appToken: feishuConfig.appToken
    })

    const localMessages: Message[] = jsonDb.getAll('messages')
    const syncedCount = {
      localToFeishu: 0,
      feishuToLocal: 0,
      updated: 0
    }

    let pageToken: string | undefined
    const feishuRecords: any[] = []

    do {
      const result = await feishuAPI.getRecords(feishuConfig.appToken, feishuConfig.tableId, {
        pageToken,
        pageSize: 100
      })

      if (!result.success) {
        return errorResponse(result.message || "获取飞书记录失败")
      }

      feishuRecords.push(...(result.data?.records || []))
      pageToken = result.data?.pageToken
    } while (pageToken)

    const localById = new Map<number, Message>()
    const localByFeishuId = new Map<string, Message>()

    localMessages.forEach(msg => {
      localById.set(msg.id, msg)
      if (msg.feishuRecordId) {
        localByFeishuId.set(msg.feishuRecordId, msg)
      }
    })

    for (const record of feishuRecords) {
      const recordId = record.record_id
      const fields = record.fields

      const localMsg = localByFeishuId.get(recordId)

      if (localMsg) {
        const updatedFields: any = {}
        let hasChanges = false

        if (fields['姓名'] && fields['姓名'] !== localMsg.name) {
          updatedFields.name = fields['姓名']
          hasChanges = true
        }
        if (fields['电话'] && fields['电话'] !== localMsg.phone) {
          updatedFields.phone = fields['电话']
          hasChanges = true
        }
        if (fields['微信'] !== undefined && fields['微信'] !== localMsg.wechat) {
          updatedFields.wechat = fields['微信'] || ''
          hasChanges = true
        }
        if (fields['邮箱'] !== undefined && fields['邮箱'] !== localMsg.email) {
          updatedFields.email = fields['邮箱'] || ''
          hasChanges = true
        }
        if (fields['留言内容'] && fields['留言内容'] !== localMsg.message) {
          updatedFields.message = fields['留言内容']
          hasChanges = true
        }

        if (hasChanges) {
          updatedFields.updated_at = new Date().toISOString()
          jsonDb.update('messages', localMsg.id, updatedFields)
          syncedCount.updated++
        }
      } else {
        const newMessage: Omit<Message, 'id'> = {
          name: String(fields['姓名'] || ''),
          phone: String(fields['电话'] || ''),
          wechat: String(fields['微信'] || ''),
          email: String(fields['邮箱'] || ''),
          preference: String(fields['偏好联系方式'] || ''),
          message: String(fields['留言内容'] || ''),
          ip: String(fields['IP地址'] || ''),
          region: '',
          os: String(fields['操作系统'] || ''),
          osVersion: '',
          browser: String(fields['浏览器'] || ''),
          browserVersion: '',
          deviceModel: String(fields['设备机型'] || ''),
          userAgent: '',
          status: 'pending',
          note: '',
          feishuRecordId: recordId,
          created_at: fields['提交时间'] ? new Date(fields['提交时间']).toISOString() : new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        jsonDb.insert('messages', newMessage)
        syncedCount.feishuToLocal++
      }
    }

    for (const localMsg of localMessages) {
      if (!localMsg.feishuRecordId) {
        try {
          const result = await feishuAPI.addRecord(feishuConfig.appToken, feishuConfig.tableId, {
            fields: {
              "姓名": localMsg.name,
              "电话": localMsg.phone,
              "微信": localMsg.wechat || "",
              "邮箱": localMsg.email || "",
              "偏好联系方式": localMsg.preference || "",
              "留言内容": localMsg.message,
              "提交时间": localMsg.created_at,
              "IP地址": localMsg.ip || "",
              "操作系统": localMsg.os || "",
              "设备机型": localMsg.deviceModel || "",
              "浏览器": localMsg.browser || ""
            }
          })

          if (result.success && result.data?.record_id) {
            jsonDb.update('messages', localMsg.id, {
              feishuRecordId: result.data.record_id,
              updated_at: new Date().toISOString()
            })
            syncedCount.localToFeishu++
          }
        } catch (error) {
          console.warn(`同步留言 ${localMsg.id} 到飞书失败:`, error)
        }
      }
    }

    return successResponse({
      localToFeishu: syncedCount.localToFeishu,
      feishuToLocal: syncedCount.feishuToLocal,
      updated: syncedCount.updated,
      total: syncedCount.localToFeishu + syncedCount.feishuToLocal + syncedCount.updated
    }, `同步完成：新增本地到飞书 ${syncedCount.localToFeishu} 条，飞书到本地 ${syncedCount.feishuToLocal} 条，更新 ${syncedCount.updated} 条`)
  } catch (error) {
    console.error("同步飞书数据失败:", error)
    return errorResponse("同步飞书数据失败")
  }
}
