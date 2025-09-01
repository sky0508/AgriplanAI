# 売上分析機能 - 技術仕様書

## アーキテクチャ概要

### ファイル構成
```
app/existing-farmer/sales-analysis/
├── page.tsx                    # メインページコンポーネント
└── components/
    ├── SalesAnalysisFilters.tsx    # フィルターコンポーネント
    ├── CropSalesChart.tsx          # 品目別売上推移グラフ
    ├── ChannelAnalysisChart.tsx    # 販売チャンネル別分析
    ├── CropCompositionChart.tsx    # 作物別売上構成比
    └── SalesCostComparisonChart.tsx # 売上・コスト比較分析
```

## データ型定義

### 基本データ型
```typescript
// 売上記録の型定義
interface SalesRecord {
  id: number
  date: string          // ISO形式の日付
  crop: string         // 作物名
  quantity: number     // 数量（kg）
  unitPrice: number    // 単価（円/kg）
  total: number        // 合計金額（円）
  buyer: string        // 販売先ID
  notes?: string       // メモ（任意）
}

// 販売チャンネルの型定義
interface SalesChannel {
  id: string
  name: string
  displayName: string
}

// フィルター条件の型定義
interface AnalysisFilters {
  startDate: string
  endDate: string
  crops: string[]      // 選択された作物のリスト
  channels: string[]   // 選択された販売チャンネルのリスト
  period: 'monthly' | 'quarterly' | 'yearly'
}

// グラフ用データの型定義
interface ChartDataPoint {
  period: string       // 期間（月名等）
  [key: string]: any   // 動的なキー（作物名等）
}

interface ChannelAnalysisData {
  channel: string
  revenue: number
  volume: number
  averagePrice: number
  percentage: number
}

interface CropCompositionData {
  crop: string
  value: number
  percentage: number
  color: string
}
```

## コンポーネント設計

### 1. メインページ（page.tsx）
```typescript
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// コンポーネントインポート
import { SalesAnalysisFilters } from './components/SalesAnalysisFilters'
import { CropSalesChart } from './components/CropSalesChart'
import { ChannelAnalysisChart } from './components/ChannelAnalysisChart'
import { CropCompositionChart } from './components/CropCompositionChart'
import { SalesCostComparisonChart } from './components/SalesCostComparisonChart'

export default function SalesAnalysisPage() {
  const [salesData, setSalesData] = useState<SalesRecord[]>([])
  const [filters, setFilters] = useState<AnalysisFilters>({
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    crops: [],
    channels: [],
    period: 'monthly'
  })

  // データ取得・フィルタリング処理
  const filteredData = useMemo(() => {
    return filterSalesData(salesData, filters)
  }, [salesData, filters])

  return (
    <div className="min-h-screen bg-fog-grey p-6">
      {/* ヘッダー */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/existing-farmer">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              ダッシュボードに戻る
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-charcoal">売上分析</h1>
            <p className="text-soil-brown">売上データの詳細分析と可視化</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* フィルター */}
        <SalesAnalysisFilters 
          filters={filters}
          onFiltersChange={setFilters}
          availableCrops={getAvailableCrops(salesData)}
          availableChannels={getAvailableChannels(salesData)}
        />

        {/* グラフエリア */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CropSalesChart data={filteredData} filters={filters} />
          <ChannelAnalysisChart data={filteredData} />
          <CropCompositionChart data={filteredData} />
          <SalesCostComparisonChart data={filteredData} />
        </div>
      </div>
    </div>
  )
}
```

