// 売上分析機能の定数・設定

// 作物別カラー設定
export const CROP_COLORS = {
  grape: '#2E7D32',      // Sprout Green
  potato: '#8D6E63',     // Soil Brown
  tomato: '#D32F2F',     // Red
  cucumber: '#388E3C',   // Green
  cabbage: '#1976D2',    // Blue
  lettuce: '#4CAF50',    // Light Green
  strawberry: '#E91E63', // Pink
  apple: '#FF9800',      // Orange
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

// 作物名マッピング
export const CROP_NAMES = {
  'grape': '葡萄',
  'potato': 'じゃがいも',
  'tomato': 'トマト',
  'cucumber': 'きゅうり',
  'cabbage': 'キャベツ',
  'lettuce': 'レタス',
  'strawberry': 'いちご',
  'apple': 'りんご'
} as const

// 分析に必要な最小データ件数
export const MINIMUM_RECORDS_FOR_ANALYSIS = 3

// デフォルト設定
export const DEFAULT_CHART_HEIGHT = 320
export const DEFAULT_DATE_RANGE_DAYS = 90
