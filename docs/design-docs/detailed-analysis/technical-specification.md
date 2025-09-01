# 詳細分析機能 - 技術仕様書

## アーキテクチャ概要

### ファイル構成
```
app/existing-farmer/detailed-analysis/
├── page.tsx                           # メインページコンポーネント
├── components/
│   ├── WorkAnalysisSection.tsx        # 作業分析セクション
│   ├── CostAnalysisSection.tsx        # コスト分析セクション
│   ├── InsightsSection.tsx            # AI改善インサイトセクション
│   ├── charts/
│   │   ├── WorkTimeChart.tsx          # 作業時間推移グラフ
│   │   ├── WorkRatioChart.tsx         # 作業内容別比率グラフ
│   │   ├── EfficiencyMetrics.tsx      # 作業効率指標カード
│   │   ├── CostTrendChart.tsx         # コスト推移グラフ
│   │   ├── ProfitabilityChart.tsx     # 売上対比利益率グラフ
│   │   └── CostStructureChart.tsx     # コスト構造分析グラフ
│   ├── insights/
│   │   ├── AIInsightsCard.tsx         # AI改善提案カード
│   │   ├── TargetTracker.tsx          # 目標追跡コンポーネント
│   │   └── ImprovementActions.tsx     # 改善アクション一覧
│   └── filters/
│       ├── AnalysisFilters.tsx        # 分析条件フィルター
│       └── PeriodSelector.tsx         # 期間選択コンポーネント
├── utils/
│   ├── data-aggregation.ts            # データ集計ユーティリティ
│   ├── efficiency-calculations.ts     # 効率指標計算
│   ├── ai-insights.ts                 # AI分析ロジック
│   └── sample-data.ts                 # サンプルデータ生成
├── types.ts                           # TypeScript型定義
└── constants.ts                       # 定数・設定値
```

## データ型定義

### 基本データ型
```typescript
// 作業記録の型定義
interface WorkRecord {
  id: number
  date: string              // ISO形式の日付
  workType: string         // 作業種別（除草、収穫、施肥等）
  duration: number         // 作業時間（分）
  crop: string            // 対象作物
  laborCost?: number      // 人件費（任意）
  notes?: string          // メモ（任意）
  createdAt: string       // 作成日時
  updatedAt: string       // 更新日時
}

// コスト記録の型定義
interface CostRecord {
  id: number
  date: string              // 発生日
  category: string         // カテゴリ（肥料、農薬、人件費、設備費等）
  subcategory?: string     // サブカテゴリ
  amount: number           // 金額
  description: string      // 内容説明
  crop?: string           // 対象作物（任意）
  supplier?: string       // 仕入先（任意）
  createdAt: string       // 作成日時
  updatedAt: string       // 更新日時
}

// 売上記録の型定義（既存データ管理機能から）
interface SalesRecord {
  id: number
  date: string
  crop: string
  quantity: number
  unitPrice: number
  total: number
  channel: string
  notes?: string
  createdAt: string
  updatedAt: string
}

// 目標設定の型定義
interface Target {
  id: string
  type: 'efficiency' | 'cost' | 'revenue' | 'worktime'
  title: string            // 目標名
  description: string      // 目標説明
  targetValue: number      // 目標値
  currentValue: number     // 現在値
  unit: string            // 単位（%、円、時間等）
  deadline: string        // 期限
  status: 'active' | 'achieved' | 'missed' | 'paused'
  createdAt: string       // 作成日時
  updatedAt: string       // 更新日時
}

// AI改善インサイトの型定義
interface AIInsight {
  id: string
  type: 'efficiency' | 'cost' | 'revenue' | 'timing'
  title: string            // インサイトタイトル
  description: string      // 詳細説明
  impact: 'high' | 'medium' | 'low'  // 影響度
  confidence: number       // 信頼度（0-100）
  suggestedActions: string[]  // 推奨アクション
  dataSource: string       // 根拠データ
  generatedAt: string      // 生成日時
  isRead: boolean          // 既読フラグ
}
```

