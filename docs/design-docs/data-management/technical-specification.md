# 売上分析データ管理機能 - 技術仕様書

## アーキテクチャ概要

### ファイル構成
```
app/existing-farmer/data-management/
├── page.tsx                           # メインページコンポーネント
├── types.ts                           # 型定義
├── hooks/
│   ├── use-sales-records.ts          # 売上記録管理フック
│   ├── use-crop-info.ts               # 作物情報管理フック
│   └── use-sales-channels.ts          # 販売チャンネル管理フック
├── components/
│   ├── DataManagementTabs.tsx         # タブナビゲーション
│   ├── SalesRecordTable.tsx           # 売上記録テーブル
│   ├── CropInfoTable.tsx              # 作物情報テーブル
│   ├── SalesChannelTable.tsx          # 販売チャンネルテーブル
│   ├── DataTableToolbar.tsx           # テーブル操作ツールバー
│   ├── EditRecordDialog.tsx           # レコード編集ダイアログ
│   ├── DeleteConfirmDialog.tsx        # 削除確認ダイアログ
│   └── DataImportExport.tsx           # インポート・エクスポート機能
└── utils/
    ├── validation.ts                  # バリデーション関数
    ├── data-processing.ts             # データ処理ユーティリティ
    └── export-utils.ts                # エクスポート機能

lib/
├── database/
│   ├── schema.ts                      # データベーススキーマ（将来）
│   └── queries.ts                     # データベースクエリ（将来）
└── stores/
    └── data-management-store.ts       # グローバル状態管理
```

## データ型定義

### 基本データ型
```typescript
// 売上記録の型定義
interface SalesRecord {
  id: number
  date: string                    // ISO形式の日付
  crop: string                   // 作物ID
  quantity: number               // 数量
  unit: string                   // 単位
  unitPrice: number              // 単価（円）
  total: number                  // 合計金額（円）
  channel: string                // 販売チャンネルID
  notes?: string                 // メモ（任意）
  createdAt: string              // 作成日時
  updatedAt: string              // 更新日時
}

// 作物情報の型定義
interface CropInfo {
  id: string                     // 作物ID（例: grape, potato）
  name: string                   // 表示名（例: ぶどう、じゃがいも）
  category: string               // カテゴリ（果物、野菜等）
  defaultUnit: string            // 標準単位（kg, 箱等）
  standardPrice: number          // 標準単価（参考値）
  description?: string           // 説明
  isActive: boolean              // 有効フラグ
  createdAt: string              // 作成日時
  updatedAt: string              // 更新日時
}

// 販売チャンネルの型定義
interface SalesChannel {
  id: string                     // チャンネルID（例: wholesale_market）
  name: string                   // 内部名（例: wholesale_market）
  displayName: string            // 表示名（例: よ市）
  commissionRate?: number        // 手数料率（%）
  contactInfo?: string           // 連絡先
  notes?: string                 // メモ
  isActive: boolean              // 有効フラグ
  createdAt: string              // 作成日時
  updatedAt: string              // 更新日時
}

// テーブル操作の型定義
interface TableFilters {
  search: string                 // 検索文字列
  dateRange?: {
    start: string
    end: string
  }
  cropIds: string[]              // 作物フィルター
  channelIds: string[]           // チャンネルフィルター
  sortBy: string                 // ソート対象カラム
  sortOrder: 'asc' | 'desc'      // ソート順
}

interface PaginationState {
  page: number                   // 現在のページ
  pageSize: number               // ページサイズ
  total: number                  // 総レコード数
}

// フォーム用の型定義
interface SalesRecordFormData {
  date: string
  crop: string
  quantity: string               // フォームでは文字列として扱う
  unit: string
  unitPrice: string              // フォームでは文字列として扱う
  channel: string
  notes?: string
}

interface CropInfoFormData {
  name: string
  category: string
  defaultUnit: string
  standardPrice: string          // フォームでは文字列として扱う
  description?: string
}

interface SalesChannelFormData {
  name: string
  displayName: string
  commissionRate?: string        // フォームでは文字列として扱う
  contactInfo?: string
  notes?: string
}
```

## コンポーネント設計

