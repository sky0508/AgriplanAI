// 詳細分析機能 - 定数・設定値

// ===== カラー設定 =====

// 作業種別カラー設定
export const WORK_TYPE_COLORS = {
  '除草': '#8D6E63',      // Soil Brown
  '収穫': '#2E7D32',      // Sprout Green
  '施肥': '#F6C445',      // Harvest Yellow
  '出荷準備': '#42A5F5',  // Sky Blue
  '管理作業': '#9C27B0',  // Purple
  '剪定': '#FF5722',      // Deep Orange
  '防除': '#FF9800',      // Orange
  'その他': '#757575'      // Grey
} as const

// コストカテゴリカラー設定
export const COST_CATEGORY_COLORS = {
  '肥料': '#4CAF50',      // Green
  '農薬': '#FF9800',      // Orange
  '人件費': '#2196F3',    // Blue
  '設備費': '#9C27B0',    // Purple
  '光熱費': '#FF5722',    // Deep Orange
  '資材費': '#795548',    // Brown
  '燃料費': '#607D8B',    // Blue Grey
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

// チャート用カラーパレット
export const CHART_COLORS = [
  '#2E7D32', '#42A5F5', '#F6C445', '#8D6E63', 
  '#9C27B0', '#FF9800', '#4CAF50', '#2196F3',
  '#FF5722', '#795548', '#607D8B', '#757575'
] as const

// ===== 効率指標・分析の基準値 =====

// 効率指標の基準値
export const EFFICIENCY_BENCHMARKS = {
  timePerOutputGood: 2.0,      // 良好な時間/出荷量比率（時間/kg）
  laborCostRatioGood: 15,      // 良好な人件費率（%）
  revenuePerHourGood: 1500,    // 良好な時間当たり売上（円/時間）
  efficiencyScoreGood: 80,     // 良好な効率スコア
  profitMarginGood: 25,        // 良好な利益率（%）
  workHoursPerDayGood: 8       // 良好な1日あたり作業時間
} as const

// AI分析の閾値
export const AI_ANALYSIS_THRESHOLDS = {
  significantChange: 0.15,     // 15%以上の変化を有意とする
  highImpactChange: 0.25,      // 25%以上の変化を高影響とする
  minDataPoints: 5,            // 最小必要データ点数
  confidenceThreshold: 70,     // 信頼度の最小閾値
  outlierThreshold: 2.0,       // 外れ値判定の標準偏差倍数
  trendMinDataPoints: 10       // トレンド分析に必要な最小データ点数
} as const

// ===== 期間・日付関連の設定 =====

// 期間選択オプション
export const PERIOD_OPTIONS = [
  { value: 'weekly', label: '週別', shortLabel: '週' },
  { value: 'monthly', label: '月別', shortLabel: '月' },
  { value: 'quarterly', label: '四半期別', shortLabel: '四半期' },
  { value: 'yearly', label: '年別', shortLabel: '年' }
] as const

// 日付フォーマット
export const DATE_FORMATS = {
  display: 'yyyy年MM月dd日',
  chart: 'MM/dd',
  monthChart: 'MM月',
  quarterChart: 'QQ',
  yearChart: 'yyyy年',
  iso: 'yyyy-MM-dd'
} as const

// デフォルト期間設定
export const DEFAULT_DATE_RANGE = {
  months: 12,  // デフォルトで12ヶ月分のデータを表示
  startDate: () => {
    const date = new Date()
    date.setMonth(date.getMonth() - 12)
    return date.toISOString().split('T')[0]
  },
  endDate: () => new Date().toISOString().split('T')[0]
} as const

// ===== 作業・コスト関連の設定 =====

// 作業種別の定義
export const WORK_TYPES = [
  { id: 'weeding', name: '除草', category: 'maintenance' },
  { id: 'harvest', name: '収穫', category: 'harvest' },
  { id: 'fertilizing', name: '施肥', category: 'cultivation' },
  { id: 'shipping', name: '出荷準備', category: 'shipping' },
  { id: 'management', name: '管理作業', category: 'management' },
  { id: 'pruning', name: '剪定', category: 'maintenance' },
  { id: 'pest_control', name: '防除', category: 'cultivation' },
  { id: 'other', name: 'その他', category: 'other' }
] as const

// コストカテゴリの定義
export const COST_CATEGORIES = [
  { id: 'fertilizer', name: '肥料', category: 'materials' },
  { id: 'pesticide', name: '農薬', category: 'materials' },
  { id: 'labor', name: '人件費', category: 'labor' },
  { id: 'equipment', name: '設備費', category: 'equipment' },
  { id: 'utilities', name: '光熱費', category: 'utilities' },
  { id: 'materials', name: '資材費', category: 'materials' },
  { id: 'fuel', name: '燃料費', category: 'utilities' },
  { id: 'other', name: 'その他', category: 'other' }
] as const

// 作物の定義（既存データと整合性を保つ）
export const CROPS = [
  { id: 'grape', name: 'ぶどう', category: 'fruit' },
  { id: 'potato', name: 'じゃがいも', category: 'vegetable' },
  { id: 'tomato', name: 'トマト', category: 'vegetable' },
  { id: 'cucumber', name: 'きゅうり', category: 'vegetable' },
  { id: 'cabbage', name: 'キャベツ', category: 'vegetable' },
  { id: 'rice', name: '米', category: 'grain' },
  { id: 'wheat', name: '小麦', category: 'grain' }
] as const

// ===== UI/UX設定 =====

// グラフの設定
export const CHART_CONFIG = {
  defaultHeight: 320,          // デフォルトグラフ高さ
  mobileHeight: 250,           // モバイル時のグラフ高さ
  animationDuration: 300,      // アニメーション時間（ms）
  tooltipDelay: 100,          // ツールチップ表示遅延（ms）
  gridStroke: '#f0f0f0',      // グリッド線の色
  axisStroke: '#8D6E63',      // 軸の色
  fontSize: 12,               // フォントサイズ
  fontFamily: 'Inter, sans-serif'  // フォントファミリー
} as const

// レスポンシブブレークポイント
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280
} as const