### 2. フィルターコンポーネント
```typescript
interface SalesAnalysisFiltersProps {
  filters: AnalysisFilters
  onFiltersChange: (filters: AnalysisFilters) => void
  availableCrops: string[]
  availableChannels: SalesChannel[]
}

export const SalesAnalysisFilters = ({ 
  filters, 
  onFiltersChange, 
  availableCrops, 
  availableChannels 
}: SalesAnalysisFiltersProps) => {
  return (
    <Card className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-charcoal">分析条件</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 期間選択 */}
          <div className="space-y-2">
            <Label>期間</Label>
            <Select value={filters.period} onValueChange={(value) => 
              onFiltersChange({...filters, period: value as any})
            }>
              <SelectContent>
                <SelectItem value="monthly">月別</SelectItem>
                <SelectItem value="quarterly">四半期別</SelectItem>
                <SelectItem value="yearly">年別</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 開始日 */}
          <div className="space-y-2">
            <Label>開始日</Label>
            <Input 
              type="date" 
              value={filters.startDate}
              onChange={(e) => onFiltersChange({...filters, startDate: e.target.value})}
            />
          </div>

          {/* 終了日 */}
          <div className="space-y-2">
            <Label>終了日</Label>
            <Input 
              type="date" 
              value={filters.endDate}
              onChange={(e) => onFiltersChange({...filters, endDate: e.target.value})}
            />
          </div>

          {/* 作物フィルター */}
          <div className="space-y-2">
            <Label>作物</Label>
            <MultiSelect
              options={availableCrops.map(crop => ({ value: crop, label: crop }))}
              value={filters.crops}
              onChange={(crops) => onFiltersChange({...filters, crops})}
              placeholder="作物を選択"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

### 3. 品目別売上推移グラフ
```typescript
interface CropSalesChartProps {
  data: SalesRecord[]
  filters: AnalysisFilters
}

