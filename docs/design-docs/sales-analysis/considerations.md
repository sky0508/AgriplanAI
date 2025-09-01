# 売上分析機能 - 開発時の留意点

## 設計・開発時の重要な留意点

### 1. データ連携に関する留意点

#### 日々の記録データとの整合性
```typescript
// 重要：日々の記録モーダルのデータ構造と一致させる
interface SalesRecord {
  // daily-record-modal.tsx のSalesRecordと同じ構造を維持
  date: string
  crop: string
  quantity: string    // 注意：文字列として入力される
  unitPrice: string   // 注意：文字列として入力される
  buyer: string
  notes?: string
}

// 数値変換処理を確実に行う
const processedData = rawData.map(record => ({
  ...record,
  quantity: Number(record.quantity) || 0,
  unitPrice: Number(record.unitPrice) || 0,
  total: (Number(record.quantity) || 0) * (Number(record.unitPrice) || 0)
}))
```

#### データ永続化の考慮
- **現在**: ローカルストレージベース
- **将来**: データベース連携時の移行容易性を考慮
- **バックアップ**: データ損失防止のための定期的な確認

### 2. UI/UX設計の留意点

#### 既存デザインシステムとの統一
```typescript
// 必須：既存のカラーパレットを使用
const colors = {
  sproutGreen: '#2E7D32',    // メインカラー
  skyBlue: '#42A5F5',        // セカンダリ
  harvestYellow: '#F6C445',  // アクセント
  soilBrown: '#8D6E63',      // サポート
  fogGrey: '#F5F7F9',        // 背景
  charcoal: '#263238'        // テキスト
}

// 重要：既存コンポーネントとの統一
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// ↑ 新しいカードコンポーネントを作らず、既存を活用
```

#### レスポンシブ対応の重点事項
```typescript
// モバイル：1列レイアウト
// デスクトップ：2列グリッドレイアウト
const gridClass = isMobile 
  ? "grid grid-cols-1 gap-4" 
  : "grid grid-cols-1 lg:grid-cols-2 gap-6"

// グラフサイズの調整
const chartHeight = isMobile ? 250 : 320
```

#### ユーザビリティ重点項目
1. **初回利用時**: データがない状態での適切な案内
2. **データ不足時**: 分析に必要な最小データ件数の明示
3. **フィルター操作**: 直感的な操作方法の提供

### 3. パフォーマンスの留意点

#### データ処理の最適化
```typescript
// 重要：大量データでもパフォーマンスを維持
const processedData = useMemo(() => {
  // 複雑な計算はメモ化で最適化
  return expensiveDataProcessing(rawData, filters)
}, [rawData, filters]) // 依存配列を適切に設定

// Rechartsの最適化
const MemoizedChart = React.memo(({ data }) => (
  <ResponsiveContainer width="100%" height={320}>
    <LineChart data={data}>
      {/* グラフ定義 */}
    </LineChart>
  </ResponsiveContainer>
))
```

#### レンダリング最適化
- **遅延ローディング**: 重いコンポーネントの動的インポート
- **仮想化**: 将来的な大量データ対応
- **デバウンス**: フィルター入力の即時反応制御

### 4. データ品質・バリデーション

#### 入力データの検証
```typescript
// データ品質チェック関数
function validateSalesData(records: SalesRecord[]): ValidationResult {
  const errors: string[] = []
  
  records.forEach((record, index) => {
    // 必須フィールドチェック
    if (!record.date) errors.push(`Record ${index}: Date is required`)
    if (!record.crop) errors.push(`Record ${index}: Crop is required`)
    
    // 数値妥当性チェック
    if (isNaN(Number(record.quantity)) || Number(record.quantity) <= 0) {
      errors.push(`Record ${index}: Invalid quantity`)
    }
    
    // 日付妥当性チェック
    if (!isValidDate(record.date)) {
      errors.push(`Record ${index}: Invalid date format`)
    }
  })
  
  return { isValid: errors.length === 0, errors }
}
```

#### エラーハンドリング戦略
1. **グラフ表示エラー**: 代替表示またはエラーメッセージ
2. **データ不足**: 最小要件の案内と推奨アクション
3. **計算エラー**: ゼロ除算等の数値計算エラー対応

### 5. 拡張性の考慮

