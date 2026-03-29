import { NextResponse } from 'next/server'
import os from 'os'

export async function GET() {
  try {
    const networkInterfaces = os.networkInterfaces()
    let ipAddress = '127.0.0.1'

    for (const name of Object.keys(networkInterfaces)) {
      for (const iface of networkInterfaces[name] || []) {
        if (iface.family === 'IPv4' && !iface.internal) {
          ipAddress = iface.address
          break
        }
      }
    }

    const port = process.env.PORT || '3000'
    const nodeEnv = process.env.NODE_ENV || 'development'

    return NextResponse.json({
      success: true,
      data: {
        port: port,
        ipAddress: ipAddress,
        hostname: os.hostname(),
        platform: os.platform(),
        nodeVersion: process.version,
        uptime: process.uptime(),
        environment: nodeEnv
      }
    })
  } catch (error) {
    console.error('获取系统信息失败:', error)
    return NextResponse.json({
      success: false,
      message: '获取系统信息失败'
    }, { status: 500 })
  }
}