// グリッドレイアウト設定
export const GRID_CONFIG = {
  mobile: 'grid-cols-1',
  tablet: 'grid-cols-2', 
  desktop: 'grid-cols-3',
  gap: 'gap-6'
} as const

// ===== パフォーマンス設定 =====

// データ処理の設定
export const PERFORMANCE_CONFIG = {
  maxDataPoints: 1000,         // 最大データ点数
  cacheTimeout: 5 * 60 * 1000, // キャッシュタイムアウト（5分）
  virtualizeThreshold: 100,     // 仮想化閾値
  debounceDelay: 300,          // デバウンス遅延（ms）
  memoizationTimeout: 1000     // メモ化タイムアウト（ms）
} as const

// API設定
export const API_CONFIG = {
  timeout: 10000,              // APIタイムアウト（10秒）
  retryCount: 3,               // リトライ回数
  retryDelay: 1000,           // リトライ間隔（ms）
  maxRequestSize: 1024 * 1024  // 最大リクエストサイズ（1MB）
} as const

// ===== AI分析設定 =====

// AI分析の設定
export const AI_CONFIG = {
  enabled: true,               // AI機能の有効/無効
  fallbackToRules: true,       // ルールベース分析へのフォールバック
  maxInsights: 10,             // 最大インサイト数
  minConfidence: 60,           // 最小信頼度
  analysisTimeout: 15000,      // AI分析タイムアウト（15秒）
  cacheInsights: true,         // インサイトのキャッシュ
  insightExpiry: 24 * 60 * 60 * 1000  // インサイト有効期限（24時間）
} as const

// AI改善提案のテンプレート
export const AI_INSIGHT_TEMPLATES = {
  efficiency: {
    decreasing: '${workType}の作業効率が前期比${changePercent}%低下しています。作業手順の見直しや効率化を検討してください。',
    seasonal: '${month}月は${workType}に時間がかかる傾向があります。事前準備や作業計画の最適化を検討してください。'
  },
  cost: {
    increasing: '${category}のコストが前期比${changePercent}%増加しています。仕入先の見直しや購入タイミングの最適化を検討してください。',
    ratio: '${month}月は売上に対するコスト比率が${ratio}%と高くなっています。コスト構造の見直しが必要です。'
  },
  timing: {
    price: '出荷時期を${weeks}週ずらすことで、単価が${priceIncrease}%向上する可能性があります。',
    demand: '${month}月は需要が高く、この時期の出荷量を増やすことで収益向上が期待できます。'
  }
} as const

// ===== 目標設定の定数 =====

// 目標タイプの定義
export const TARGET_TYPES = [
  { 
    value: 'efficiency', 
    label: '作業効率', 
    unit: '%',
    description: '作業時間の短縮や生産性の向上'
  },
  { 
    value: 'cost', 
    label: 'コスト削減', 
    unit: '円',
    description: '運営コストの削減'
  },
  { 
    value: 'revenue', 
    label: '売上向上', 
    unit: '円',
    description: '売上・収益の増加'
  },
  { 
    value: 'worktime', 
    label: '作業時間', 
    unit: '時間',
    description: '作業時間の管理・最適化'
  }
] as const

// デフォルト目標値
export const DEFAULT_TARGETS = {
  efficiency: { value: 10, unit: '%', description: '作業効率10%向上' },
  cost: { value: 50000, unit: '円', description: '月間コスト5万円削減' },
  revenue: { value: 100000, unit: '円', description: '月間売上10万円向上' },
  worktime: { value: 2, unit: '時間', description: '1日2時間の作業時間短縮' }
} as const

// ===== エラーメッセージ =====

export const ERROR_MESSAGES = {
  // データ関連
  DATA_LOAD_FAILED: 'データの読み込みに失敗しました',
  DATA_VALIDATION_FAILED: 'データの検証に失敗しました',
  INSUFFICIENT_DATA: 'データが不足しています（最小${minCount}件必要）',
  
  // AI分析関連
  AI_ANALYSIS_FAILED: 'AI分析に失敗しました',
  AI_TIMEOUT: 'AI分析がタイムアウトしました',
  AI_UNAVAILABLE: 'AI機能が利用できません',
  
  // 計算関連
  CALCULATION_ERROR: '計算処理でエラーが発生しました',
  INVALID_DATE_RANGE: '日付範囲が正しくありません',
  DIVISION_BY_ZERO: '計算でゼロ除算が発生しました',
  
  // UI関連
  CHART_RENDER_FAILED: 'グラフの描画に失敗しました',
  FILTER_APPLY_FAILED: 'フィルターの適用に失敗しました'
} as const

// ===== 成功メッセージ =====

export const SUCCESS_MESSAGES = {
  DATA_LOADED: 'データを正常に読み込みました',
  ANALYSIS_COMPLETED: '分析が完了しました',
  INSIGHT_GENERATED: '${count}件の改善提案を生成しました',
  TARGET_SAVED: '目標を保存しました',
  FILTER_APPLIED: 'フィルターを適用しました'
} as const

// ===== 開発・デバッグ用設定 =====

export const DEV_CONFIG = {
  enableDebugLogs: process.env.NODE_ENV === 'development',
  showPerformanceMetrics: process.env.NODE_ENV === 'development',
  mockAIAnalysis: process.env.NODE_ENV === 'development',
  sampleDataSize: process.env.NODE_ENV === 'development' ? 100 : 50
} as const
