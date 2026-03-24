"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button, Input, Message } from "@arco-design/web-react"
import { IconLock } from "@arco-design/web-react/icon"

export default function ChangePasswordPage() {
  const router = useRouter()
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Message.error("请填写所有字段")
      return
    }

    if (newPassword !== confirmPassword) {
      Message.error("两次输入的新密码不一致")
      return
    }

    if (newPassword.length < 8) {
      Message.error("新密码长度至少为8位")
      return
    }

    const currentUserStr = sessionStorage.getItem('currentUser')
    if (!currentUserStr) {
      Message.error("未找到用户信息，请重新登录")
      router.push("/admin")
      return
    }

    const currentUser = JSON.parse(currentUserStr)

    setLoading(true)

    try {
      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          username: currentUser.username,
          oldPassword, 
          newPassword 
        }),
      })

      const data = await response.json()

      if (response.ok) {
        Message.success("密码修改成功，请重新登录")
        router.push("/admin")
      } else {
        Message.error(data.message || "密码修改失败")
      }
    } catch (error) {
      Message.error("密码修改失败，请重试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">修改密码</h1>
            <p className="text-gray-500">首次登录需要修改密码</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                原密码
              </label>
              <Input
                prefix={<IconLock />}
                placeholder="请输入原密码"
                type="password"
                value={oldPassword}
                onChange={setOldPassword}
                className="!h-12"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                新密码
              </label>
              <Input
                prefix={<IconLock />}
                placeholder="请输入新密码（至少8位）"
                type="password"
                value={newPassword}
                onChange={setNewPassword}
                className="!h-12"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                确认新密码
              </label>
              <Input
                prefix={<IconLock />}
                placeholder="请再次输入新密码"
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                className="!h-12"
                onPressEnter={handleChangePassword}
              />
            </div>

            <Button
              type="primary"
              long
              loading={loading}
              onClick={handleChangePassword}
              className="!h-12 !bg-blue-600 hover:!bg-blue-700"
            >
              确认修改
            </Button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push("/admin")}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              返回登录
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