### 分析用データ型
```typescript
// 分析フィルター条件
interface DetailedAnalysisFilters {
  startDate: string
  endDate: string
  crops: string[]          // 選択された作物
  workTypes: string[]      // 選択された作業種別
  costCategories: string[] // 選択されたコストカテゴリ
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  compareWithPrevious: boolean  // 前期比較フラグ
}

// 作業効率指標データ
interface EfficiencyMetrics {
  timePerOutput: number    // 出荷量あたり作業時間
  laborCostRatio: number   // 人件費率（人件費/売上）
  revenuePerHour: number   // 時間あたり売上
  workProductivity: number // 作業生産性
  efficiency: number       // 総合効率スコア
}

// 集計データの型定義
interface AggregatedWorkData {
  period: string           // 期間（月名等）
  totalHours: number       // 総作業時間
  workBreakdown: Record<string, number>  // 作業種別ごとの時間
  efficiency: EfficiencyMetrics
}

interface AggregatedCostData {
  period: string           // 期間
  totalCost: number        // 総コスト
  costBreakdown: Record<string, number>  // カテゴリ別コスト
  revenue: number          // 売上
  profit: number           // 利益
  profitMargin: number     // 利益率
}

// チャート用データの型定義
interface ChartDataPoint {
  period: string
  [key: string]: any       // 動的なキー
}

interface PieChartData {
  name: string
  value: number
  color: string
  percentage: number
}
```

## コンポーネント設計

