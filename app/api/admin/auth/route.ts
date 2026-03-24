import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const adminUserCookie = cookieStore.get('adminUser')
    
    if (!adminUserCookie) {
      return NextResponse.json({
        authenticated: false
      })
    }
    
    const user = JSON.parse(adminUserCookie.value)
    
    return NextResponse.json({
      authenticated: true,
      user: user
    })
  } catch (error) {
    return NextResponse.json({
      authenticated: false
    })
  }
}
