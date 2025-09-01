'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, TrendingUp, AlertCircle, DollarSign, Clock, Target } from 'lucide-react'
import Link from 'next/link'

// 型とユーティリティのインポート
import { 
  WorkRecord, 
  CostRecord, 
  SalesRecord, 
  Target as TargetType, 
  AIInsight,
  DetailedAnalysisFilters,
  AggregatedWorkData,
  AggregatedCostData
} from './types'

import { 
  aggregateWorkData, 
  aggregateCostData, 
  filterWorkData, 
  filterCostData, 
  filterSalesData,
  getAvailableCrops,
  getAvailableWorkTypes,
  getAvailableCostCategories,
  validateDataConsistency
} from './utils/data-aggregation'

import { initializeSampleData } from './utils/sample-data'
import { DEFAULT_DATE_RANGE } from './constants'

export default function DetailedAnalysisPage() {
  // ===== 状態管理 =====
  const [workData, setWorkData] = useState<WorkRecord[]>([])
  const [costData, setCostData] = useState<CostRecord[]>([])
  const [salesData, setSalesData] = useState<SalesRecord[]>([])
  const [targets, setTargets] = useState<TargetType[]>([])
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [filters, setFilters] = useState<DetailedAnalysisFilters>({
    startDate: DEFAULT_DATE_RANGE.startDate(),
    endDate: DEFAULT_DATE_RANGE.endDate(),
    crops: [],
    workTypes: [],
    costCategories: [],
    period: 'monthly',
    compareWithPrevious: false
  })

  // ===== データ読み込み =====
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // サンプルデータの初期化
        const sampleData = initializeSampleData()
        
        setWorkData(sampleData.workRecords)
        setCostData(sampleData.costRecords)
        setSalesData(sampleData.salesRecords)
        setTargets(sampleData.targets)
        setInsights(sampleData.insights)

        // データ整合性の検証
        const validation = validateDataConsistency(
          sampleData.workRecords,
          sampleData.costRecords,
          sampleData.salesRecords
        )
        
        if (!validation.isValid) {
          console.warn('データ整合性の問題:', validation.issues)
        }
        
      } catch (error) {
        console.error('データ読み込みエラー:', error)
        setError('データの読み込みに失敗しました')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [])

  // ===== フィルタリング済みデータ =====
  const filteredData = useMemo(() => {
    return {
      work: filterWorkData(workData, filters),
      cost: filterCostData(costData, filters),
      sales: filterSalesData(salesData, filters)
    }
  }, [workData, costData, salesData, filters])

  // ===== 集計データ =====
  const aggregatedData = useMemo(() => {
    return {
      work: aggregateWorkData(filteredData.work, filters.period),
      cost: aggregateCostData(filteredData.cost, filteredData.sales, filters.period)
    }
  }, [filteredData, filters.period])

  // ===== サマリー指標の計算 =====
  const summaryMetrics = useMemo(() => {
    const totalWorkHours = aggregatedData.work.reduce((sum, data) => sum + data.totalHours, 0)
    const totalCost = aggregatedData.cost.reduce((sum, data) => sum + data.totalCost, 0)
    const totalRevenue = aggregatedData.cost.reduce((sum, data) => sum + data.revenue, 0)
    const avgProfitMargin = aggregatedData.cost.length > 0
      ? aggregatedData.cost.reduce((sum, data) => sum + data.profitMargin, 0) / aggregatedData.cost.length
      : 0
    const unreadInsights = insights.filter(insight => !insight.isRead).length

    return {
      totalWorkHours: Math.round(totalWorkHours * 10) / 10,
      totalCost: Math.round(totalCost),
      totalRevenue: Math.round(totalRevenue),
      avgProfitMargin: Math.round(avgProfitMargin * 10) / 10,
      unreadInsights
    }
  }, [aggregatedData, insights])

  // ===== 利用可能な選択肢 =====
  const availableOptions = useMemo(() => {
    return {
      crops: getAvailableCrops(workData, costData, salesData),
      workTypes: getAvailableWorkTypes(workData),
      costCategories: getAvailableCostCategories(costData)
    }
  }, [workData, costData, salesData])

  // ===== インサイト既読処理 =====
  const handleInsightRead = (insightId: string) => {
    setInsights(prev => prev.map(insight => 
      insight.id === insightId ? { ...insight, isRead: true } : insight
    ))
  }

  // ===== ローディング画面 =====
  if (isLoading) {
    return (
      <div className="min-h-screen bg-fog-grey flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-sprout-green border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-soil-brown">分析データを読み込み中...</p>
        </div>
      </div>
    )
  }

  // ===== エラー画面 =====
  if (error) {
    return (
      <div className="min-h-screen bg-fog-grey flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-charcoal mb-2">エラーが発生しました</h2>
            <p className="text-soil-brown mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              再読み込み
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-fog-grey p-6">
      {/* ===== ヘッダー ===== */}
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
          {summaryMetrics.unreadInsights > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-harvest-yellow/10 rounded-lg">
              <AlertCircle className="w-4 h-4 text-harvest-yellow" />
              <span className="text-sm text-charcoal font-medium">
                {summaryMetrics.unreadInsights}件の新しい改善提案があります
              </span>
            </div>
          )}
        </div>
        
        {/* ===== サマリーカード ===== */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white rounded-2xl shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sprout-green/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-sprout-green" />
                </div>
                <div>
                  <p className="text-sm text-soil-brown">総作業時間</p>
                  <p className="text-xl font-bold text-charcoal">
                    {summaryMetrics.totalWorkHours}h
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white rounded-2xl shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-soil-brown/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-soil-brown" />
                </div>
                <div>
                  <p className="text-sm text-soil-brown">総コスト</p>
                  <p className="text-xl font-bold text-charcoal">
                    ¥{summaryMetrics.totalCost.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white rounded-2xl shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-harvest-yellow/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-harvest-yellow" />
                </div>
                <div>
                  <p className="text-sm text-soil-brown">平均利益率</p>
                  <p className="text-xl font-bold text-charcoal">
                    {summaryMetrics.avgProfitMargin}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white rounded-2xl shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sky-blue/10 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-sky-blue" />
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
        {/* ===== フィルターセクション ===== */}
        <Card className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-charcoal">分析条件</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* 期間選択 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-charcoal">期間</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sprout-green"
                  value={filters.period}
                  onChange={(e) => setFilters(prev => ({
                    ...prev, 
                    period: e.target.value as DetailedAnalysisFilters['period']
                  }))}
                >
                  <option value="monthly">月別</option>
                  <option value="quarterly">四半期別</option>
                  <option value="yearly">年別</option>
                </select>
              </div>

              {/* 開始日 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-charcoal">開始日</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sprout-green"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>

              {/* 終了日 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-charcoal">終了日</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sprout-green"
                  value={filters.endDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>

              {/* 作物選択 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-charcoal">作物</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sprout-green"
                  value={filters.crops[0] || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev, 
                    crops: e.target.value ? [e.target.value] : []
                  }))}
                >
                  <option value="">すべての作物</option>
                  {availableOptions.crops.map(crop => (
                    <option key={crop} value={crop}>{crop}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ===== 分析セクション ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 作業分析セクション */}
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-charcoal">作業分析</h2>
            
            {/* 作業時間推移プレースホルダー */}
            <Card className="bg-white rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-charcoal">作業時間推移</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">作業時間推移グラフ</p>
                    <p className="text-xs text-gray-400">実装予定</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 作業効率指標 */}
            <Card className="bg-white rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-charcoal">作業効率指標</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-soil-brown">総作業時間</span>
                    <span className="font-semibold text-charcoal">{summaryMetrics.totalWorkHours}h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-soil-brown">記録件数</span>
                    <span className="font-semibold text-charcoal">{filteredData.work.length}件</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-soil-brown">平均作業時間/日</span>
                    <span className="font-semibold text-charcoal">
                      {filteredData.work.length > 0 
                        ? (summaryMetrics.totalWorkHours / Math.max(1, new Set(filteredData.work.map(w => w.date)).size)).toFixed(1)
                        : 0}h
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* コスト分析セクション */}
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-charcoal">コスト分析</h2>
            
            {/* コスト推移プレースホルダー */}
            <Card className="bg-white rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-charcoal">コスト推移</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <DollarSign className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">コスト推移グラフ</p>
                    <p className="text-xs text-gray-400">実装予定</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* コスト指標 */}
            <Card className="bg-white rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-charcoal">コスト指標</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-soil-brown">総コスト</span>
                    <span className="font-semibold text-charcoal">¥{summaryMetrics.totalCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-soil-brown">総売上</span>
                    <span className="font-semibold text-charcoal">¥{summaryMetrics.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-soil-brown">利益率</span>
                    <span className={`font-semibold ${summaryMetrics.avgProfitMargin >= 20 ? 'text-sprout-green' : 'text-red-500'}`}>
                      {summaryMetrics.avgProfitMargin}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI改善インサイトセクション */}
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-charcoal">AI改善提案</h2>
            
            {insights.length > 0 ? (
              insights.slice(0, 3).map((insight, index) => (
                <Card key={insight.id} className={`bg-white rounded-2xl shadow-sm border-l-4 ${
                  insight.impact === 'high' ? 'border-l-red-500' :
                  insight.impact === 'medium' ? 'border-l-orange-500' : 'border-l-green-500'
                }`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm font-semibold text-charcoal">
                        {insight.title}
                      </CardTitle>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        insight.impact === 'high' ? 'bg-red-100 text-red-700' :
                        insight.impact === 'medium' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {insight.impact === 'high' ? '高影響' : insight.impact === 'medium' ? '中影響' : '低影響'}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-soil-brown mb-3">{insight.description}</p>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">推奨アクション:</p>
                      <ul className="text-xs text-soil-brown space-y-1">
                        {insight.suggestedActions.slice(0, 2).map((action, actionIndex) => (
                          <li key={actionIndex} className="flex items-start gap-1">
                            <span className="text-sprout-green">•</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t">
                      <span className="text-xs text-gray-500">信頼度: {insight.confidence}%</span>
                      {!insight.isRead && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleInsightRead(insight.id)}
                          className="text-xs"
                        >
                          確認済み
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-white rounded-2xl shadow-sm">
                <CardContent className="p-6 text-center">
                  <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">改善提案を生成中...</p>
                  <p className="text-xs text-gray-400">データが蓄積されると表示されます</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* データ概要情報 */}
        <Card className="bg-white rounded-2xl shadow-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-soil-brown">
              <div>
                <span className="font-medium">データ期間:</span> {filters.startDate} 〜 {filters.endDate}
              </div>
              <div>
                <span className="font-medium">分析期間:</span> {
                  filters.period === 'monthly' ? '月別' :
                  filters.period === 'quarterly' ? '四半期別' : '年別'
                }
              </div>
              <div>
                <span className="font-medium">対象作物:</span> {
                  filters.crops.length > 0 ? filters.crops.join(', ') : 'すべて'
                }
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