### 1. メインページ（page.tsx）
```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Database } from 'lucide-react'
import Link from 'next/link'
import { DataManagementTabs } from './components/DataManagementTabs'
import { DataImportExport } from './components/DataImportExport'

export default function DataManagementPage() {
  const [activeTab, setActiveTab] = useState<'sales' | 'crops' | 'channels'>('sales')

  return (
    <div className="min-h-screen bg-fog-grey p-6">
      {/* ヘッダー */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/existing-farmer/sales-analysis">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-soil-brown hover:text-charcoal hover:bg-white/50 rounded-xl"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                売上分析に戻る
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-charcoal flex items-center gap-3">
                <Database className="w-8 h-8 text-sprout-green" />
                データ管理
              </h1>
              <p className="text-lg text-soil-brown">
                売上分析で使用するデータの閲覧・編集
              </p>
            </div>
          </div>
          
          <DataImportExport activeTab={activeTab} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <DataManagementTabs 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </div>
  )
}
```

### 2. タブナビゲーション（DataManagementTabs.tsx）
```typescript
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SalesRecordTable } from './SalesRecordTable'
import { CropInfoTable } from './CropInfoTable'
import { SalesChannelTable } from './SalesChannelTable'

interface DataManagementTabsProps {
  activeTab: 'sales' | 'crops' | 'channels'
  onTabChange: (tab: 'sales' | 'crops' | 'channels') => void
}

export const DataManagementTabs = ({ 
  activeTab, 
  onTabChange 
}: DataManagementTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="sales" className="flex items-center gap-2">
          📊 売上記録
        </TabsTrigger>
        <TabsTrigger value="crops" className="flex items-center gap-2">
          🌱 作物情報
        </TabsTrigger>
        <TabsTrigger value="channels" className="flex items-center gap-2">
          🏪 販売チャンネル
        </TabsTrigger>
      </TabsList>

      <TabsContent value="sales" className="space-y-4">
        <SalesRecordTable />
      </TabsContent>

      <TabsContent value="crops" className="space-y-4">
        <CropInfoTable />
      </TabsContent>

      <TabsContent value="channels" className="space-y-4">
        <SalesChannelTable />
      </TabsContent>
    </Tabs>
  )
}
```

### 3. 売上記録テーブル（SalesRecordTable.tsx）
```typescript
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
import { Edit, Trash2, Plus } from 'lucide-react'
import { DataTableToolbar } from './DataTableToolbar'
import { EditRecordDialog } from './EditRecordDialog'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'
import { useSalesRecords } from '../hooks/use-sales-records'
import { useCropInfo } from '../hooks/use-crop-info'
import { useSalesChannels } from '../hooks/use-sales-channels'
import { formatCurrency, formatDate } from '../utils/formatting'

export const SalesRecordTable = () => {
  const [filters, setFilters] = useState<TableFilters>({
    search: '',
    cropIds: [],
    channelIds: [],
    sortBy: 'date',
    sortOrder: 'desc'
  })
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 20,
    total: 0
  })
  const [selectedRecord, setSelectedRecord] = useState<SalesRecord | null>(null)
  const [recordToDelete, setRecordToDelete] = useState<SalesRecord | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { 
    records, 
    isLoading, 
    createRecord, 
    updateRecord, 
    deleteRecord 
  } = useSalesRecords(filters, pagination)
  
  const { crops } = useCropInfo()
  const { channels } = useSalesChannels()

  // フィルタリング・ソート済みデータ
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      // 検索フィルター
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        return (
          record.crop.toLowerCase().includes(searchTerm) ||
          record.channel.toLowerCase().includes(searchTerm) ||
          record.notes?.toLowerCase().includes(searchTerm)
        )
      }
      return true
    })
  }, [records, filters])

  const handleEdit = (record: SalesRecord) => {
    setSelectedRecord(record)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (record: SalesRecord) => {
    setRecordToDelete(record)
    setIsDeleteDialogOpen(true)
  }

  const handleSave = async (data: SalesRecordFormData) => {
    if (selectedRecord) {
      await updateRecord(selectedRecord.id, data)
    } else {
      await createRecord(data)
    }
    setIsEditDialogOpen(false)
    setSelectedRecord(null)
  }

  const handleConfirmDelete = async () => {
    if (recordToDelete) {
      await deleteRecord(recordToDelete.id)
      setIsDeleteDialogOpen(false)
      setRecordToDelete(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-sky-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-soil-brown">データを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* ツールバー */}
      <div className="flex items-center justify-between">
        <DataTableToolbar 
          filters={filters}
          onFiltersChange={setFilters}
          availableCrops={crops}
          availableChannels={channels}
        />
        <Button 
          onClick={() => {
            setSelectedRecord(null)
            setIsEditDialogOpen(true)
          }}
          className="bg-sprout-green text-white hover:bg-sprout-green/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          新規追加
        </Button>
      </div>

      {/* テーブル */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
            {filteredRecords.map((record) => {
              const crop = crops.find(c => c.id === record.crop)
              const channel = channels.find(c => c.id === record.channel)
              
              return (
                <TableRow key={record.id} className="hover:bg-fog-grey/50">
                  <TableCell className="font-medium">
                    {formatDate(record.date)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-sprout-green/10 text-sprout-green">
                      {crop?.name || record.crop}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {record.quantity.toLocaleString()}{record.unit}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(record.unitPrice)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {formatCurrency(record.total)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-sky-blue text-sky-blue">
                      {channel?.displayName || record.channel}
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
              )
            })}
          </TableBody>
        </Table>

        {filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <p className="text-soil-brown">表示するデータがありません</p>
            <Button 
              variant="ghost" 
              onClick={() => {
                setSelectedRecord(null)
                setIsEditDialogOpen(true)
              }}
              className="mt-2 text-sky-blue"
            >
              最初のデータを追加
            </Button>
          </div>
        )}
      </div>

      {/* 編集ダイアログ */}
      <EditRecordDialog
        record={selectedRecord}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false)
          setSelectedRecord(null)
        }}
        onSave={handleSave}
        crops={crops}
        channels={channels}
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
```

