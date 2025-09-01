// 詳細分析機能 - TypeScript型定義

// ===== 基本データ型 =====

// 作業記録の型定義
export interface WorkRecord {
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
export interface CostRecord {
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

// 売上記録の型定義（既存データ管理機能から流用）
export interface SalesRecord {
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
export interface Target {
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
export interface AIInsight {
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

// ===== 分析用データ型 =====

// 分析フィルター条件
export interface DetailedAnalysisFilters {
  startDate: string
  endDate: string
  crops: string[]          // 選択された作物
  workTypes: string[]      // 選択された作業種別
  costCategories: string[] // 選択されたコストカテゴリ
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  compareWithPrevious: boolean  // 前期比較フラグ
}

// 作業効率指標データ
export interface EfficiencyMetrics {
  timePerOutput: number    // 出荷量あたり作業時間
  laborCostRatio: number   // 人件費率（人件費/売上）
  revenuePerHour: number   // 時間あたり売上
  workProductivity: number // 作業生産性
  efficiency: number       // 総合効率スコア
}

// 集計データの型定義
export interface AggregatedWorkData {
  period: string           // 期間（月名等）
  totalHours: number       // 総作業時間
  workBreakdown: Record<string, number>  // 作業種別ごとの時間
  efficiency: EfficiencyMetrics
  recordCount: number      // 記録件数
}

export interface AggregatedCostData {
  period: string           // 期間
  totalCost: number        // 総コスト
  costBreakdown: Record<string, number>  // カテゴリ別コスト
  revenue: number          // 売上
  profit: number           // 利益
  profitMargin: number     // 利益率
  recordCount: number      // 記録件数
}

// チャート用データの型定義
export interface ChartDataPoint {
  period: string
  [key: string]: any       // 動的なキー
}

export interface PieChartData {
  name: string
  value: number
  color: string
  percentage: number
}

// ===== コンポーネントProps型 =====

// 作業分析セクションのProps
export interface WorkAnalysisSectionProps {
  data: AggregatedWorkData[]
  filters: DetailedAnalysisFilters
  rawData: WorkRecord[]
}

// コスト分析セクションのProps
export interface CostAnalysisSectionProps {
  data: AggregatedCostData[]
  filters: DetailedAnalysisFilters
  rawData: CostRecord[]
}

// インサイトセクションのProps
export interface InsightsSectionProps {
  insights: AIInsight[]
  targets: Target[]
  onTargetsUpdate: (targets: Target[]) => void
  onInsightRead: (insightId: string) => void
}

// フィルターコンポーネントのProps
export interface AnalysisFiltersProps {
  filters: DetailedAnalysisFilters
  onFiltersChange: (filters: DetailedAnalysisFilters) => void
  availableCrops: string[]
  availableWorkTypes: string[]
  availableCostCategories: string[]
}

// グラフコンポーネントのProps
export interface WorkTimeChartProps {
  data: AggregatedWorkData[]
  period: DetailedAnalysisFilters['period']
}

export interface WorkRatioChartProps {
  data: AggregatedWorkData[]
}

export interface CostTrendChartProps {
  data: AggregatedCostData[]
  period: DetailedAnalysisFilters['period']
}

export interface ProfitabilityChartProps {
  data: AggregatedCostData[]
}

export interface EfficiencyMetricsProps {
  metrics: EfficiencyMetrics
}

// ===== ユーティリティ関数の型 =====

// データ集計関数の型
export type DataAggregationFunction<T, R> = (
  data: T[],
  period: DetailedAnalysisFilters['period']
) => R[]

// 効率指標計算関数の型
export type EfficiencyCalculationFunction = (
  workData: WorkRecord[],
  salesData?: SalesRecord[]
) => EfficiencyMetrics

// AI分析関数の型
export interface AIAnalysisInput {
  workData: WorkRecord[]
  costData: CostRecord[]
  salesData: SalesRecord[]
}

export type AIAnalysisFunction = (
  data: AIAnalysisInput
) => Promise<AIInsight[]>

// ===== API関連の型 =====

// AI分析APIリクエスト
export interface AIAnalysisRequest {
  workData: WorkRecord[]
  costData: CostRecord[]
  salesData: SalesRecord[]
  analysisType: 'full' | 'efficiency' | 'cost' | 'timing'
}

// AI分析APIレスポンス
export interface AIAnalysisResponse {
  insights: AIInsight[]
  confidence: number
  processingTime: number
}

// ===== エラー処理の型 =====

export interface AnalysisError {
  code: string
  message: string
  details?: any
}

export type AnalysisResult<T> = {
  success: true
  data: T
} | {
  success: false
  error: AnalysisError
}

// ===== 統計・計算用の型 =====

export interface StatisticalSummary {
  mean: number
  median: number
  min: number
  max: number
  stdDev: number
  count: number
}

export interface TrendAnalysis {
  direction: 'increasing' | 'decreasing' | 'stable'
  changeRate: number        // 変化率（-1.0 to 1.0）
  confidence: number        // 信頼度（0-100）
  dataPoints: number        // データ点数
}

export interface ComparisonResult {
  current: number
  previous: number
  change: number
  changePercent: number
  trend: TrendAnalysis
}

// ===== 設定・定数の型 =====

export interface AnalysisConfig {
  // AI分析の設定
  aiAnalysis: {
    enabled: boolean
    apiKey?: string
    timeout: number
    retryCount: number
  }
  
  // パフォーマンス設定
  performance: {
    maxDataPoints: number
    cacheTimeout: number
    virtualizeThreshold: number
  }
  
  // 表示設定
  display: {
    defaultPeriod: DetailedAnalysisFilters['period']
    chartColors: Record<string, string>
    dateFormat: string
  }
}

// ===== 状態管理の型 =====

export interface DetailedAnalysisState {
  // データ
  workData: WorkRecord[]
  costData: CostRecord[]
  salesData: SalesRecord[]
  targets: Target[]
  insights: AIInsight[]
  
  // UI状態
  filters: DetailedAnalysisFilters
  isLoading: boolean
  error: AnalysisError | null
  
  // キャッシュ
  aggregatedData: {
    work: AggregatedWorkData[]
    cost: AggregatedCostData[]
  } | null
  lastUpdated: string
}

// アクション型
export type DetailedAnalysisAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: AnalysisError | null }
  | { type: 'SET_WORK_DATA'; payload: WorkRecord[] }
  | { type: 'SET_COST_DATA'; payload: CostRecord[] }
  | { type: 'SET_SALES_DATA'; payload: SalesRecord[] }
  | { type: 'SET_FILTERS'; payload: DetailedAnalysisFilters }
  | { type: 'SET_INSIGHTS'; payload: AIInsight[] }
  | { type: 'SET_TARGETS'; payload: Target[] }
  | { type: 'UPDATE_AGGREGATED_DATA'; payload: DetailedAnalysisState['aggregatedData'] }
  | { type: 'MARK_INSIGHT_READ'; payload: string }
