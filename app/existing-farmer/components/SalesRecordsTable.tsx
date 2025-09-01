"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Edit, Plus, Database } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatCurrency, formatDate, formatQuantity } from '../data-management/utils/formatting'
import { getCropName, getChannelDisplayName, initializeData } from '../data-management/utils/sample-data'
import type { SalesRecord } from '../data-management/types'

interface SalesRecordsTableProps {
  className?: string
}

export const SalesRecordsTable = ({ className }: SalesRecordsTableProps) => {
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadSalesRecords = () => {
      try {
        // 初期データが存在しない場合は作成
        initializeData()
        
        // ローカルストレージから売上記録を取得
        const savedRecords = localStorage.getItem('sales_records')
        if (savedRecords) {
          const records = JSON.parse(savedRecords) as SalesRecord[]
          // 最新5件のみ表示
          setSalesRecords(records.slice(0, 5))
        }
      } catch (error) {
        console.error('売上記録の読み込みに失敗しました:', error)
        setSalesRecords([])
      } finally {
        setIsLoading(false)
      }
    }

    loadSalesRecords()

    // データ更新イベントのリスナー
    const handleDataUpdate = () => {
      loadSalesRecords()
    }

    window.addEventListener('salesDataUpdated', handleDataUpdate)
    return () => {
      window.removeEventListener('salesDataUpdated', handleDataUpdate)
    }
  }, [])

  const handleEditData = () => {
    router.push('/existing-farmer/data-management')
  }

  if (isLoading) {
    return (
      <Card className={`bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border-0 ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-sky-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-soil-brown">データを読み込み中...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border-0 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-charcoal flex items-center gap-3">
              <Database className="w-5 h-5 text-sprout-green" />
              売上記録
            </CardTitle>
            <p className="text-soil-brown text-sm mt-1">最近の売上データ（最新5件）</p>
          </div>
          <Button 
            onClick={handleEditData}
            className="bg-sky-blue text-white hover:bg-sky-blue/90 rounded-xl"
            size="sm"
          >
            <Edit className="w-4 h-4 mr-2" />
            データを編集
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {salesRecords.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-fog-grey rounded-full flex items-center justify-center mx-auto mb-4">
              <Database className="w-8 h-8 text-soil-brown" />
            </div>
            <p className="text-soil-brown mb-4">売上記録がまだありません</p>
            <Button 
              onClick={handleEditData}
              variant="outline"
              className="text-sky-blue border-sky-blue hover:bg-sky-blue/10"
            >
              <Plus className="w-4 h-4 mr-2" />
              最初の記録を追加
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-fog-grey/50">
                  <TableHead className="font-semibold text-charcoal">日付</TableHead>
                  <TableHead className="font-semibold text-charcoal">作物</TableHead>
                  <TableHead className="font-semibold text-charcoal text-right">数量</TableHead>
                  <TableHead className="font-semibold text-charcoal text-right">単価</TableHead>
                  <TableHead className="font-semibold text-charcoal text-right">合計金額</TableHead>
                  <TableHead className="font-semibold text-charcoal">販売先</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesRecords.map((record) => (
                  <TableRow key={record.id} className="hover:bg-fog-grey/30">
                    <TableCell className="font-medium">
                      {formatDate(record.date)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-sprout-green/10 text-sprout-green border-sprout-green/20">
                        {getCropName(record.crop)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatQuantity(record.quantity, record.unit)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(record.unitPrice)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold text-sprout-green">
                      {formatCurrency(record.total)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-sky-blue text-sky-blue">
                        {getChannelDisplayName(record.channel)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {salesRecords.length >= 5 && (
              <div className="text-center mt-4 pt-4 border-t border-fog-grey">
                <Button 
                  onClick={handleEditData}
                  variant="ghost"
                  className="text-sky-blue hover:text-sky-blue/80 hover:bg-sky-blue/10"
                  size="sm"
                >
                  すべての記録を見る ({salesRecords.length >= 5 ? '5+' : salesRecords.length}件)
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