## カスタムフック設計

### 1. 売上記録管理フック（use-sales-records.ts）
```typescript
import { useState, useEffect, useCallback } from 'react'
import { useDataManagementStore } from '@/lib/stores/data-management-store'
import { validateSalesRecord } from '../utils/validation'
import type { SalesRecord, SalesRecordFormData, TableFilters, PaginationState } from '../types'

export const useSalesRecords = (
  filters: TableFilters,
  pagination: PaginationState
) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const {
    salesRecords: records,
    setSalesRecords,
    addSalesRecord,
    updateSalesRecord,
    deleteSalesRecord
  } = useDataManagementStore()

  // データ取得
  const fetchRecords = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // 将来的にはAPI呼び出し
      // const response = await fetch('/api/sales-records', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ filters, pagination })
      // })
      // const data = await response.json()
      // setSalesRecords(data.records)
      
      // 現在はローカルストレージから取得
      const savedRecords = localStorage.getItem('sales_records')
      if (savedRecords) {
        setSalesRecords(JSON.parse(savedRecords))
      }
    } catch (err) {
      setError('データの取得に失敗しました')
      console.error('Failed to fetch records:', err)
    } finally {
      setIsLoading(false)
    }
  }, [filters, pagination, setSalesRecords])

  // 新規作成
  const createRecord = useCallback(async (data: SalesRecordFormData) => {
    setError(null)
    
    try {
      // バリデーション
      const validatedData = await validateSalesRecord(data)
      
      // 新しいレコードの作成
      const newRecord: SalesRecord = {
        id: Date.now(), // 本来はサーバーサイドで生成
        ...validatedData,
        quantity: Number(data.quantity),
        unitPrice: Number(data.unitPrice),
        total: Number(data.quantity) * Number(data.unitPrice),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      // ストアに追加
      addSalesRecord(newRecord)
      
      // ローカルストレージに保存
      const updatedRecords = [...records, newRecord]
      localStorage.setItem('sales_records', JSON.stringify(updatedRecords))
      
      // 売上分析データの更新をトリガー（リアルタイム反映）
      window.dispatchEvent(new CustomEvent('salesDataUpdated', { 
        detail: { type: 'create', record: newRecord } 
      }))
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'データの保存に失敗しました'
      setError(errorMessage)
      throw err
    }
  }, [records, addSalesRecord])

  // 更新
  const updateRecord = useCallback(async (id: number, data: SalesRecordFormData) => {
    setError(null)
    
    try {
      // バリデーション
      const validatedData = await validateSalesRecord(data)
      
      // 更新データの作成
      const updatedRecord: Partial<SalesRecord> = {
        ...validatedData,
        quantity: Number(data.quantity),
        unitPrice: Number(data.unitPrice),
        total: Number(data.quantity) * Number(data.unitPrice),
        updatedAt: new Date().toISOString()
      }
      
      // ストアを更新
      updateSalesRecord(id, updatedRecord)
      
      // ローカルストレージに保存
      const updatedRecords = records.map(record => 
        record.id === id ? { ...record, ...updatedRecord } : record
      )
      localStorage.setItem('sales_records', JSON.stringify(updatedRecords))
      
      // 売上分析データの更新をトリガー
      window.dispatchEvent(new CustomEvent('salesDataUpdated', { 
        detail: { type: 'update', recordId: id, record: updatedRecord } 
      }))
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'データの更新に失敗しました'
      setError(errorMessage)
      throw err
    }
  }, [records, updateSalesRecord])

  // 削除
  const deleteRecord = useCallback(async (id: number) => {
    setError(null)
    
    try {
      // ストアから削除
      deleteSalesRecord(id)
      
      // ローカルストレージに保存
      const updatedRecords = records.filter(record => record.id !== id)
      localStorage.setItem('sales_records', JSON.stringify(updatedRecords))
      
      // 売上分析データの更新をトリガー
      window.dispatchEvent(new CustomEvent('salesDataUpdated', { 
        detail: { type: 'delete', recordId: id } 
      }))
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'データの削除に失敗しました'
      setError(errorMessage)
      throw err
    }
  }, [records, deleteSalesRecord])

  // 初期データ取得
  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  return {
    records,
    isLoading,
    error,
    createRecord,
    updateRecord,
    deleteRecord,
    refetch: fetchRecords
  }
}
```

