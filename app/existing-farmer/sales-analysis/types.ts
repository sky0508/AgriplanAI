// 売上分析機能の型定義

export interface SalesRecord {
  id: number
  date: string          // ISO形式の日付
  crop: string         // 作物名
  quantity: number     // 数量（kg）
  unitPrice: number    // 単価（円/kg）
  total: number        // 合計金額（円）
  buyer: string        // 販売先ID
  notes?: string       // メモ（任意）
}

export interface SalesChannel {
  id: string
  name: string
  displayName: string
}

export interface AnalysisFilters {
  startDate: string
  endDate: string
  crops: string[]      // 選択された作物のリスト
  channels: string[]   // 選択された販売チャンネルのリスト
  period: 'monthly' | 'quarterly' | 'yearly'
}

export interface ChartDataPoint {
  period: string       // 期間（月名等）
  [key: string]: any   // 動的なキー（作物名等）
}

export interface ChannelAnalysisData {
  channel: string
  revenue: number
  volume: number
  averagePrice: number
  percentage: number
}

export interface CropCompositionData {
  crop: string
  value: number
  percentage: number
  fill: string
}

export type AnalysisPeriod = 'monthly' | 'quarterly' | 'yearly'

