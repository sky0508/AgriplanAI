// 詳細分析機能 - データ集計ユーティリティ

import { 
  WorkRecord, 
  CostRecord, 
  SalesRecord, 
  AggregatedWorkData, 
  AggregatedCostData,
  DetailedAnalysisFilters,
  EfficiencyMetrics,
  ChartDataPoint,
  TrendAnalysis,
  ComparisonResult
} from '../types'
import { AI_ANALYSIS_THRESHOLDS } from '../constants'
// 標準のJavaScript Date APIを使用

// ===== 期間キー生成関数 =====

export function getPeriodKey(date: string, period: DetailedAnalysisFilters['period']): string {
  // 日付の検証
  if (!date || typeof date !== 'string') {
    console.warn('Invalid date string:', date)
    return '不明な期間'
  }
  
  const dateObj = new Date(date)
  
  // 無効な日付の検証
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date:', date)
    return '不明な期間'
  }
  
  switch (period) {
    case 'weekly':
      const weekNum = Math.ceil(dateObj.getDate() / 7)
      return `${dateObj.getFullYear()}年${(dateObj.getMonth() + 1).toString().padStart(2, '0')}月第${weekNum}週`
    case 'monthly':
      return `${dateObj.getFullYear()}年${(dateObj.getMonth() + 1).toString().padStart(2, '0')}月`
    case 'quarterly':
      const quarter = Math.ceil((dateObj.getMonth() + 1) / 3)
      return `${dateObj.getFullYear()}年Q${quarter}`
    case 'yearly':
      return `${dateObj.getFullYear()}年`
    default:
      return `${dateObj.getFullYear()}年${(dateObj.getMonth() + 1).toString().padStart(2, '0')}月`
  }
}

// 期間の開始・終了日を取得
export function getPeriodRange(date: string, period: DetailedAnalysisFilters['period']) {
  const dateObj = new Date(date)
  
  if (isNaN(dateObj.getTime())) {
    const now = new Date()
    return { start: now, end: now }
  }
  
  switch (period) {
    case 'weekly':
      const startOfWeek = new Date(dateObj)
      startOfWeek.setDate(dateObj.getDate() - dateObj.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      return { start: startOfWeek, end: endOfWeek }
    case 'monthly':
      const startOfMonth = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1)
      const endOfMonth = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0)
      return { start: startOfMonth, end: endOfMonth }
    case 'quarterly':
      const quarter = Math.floor(dateObj.getMonth() / 3)
      const startOfQuarter = new Date(dateObj.getFullYear(), quarter * 3, 1)
      const endOfQuarter = new Date(dateObj.getFullYear(), quarter * 3 + 3, 0)
      return { start: startOfQuarter, end: endOfQuarter }
    case 'yearly':
      const startOfYear = new Date(dateObj.getFullYear(), 0, 1)
      const endOfYear = new Date(dateObj.getFullYear(), 11, 31)
      return { start: startOfYear, end: endOfYear }
    default:
      const defaultStart = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1)
      const defaultEnd = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0)
      return { start: defaultStart, end: defaultEnd }
  }
}

// ===== 作業データ集計関数 =====

export function aggregateWorkData(
  data: WorkRecord[], 
  period: DetailedAnalysisFilters['period']
): AggregatedWorkData[] {
  if (!data || data.length === 0) return []

  const groupedData = data.reduce((acc, record) => {
    const periodKey = getPeriodKey(record.date, period)
    
    if (!acc[periodKey]) {
      acc[periodKey] = {
        period: periodKey,
        totalHours: 0,
        workBreakdown: {},
        records: [],
        recordCount: 0
      }
    }
    
    const hours = record.duration / 60 // 分を時間に変換
    acc[periodKey].totalHours += hours
    acc[periodKey].workBreakdown[record.workType] = 
      (acc[periodKey].workBreakdown[record.workType] || 0) + hours
    acc[periodKey].records.push(record)
    acc[periodKey].recordCount += 1
    
    return acc
  }, {} as Record<string, any>)

  return Object.values(groupedData).map(group => ({
    period: group.period,
    totalHours: Math.round(group.totalHours * 100) / 100, // 小数点2桁まで
    workBreakdown: Object.fromEntries(
      Object.entries(group.workBreakdown).map(([key, value]) => [
        key, 
        Math.round((value as number) * 100) / 100
      ])
    ),
    efficiency: calculateEfficiencyMetrics(group.records),
    recordCount: group.recordCount
  })).sort((a, b) => a.period.localeCompare(b.period))
}

// ===== コストデータ集計関数 =====

