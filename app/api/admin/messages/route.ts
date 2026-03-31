import { NextRequest, NextResponse } from "next/server"
import { jsonDb } from "@/lib/json-database"
import { 
  successResponse, 
  errorResponse, 
  badRequestResponse 
} from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const status = searchParams.get('status') || ''

    // 处理单个留言详情请求
    if (id) {
      const message = jsonDb.findOne('messages', { id: parseInt(id) })
      
      if (!message) {
        return badRequestResponse("留言不存在")
      }

      return successResponse(message)
    }

    // 处理留言列表请求
    let messages = jsonDb.getAll('messages')
    
    if (status) {
      messages = messages.filter((msg: any) => msg.status === status)
    }

    messages.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    const total = messages.length
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedMessages = messages.slice(startIndex, endIndex)

    return successResponse({
      list: paginatedMessages,
      total,
      page,
      pageSize
    })
  } catch (error) {
    console.error("获取留言列表失败:", error)
    return errorResponse("获取留言列表失败", 500)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, note } = body

    if (!id) {
      return badRequestResponse("留言ID不能为空")
    }

    const message = jsonDb.findOne('messages', { id: id })
    
    if (!message) {
      return badRequestResponse("留言不存在")
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (status) {
      updateData.status = status
    }

    if (note !== undefined) {
      updateData.note = note
    }

    const updatedMessage = jsonDb.update('messages', id, updateData)

    return successResponse(updatedMessage, "更新成功")
  } catch (error) {
    console.error("更新留言失败:", error)
    return errorResponse("更新留言失败", 500)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return badRequestResponse("留言ID不能为空")
    }

    const deleted = jsonDb.delete('messages', id)
    
    if (!deleted) {
      return badRequestResponse("删除失败，留言不存在")
    }

    return successResponse(undefined, "删除成功")
  } catch (error) {
    console.error("删除留言失败:", error)
    return errorResponse("删除留言失败", 500)
  }
}
