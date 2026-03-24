"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button, Input, Message } from "@arco-design/web-react"
import { IconUser, IconLock } from "@arco-design/web-react/icon"

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!username || !password) {
      Message.error("请输入用户名和密码")
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.user) {
          sessionStorage.setItem('currentUser', JSON.stringify(data.user))
        }
        Message.success("登录成功")
        router.push("/admin/dashboard")
      } else {
        Message.error(data.message || "登录失败")
      }
    } catch (error) {
      Message.error("登录失败，请重试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">配置管理后台</h1>
            <p className="text-gray-500">请登录以管理网站配置</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                用户名
              </label>
              <Input
                prefix={<IconUser />}
                placeholder="请输入用户名"
                value={username}
                onChange={setUsername}
                className="!h-12"
                onPressEnter={handleLogin}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <Input
                prefix={<IconLock />}
                placeholder="请输入密码"
                type="password"
                value={password}
                onChange={setPassword}
                className="!h-12"
                onPressEnter={handleLogin}
              />
            </div>

            <Button
              type="primary"
              long
              loading={loading}
              onClick={handleLogin}
              className="!h-12 !bg-blue-600 hover:!bg-blue-700"
            >
              登录
            </Button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>默认账号：admin</p>
            <p>默认密码：admin@1234</p>
          </div>
        </div>
      </div>
    </div>
  )
}
