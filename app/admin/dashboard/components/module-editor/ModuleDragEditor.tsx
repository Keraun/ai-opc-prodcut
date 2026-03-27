"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, Button, Space, Tag, Modal, Message, Collapse } from "@arco-design/web-react"
import { IconDragDotVertical, IconDelete, IconPlus, IconSettings, IconEye } from "@arco-design/web-react/icon"
import styles from "../../dashboard.module.css"
import { ModuleFieldEditor } from "./ModuleFieldEditor"

interface ModuleInfo {
  moduleId: string
  moduleName: string
  moduleInstanceId: string
  data: Record<string, unknown>
}

interface AvailableModule {
  moduleId: string
  moduleName: string
  category?: string
}

interface ModuleDragEditorProps {
  modules: ModuleInfo[]
  onChange: (modules: ModuleInfo[]) => void
}

export function ModuleDragEditor({ modules, onChange }: ModuleDragEditorProps) {
  const [availableModules, setAvailableModules] = useState<AvailableModule[]>([])
  const [editingModule, setEditingModule] = useState<ModuleInfo | null>(null)
  const [previewModule, setPreviewModule] = useState<AvailableModule | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  useEffect(() => {
    fetchAvailableModules()
  }, [])

  const fetchAvailableModules = async () => {
    try {
      const response = await fetch("/api/modules")
      if (response.ok) {
        const data = await response.json()
        setAvailableModules(data.modules || [])
      }
    } catch (error) {
      Message.error("获取可用模块列表失败")
    }
  }

  const handleAddModule = (moduleInfo: AvailableModule) => {
    const newModule: ModuleInfo = {
      moduleId: moduleInfo.moduleId,
      moduleName: moduleInfo.moduleName,
      moduleInstanceId: `${moduleInfo.moduleId}-${Date.now()}`,
      data: {},
    }

    onChange([...modules, newModule])
    Message.success("模块添加成功")
  }

  const handleDeleteModule = (index: number) => {
    const updatedModules = modules.filter((_, i) => i !== index)
    onChange(updatedModules)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const updatedModules = [...modules]
    const [draggedModule] = updatedModules.splice(draggedIndex, 1)
    updatedModules.splice(index, 0, draggedModule)
    
    onChange(updatedModules)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleEditModule = (module: ModuleInfo) => {
    setEditingModule(module)
  }

  const handleSaveModuleData = (data: Record<string, unknown>) => {
    if (!editingModule) return

    const updatedModules = modules.map((m) =>
      m.moduleInstanceId === editingModule.moduleInstanceId
        ? { ...m, data }
        : m
    )
    
    onChange(updatedModules)
    setEditingModule(null)
    Message.success("模块数据已更新")
  }

  const groupedModules = availableModules.reduce((acc, module) => {
    const category = module.category || "其他"
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(module)
    return acc
  }, {} as Record<string, AvailableModule[]>)

  return (
    <div className={styles.moduleEditorLayout}>
      <div className={styles.modulePickerPanel}>
        <div className={styles.modulePickerHeader}>
          <h3 style={{ margin: 0 }}>可用模块</h3>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>
            点击添加到页面
          </span>
        </div>
        
        <div className={styles.modulePickerContent}>
          {Object.entries(groupedModules).map(([category, mods]) => (
            <div key={category} className={styles.moduleCategory}>
              <div className={styles.moduleCategoryTitle}>{category}</div>
              <div className={styles.moduleGrid}>
                {mods.map((mod) => (
                  <Card
                    key={mod.moduleId}
                    className={styles.moduleCard}
                    hoverable
                  >
                    <div className={styles.moduleCardContent}>
                      <div className={styles.moduleCardName}>{mod.moduleName}</div>
                      <Tag size="small" color="arcoblue">{mod.moduleId}</Tag>
                      <div className={styles.moduleCardActions}>
                        <Button
                          type="primary"
                          size="small"
                          onClick={() => handleAddModule(mod)}
                        >
                          添加
                        </Button>
                        <Button
                          type="text"
                          size="small"
                          icon={<IconEye />}
                          onClick={(e) => {
                            e.stopPropagation()
                            setPreviewModule(mod)
                          }}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.moduleListPanel}>
        <div className={styles.moduleListHeader}>
          <h3 style={{ margin: 0 }}>页面模块</h3>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>
            拖拽调整顺序
          </span>
        </div>

        {modules.length === 0 ? (
          <Card className={styles.emptyModuleCard}>
            <div style={{ textAlign: "center", color: "#9ca3af" }}>
              <p>暂无模块，从左侧选择添加</p>
            </div>
          </Card>
        ) : (
          <div className={styles.moduleItems}>
            {modules.map((module, index) => (
              <Card
                key={module.moduleInstanceId}
                className={`${styles.moduleItem} ${
                  draggedIndex === index ? styles.moduleItemDragging : ""
                }`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
              >
                <div className={styles.moduleItemContent}>
                  <div className={styles.moduleItemDragHandle}>
                    <IconDragDotVertical />
                  </div>
                  <div className={styles.moduleItemInfo}>
                    <div className={styles.moduleItemName}>{module.moduleName}</div>
                    <div className={styles.moduleItemId}>
                      <Tag size="small" color="gray">
                        {module.moduleId}
                      </Tag>
                    </div>
                  </div>
                  <div className={styles.moduleItemActions}>
                    <Button
                      type="text"
                      size="small"
                      icon={<IconSettings />}
                      onClick={() => handleEditModule(module)}
                    >
                      编辑
                    </Button>
                    <Button
                      type="text"
                      size="small"
                      status="danger"
                      icon={<IconDelete />}
                      onClick={() => handleDeleteModule(index)}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        title={`编辑模块：${editingModule?.moduleName || ""}`}
        visible={!!editingModule}
        onCancel={() => setEditingModule(null)}
        onOk={() => {
          if (editingModule) {
            handleSaveModuleData(editingModule.data)
          }
        }}
        okText="保存"
        cancelText="取消"
        style={{ width: 800 }}
      >
        {editingModule && (
          <ModuleFieldEditor
            moduleId={editingModule.moduleId}
            data={editingModule.data}
            onChange={(data) => setEditingModule({ ...editingModule, data })}
          />
        )}
      </Modal>

      <Modal
        title={`模块预览：${previewModule?.moduleName || ""}`}
        visible={!!previewModule}
        onCancel={() => setPreviewModule(null)}
        footer={null}
        style={{ width: 800 }}
      >
        {previewModule && (
          <div className={styles.modulePreviewContent}>
            <div className={styles.modulePreviewInfo}>
              <p><strong>模块ID：</strong>{previewModule.moduleId}</p>
              <p><strong>模块名称：</strong>{previewModule.moduleName}</p>
              <p><strong>分类：</strong>{previewModule.category || "其他"}</p>
            </div>
            <div className={styles.modulePreviewFrame}>
              <iframe
                src={`/admin/module-preview/${previewModule.moduleId}`}
                className={styles.previewFrame}
                title="模块预览"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}