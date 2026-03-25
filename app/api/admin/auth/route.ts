import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const adminUserCookie = cookieStore.get('adminUser')
    
    if (!adminUserCookie) {
      return NextResponse.json({
        authenticated: false
      }, { status: 401 })
    }

    const adminUser = JSON.parse(adminUserCookie.value)
    
    return NextResponse.json({
      authenticated: true,
      user: adminUser
    })
  } catch (error) {
    return NextResponse.json({
      authenticated: false
    }, { status: 401 })
  }
}
