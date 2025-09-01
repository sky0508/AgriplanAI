# 売上分析データ管理機能 - 留意点・考慮事項

## 技術的留意点

### 1. データ整合性の確保

#### 参照整合性
- **作物マスタと売上記録の連携**: 作物情報を削除（無効化）する際に、既存の売上記録への影響を考慮
- **販売チャンネルと売上記録の連携**: チャンネル情報変更時の既存データとの整合性
- **外部キー制約**: データベースレベルでの整合性制約の実装

```typescript
// 作物削除時の制約チェック例
const validateCropDeletion = async (cropId: string) => {
  const existingRecords = await db.salesRecord.count({
    where: { crop: cropId }
  })
  
  if (existingRecords > 0) {
    throw new Error(`この作物は${existingRecords}件の売上記録で使用されています。削除ではなく無効化してください。`)
  }
}
```

#### データ型の一貫性
- **数値データ**: 負の値、小数点以下の桁数制限
- **日付データ**: 未来日付の制限、過去データの合理性チェック
- **文字列データ**: 長さ制限、特殊文字の扱い

### 2. パフォーマンス考慮事項

#### 大量データ対応
- **ページネーション**: 1,000件以上のデータに対する効率的な表示
- **仮想スクロール**: 大量データの描画パフォーマンス最適化
- **インデックス最適化**: データベースクエリの高速化

```typescript
// ページネーション実装例
interface PaginationParams {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  filters?: Record<string, any>
}

const getPaginatedSalesRecords = async (params: PaginationParams) => {
  const offset = (params.page - 1) * params.pageSize
  
  return await db.salesRecord.findMany({
    skip: offset,
    take: params.pageSize,
    orderBy: params.sortBy ? { [params.sortBy]: params.sortOrder } : undefined,
    where: buildFilterConditions(params.filters)
  })
}
```

#### リアルタイム更新の最適化
- **デバウンス処理**: 連続する編集操作の最適化
- **部分更新**: 変更された部分のみの再描画
- **キャッシュ戦略**: 頻繁にアクセスされるデータのキャッシュ

### 3. ユーザビリティ考慮事項

#### 編集操作の直感性
- **インライン編集**: セル単位での即座編集
- **バッチ編集**: 複数レコードの一括変更
- **元に戻す機能**: 編集操作の取り消し機能

#### エラーハンドリング
- **バリデーションエラーの明確な表示**
- **データ保存失敗時の復旧機能**
- **ネットワークエラー時の一時保存**

```typescript
// エラーハンドリング例
const handleSaveRecord = async (record: SalesRecord) => {
  try {
    setIsSaving(true)
    const result = await saveSalesRecord(record)
    setRecords(prev => prev.map(r => r.id === record.id ? result : r))
    toast.success('データを保存しました')
  } catch (error) {
    if (error instanceof ValidationError) {
      setValidationErrors(error.details)
      toast.error('入力内容を確認してください')
    } else if (error instanceof NetworkError) {
      // 一時保存の処理
      saveToDraft(record)
      toast.error('接続エラーが発生しました。データは一時保存されています。')
    } else {
      toast.error('データの保存に失敗しました')
    }
  } finally {
    setIsSaving(false)
  }
}
```

## データ設計上の留意点

### 1. スキーマ設計

#### 拡張性を考慮した設計
- **将来的な項目追加**: JSONフィールドやEAVモデルの活用
- **多言語対応**: 表示名の多言語化を考慮した設計
- **カスタムフィールド**: ユーザー独自項目の追加可能性

