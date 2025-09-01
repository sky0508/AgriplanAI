"use client"

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AlertTriangle } from 'lucide-react'
import { formatCurrency, formatDate, formatQuantity } from '../utils/formatting'
import { getCropName, getChannelDisplayName } from '../utils/sample-data'
import type { SalesRecord } from '../types'

interface DeleteConfirmDialogProps {
  record: SalesRecord | null
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export const DeleteConfirmDialog = ({
  record,
  isOpen,
  onClose,
  onConfirm
}: DeleteConfirmDialogProps) => {
  if (!record) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-charcoal flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            売上記録を削除
          </DialogTitle>
          <DialogDescription className="text-soil-brown">
            以下の売上記録を削除しますか？この操作は取り消せません。
          </DialogDescription>
        </DialogHeader>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-soil-brown">日付:</span>
              <span className="ml-2 font-medium text-charcoal">
                {formatDate(record.date)}
              </span>
            </div>
            <div>
              <span className="text-soil-brown">作物:</span>
              <span className="ml-2 font-medium text-charcoal">
                {getCropName(record.crop)}
              </span>
            </div>
            <div>
              <span className="text-soil-brown">数量:</span>
              <span className="ml-2 font-medium text-charcoal">
                {formatQuantity(record.quantity, record.unit)}
              </span>
            </div>
            <div>
              <span className="text-soil-brown">単価:</span>
              <span className="ml-2 font-medium text-charcoal">
                {formatCurrency(record.unitPrice)}
              </span>
            </div>
            <div>
              <span className="text-soil-brown">販売先:</span>
              <span className="ml-2 font-medium text-charcoal">
                {getChannelDisplayName(record.channel)}
              </span>
            </div>
            <div>
              <span className="text-soil-brown">合計:</span>
              <span className="ml-2 font-bold text-red-600">
                {formatCurrency(record.total)}
              </span>
            </div>
          </div>
          
          {record.notes && (
            <div className="pt-2 border-t border-red-200">
              <span className="text-soil-brown text-sm">メモ:</span>
              <p className="text-sm text-charcoal mt-1">{record.notes}</p>
            </div>
          )}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <p className="text-sm text-amber-700">
            <AlertTriangle className="w-4 h-4 inline mr-1" />
            この記録を削除すると、売上分析のグラフにも反映されます。
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            キャンセル
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-red-500 text-white hover:bg-red-600"
          >
            削除する
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