### 1. メインページ（page.tsx）
```typescript
'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, TrendingUp, AlertCircle } from 'lucide-react'
import Link from 'next/link'

// コンポーネントインポート
import { AnalysisFilters } from './components/filters/AnalysisFilters'
import { WorkAnalysisSection } from './components/WorkAnalysisSection'
import { CostAnalysisSection } from './components/CostAnalysisSection'
import { InsightsSection } from './components/InsightsSection'

// ユーティリティインポート
import { aggregateWorkData, aggregateCostData } from './utils/data-aggregation'
import { calculateEfficiencyMetrics } from './utils/efficiency-calculations'
import { generateAIInsights } from './utils/ai-insights'

export default function DetailedAnalysisPage() {
  // 状態管理
  const [workData, setWorkData] = useState<WorkRecord[]>([])
  const [costData, setCostData] = useState<CostRecord[]>([])
  const [salesData, setSalesData] = useState<SalesRecord[]>([])
  const [targets, setTargets] = useState<Target[]>([])
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const [filters, setFilters] = useState<DetailedAnalysisFilters>({
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    crops: [],
    workTypes: [],
    costCategories: [],
    period: 'monthly',
    compareWithPrevious: false
  })

  // データ読み込み
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // 各種データの読み込み
        const [workRecords, costRecords, salesRecords] = await Promise.all([
          loadWorkRecords(),
          loadCostRecords(),
          loadSalesRecords()
        ])
        
        setWorkData(workRecords)
        setCostData(costRecords)
        setSalesData(salesRecords)
        
        // AI分析の実行
        const generatedInsights = await generateAIInsights({
          workData: workRecords,
          costData: costRecords,
          salesData: salesRecords
        })
        setInsights(generatedInsights)
        
      } catch (error) {
        console.error('データ読み込みエラー:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [])

  // フィルタリング済みデータ
  const filteredData = useMemo(() => {
    return {
      work: filterWorkData(workData, filters),
      cost: filterCostData(costData, filters),
      sales: filterSalesData(salesData, filters)
    }
  }, [workData, costData, salesData, filters])

  // 集計データ
  const aggregatedData = useMemo(() => {
    return {
      work: aggregateWorkData(filteredData.work, filters.period),
      cost: aggregateCostData(filteredData.cost, filteredData.sales, filters.period)
    }
  }, [filteredData, filters.period])

  if (isLoading) {
    return <div className="min-h-screen bg-fog-grey flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-sprout-green border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-soil-brown">分析データを読み込み中...</p>
      </div>
    </div>
  }

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
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-charcoal">詳細分析</h1>
            <p className="text-soil-brown">作業・コストの長期分析とAI改善提案</p>
          </div>
          {insights.filter(i => !i.isRead).length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-harvest-yellow/10 rounded-lg">
              <AlertCircle className="w-4 h-4 text-harvest-yellow" />
              <span className="text-sm text-charcoal font-medium">
                {insights.filter(i => !i.isRead).length}件の新しい改善提案があります
              </span>
            </div>
          )}
        </div>
        
        {/* サマリーカード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white rounded-2xl shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sprout-green/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-sprout-green" />
                </div>
                <div>
                  <p className="text-sm text-soil-brown">総作業時間</p>
                  <p className="text-xl font-bold text-charcoal">
                    {aggregatedData.work.reduce((sum, data) => sum + data.totalHours, 0).toFixed(0)}h
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white rounded-2xl shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-soil-brown/10 rounded-lg flex items-center justify-center">
                  <span className="text-soil-brown font-bold">¥</span>
                </div>
                <div>
                  <p className="text-sm text-soil-brown">総コスト</p>
                  <p className="text-xl font-bold text-charcoal">
                    ¥{aggregatedData.cost.reduce((sum, data) => sum + data.totalCost, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white rounded-2xl shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-harvest-yellow/10 rounded-lg flex items-center justify-center">
                  <span className="text-harvest-yellow font-bold">%</span>
                </div>
                <div>
                  <p className="text-sm text-soil-brown">平均利益率</p>
                  <p className="text-xl font-bold text-charcoal">
                    {(aggregatedData.cost.reduce((sum, data) => sum + data.profitMargin, 0) / aggregatedData.cost.length || 0).toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white rounded-2xl shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sky-blue/10 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-sky-blue" />
                </div>
                <div>
                  <p className="text-sm text-soil-brown">改善提案</p>
                  <p className="text-xl font-bold text-charcoal">{insights.length}件</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* フィルター */}
        <AnalysisFilters 
          filters={filters}
          onFiltersChange={setFilters}
          availableCrops={getAvailableCrops(workData, costData, salesData)}
          availableWorkTypes={getAvailableWorkTypes(workData)}
          availableCostCategories={getAvailableCostCategories(costData)}
        />

        {/* 分析セクション */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 作業分析 */}
          <WorkAnalysisSection 
            data={aggregatedData.work}
            filters={filters}
            rawData={filteredData.work}
          />
          
          {/* コスト分析 */}
          <CostAnalysisSection 
            data={aggregatedData.cost}
            filters={filters}
            rawData={filteredData.cost}
          />
          
          {/* AI改善インサイト */}
          <InsightsSection 
            insights={insights}
            targets={targets}
            onTargetsUpdate={setTargets}
            onInsightRead={(insightId) => 
              setInsights(prev => prev.map(i => 
                i.id === insightId ? {...i, isRead: true} : i
              ))
            }
          />
        </div>
      </div>
    </div>
  )
}
```

### 2. 作業分析セクション
```typescript
interface WorkAnalysisSectionProps {
  data: AggregatedWorkData[]
  filters: DetailedAnalysisFilters
  rawData: WorkRecord[]
}

export const WorkAnalysisSection = ({ data, filters, rawData }: WorkAnalysisSectionProps) => {
  const efficiencyMetrics = useMemo(() => {
    return calculateEfficiencyMetrics(rawData)
  }, [rawData])

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-charcoal">作業分析</h2>
      
      {/* 作業時間推移 */}
      <WorkTimeChart data={data} period={filters.period} />
      
      {/* 作業内容別比率 */}
      <WorkRatioChart data={data} />
      
      {/* 効率指標 */}
      <EfficiencyMetrics metrics={efficiencyMetrics} />
    </div>
  )
}
```

