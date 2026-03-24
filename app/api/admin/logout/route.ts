import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete('adminUser')
  
  return NextResponse.json({
    success: true,
    message: "退出成功"
  })
}