```sql
-- 拡張可能な作物マスタ設計例
CREATE TABLE crop_info (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  default_unit VARCHAR(20),
  standard_price DECIMAL(10,2),
  description TEXT,
  custom_fields JSONB, -- 将来的なカスタムフィールド
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### バージョニング
- **スキーマバージョン管理**: データベーススキーマの変更履歴
- **マイグレーション戦略**: 既存データの段階的移行
- **後方互換性**: 旧バージョンとの互換性確保

### 2. データ品質管理

#### バリデーションルール
- **必須項目**: 分析に必要最小限のデータの強制
- **論理チェック**: 数量×単価＝合計金額の整合性
- **範囲チェック**: 現実的な数値範囲の制限

```typescript
// バリデーションスキーマ例（Zod）
const salesRecordSchema = z.object({
  date: z.string().refine(date => {
    const d = new Date(date)
    const now = new Date()
    return d <= now && d >= new Date('2020-01-01')
  }, '日付は2020年1月1日から今日までの範囲で入力してください'),
  
  quantity: z.number().positive().max(10000, '数量は10,000以下で入力してください'),
  
  unitPrice: z.number().positive().max(100000, '単価は100,000円以下で入力してください'),
  
  total: z.number().refine((total, ctx) => {
    const { quantity, unitPrice } = ctx.parent
    return Math.abs(total - (quantity * unitPrice)) < 0.01
  }, '合計金額が数量×単価と一致しません')
})
```

#### データクリーニング
- **重複データの検出**: 同一日付・作物・チャンネルの重複チェック
- **異常値の検出**: 統計的外れ値の警告表示
- **データ正規化**: 表記ゆれの統一化

## セキュリティ上の留意点

### 1. 入力セキュリティ

#### SQLインジェクション対策
- **パラメータ化クエリ**: ORMの適切な使用
- **入力サニタイゼーション**: 特殊文字のエスケープ
- **権限制御**: データアクセス権限の適切な管理

#### XSS対策
- **出力エスケープ**: HTML出力時のエスケープ処理
- **CSP設定**: Content Security Policyの適切な設定
- **入力検証**: 悪意のあるスクリプトの検出・除去

### 2. データプライバシー

#### 個人情報保護
- **データ匿名化**: 必要に応じた個人識別情報の除去
- **アクセスログ**: データアクセス履歴の記録
- **データ保持期間**: 不要になったデータの自動削除

## 運用上の留意点

### 1. データバックアップ

#### 定期バックアップ
- **自動バックアップ**: 日次・週次の自動バックアップ
- **差分バックアップ**: 効率的なバックアップ戦略
- **復旧テスト**: バックアップからの復旧手順の確認

#### 障害対応
- **データ破損時の復旧手順**
- **システム障害時の一時的な代替手段**
- **ユーザーへの影響最小化策**

### 2. ユーザーサポート

#### 操作ガイダンス
- **初回利用ガイド**: データ管理機能の使い方説明
- **エラー時のヘルプ**: 問題解決のための情報提供
- **FAQ**: よくある質問と回答の整備

#### データ移行支援
- **既存データの移行**: サンプルデータから実データへの移行支援
- **インポート機能**: 外部データの取り込み支援
- **データ検証**: 移行データの整合性チェック

## パフォーマンス監視

### 1. メトリクス定義

#### システムメトリクス
- **レスポンス時間**: データロード・保存時間の監視
- **エラー率**: 操作失敗率の追跡
- **同時ユーザー数**: システム負荷の監視

#### ユーザビリティメトリクス
- **操作完了率**: データ編集操作の成功率
- **操作時間**: 各種操作にかかる平均時間
- **エラー回復率**: エラー発生後の回復率

### 2. アラート設定

#### 閾値設定
```typescript
// パフォーマンスアラート例
const performanceAlerts = {
  dataLoadTime: { threshold: 3000, unit: 'ms' },  // 3秒以上でアラート
  saveTime: { threshold: 1000, unit: 'ms' },      // 1秒以上でアラート
  errorRate: { threshold: 5, unit: '%' },         // エラー率5%以上でアラート
  concurrentUsers: { threshold: 100, unit: 'users' } // 100ユーザー以上でアラート
}
```

## テスト戦略

### 1. 自動テスト

#### ユニットテスト
- **バリデーション関数**: 入力検証ロジックのテスト
- **データ変換関数**: データ処理ロジックのテスト
- **ユーティリティ関数**: 共通関数のテスト

#### インテグレーションテスト
- **API エンドポイント**: データCRUD操作のテスト
- **データベース操作**: 整合性制約のテスト
- **外部サービス連携**: 外部APIとの連携テスト

### 2. 手動テスト

#### ユーザビリティテスト
- **操作フロー**: 実際のユーザー操作シナリオ
- **エラーハンドリング**: 異常系での動作確認
- **パフォーマンス**: 大量データでの動作確認

## 法的・コンプライアンス留意点

### 1. データ保護法令
- **個人情報保護法**: 農家の個人情報の適切な管理
- **GDPR**: 将来的な海外展開時の対応準備
- **業界規制**: 農業分野特有の規制への対応

### 2. データ所有権
- **ユーザーデータの所有権**: 農家が入力したデータの権利
- **データポータビリティ**: ユーザーのデータ移行権
- **データ削除権**: ユーザーによるデータ削除要求への対応

---

**作成日**: 2024年12月  
**最終更新**: 2024年12月