### 3. AI改善インサイト生成ロジック
```typescript
// AI改善インサイト生成
export async function generateAIInsights(data: {
  workData: WorkRecord[]
  costData: CostRecord[]
  salesData: SalesRecord[]
}): Promise<AIInsight[]> {
  const insights: AIInsight[] = []
  
  // 1. 作業効率分析
  const workEfficiencyInsights = analyzeWorkEfficiency(data.workData)
  insights.push(...workEfficiencyInsights)
  
  // 2. コスト構造分析
  const costInsights = analyzeCostStructure(data.costData, data.salesData)
  insights.push(...costInsights)
  
  // 3. 季節性・タイミング分析
  const timingInsights = analyzeSeasonalPatterns(data)
  insights.push(...timingInsights)
  
  // 4. 収益性改善分析
  const profitabilityInsights = analyzeProfitabilityOpportunities(data)
  insights.push(...profitabilityInsights)
  
  return insights.sort((a, b) => {
    // 影響度と信頼度でソート
    const scoreA = getInsightScore(a)
    const scoreB = getInsightScore(b)
    return scoreB - scoreA
  })
}

// 作業効率分析
function analyzeWorkEfficiency(workData: WorkRecord[]): AIInsight[] {
  const insights: AIInsight[] = []
  
  // 作業種別ごとの効率分析
  const workTypeEfficiency = analyzeWorkTypeEfficiency(workData)
  
  // 非効率な作業の特定
  Object.entries(workTypeEfficiency).forEach(([workType, efficiency]) => {
    if (efficiency.trend === 'decreasing' && efficiency.severity > 0.2) {
      insights.push({
        id: `work-efficiency-${workType}`,
        type: 'efficiency',
        title: `${workType}の作業効率が低下`,
        description: `${workType}にかける時間が前年同期比+${(efficiency.changeRate * 100).toFixed(0)}%増加しています。作業手順の見直しや新しい手法の導入を検討してください。`,
        impact: efficiency.severity > 0.4 ? 'high' : 'medium',
        confidence: Math.min(90, efficiency.dataPoints * 10),
        suggestedActions: [
          '作業手順の標準化',
          '効率的な道具・機械の導入',
          '作業時間の最適化',
          '外部委託の検討'
        ],
        dataSource: `${workType}作業記録${efficiency.dataPoints}件`,
        generatedAt: new Date().toISOString(),
        isRead: false
      })
    }
  })
  
  return insights
}

// コスト構造分析
function analyzeCostStructure(costData: CostRecord[], salesData: SalesRecord[]): AIInsight[] {
  const insights: AIInsight[] = []
  
  // 月別利益率分析
  const monthlyProfitability = calculateMonthlyProfitability(costData, salesData)
  
  // 利益率の低い月を特定
  const lowProfitMonths = monthlyProfitability
    .filter(month => month.profitMargin < 20) // 20%以下
    .sort((a, b) => a.profitMargin - b.profitMargin)
  
  if (lowProfitMonths.length > 0) {
    const worstMonth = lowProfitMonths[0]
    insights.push({
      id: `low-profit-${worstMonth.month}`,
      type: 'cost',
      title: `${worstMonth.month}は利益率が最も低い`,
      description: `${worstMonth.month}の利益率は${worstMonth.profitMargin.toFixed(1)}%でした。主な要因は${worstMonth.majorCostCategory}の増加です。コスト構造を見直すことで改善の余地があります。`,
      impact: 'high',
      confidence: 85,
      suggestedActions: [
        `${worstMonth.majorCostCategory}の仕入先見直し`,
        '購入タイミングの最適化',
        'まとめ買いによるコスト削減',
        '代替手法の検討'
      ],
      dataSource: `${worstMonth.month}のコスト・売上記録`,
      generatedAt: new Date().toISOString(),
      isRead: false
    })
  }
  
  return insights
}
```

## データ処理・集計ロジック

