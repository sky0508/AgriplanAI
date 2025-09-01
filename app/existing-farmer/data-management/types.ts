// 売上分析データ管理機能の型定義

export interface SalesRecord {
  id: number
  date: string                    // ISO形式の日付
  crop: string                   // 作物ID
  quantity: number               // 数量
  unit: string                   // 単位
  unitPrice: number              // 単価（円）
  total: number                  // 合計金額（円）
  channel: string                // 販売チャンネルID（buyer から統一）
  notes?: string                 // メモ（任意）
  createdAt: string              // 作成日時
  updatedAt: string              // 更新日時
}

export interface CropInfo {
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

export interface SalesChannel {
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
export interface TableFilters {
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

export interface PaginationState {
  page: number                   // 現在のページ
  pageSize: number               // ページサイズ
  total: number                  // 総レコード数
}

// フォーム用の型定義
export interface SalesRecordFormData {
  date: string
  crop: string
  quantity: string               // フォームでは文字列として扱う
  unit: string
  unitPrice: string              // フォームでは文字列として扱う
  channel: string
  notes?: string
}

export interface CropInfoFormData {
  name: string
  category: string
  defaultUnit: string
  standardPrice: string          // フォームでは文字列として扱う
  description?: string
}

export interface SalesChannelFormData {
  name: string
  displayName: string
  commissionRate?: string        // フォームでは文字列として扱う
  contactInfo?: string
  notes?: string
}

// 日々の記録モーダルとの互換性のための型（既存との統合用）
export interface DailyRecordSalesData {
  type: 'sales'
  date: string
  crop: string
  quantity: string
  unitPrice: string
  buyer: string  // channel に変換される
  notes?: string
  total: number
}