export function aggregateCostData(
  costData: CostRecord[], 
  salesData: SalesRecord[], 
  period: DetailedAnalysisFilters['period']
): AggregatedCostData[] {
  if (!costData || costData.length === 0) return []

  // コストデータをグループ化
  const groupedCostData = costData.reduce((acc, record) => {
    const periodKey = getPeriodKey(record.date, period)
    
    if (!acc[periodKey]) {
      acc[periodKey] = {
        period: periodKey,
        totalCost: 0,
        costBreakdown: {},
        recordCount: 0
      }
    }
    
    acc[periodKey].totalCost += record.amount
    acc[periodKey].costBreakdown[record.category] = 
      (acc[periodKey].costBreakdown[record.category] || 0) + record.amount
    acc[periodKey].recordCount += 1
    
    return acc
  }, {} as Record<string, any>)

  // 売上データをグループ化
  const groupedSalesData = salesData.reduce((acc, record) => {
    const periodKey = getPeriodKey(record.date, period)
    
    if (!acc[periodKey]) {
      acc[periodKey] = { revenue: 0 }
    }
    
    acc[periodKey].revenue += record.total
    
    return acc
  }, {} as Record<string, { revenue: number }>)

  // コストと売上を結合
  return Object.values(groupedCostData).map(costGroup => {
    const salesGroup = groupedSalesData[costGroup.period] || { revenue: 0 }
    const profit = salesGroup.revenue - costGroup.totalCost
    const profitMargin = salesGroup.revenue > 0 ? (profit / salesGroup.revenue) * 100 : 0

    return {
      period: costGroup.period,
      totalCost: Math.round(costGroup.totalCost),
      costBreakdown: Object.fromEntries(
        Object.entries(costGroup.costBreakdown).map(([key, value]) => [
          key, 
          Math.round(value as number)
        ])
      ),
      revenue: Math.round(salesGroup.revenue),
      profit: Math.round(profit),
      profitMargin: Math.round(profitMargin * 100) / 100,
      recordCount: costGroup.recordCount
    }
  }).sort((a, b) => a.period.localeCompare(b.period))
}

// ===== 効率指標計算関数 =====

export function calculateEfficiencyMetrics(
  workData: WorkRecord[], 
  salesData?: SalesRecord[]
): EfficiencyMetrics {
  if (!workData || workData.length === 0) {
    return {
      timePerOutput: 0,
      laborCostRatio: 0,
      revenuePerHour: 0,
      workProductivity: 0,
      efficiency: 0
    }
  }

  const totalHours = workData.reduce((sum, record) => sum + (record.duration / 60), 0)
  const totalLaborCost = workData.reduce((sum, record) => sum + (record.laborCost || 0), 0)
  
  // 売上データがある場合の計算
  let revenue = 0
  let output = 0 // 出荷量（kg）
  
  if (salesData && salesData.length > 0) {
    revenue = salesData.reduce((sum, record) => sum + record.total, 0)
    output = salesData.reduce((sum, record) => sum + record.quantity, 0)
  }

  const timePerOutput = output > 0 ? totalHours / output : 0
  const laborCostRatio = revenue > 0 ? (totalLaborCost / revenue) * 100 : 0
  const revenuePerHour = totalHours > 0 ? revenue / totalHours : 0
  
  // 作業生産性（作業時間あたりの出荷量）
  const workProductivity = totalHours > 0 ? output / totalHours : 0
  
  // 総合効率スコア（0-100）
  const efficiency = calculateOverallEfficiency({
    timePerOutput,
    laborCostRatio,
    revenuePerHour,
    workProductivity
  })

  return {
    timePerOutput: Math.round(timePerOutput * 100) / 100,
    laborCostRatio: Math.round(laborCostRatio * 100) / 100,
    revenuePerHour: Math.round(revenuePerHour),
    workProductivity: Math.round(workProductivity * 100) / 100,
    efficiency: Math.round(efficiency)
  }
}

// 総合効率スコア計算
function calculateOverallEfficiency(metrics: Partial<EfficiencyMetrics>): number {
  const scores: number[] = []
  
  // 時間効率スコア（時間/出荷量が少ないほど高スコア）
  if (metrics.timePerOutput !== undefined && metrics.timePerOutput > 0) {
    const timeScore = Math.max(0, 100 - (metrics.timePerOutput * 20))
    scores.push(timeScore)
  }
  
  // コスト効率スコア（人件費率が少ないほど高スコア）
  if (metrics.laborCostRatio !== undefined) {
    const costScore = Math.max(0, 100 - (metrics.laborCostRatio * 2))
    scores.push(costScore)
  }
  
  // 売上効率スコア（時間あたり売上が多いほど高スコア）
  if (metrics.revenuePerHour !== undefined && metrics.revenuePerHour > 0) {
    const revenueScore = Math.min(100, (metrics.revenuePerHour / 1500) * 100)
    scores.push(revenueScore)
  }
  
  // 作業生産性スコア
  if (metrics.workProductivity !== undefined && metrics.workProductivity > 0) {
    const productivityScore = Math.min(100, metrics.workProductivity * 10)
    scores.push(productivityScore)
  }
  
  return scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 50
}

