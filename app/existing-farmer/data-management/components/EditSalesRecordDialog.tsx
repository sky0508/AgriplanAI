"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { useDataManagementStore } from '@/lib/stores/data-management-store'
import { validateSalesRecord } from '../utils/validation'
import { formatDateForInput, getTodayISO } from '../utils/formatting'
import type { SalesRecord, SalesRecordFormData } from '../types'

interface EditSalesRecordDialogProps {
  record: SalesRecord | null
  isOpen: boolean
  onClose: () => void
}

export const EditSalesRecordDialog = ({
  record,
  isOpen,
  onClose
}: EditSalesRecordDialogProps) => {
  const [formData, setFormData] = useState<SalesRecordFormData>({
    date: getTodayISO(),
    crop: '',
    quantity: '',
    unit: 'kg',
    unitPrice: '',
    channel: '',
    notes: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { 
    cropInfo, 
    salesChannels, 
    addSalesRecord, 
    updateSalesRecord 
  } = useDataManagementStore()

  // フォームの初期化
  useEffect(() => {
    if (record) {
      setFormData({
        date: formatDateForInput(record.date),
        crop: record.crop,
        quantity: record.quantity.toString(),
        unit: record.unit,
        unitPrice: record.unitPrice.toString(),
        channel: record.channel,
        notes: record.notes || ''
      })
    } else {
      setFormData({
        date: getTodayISO(),
        crop: '',
        quantity: '',
        unit: 'kg',
        unitPrice: '',
        channel: '',
        notes: ''
      })
    }
    setErrors({})
  }, [record, isOpen])

  const handleInputChange = (field: keyof SalesRecordFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const calculateTotal = () => {
    const quantity = Number(formData.quantity) || 0
    const unitPrice = Number(formData.unitPrice) || 0
    return quantity * unitPrice
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    try {
      // バリデーション
      await validateSalesRecord(formData)

      // データの作成・更新
      const total = calculateTotal()
      
      if (record) {
        // 更新
        const updates = {
          date: formData.date,
          crop: formData.crop,
          quantity: Number(formData.quantity),
          unit: formData.unit,
          unitPrice: Number(formData.unitPrice),
          total,
          channel: formData.channel,
          notes: formData.notes || undefined,
          updatedAt: new Date().toISOString()
        }
        
        updateSalesRecord(record.id, updates)
        toast.success('売上記録を更新しました')
      } else {
        // 新規作成
        const newRecord: SalesRecord = {
          id: Date.now(), // 本来はサーバーサイドで生成
          date: formData.date,
          crop: formData.crop,
          quantity: Number(formData.quantity),
          unit: formData.unit,
          unitPrice: Number(formData.unitPrice),
          total,
          channel: formData.channel,
          notes: formData.notes || undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        addSalesRecord(newRecord)
        toast.success('売上記録を追加しました')
      }

      onClose()
    } catch (error: any) {
      if (error.errors) {
        // Zodバリデーションエラー
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach((err: any) => {
          fieldErrors[err.path[0]] = err.message
        })
        setErrors(fieldErrors)
      } else {
        toast.error('保存に失敗しました')
        console.error('Save error:', error)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-charcoal">
            {record ? '売上記録を編集' : '新しい売上記録'}
          </DialogTitle>
          <DialogDescription className="text-soil-brown">
            {record ? '売上記録の内容を編集できます' : '新しい売上記録を追加します'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 日付 */}
          <div className="space-y-2">
            <Label htmlFor="date">日付</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className={errors.date ? 'border-red-500' : ''}
            />
            {errors.date && (
              <p className="text-xs text-red-500">{errors.date}</p>
            )}
          </div>

          {/* 作物 */}
          <div className="space-y-2">
            <Label htmlFor="crop">作物</Label>
            <Select
              value={formData.crop}
              onValueChange={(value) => handleInputChange('crop', value)}
            >
              <SelectTrigger className={errors.crop ? 'border-red-500' : ''}>
                <SelectValue placeholder="作物を選択" />
              </SelectTrigger>
              <SelectContent>
                {cropInfo.filter(crop => crop.isActive).map((crop) => (
                  <SelectItem key={crop.id} value={crop.id}>
                    {crop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.crop && (
              <p className="text-xs text-red-500">{errors.crop}</p>
            )}
          </div>

          {/* 数量と単位 */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="quantity">数量</Label>
              <Input
                id="quantity"
                type="number"
                step="0.1"
                min="0"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                className={errors.quantity ? 'border-red-500' : ''}
                placeholder="0"
              />
              {errors.quantity && (
                <p className="text-xs text-red-500">{errors.quantity}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">単位</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => handleInputChange('unit', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="箱">箱</SelectItem>
                  <SelectItem value="個">個</SelectItem>
                  <SelectItem value="束">束</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 単価 */}
          <div className="space-y-2">
            <Label htmlFor="unitPrice">単価（円）</Label>
            <Input
              id="unitPrice"
              type="number"
              step="1"
              min="0"
              value={formData.unitPrice}
              onChange={(e) => handleInputChange('unitPrice', e.target.value)}
              className={errors.unitPrice ? 'border-red-500' : ''}
              placeholder="0"
            />
            {errors.unitPrice && (
              <p className="text-xs text-red-500">{errors.unitPrice}</p>
            )}
          </div>

          {/* 合計金額（計算表示） */}
          {(formData.quantity && formData.unitPrice) && (
            <div className="space-y-2">
              <Label>合計金額</Label>
              <div className="p-3 bg-fog-grey rounded-xl">
                <span className="text-lg font-bold text-sprout-green">
                  ¥{calculateTotal().toLocaleString()}
                </span>
                <span className="text-sm text-soil-brown ml-2">
                  ({formData.quantity} × ¥{Number(formData.unitPrice).toLocaleString()})
                </span>
              </div>
            </div>
          )}

          {/* 販売先 */}
          <div className="space-y-2">
            <Label htmlFor="channel">販売先</Label>
            <Select
              value={formData.channel}
              onValueChange={(value) => handleInputChange('channel', value)}
            >
              <SelectTrigger className={errors.channel ? 'border-red-500' : ''}>
                <SelectValue placeholder="販売先を選択" />
              </SelectTrigger>
              <SelectContent>
                {salesChannels.filter(channel => channel.isActive).map((channel) => (
                  <SelectItem key={channel.id} value={channel.id}>
                    {channel.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.channel && (
              <p className="text-xs text-red-500">{errors.channel}</p>
            )}
          </div>

          {/* メモ */}
          <div className="space-y-2">
            <Label htmlFor="notes">メモ（任意）</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="品質、特記事項など"
              rows={2}
            />
          </div>

          {/* ボタン */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-sprout-green text-white hover:bg-sprout-green/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? '保存中...' : record ? '更新' : '追加'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

