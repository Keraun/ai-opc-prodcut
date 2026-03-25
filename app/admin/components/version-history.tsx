import { useState, useEffect } from 'react'
import { Button, Modal, Table } from '@arco-design/web-react'
import { IconHistory, IconEye, IconUndo } from '@arco-design/web-react/icon'
import { toast } from 'sonner'
import { JSONDiffViewer } from './json-diff-viewer'
import styles from '../dashboard/dashboard.module.css'

interface VersionHistoryProps {
  configKey: string
  currentData: any
  onRestore?: (data: any) => void
}

interface Version {
  timestamp: string
  data: any
}

export function VersionHistory({ 
  configKey, 
  currentData,
  onRestore 
}: VersionHistoryProps) {
  const [visible, setVisible] = useState(false)
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null)
  const [showDiff, setShowDiff] = useState(false)

  useEffect(() => {
    if (visible) {
      fetchVersions()
    }
  }, [visible, configKey])

  const fetchVersions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/version?type=${configKey}`)
      
      if (!response.ok) {
        throw new Error('获取版本历史失败')
      }
      
      const data = await response.json()
      setVersions(data.versions || [])
    } catch (error) {
      toast.error('获取版本历史失败')
    } finally {
      setLoading(false)
    }
  }

  const handleViewVersion = (version: Version) => {
    setSelectedVersion(version)
    setShowDiff(true)
  }

  const handleRestore = async (version: Version) => {
    Modal.confirm({
      title: '确认恢复',
      content: `确定要恢复到 ${new Date(version.timestamp).toLocaleString('zh-CN')} 的版本吗？`,
      onOk: async () => {
        try {
          const response = await fetch('/api/admin/config', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              type: configKey, 
              data: version.data 
            }),
          })

          if (!response.ok) {
            throw new Error('恢复失败')
          }

          toast.success('版本恢复成功')
          onRestore?.(version.data)
          setVisible(false)
        } catch (error) {
          toast.error('版本恢复失败')
        }
      }
    })
  }

  const columns = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      render: (timestamp: string) => new Date(timestamp).toLocaleString('zh-CN')
    },
    {
      title: '操作',
      dataIndex: 'action',
      render: (_: any, record: Version) => (
        <div className={styles.versionActions}>
          <Button
            type="text"
            size="small"
            icon={<IconEye />}
            onClick={() => handleViewVersion(record)}
          >
            查看
          </Button>
          <Button
            type="text"
            size="small"
            icon={<IconUndo />}
            onClick={() => handleRestore(record)}
          >
            恢复
          </Button>
        </div>
      )
    }
  ]

  return (
    <>
      <Button
        type="text"
        icon={<IconHistory />}
        onClick={() => setVisible(true)}
      >
        版本历史
      </Button>

      <Modal
        title="版本历史"
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        style={{ width: '800px' }}
      >
        <Table
          columns={columns}
          data={versions}
          loading={loading}
          pagination={{ pageSize: 10 }}
          rowKey="timestamp"
        />
      </Modal>

      <Modal
        title="版本对比"
        visible={showDiff}
        onCancel={() => setShowDiff(false)}
        footer={null}
        style={{ width: '1200px' }}
      >
        {selectedVersion && (
          <JSONDiffViewer
            oldContent={JSON.stringify(selectedVersion.data, null, 2)}
            newContent={JSON.stringify(currentData, null, 2)}
            oldTitle={`版本 (${new Date(selectedVersion.timestamp).toLocaleString('zh-CN')})`}
            newTitle="当前版本"
          />
        )}
      </Modal>
    </>
  )
}