// ===== データフィルタリング関数 =====

export function filterWorkData(
  data: WorkRecord[], 
  filters: DetailedAnalysisFilters
): WorkRecord[] {
  return data.filter(record => {
    // 日付範囲フィルター
    if (record.date < filters.startDate || record.date > filters.endDate) {
      return false
    }
    
    // 作物フィルター
    if (filters.crops.length > 0 && !filters.crops.includes(record.crop)) {
      return false
    }
    
    // 作業種別フィルター
    if (filters.workTypes.length > 0 && !filters.workTypes.includes(record.workType)) {
      return false
    }
    
    return true
  })
}

export function filterCostData(
  data: CostRecord[], 
  filters: DetailedAnalysisFilters
): CostRecord[] {
  return data.filter(record => {
    // 日付範囲フィルター
    if (record.date < filters.startDate || record.date > filters.endDate) {
      return false
    }
    
    // 作物フィルター（作物が指定されている記録のみ）
    if (filters.crops.length > 0 && record.crop && !filters.crops.includes(record.crop)) {
      return false
    }
    
    // コストカテゴリフィルター
    if (filters.costCategories.length > 0 && !filters.costCategories.includes(record.category)) {
      return false
    }
    
    return true
  })
}

export function filterSalesData(
  data: SalesRecord[], 
  filters: DetailedAnalysisFilters
): SalesRecord[] {
  return data.filter(record => {
    // 日付範囲フィルター
    if (record.date < filters.startDate || record.date > filters.endDate) {
      return false
    }
    
    // 作物フィルター
    if (filters.crops.length > 0 && !filters.crops.includes(record.crop)) {
      return false
    }
    
    return true
  })
}

// ===== 利用可能な選択肢取得関数 =====

export function getAvailableCrops(
  workData: WorkRecord[], 
  costData: CostRecord[], 
  salesData: SalesRecord[]
): string[] {
  const crops = new Set<string>()
  
  workData.forEach(record => crops.add(record.crop))
  costData.forEach(record => record.crop && crops.add(record.crop))
  salesData.forEach(record => crops.add(record.crop))
  
  return Array.from(crops).sort()
}

export function getAvailableWorkTypes(workData: WorkRecord[]): string[] {
  const workTypes = new Set<string>()
  workData.forEach(record => workTypes.add(record.workType))
  return Array.from(workTypes).sort()
}

export function getAvailableCostCategories(costData: CostRecord[]): string[] {
  const categories = new Set<string>()
  costData.forEach(record => categories.add(record.category))
  return Array.from(categories).sort()
}

// ===== トレンド分析関数 =====

export function analyzeTrend(data: number[]): TrendAnalysis {
  if (data.length < AI_ANALYSIS_THRESHOLDS.trendMinDataPoints) {
    return {
      direction: 'stable',
      changeRate: 0,
      confidence: 0,
      dataPoints: data.length
    }
  }

  // 線形回帰による傾向分析
  const n = data.length
  const sumX = (n * (n - 1)) / 2
  const sumY = data.reduce((sum, value) => sum + value, 0)
  const sumXY = data.reduce((sum, value, index) => sum + (index * value), 0)
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  // 変化率の計算
  const firstValue = data[0]
  const lastValue = data[data.length - 1]
  const changeRate = firstValue !== 0 ? (lastValue - firstValue) / firstValue : 0

  // 方向の判定
  let direction: TrendAnalysis['direction'] = 'stable'
  if (Math.abs(changeRate) > AI_ANALYSIS_THRESHOLDS.significantChange) {
    direction = changeRate > 0 ? 'increasing' : 'decreasing'
  }

  // 信頼度の計算（決定係数R²に基づく）
  const yMean = sumY / n
  const totalSumSquares = data.reduce((sum, value) => sum + Math.pow(value - yMean, 2), 0)
  const residualSumSquares = data.reduce((sum, value, index) => {
    const predicted = slope * index + intercept
    return sum + Math.pow(value - predicted, 2)
  }, 0)
  
  const rSquared = totalSumSquares > 0 ? 1 - (residualSumSquares / totalSumSquares) : 0
  const confidence = Math.max(0, Math.min(100, rSquared * 100))

  return {
    direction,
    changeRate: Math.round(changeRate * 1000) / 1000,
    confidence: Math.round(confidence),
    dataPoints: n
  }
}

// ===== 比較分析関数 =====