## バリデーション設計

### バリデーションスキーマ（validation.ts）
```typescript
import { z } from 'zod'

// 売上記録のバリデーションスキーマ
export const salesRecordSchema = z.object({
  date: z.string()
    .min(1, '日付は必須です')
    .refine(date => {
      const d = new Date(date)
      const now = new Date()
      const minDate = new Date('2020-01-01')
      return d <= now && d >= minDate && !isNaN(d.getTime())
    }, '日付は2020年1月1日から今日までの範囲で入力してください'),
  
  crop: z.string()
    .min(1, '作物を選択してください'),
  
  quantity: z.string()
    .min(1, '数量は必須です')
    .refine(val => {
      const num = Number(val)
      return !isNaN(num) && num > 0 && num <= 100000
    }, '数量は1以上100,000以下の数値で入力してください'),
  
  unit: z.string()
    .min(1, '単位は必須です'),
  
  unitPrice: z.string()
    .min(1, '単価は必須です')
    .refine(val => {
      const num = Number(val)
      return !isNaN(num) && num > 0 && num <= 1000000
    }, '単価は1円以上1,000,000円以下で入力してください'),
  
  channel: z.string()
    .min(1, '販売チャンネルを選択してください'),
  
  notes: z.string().optional()
})

// 作物情報のバリデーションスキーマ
export const cropInfoSchema = z.object({
  name: z.string()
    .min(1, '作物名は必須です')
    .max(50, '作物名は50文字以内で入力してください'),
  
  category: z.string()
    .min(1, 'カテゴリは必須です'),
  
  defaultUnit: z.string()
    .min(1, '標準単位は必須です'),
  
  standardPrice: z.string()
    .refine(val => {
      if (!val) return true // 任意項目
      const num = Number(val)
      return !isNaN(num) && num >= 0 && num <= 1000000
    }, '標準単価は0円以上1,000,000円以下で入力してください'),
  
  description: z.string()
    .max(200, '説明は200文字以内で入力してください')
    .optional()
})

// 販売チャンネルのバリデーションスキーマ
export const salesChannelSchema = z.object({
  name: z.string()
    .min(1, 'チャンネル名は必須です')
    .max(50, 'チャンネル名は50文字以内で入力してください')
    .regex(/^[a-zA-Z0-9_]+$/, 'チャンネル名は英数字とアンダースコアのみ使用可能です'),
  
  displayName: z.string()
    .min(1, '表示名は必須です')
    .max(50, '表示名は50文字以内で入力してください'),
  
  commissionRate: z.string()
    .refine(val => {
      if (!val) return true // 任意項目
      const num = Number(val)
      return !isNaN(num) && num >= 0 && num <= 100
    }, '手数料率は0%以上100%以下で入力してください'),
  
  contactInfo: z.string()
    .max(100, '連絡先は100文字以内で入力してください')
    .optional(),
  
  notes: z.string()
    .max(200, 'メモは200文字以内で入力してください')
    .optional()
})

// バリデーション実行関数
export const validateSalesRecord = async (data: SalesRecordFormData) => {
  return salesRecordSchema.parseAsync(data)
}

export const validateCropInfo = async (data: CropInfoFormData) => {
  return cropInfoSchema.parseAsync(data)
}

export const validateSalesChannel = async (data: SalesChannelFormData) => {
  return salesChannelSchema.parseAsync(data)
}

// カスタムバリデーション関数
export const validateRecordConsistency = (record: SalesRecord): string[] => {
  const errors: string[] = []
  
  // 合計金額の整合性チェック
  const calculatedTotal = record.quantity * record.unitPrice
  if (Math.abs(record.total - calculatedTotal) > 0.01) {
    errors.push('合計金額が数量×単価と一致しません')
  }
  
  // 日付の妥当性チェック
  const recordDate = new Date(record.date)
  const now = new Date()
  if (recordDate > now) {
    errors.push('未来の日付は入力できません')
  }
  
  return errors
}
```

