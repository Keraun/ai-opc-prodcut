"use client"

import React, { useState, useRef } from "react"
import { Input, Button, Spin } from "@arco-design/web-react"
import { Upload as IconUpload, Image as ImageIcon } from "lucide-react"
import { uploadImage } from "@/lib/api/images"
import { toast } from "sonner"
import styles from "./ImageUploadInput.module.css"

interface ImageUploadInputProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function ImageUploadInput({
  value = "",
  onChange,
  placeholder = "请输入图片链接或点击上传",
  disabled = false
}: ImageUploadInputProps) {
  const [uploading, setUploading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error("图片大小不能超过10MB")
      return
    }

    if (!file.type.startsWith("image/")) {
      toast.error("请选择图片文件")
      return
    }

    try {
      setUploading(true)
      const result = await uploadImage(file, { quality: 80 })

      if (result.success && result.url) {
        onChange?.(result.url)
        toast.success(`图片上传成功${result.savedPercentage ? `，节省 ${result.savedPercentage}% 空间` : ""}`)
      } else {
        toast.error(result.message || "上传失败")
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("上传失败")
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleInputChange = (value: string) => {
    onChange?.(value)
  }

  return (
    <div className={styles.imageUploadInput}>
      <div className={styles.inputWrapper}>
        <Input
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled || uploading}
          allowClear
          className={styles.input}
          prefix={<ImageIcon size={16} className={styles.inputIcon} />}
        />
        <Button
          type="primary"
          onClick={handleUploadClick}
          disabled={disabled || uploading}
          loading={uploading}
          className={styles.uploadButton}
          icon={<IconUpload size={16} />}
        >
          上传图片
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {value && (
        <div className={styles.previewContainer}>
          <div className={styles.previewHeader}>
            <span className={styles.previewLabel}>图片预览</span>
            <button
              type="button"
              className={styles.toggleButton}
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? "隐藏" : "显示"}
            </button>
          </div>
          {showPreview && (
            <div className={styles.previewImage}>
              <img
                src={value}
                alt="预览"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
                onLoad={(e) => {
                  e.currentTarget.style.display = "block"
                }}
              />
            </div>
          )}
        </div>
      )}

      {uploading && (
        <div className={styles.uploadingOverlay}>
          <Spin size={20} />
          <span>上传中...</span>
        </div>
      )}
    </div>
  )
}