export const CropSalesChart = ({ data, filters }: CropSalesChartProps) => {
  const chartData = useMemo(() => {
    return aggregateCropSalesData(data, filters.period)
  }, [data, filters.period])

  return (
    <Card className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-charcoal">品目別売上推移</CardTitle>
        <CardDescription className="text-soil-brown">
          月別の作物ごと売上推移
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="period" 
                stroke="#8D6E63"
                fontSize={12}
              />
              <YAxis 
                stroke="#8D6E63"
                fontSize={12}
                tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number) => [`¥${value.toLocaleString()}`, '売上']}
                labelStyle={{ color: '#263238' }}
              />
              <Legend />
              
              {/* 動的に作物ごとのLineを生成 */}
              {getAvailableCrops(data).map((crop, index) => (
                <Line
                  key={crop}
                  type="monotone"
                  dataKey={crop}
                  stroke={CROP_COLORS[crop] || CHART_COLORS[index % CHART_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
```

## データ処理ロジック

### 1. データ集計関数
```typescript
// 品目別売上データの集計
function aggregateCropSalesData(
  data: SalesRecord[], 
  period: 'monthly' | 'quarterly' | 'yearly'
): ChartDataPoint[] {
  const groupedData = data.reduce((acc, record) => {
    const periodKey = getPeriodKey(record.date, period)
    
    if (!acc[periodKey]) {
      acc[periodKey] = {}
    }
    
    if (!acc[periodKey][record.crop]) {
      acc[periodKey][record.crop] = 0
    }
    
    acc[periodKey][record.crop] += record.total
    
    return acc
  }, {} as Record<string, Record<string, number>>)

  return Object.entries(groupedData).map(([period, crops]) => ({
    period,
    ...crops
  })).sort((a, b) => a.period.localeCompare(b.period))
}

// 販売チャンネル別分析データの生成
function generateChannelAnalysisData(data: SalesRecord[]): ChannelAnalysisData[] {
  const channelGroups = data.reduce((acc, record) => {
    if (!acc[record.buyer]) {
      acc[record.buyer] = {
        revenue: 0,
        volume: 0,
        count: 0
      }
    }
    
    acc[record.buyer].revenue += record.total
    acc[record.buyer].volume += record.quantity
    acc[record.buyer].count += 1
    
    return acc
  }, {} as Record<string, {revenue: number, volume: number, count: number}>)

  const totalRevenue = Object.values(channelGroups)
    .reduce((sum, channel) => sum + channel.revenue, 0)

  return Object.entries(channelGroups).map(([channel, data]) => ({
    channel: CHANNEL_NAMES[channel] || channel,
    revenue: data.revenue,
    volume: data.volume,
    averagePrice: data.revenue / data.volume,
    percentage: (data.revenue / totalRevenue) * 100
  }))
}
```

### 2. サンプルデータ生成
```typescript
// 開発・テスト用のサンプルデータ
export const generateSampleSalesData = (): SalesRecord[] => {
  const records: SalesRecord[] = []
  let id = 1

  // 葡萄データ（11月〜12月）
  const grapeWholesale = [
    { date: '2024-11-01', quantity: 50, unitPrice: 300 },
    { date: '2024-11-05', quantity: 30, unitPrice: 300 },
    { date: '2024-11-10', quantity: 45, unitPrice: 300 },
    { date: '2024-11-15', quantity: 35, unitPrice: 300 },
    { date: '2024-11-20', quantity: 40, unitPrice: 300 },
  ]

  const grapeDirect = [
    { date: '2024-11-03', quantity: 20, unitPrice: 400 },
    { date: '2024-11-07', quantity: 25, unitPrice: 400 },
    { date: '2024-11-12', quantity: 15, unitPrice: 400 },
    { date: '2024-11-18', quantity: 30, unitPrice: 400 },
    { date: '2024-11-25', quantity: 22, unitPrice: 400 },
  ]

  // じゃがいもデータ（10月〜11月）
  const potatoWholesale = [
    { date: '2024-10-15', quantity: 100, unitPrice: 150 },
    { date: '2024-10-20', quantity: 120, unitPrice: 150 },
    { date: '2024-10-25', quantity: 80, unitPrice: 150 },
    { date: '2024-11-02', quantity: 90, unitPrice: 150 },
    { date: '2024-11-08', quantity: 110, unitPrice: 150 },
  ]

  const potatoDirect = [
    { date: '2024-10-18', quantity: 60, unitPrice: 200 },
    { date: '2024-10-22', quantity: 70, unitPrice: 200 },
    { date: '2024-10-28', quantity: 50, unitPrice: 200 },
    { date: '2024-11-04', quantity: 80, unitPrice: 200 },
    { date: '2024-11-12', quantity: 65, unitPrice: 200 },
  ]

  // レコード生成
  grapeWholesale.forEach(item => {
    records.push({
      id: id++,
      date: item.date,
      crop: 'grape',
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.quantity * item.unitPrice,
      buyer: 'wholesale_market'
    })
  })

  grapeDirect.forEach(item => {
    records.push({
      id: id++,
      date: item.date,
      crop: 'grape',
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.quantity * item.unitPrice,
      buyer: 'direct_sales'
    })
  })

  potatoWholesale.forEach(item => {
    records.push({
      id: id++,
      date: item.date,
      crop: 'potato',
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.quantity * item.unitPrice,
      buyer: 'wholesale_market'
    })
  })

  potatoDirect.forEach(item => {
    records.push({
      id: id++,
      date: item.date,
      crop: 'potato',
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.quantity * item.unitPrice,
      buyer: 'direct_sales'
    })
  })

  return records
}
```

## 設定・定数

### カラー設定
```typescript
// 作物別カラー設定
export const CROP_COLORS = {
  grape: '#2E7D32',      // Sprout Green
  potato: '#8D6E63',     // Soil Brown
  tomato: '#D32F2F',     // Red
  cucumber: '#388E3C',   // Green
  cabbage: '#1976D2',    // Blue
} as const

// チャート用カラーパレット
export const CHART_COLORS = [
  '#2E7D32', '#42A5F5', '#F6C445', '#8D6E63', 
  '#9C27B0', '#FF9800', '#4CAF50', '#2196F3'
] as const

// 販売チャンネル名マッピング
export const CHANNEL_NAMES = {
  'wholesale_market': 'よ市',
  'direct_sales': '産直',
  'ja': '農協',
  'restaurant': 'レストラン',
  'individual': '個人販売'
} as const
```

## パフォーマンス最適化

### 1. メモ化
```typescript
// データ処理の最適化
const processedData = useMemo(() => {
  return expensiveDataProcessing(rawData, filters)
}, [rawData, filters])

// コンポーネントの最適化
export const CropSalesChart = React.memo(({ data, filters }) => {
  // コンポーネント実装
})
```

### 2. 仮想化
```typescript
// 大量データ対応（将来拡張）
import { FixedSizeList as List } from 'react-window'
```

## テスト要件

### 1. ユニットテスト
- データ集計関数のテスト
- フィルタリング関数のテスト
- 日付処理関数のテスト

### 2. インテグレーションテスト
- コンポーネント間のデータ連携
- フィルター変更時のグラフ更新

### 3. E2Eテスト
- ページ表示からグラフ描画まで
- フィルター操作シナリオ

---

**作成日**: 2024年12月  
**最終更新**: 2024年12月

