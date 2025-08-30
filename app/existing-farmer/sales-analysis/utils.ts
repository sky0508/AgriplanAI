import { format, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from 'date-fns'
import { ja } from 'date-fns/locale'
import type { 
  SalesRecord, 
  AnalysisFilters, 
  ChartDataPoint, 
  ChannelAnalysisData, 
  CropCompositionData,
  AnalysisPeriod 
} from './types'
import { CHANNEL_NAMES, CROP_NAMES, CROP_COLORS } from './constants'

// サンプルデータ生成
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
    { date: '2024-12-01', quantity: 25, unitPrice: 300 },
    { date: '2024-12-05', quantity: 35, unitPrice: 300 },
  ]

  const grapeDirect = [
    { date: '2024-11-03', quantity: 20, unitPrice: 400 },
    { date: '2024-11-07', quantity: 25, unitPrice: 400 },
    { date: '2024-11-12', quantity: 15, unitPrice: 400 },
    { date: '2024-11-18', quantity: 30, unitPrice: 400 },
    { date: '2024-11-25', quantity: 22, unitPrice: 400 },
    { date: '2024-12-03', quantity: 18, unitPrice: 400 },
    { date: '2024-12-08', quantity: 28, unitPrice: 400 },
  ]

  // じゃがいもデータ（10月〜11月）
  const potatoWholesale = [
    { date: '2024-10-15', quantity: 100, unitPrice: 150 },
    { date: '2024-10-20', quantity: 120, unitPrice: 150 },
    { date: '2024-10-25', quantity: 80, unitPrice: 150 },
    { date: '2024-11-02', quantity: 90, unitPrice: 150 },
    { date: '2024-11-08', quantity: 110, unitPrice: 150 },
    { date: '2024-11-15', quantity: 95, unitPrice: 150 },
    { date: '2024-11-22', quantity: 85, unitPrice: 150 },
  ]

  const potatoDirect = [
    { date: '2024-10-18', quantity: 60, unitPrice: 200 },
    { date: '2024-10-22', quantity: 70, unitPrice: 200 },
    { date: '2024-10-28', quantity: 50, unitPrice: 200 },
    { date: '2024-11-04', quantity: 80, unitPrice: 200 },
    { date: '2024-11-12', quantity: 65, unitPrice: 200 },
    { date: '2024-11-18', quantity: 75, unitPrice: 200 },
    { date: '2024-11-25', quantity: 55, unitPrice: 200 },
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

// 期間キーの生成
export const getPeriodKey = (date: string, period: AnalysisPeriod): string => {
  const dateObj = new Date(date)
  
  switch (period) {
    case 'monthly':
      return format(dateObj, 'yyyy-MM', { locale: ja })
    case 'quarterly':
      return `${dateObj.getFullYear()}-Q${Math.floor(dateObj.getMonth() / 3) + 1}`
    case 'yearly':
      return dateObj.getFullYear().toString()
    default:
      return format(dateObj, 'yyyy-MM', { locale: ja })
  }
}

// 期間表示名の生成
export const getPeriodLabel = (periodKey: string, period: AnalysisPeriod): string => {
  switch (period) {
    case 'monthly':
      const [year, month] = periodKey.split('-')
      return `${year}年${month}月`
    case 'quarterly':
      const [qYear, quarter] = periodKey.split('-Q')
      return `${qYear}年${quarter}Q`
    case 'yearly':
      return `${periodKey}年`
    default:
      return periodKey
  }
}

// データフィルタリング
export const filterSalesData = (data: SalesRecord[], filters: AnalysisFilters): SalesRecord[] => {
  return data.filter(record => {
    // 日付範囲フィルター
    const recordDate = new Date(record.date)
    const startDate = new Date(filters.startDate)
    const endDate = new Date(filters.endDate)
    
    if (recordDate < startDate || recordDate > endDate) {
      return false
    }

    // 作物フィルター
    if (filters.crops.length > 0 && !filters.crops.includes(record.crop)) {
      return false
    }

    // チャンネルフィルター
    if (filters.channels.length > 0 && !filters.channels.includes(record.buyer)) {
      return false
    }

    return true
  })
}

// 品目別売上データの集計
export const aggregateCropSalesData = (
  data: SalesRecord[], 
  period: AnalysisPeriod
): ChartDataPoint[] => {
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
    period: getPeriodLabel(period, period as AnalysisPeriod),
    ...crops
  })).sort((a, b) => a.period.localeCompare(b.period))
}

// 販売チャンネル別分析データの生成
export const generateChannelAnalysisData = (data: SalesRecord[]): ChannelAnalysisData[] => {
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
    channel: CHANNEL_NAMES[channel as keyof typeof CHANNEL_NAMES] || channel,
    revenue: data.revenue,
    volume: data.volume,
    averagePrice: data.revenue / data.volume,
    percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0
  }))
}

// 作物別売上構成比データの生成
export const generateCropCompositionData = (data: SalesRecord[]): CropCompositionData[] => {
  const cropGroups = data.reduce((acc, record) => {
    if (!acc[record.crop]) {
      acc[record.crop] = 0
    }
    acc[record.crop] += record.total
    return acc
  }, {} as Record<string, number>)

  const totalRevenue = Object.values(cropGroups).reduce((sum, value) => sum + value, 0)

  return Object.entries(cropGroups).map(([crop, value]) => ({
    crop: CROP_NAMES[crop as keyof typeof CROP_NAMES] || crop,
    value,
    percentage: totalRevenue > 0 ? (value / totalRevenue) * 100 : 0,
    fill: CROP_COLORS[crop as keyof typeof CROP_COLORS] || '#8D6E63'
  }))
}

// 利用可能な作物リストの取得
export const getAvailableCrops = (data: SalesRecord[]): string[] => {
  const crops = [...new Set(data.map(record => record.crop))]
  return crops.sort()
}

// 利用可能なチャンネルリストの取得
export const getAvailableChannels = (data: SalesRecord[]): string[] => {
  const channels = [...new Set(data.map(record => record.buyer))]
  return channels.sort()
}

// 数値フォーマット関数
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0,
  }).format(amount)
}

// 大きな数値の短縮表示
export const formatLargeNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}k`
  }
  return value.toLocaleString()
}