#### 将来機能追加への対応
```typescript
// 拡張しやすい設計
interface AnalysisConfig {
  charts: {
    cropSales: { enabled: boolean; config: CropSalesConfig }
    channelAnalysis: { enabled: boolean; config: ChannelConfig }
    composition: { enabled: boolean; config: CompositionConfig }
    comparison: { enabled: boolean; config: ComparisonConfig }
  }
  filters: {
    period: boolean
    dateRange: boolean
    crops: boolean
    channels: boolean
  }
}

// プラグイン的な拡張を想定
const chartComponents = {
  cropSales: CropSalesChart,
  channelAnalysis: ChannelAnalysisChart,
  composition: CropCompositionChart,
  comparison: SalesCostComparisonChart
}
```

#### API連携への準備
```typescript
// 将来のAPI連携を想定した設計
interface DataProvider {
  getSalesData(filters: AnalysisFilters): Promise<SalesRecord[]>
  getCostData(filters: AnalysisFilters): Promise<CostRecord[]>
}

// 現在：ローカルデータプロバイダー
class LocalDataProvider implements DataProvider {
  async getSalesData(filters: AnalysisFilters): Promise<SalesRecord[]> {
    // ローカルストレージからデータ取得
  }
}

// 将来：APIデータプロバイダー
class ApiDataProvider implements DataProvider {
  async getSalesData(filters: AnalysisFilters): Promise<SalesRecord[]> {
    // API経由でデータ取得
  }
}
```

### 6. セキュリティ・プライバシー

#### データの取り扱い
- **個人情報**: 農家の売上データは機密情報として適切に管理
- **ローカルストレージ**: データの暗号化は不要だが、適切なキー管理
- **エラーログ**: 機密データをログに出力しない

#### 入力検証
```typescript
// XSS対策：ユーザー入力のエスケープ
const sanitizeInput = (input: string): string => {
  return input.replace(/[<>\"']/g, '')
}

// SQLインジェクション対策：将来のAPI連携時に重要
// 現在はローカルデータのため該当なし
```

### 7. テスト・デバッグ

#### 段階的テスト戦略
```typescript
// 1. データ処理のユニットテスト
describe('Sales Data Processing', () => {
  test('aggregates crop sales correctly', () => {
    const input = mockSalesData
    const result = aggregateCropSalesData(input, 'monthly')
    expect(result).toEqual(expectedOutput)
  })
})

// 2. コンポーネントのテスト
describe('CropSalesChart', () => {
  test('renders chart with data', () => {
    render(<CropSalesChart data={mockData} filters={mockFilters} />)
    expect(screen.getByText('品目別売上推移')).toBeInTheDocument()
  })
})
```

#### デバッグ支援
```typescript
// 開発時のデバッグ情報
const DEBUG = process.env.NODE_ENV === 'development'

if (DEBUG) {
  console.log('Sales Analysis Debug Info:', {
    recordCount: salesData.length,
    dateRange: `${filters.startDate} - ${filters.endDate}`,
    activeCrops: filters.crops
  })
}
```

### 8. ドキュメント・保守

#### コード可読性
```typescript
// 適切なコメント
/**
 * 売上データを期間別に集計する
 * @param data - 売上記録の配列
 * @param period - 集計期間（monthly/quarterly/yearly）
 * @returns 期間別に集計されたチャートデータ
 */
function aggregateCropSalesData(
  data: SalesRecord[], 
  period: AnalysisPeriod
): ChartDataPoint[] {
  // 実装
}

// 定数の明確な定義
const MINIMUM_RECORDS_FOR_ANALYSIS = 5
const CHART_HEIGHT = 320
const DEFAULT_DATE_RANGE_DAYS = 90
```

#### 進捗管理
- **status.mdの定期更新**: 実装進捗の正確な記録
- **課題ログ**: 発見した技術的課題と解決策の記録
- **レビューポイント**: コードレビュー時のチェック項目

### 9. 実装順序の推奨

#### 推奨実装順序
1. **基本構造** → **サンプルデータ** → **1つ目のグラフ**
2. **フィルター基本機能** → **データ連携** → **残りのグラフ**
3. **UI調整** → **エラーハンドリング** → **最適化**

#### 各段階での確認点
- **構造確認**: ファイル配置とインポートの確認
- **データ確認**: サンプルデータの表示確認
- **機能確認**: 各グラフの動作確認
- **統合確認**: フィルターとグラフの連携確認

### 10. トラブルシューティング

#### よくある問題と対策
1. **Rechartsが表示されない**: ResponsiveContainerの設定確認
2. **データが空**: サンプルデータの生成・読み込み確認
3. **フィルターが効かない**: 状態管理と依存配列の確認
4. **レイアウト崩れ**: Tailwind CSSのクラス名確認

---

**これらの留意点を踏まえて実装を進めることで、品質が高く保守しやすい売上分析機能を構築できます。**

**作成日**: 2024年12月  
**最終更新**: 2024年12月