export function compareWithPrevious(
  currentData: AggregatedWorkData[] | AggregatedCostData[],
  previousData: AggregatedWorkData[] | AggregatedCostData[]
): ComparisonResult[] {
  const results: ComparisonResult[] = []

  currentData.forEach(current => {
    const previous = previousData.find(p => 
      p.period.replace(/\d{4}年/, '') === current.period.replace(/\d{4}年/, '')
    )

    if (previous) {
      const currentValue = 'totalHours' in current ? current.totalHours : current.totalCost
      const previousValue = 'totalHours' in previous ? previous.totalHours : previous.totalCost
      
      const change = currentValue - previousValue
      const changePercent = previousValue !== 0 ? (change / previousValue) * 100 : 0

      results.push({
        current: currentValue,
        previous: previousValue,
        change,
        changePercent: Math.round(changePercent * 100) / 100,
        trend: analyzeTrend([previousValue, currentValue])
      })
    }
  })

  return results
}

// ===== チャート用データ変換関数 =====

export function convertToChartData(
  aggregatedData: AggregatedWorkData[] | AggregatedCostData[]
): ChartDataPoint[] {
  return aggregatedData.map(data => {
    const baseData: ChartDataPoint = {
      period: data.period
    }

    if ('workBreakdown' in data) {
      // 作業データの場合
      return {
        ...baseData,
        totalHours: data.totalHours,
        ...data.workBreakdown
      }
    } else {
      // コストデータの場合
      return {
        ...baseData,
        totalCost: data.totalCost,
        revenue: data.revenue,
        profit: data.profit,
        profitMargin: data.profitMargin,
        ...data.costBreakdown
      }
    }
  })
}

// ===== 統計計算関数 =====

export function calculateStatistics(data: number[]) {
  if (data.length === 0) {
    return {
      mean: 0,
      median: 0,
      min: 0,
      max: 0,
      stdDev: 0,
      count: 0
    }
  }

  const sortedData = [...data].sort((a, b) => a - b)
  const mean = data.reduce((sum, value) => sum + value, 0) / data.length
  const median = sortedData.length % 2 === 0
    ? (sortedData[sortedData.length / 2 - 1] + sortedData[sortedData.length / 2]) / 2
    : sortedData[Math.floor(sortedData.length / 2)]

  const variance = data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / data.length
  const stdDev = Math.sqrt(variance)

  return {
    mean: Math.round(mean * 100) / 100,
    median: Math.round(median * 100) / 100,
    min: Math.min(...data),
    max: Math.max(...data),
    stdDev: Math.round(stdDev * 100) / 100,
    count: data.length
  }
}

// 外れ値検出
export function detectOutliers(data: number[]): number[] {
  if (data.length < 4) return []

  const stats = calculateStatistics(data)
  const threshold = stats.stdDev * AI_ANALYSIS_THRESHOLDS.outlierThreshold

  return data.filter(value => 
    Math.abs(value - stats.mean) > threshold
  )
}

// ===== データ検証関数 =====

export function validateDataConsistency(
  workData: WorkRecord[],
  costData: CostRecord[],
  salesData: SalesRecord[]
): { isValid: boolean; issues: string[] } {
  const issues: string[] = []

  // 日付範囲の整合性チェック
  const workDateRange = getDateRange(workData.map(r => r.date))
  const costDateRange = getDateRange(costData.map(r => r.date))
  const salesDateRange = getDateRange(salesData.map(r => r.date))

  if (!isDateRangeOverlap(workDateRange, costDateRange)) {
    issues.push('作業記録とコスト記録の期間が重複していません')
  }

  if (!isDateRangeOverlap(workDateRange, salesDateRange)) {
    issues.push('作業記録と売上記録の期間が重複していません')
  }

  // データ量の妥当性チェック
  if (workData.length === 0) issues.push('作業記録データがありません')
  if (costData.length === 0) issues.push('コスト記録データがありません')
  if (salesData.length === 0) issues.push('売上記録データがありません')

  // 作物の整合性チェック
  const workCrops = new Set(workData.map(r => r.crop))
  const salesCrops = new Set(salesData.map(r => r.crop))
  const missingCrops = Array.from(salesCrops).filter(crop => !workCrops.has(crop))
  
  if (missingCrops.length > 0) {
    issues.push(`売上はあるが作業記録がない作物があります: ${missingCrops.join(', ')}`)
  }

  return {
    isValid: issues.length === 0,
    issues
  }
}

// 日付範囲取得
function getDateRange(dates: string[]): { start: string; end: string } | null {
  if (dates.length === 0) return null
  
  const sortedDates = dates.sort()
  return {
    start: sortedDates[0],
    end: sortedDates[sortedDates.length - 1]
  }
}

// 日付範囲の重複チェック
function isDateRangeOverlap(
  range1: { start: string; end: string } | null,
  range2: { start: string; end: string } | null
): boolean {
  if (!range1 || !range2) return false
  
  return range1.start <= range2.end && range2.start <= range1.end
}
