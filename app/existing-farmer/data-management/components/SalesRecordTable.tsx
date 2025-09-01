"use client"

import { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Edit, Trash2, Plus, Search } from 'lucide-react'
import { useDataManagementStore } from '@/lib/stores/data-management-store'
import { formatCurrency, formatDate, formatQuantity } from '../utils/formatting'
import { getCropName, getChannelDisplayName } from '../utils/sample-data'
import { EditSalesRecordDialog } from './EditSalesRecordDialog'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'
import type { SalesRecord } from '../types'

export const SalesRecordTable = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRecord, setSelectedRecord] = useState<SalesRecord | null>(null)
  const [recordToDelete, setRecordToDelete] = useState<SalesRecord | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { 
    salesRecords, 
    cropInfo, 
    salesChannels,
    deleteSalesRecord 
  } = useDataManagementStore()

  // フィルタリング・ソート済みデータ
  const filteredRecords = useMemo(() => {
    let filtered = salesRecords

    // 検索フィルター
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(record => {
        const cropName = getCropName(record.crop).toLowerCase()
        const channelName = getChannelDisplayName(record.channel).toLowerCase()
        const date = formatDate(record.date).toLowerCase()
        const notes = record.notes?.toLowerCase() || ''
        
        return (
          cropName.includes(searchLower) ||
          channelName.includes(searchLower) ||
          date.includes(searchLower) ||
          notes.includes(searchLower)
        )
      })
    }

    // 日付順でソート（新しい順）
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [salesRecords, searchTerm])

  const handleEdit = (record: SalesRecord) => {
    setSelectedRecord(record)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (record: SalesRecord) => {
    setRecordToDelete(record)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (recordToDelete) {
      deleteSalesRecord(recordToDelete.id)
      setIsDeleteDialogOpen(false)
      setRecordToDelete(null)
    }
  }

  const handleNewRecord = () => {
    setSelectedRecord(null)
    setIsEditDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* ツールバー */}
      <Card className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-0">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-soil-brown w-4 h-4" />
              <Input
                placeholder="作物、販売先、日付で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-sm text-soil-brown">
                {filteredRecords.length}件 / {salesRecords.length}件
              </div>
              <Button 
                onClick={handleNewRecord}
                className="bg-sprout-green text-white hover:bg-sprout-green/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                新規追加
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* テーブル */}
      <Card className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-0 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-charcoal">売上記録一覧</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              {searchTerm ? (
                <div>
                  <p className="text-soil-brown mb-2">「{searchTerm}」に該当する記録が見つかりませんでした</p>
                  <Button 
                    variant="ghost" 
                    onClick={() => setSearchTerm('')}
                    className="text-sky-blue"
                  >
                    検索をクリア
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="w-16 h-16 bg-fog-grey rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  <p className="text-soil-brown mb-4">売上記録がまだありません</p>
                  <Button 
                    onClick={handleNewRecord}
                    className="bg-sprout-green text-white hover:bg-sprout-green/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    最初の記録を追加
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-fog-grey">
                    <TableHead className="font-semibold">日付</TableHead>
                    <TableHead className="font-semibold">作物</TableHead>
                    <TableHead className="font-semibold text-right">数量</TableHead>
                    <TableHead className="font-semibold text-right">単価</TableHead>
                    <TableHead className="font-semibold text-right">合計金額</TableHead>
                    <TableHead className="font-semibold">販売先</TableHead>
                    <TableHead className="font-semibold">メモ</TableHead>
                    <TableHead className="font-semibold text-center">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id} className="hover:bg-fog-grey/50">
                      <TableCell className="font-medium">
                        {formatDate(record.date)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-sprout-green/10 text-sprout-green">
                          {getCropName(record.crop)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatQuantity(record.quantity, record.unit)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(record.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {formatCurrency(record.total)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-sky-blue text-sky-blue">
                          {getChannelDisplayName(record.channel)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-32 truncate text-soil-brown">
                        {record.notes || '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(record)}
                            className="h-8 w-8 p-0 text-sky-blue hover:text-sky-blue/80 hover:bg-sky-blue/10"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(record)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 編集ダイアログ */}
      <EditSalesRecordDialog
        record={selectedRecord}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false)
          setSelectedRecord(null)
        }}
      />

      {/* 削除確認ダイアログ */}
      <DeleteConfirmDialog
        record={recordToDelete}
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setRecordToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