### 1. 作業データ集計
```typescript
// 作業データの集計
export function aggregateWorkData(
  data: WorkRecord[], 
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
): AggregatedWorkData[] {
  const groupedData = data.reduce((acc, record) => {
    const periodKey = getPeriodKey(record.date, period)
    
    if (!acc[periodKey]) {
      acc[periodKey] = {
        period: periodKey,
        totalHours: 0,
        workBreakdown: {},
        records: []
      }
    }
    
    const hours = record.duration / 60 // 分を時間に変換
    acc[periodKey].totalHours += hours
    acc[periodKey].workBreakdown[record.workType] = 
      (acc[periodKey].workBreakdown[record.workType] || 0) + hours
    acc[periodKey].records.push(record)
    
    return acc
  }, {} as Record<string, any>)

  return Object.values(groupedData).map(group => ({
    period: group.period,
    totalHours: group.totalHours,
    workBreakdown: group.workBreakdown,
    efficiency: calculateEfficiencyMetrics(group.records)
  })).sort((a, b) => a.period.localeCompare(b.period))
}

// 効率指標の計算
export function calculateEfficiencyMetrics(workData: WorkRecord[]): EfficiencyMetrics {
  const totalHours = workData.reduce((sum, record) => sum + (record.duration / 60), 0)
  const totalLaborCost = workData.reduce((sum, record) => sum + (record.laborCost || 0), 0)
  
  // 売上データとの突合（実装時に追加）
  const revenue = 0 // TODO: 売上データから計算
  const output = 0  // TODO: 出荷量データから計算
  
  return {
    timePerOutput: output > 0 ? totalHours / output : 0,
    laborCostRatio: revenue > 0 ? (totalLaborCost / revenue) * 100 : 0,
    revenuePerHour: totalHours > 0 ? revenue / totalHours : 0,
    workProductivity: calculateWorkProductivity(workData),
    efficiency: calculateOverallEfficiency(workData)
  }
}
```

### 2. サンプルデータ生成
```typescript
// 開発・テスト用のサンプルデータ
export const generateSampleDetailedAnalysisData = () => {
  const workRecords: WorkRecord[] = []
  const costRecords: CostRecord[] = []
  let workId = 1
  let costId = 1

  // 1年分の作業記録を生成
  for (let month = 1; month <= 12; month++) {
    for (let week = 1; week <= 4; week++) {
      // 除草作業
      workRecords.push({
        id: workId++,
        date: `2024-${month.toString().padStart(2, '0')}-${(week * 7).toString().padStart(2, '0')}`,
        workType: '除草',
        duration: 180 + Math.random() * 120, // 3-5時間
        crop: 'grape',
        laborCost: 2000,
        notes: '畑の除草作業',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      // 収穫作業（8-11月のみ）
      if (month >= 8 && month <= 11) {
        workRecords.push({
          id: workId++,
          date: `2024-${month.toString().padStart(2, '0')}-${((week * 7) + 2).toString().padStart(2, '0')}`,
          workType: '収穫',
          duration: 300 + Math.random() * 180, // 5-8時間
          crop: 'grape',
          laborCost: 3000,
          notes: '葡萄の収穫作業',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      }

      // 施肥作業（3-5月、9-11月）
      if ((month >= 3 && month <= 5) || (month >= 9 && month <= 11)) {
        workRecords.push({
          id: workId++,
          date: `2024-${month.toString().padStart(2, '0')}-${((week * 7) + 4).toString().padStart(2, '0')}`,
          workType: '施肥',
          duration: 120 + Math.random() * 60, // 2-3時間
          crop: 'grape',
          laborCost: 1500,
          notes: '肥料散布作業',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      }
    }
  }

  // 1年分のコスト記録を生成
  for (let month = 1; month <= 12; month++) {
    // 肥料代
    costRecords.push({
      id: costId++,
      date: `2024-${month.toString().padStart(2, '0')}-15`,
      category: '肥料',
      subcategory: '化成肥料',
      amount: 15000 + Math.random() * 10000,
      description: '月次肥料購入',
      crop: 'grape',
      supplier: 'JA',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    // 農薬代
    costRecords.push({
      id: costId++,
      date: `2024-${month.toString().padStart(2, '0')}-20`,
      category: '農薬',
      subcategory: '殺菌剤',
      amount: 8000 + Math.random() * 5000,
      description: '病害虫防除',
      crop: 'grape',
      supplier: '農協',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    // 人件費（アルバイト）
    if (month >= 8 && month <= 11) { // 収穫期
      costRecords.push({
        id: costId++,
        date: `2024-${month.toString().padStart(2, '0')}-25`,
        category: '人件費',
        subcategory: 'アルバイト',
        amount: 50000 + Math.random() * 30000,
        description: '収穫期アルバイト',
        crop: 'grape',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }
  }

  return {
    workRecords,
    costRecords
  }
}
```

