"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Form, Input, Button, Card, Alert } from "@arco-design/web-react"
import { IconLock, IconCheck } from "@arco-design/web-react/icon"
import { toast, Toaster } from "sonner"
import { AdminLayout } from '../components'
import styles from './change-password.module.css'

const FormItem = Form.Item

export default function ChangePasswordPage() {
  const router = useRouter()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || '修改失败')
      }

      toast.success('密码修改成功，请重新登录')
      
      setTimeout(() => {
        router.push('/admin')
      }, 2000)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '修改失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Toaster position="top-center" richColors />
      
      <AdminLayout title="修改密码">
        <div className={styles.container}>
          <Card className={styles.formCard}>
            <div className={styles.header}>
              <IconLock className={styles.icon} />
              <h2>修改密码</h2>
            </div>

            <Alert
              type="warning"
              content="修改密码后需要重新登录"
              style={{ marginBottom: 24 }}
            />

            <Form
              form={form}
              layout="vertical"
              onSubmit={handleSubmit}
              autoComplete="off"
            >
              <FormItem
                label="旧密码"
                field="oldPassword"
                rules={[
                  { required: true, message: '请输入旧密码' },
                  { minLength: 6, message: '密码长度不能少于6位' },
                ]}
              >
                <Input.Password
                  placeholder="请输入旧密码"
                  prefix={<IconLock />}
                />
              </FormItem>

              <FormItem
                label="新密码"
                field="newPassword"
                rules={[
                  { required: true, message: '请输入新密码' },
                  { minLength: 6, message: '密码长度不能少于6位' },
                ]}
              >
                <Input.Password
                  placeholder="请输入新密码"
                  prefix={<IconLock />}
                />
              </FormItem>

              <FormItem
                label="确认新密码"
                field="confirmPassword"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: '请确认新密码' },
                  {
                    validator: (value, callback) => {
                      if (value !== form.getFieldValue('newPassword')) {
                        callback('两次输入的密码不一致')
                      } else {
                        callback()
                      }
                    }
                  }
                ]}
              >
                <Input.Password
                  placeholder="请再次输入新密码"
                  prefix={<IconLock />}
                />
              </FormItem>

              <FormItem>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<IconCheck />}
                  long
                >
                  确认修改
                </Button>
              </FormItem>
            </Form>
          </Card>
        </div>
      </AdminLayout>
    </>
  )
}