## 状態管理設計

### グローバルストア（data-management-store.ts）
```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SalesRecord, CropInfo, SalesChannel } from '../types'

interface DataManagementState {
  // 売上記録
  salesRecords: SalesRecord[]
  setSalesRecords: (records: SalesRecord[]) => void
  addSalesRecord: (record: SalesRecord) => void
  updateSalesRecord: (id: number, updates: Partial<SalesRecord>) => void
  deleteSalesRecord: (id: number) => void
  
  // 作物情報
  cropInfo: CropInfo[]
  setCropInfo: (crops: CropInfo[]) => void
  addCropInfo: (crop: CropInfo) => void
  updateCropInfo: (id: string, updates: Partial<CropInfo>) => void
  deleteCropInfo: (id: string) => void
  
  // 販売チャンネル
  salesChannels: SalesChannel[]
  setSalesChannels: (channels: SalesChannel[]) => void
  addSalesChannel: (channel: SalesChannel) => void
  updateSalesChannel: (id: string, updates: Partial<SalesChannel>) => void
  deleteSalesChannel: (id: string) => void
  
  // UI状態
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  lastUpdated: string | null
  setLastUpdated: (timestamp: string) => void
}

export const useDataManagementStore = create<DataManagementState>()(
  persist(
    (set, get) => ({
      // 売上記録
      salesRecords: [],
      setSalesRecords: (records) => set({ salesRecords: records }),
      addSalesRecord: (record) => set((state) => ({
        salesRecords: [...state.salesRecords, record],
        lastUpdated: new Date().toISOString()
      })),
      updateSalesRecord: (id, updates) => set((state) => ({
        salesRecords: state.salesRecords.map(record =>
          record.id === id ? { ...record, ...updates } : record
        ),
        lastUpdated: new Date().toISOString()
      })),
      deleteSalesRecord: (id) => set((state) => ({
        salesRecords: state.salesRecords.filter(record => record.id !== id),
        lastUpdated: new Date().toISOString()
      })),
      
      // 作物情報
      cropInfo: [],
      setCropInfo: (crops) => set({ cropInfo: crops }),
      addCropInfo: (crop) => set((state) => ({
        cropInfo: [...state.cropInfo, crop],
        lastUpdated: new Date().toISOString()
      })),
      updateCropInfo: (id, updates) => set((state) => ({
        cropInfo: state.cropInfo.map(crop =>
          crop.id === id ? { ...crop, ...updates } : crop
        ),
        lastUpdated: new Date().toISOString()
      })),
      deleteCropInfo: (id) => set((state) => ({
        cropInfo: state.cropInfo.filter(crop => crop.id !== id),
        lastUpdated: new Date().toISOString()
      })),
      
      // 販売チャンネル
      salesChannels: [],
      setSalesChannels: (channels) => set({ salesChannels: channels }),
      addSalesChannel: (channel) => set((state) => ({
        salesChannels: [...state.salesChannels, channel],
        lastUpdated: new Date().toISOString()
      })),
      updateSalesChannel: (id, updates) => set((state) => ({
        salesChannels: state.salesChannels.map(channel =>
          channel.id === id ? { ...channel, ...updates } : channel
        ),
        lastUpdated: new Date().toISOString()
      })),
      deleteSalesChannel: (id) => set((state) => ({
        salesChannels: state.salesChannels.filter(channel => channel.id !== id),
        lastUpdated: new Date().toISOString()
      })),
      
      // UI状態
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      lastUpdated: null,
      setLastUpdated: (timestamp) => set({ lastUpdated: timestamp })
    }),
    {
      name: 'data-management-store',
      partialize: (state) => ({
        salesRecords: state.salesRecords,
        cropInfo: state.cropInfo,
        salesChannels: state.salesChannels,
        lastUpdated: state.lastUpdated
      })
    }
  )
)
```