## 設定・定数

### カラー・テーマ設定
```typescript
// 作業種別カラー設定
export const WORK_TYPE_COLORS = {
  '除草': '#8D6E63',      // Soil Brown
  '収穫': '#2E7D32',      // Sprout Green
  '施肥': '#F6C445',      // Harvest Yellow
  '出荷準備': '#42A5F5',  // Sky Blue
  '管理作業': '#9C27B0',  // Purple
  'その他': '#757575'      // Grey
} as const

// コストカテゴリカラー設定
export const COST_CATEGORY_COLORS = {
  '肥料': '#4CAF50',      // Green
  '農薬': '#FF9800',      // Orange
  '人件費': '#2196F3',    // Blue
  '設備費': '#9C27B0',    // Purple
  '光熱費': '#FF5722',    // Deep Orange
  'その他': '#757575'      // Grey
} as const

// AI改善提案タイプ別カラー
export const INSIGHT_TYPE_COLORS = {
  'efficiency': '#2E7D32',  // Sprout Green
  'cost': '#FF9800',        // Orange
  'revenue': '#42A5F5',     // Sky Blue
  'timing': '#F6C445'       // Harvest Yellow
} as const

// 影響度カラー
export const IMPACT_COLORS = {
  'high': '#D32F2F',        // Red
  'medium': '#FF9800',      // Orange
  'low': '#4CAF50'          // Green
} as const
```

### 計算用定数
```typescript
// 効率指標の基準値
export const EFFICIENCY_BENCHMARKS = {
  timePerOutputGood: 2.0,      // 良好な時間/出荷量比率
  laborCostRatioGood: 15,      // 良好な人件費率（%）
  revenuePerHourGood: 1500,    // 良好な時間当たり売上
  efficiencyScoreGood: 80      // 良好な効率スコア
} as const

// AI分析の閾値
export const AI_ANALYSIS_THRESHOLDS = {
  significantChange: 0.15,     // 15%以上の変化を有意とする
  highImpactChange: 0.25,      // 25%以上の変化を高影響とする
  minDataPoints: 5,            // 最小必要データ点数
  confidenceThreshold: 70      // 信頼度の最小閾値
} as const
```

## パフォーマンス最適化

### 1. メモ化戦略
```typescript
// 重い計算のメモ化
const processedAnalysisData = useMemo(() => {
  return expensiveAnalysisCalculation(rawData, filters)
}, [rawData, filters])

// AI分析結果のキャッシュ
const memoizedInsights = useMemo(() => {
  return generateAIInsights(allData)
}, [allData])
```

### 2. データの仮想化
```typescript
// 大量データ対応（将来拡張）
import { FixedSizeList as List } from 'react-window'
```

### 3. 段階的データ読み込み
```typescript
// 初期表示用の最小データセット
const initialData = await loadInitialAnalysisData()
// 詳細データの遅延読み込み
const detailedData = await loadDetailedAnalysisData()
```

## API連携設計

### AI分析API
```typescript
// OpenAI API連携（改善インサイト生成）
interface AIAnalysisRequest {
  workData: WorkRecord[]
  costData: CostRecord[]
  salesData: SalesRecord[]
  analysisType: 'full' | 'efficiency' | 'cost' | 'timing'
}

interface AIAnalysisResponse {
  insights: AIInsight[]
  confidence: number
  processingTime: number
}
```

## テスト要件

### 1. ユニットテスト
- データ集計関数のテスト
- 効率指標計算のテスト
- AI分析ロジックのテスト

### 2. インテグレーションテスト
- コンポーネント間のデータフロー
- フィルター変更時の正しい更新

### 3. パフォーマンステスト
- 大量データ処理の性能確認
- AI分析の応答時間測定

---

**作成日**: 2024年12月  
**最終更新**: 2024年12月