## リアルタイム反映機能

### イベント駆動更新システム
```typescript
// グラフ更新イベントリスナー（売上分析画面で使用）
useEffect(() => {
  const handleSalesDataUpdate = (event: CustomEvent) => {
    const { type, record, recordId } = event.detail
    
    switch (type) {
      case 'create':
        // 新規データの追加
        setSalesData(prev => [...prev, record])
        break
      case 'update':
        // データの更新
        setSalesData(prev => prev.map(r => r.id === recordId ? { ...r, ...record } : r))
        break
      case 'delete':
        // データの削除
        setSalesData(prev => prev.filter(r => r.id !== recordId))
        break
    }
    
    // グラフの再描画をトリガー
    setGraphKey(prev => prev + 1)
  }
  
  window.addEventListener('salesDataUpdated', handleSalesDataUpdate)
  
  return () => {
    window.removeEventListener('salesDataUpdated', handleSalesDataUpdate)
  }
}, [])
```

## パフォーマンス最適化

### 1. 仮想化テーブル
```typescript
// 大量データ対応のための仮想化実装
import { useVirtualizer } from '@tanstack/react-virtual'

const VirtualizedTable = ({ data, columns }) => {
  const parentRef = useRef<HTMLDivElement>(null)
  
  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // 行の高さ
    overscan: 5
  })
  
  return (
    <div ref={parentRef} className="h-96 overflow-auto">
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: virtualRow.size,
              transform: `translateY(${virtualRow.start}px)`
            }}
          >
            <TableRow data={data[virtualRow.index]} columns={columns} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 2. デバウンス処理
```typescript
// 検索・フィルター入力のデバウンス
import { useDebouncedCallback } from 'use-debounce'

const debouncedSearch = useDebouncedCallback(
  (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm }))
  },
  300 // 300ms delay
)
```

## データベース設計（将来実装）

### Prismaスキーマ例
```prisma
model SalesRecord {
  id        Int      @id @default(autoincrement())
  date      DateTime
  crop      String
  quantity  Float
  unit      String
  unitPrice Float
  total     Float
  channel   String
  notes     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  cropInfo    CropInfo     @relation(fields: [crop], references: [id])
  salesChannel SalesChannel @relation(fields: [channel], references: [id])
  
  @@map("sales_records")
}

model CropInfo {
  id           String  @id
  name         String
  category     String
  defaultUnit  String
  standardPrice Float?
  description  String?
  isActive     Boolean @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  salesRecords SalesRecord[]
  
  @@map("crop_info")
}

model SalesChannel {
  id             String  @id
  name           String  @unique
  displayName    String
  commissionRate Float?
  contactInfo    String?
  notes          String?
  isActive       Boolean @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  salesRecords SalesRecord[]
  
  @@map("sales_channels")
}
```

## テスト設計

### 1. ユニットテスト例
```typescript
// バリデーション関数のテスト
describe('validateSalesRecord', () => {
  it('正常なデータの場合は成功する', async () => {
    const validData = {
      date: '2024-12-01',
      crop: 'grape',
      quantity: '100',
      unit: 'kg',
      unitPrice: '300',
      channel: 'wholesale_market'
    }
    
    const result = await validateSalesRecord(validData)
    expect(result).toEqual(validData)
  })
  
  it('必須項目が不足している場合はエラーになる', async () => {
    const invalidData = {
      date: '',
      crop: 'grape',
      quantity: '100',
      unit: 'kg',
      unitPrice: '300',
      channel: 'wholesale_market'
    }
    
    await expect(validateSalesRecord(invalidData)).rejects.toThrow()
  })
})
```

### 2. インテグレーションテスト例
```typescript
// カスタムフックのテスト
describe('useSalesRecords', () => {
  it('レコードを正常に作成できる', async () => {
    const { result } = renderHook(() => useSalesRecords({}, {}))
    
    const newRecord = {
      date: '2024-12-01',
      crop: 'grape',
      quantity: '100',
      unit: 'kg',
      unitPrice: '300',
      channel: 'wholesale_market'
    }
    
    await act(async () => {
      await result.current.createRecord(newRecord)
    })
    
    expect(result.current.records).toHaveLength(1)
    expect(result.current.records[0].total).toBe(30000)
  })
})
```

---

**作成日**: 2024年12月  
**最終更新**: 2024年12月
