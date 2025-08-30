# データ設計仕様書

## 概要

既存農家の「売上予測の高精度化」と「AIによる最適化アドバイス」実現のためのデータ設計仕様書です。ユーザーが実現したい価値から逆算して、必要なデータ要素、取得方法、処理フローを定義します。

---

## 1. ユーザーの実現したい価値

### 1.1 売上予測の高精度化
- **目標精度**: ±20%程度の誤差範囲
- **予測期間**: 年間予測 + 月別詳細予測
- **更新頻度**: 月次更新、重要イベント時の随時更新

### 1.2 AIアドバイス機能
- **価格最適化**: 最適販売価格の提案（チャンネル別）
- **販売チャンネル推奨**: 収益最大化のためのチャンネル選択
- **収穫時期最適化**: 品質・価格・労働力を考慮した最適収穫タイミング

---

## 2. データ要素の詳細定義

### 2.1 売上予測に必要なデータ

#### コア予測要因
| データ項目 | 重要度 | データソース | 更新頻度 | 備考 |
|-----------|--------|-------------|----------|------|
| **生産量データ** |
| 栽培面積 | 高 | ユーザー入力 | 年次 | 基本情報 |
| 過去収穫量実績 | 高 | ユーザー入力 | 年次 | 3年分推奨 |
| 品種別収量ポテンシャル | 中 | 統計データ | 年次 | 地域×品種マスタ |
| 作業効率・技術レベル | 中 | ユーザー入力 | 年次 | 自己評価または作業時間 |
| **価格変動要因** |
| 過去市場価格 | 高 | 市場価格API | 日次 | 5年分の月別価格 |
| 地域別価格差 | 中 | 統計データ | 月次 | 近隣産地との比較 |
| 品質等級別価格 | 中 | ユーザー入力+市場データ | 月次 | 特秀、秀、優等 |
| 需給バランス指標 | 中 | 統計データ | 月次 | 全国作付・出荷予定 |
| **季節性・タイミング要因** |
| 収穫時期 | 高 | ユーザー入力+気象 | リアルタイム | 品種・地域・気象連動 |
| 出荷スケジュール | 高 | ユーザー入力 | 月次 | 貯蔵・加工対応含む |
| 競合産地出荷時期 | 中 | 産地情報API | 週次 | 価格影響分析用 |
| 季節需要パターン | 中 | 消費統計 | 月次 | イベント・季節要因 |
| **外部環境要因** |
| 気象データ | 高 | 気象庁API | 日次 | 温度、降水、日照 |
| 自然災害リスク | 中 | 気象庁API | リアルタイム | 台風、霜害等 |
| 市場トレンド | 低 | ニュースAPI | 週次 | 消費者嗜好変化 |
| 競合産地作況 | 中 | 統計データ | 月次 | 供給量変動要因 |

### 2.2 AIアドバイス機能に必要なデータ

#### 価格最適化のためのデータ
| データ項目 | 重要度 | データソース | 更新頻度 | 活用目的 |
|-----------|--------|-------------|----------|----------|
| リアルタイム市場価格 | 高 | 市場価格API | 日次 | 価格設定基準 |
| チャンネル別価格差 | 高 | ユーザー入力+市場データ | 週次 | チャンネル選択判断 |
| 需要予測データ | 中 | 消費統計+イベントカレンダー | 週次 | 価格弾力性分析 |
| 在庫・供給量データ | 中 | 統計データ+産地情報 | 週次 | 需給バランス判断 |
| 品質評価データ | 中 | ユーザー入力 | 収穫時 | プレミアム価格設定 |
| 販売コスト | 中 | ユーザー入力+統計 | 月次 | 利益最大化計算 |

#### 販売チャンネル推奨のためのデータ
| データ項目 | 重要度 | データソース | 更新頻度 | 活用目的 |
|-----------|--------|-------------|----------|----------|
| チャンネル別販売実績 | 高 | ユーザー入力 | 月次 | 実績ベース推奨 |
| チャンネル別手数料 | 高 | 市場データ+ユーザー入力 | 年次 | 利益率計算 |
| 配送・物流コスト | 中 | 物流API | 週次 | 総コスト最適化 |
| チャンネル別在庫回転 | 中 | ユーザー入力 | 月次 | リスク評価 |
| 顧客属性・需要 | 低 | 消費統計 | 月次 | ターゲティング |

#### 収穫時期最適化のためのデータ
| データ項目 | 重要度 | データソース | 更新頻度 | 活用目的 |
|-----------|--------|-------------|----------|----------|
| 生育ステージ予測 | 高 | 気象データ+生育モデル | 日次 | 収穫適期判定 |
| 品質成熟度予測 | 高 | 気象データ+品種特性 | 日次 | 品質最適化 |
| 収穫時期別価格予測 | 高 | 価格データ+需給予測 | 週次 | 収益最大化 |
| 労働力確保状況 | 中 | ユーザー入力 | 週次 | 実行可能性判断 |
| 競合出荷スケジュール | 中 | 産地情報 | 週次 | 市場競合回避 |
| 貯蔵・加工コスト | 低 | 統計データ | 月次 | 延期収穫判断 |

---

## 3. データ分類：ユーザー入力 vs 外部データ

### 3.1 ユーザー入力データ

#### レベル1: 必須項目（3分入力目標）
```json
{
  "basic_info": {
    "crop_type": "string",           // 品目（例：ぶどう）
    "variety": "string",             // 品種（例：シャインマスカット）
    "cultivation_area": "number",    // 栽培面積（単位：a）
    "location": {
      "prefecture": "string",        // 都道府県
      "city": "string"              // 市町村
    }
  },
  "sales_history": {
    "annual_revenue": "number",      // 年間売上（円）
    "average_price": "number",       // 平均単価（円/kg）
    "main_channel": "string"         // 主要販売チャンネル
  }
}
```

#### レベル2: 詳細項目（任意、精度向上）
```json
{
  "production_details": {
    "harvest_history": [
      {
        "year": "number",
        "total_yield": "number",     // 総収穫量（kg）
        "quality_distribution": {    // 品質等級別比率
          "premium": "number",       // 特秀品（%）
          "excellent": "number",     // 秀品（%）
          "good": "number"          // 優品（%）
        }
      }
    ],
    "work_efficiency": {
      "labor_hours_per_area": "number",  // 単位面積当たり作業時間
      "technology_level": "string",      // 技術レベル（初級/中級/上級）
      "equipment_status": "string"       // 設備状況
    }
  },
  "cost_structure": {
    "material_cost": "number",       // 資材費（年間）
    "utility_cost": "number",        // 光熱費（年間）
    "labor_cost": "number",          // 人件費（年間）
    "equipment_depreciation": "number" // 設備減価償却費
  },
  "sales_details": {
    "monthly_sales": [               // 月別販売実績
      {
        "month": "number",
        "volume": "number",          // 販売量（kg）
        "average_price": "number",   // 平均価格（円/kg）
        "channels": [
          {
            "type": "string",        // チャンネル種別
            "volume_ratio": "number", // 販売量比率（%）
            "price": "number"        // 価格（円/kg）
          }
        ]
      }
    ],
    "inventory_data": {
      "storage_capacity": "number",    // 貯蔵能力（kg）
      "waste_ratio": "number"         // 廃棄率（%）
    }
  }
}
```

#### レベル3: 高度分析項目（将来拡張）
```json
{
  "quality_data": {
    "sugar_content": "number",       // 糖度（Brix）
    "taste_score": "number",         // 食味スコア
    "size_distribution": "object",   // サイズ分布
    "appearance_score": "number"     // 外観評価
  },
  "cultivation_technique": {
    "fertilizer_program": "array",   // 施肥プログラム
    "pesticide_usage": "array",      // 農薬使用履歴
    "irrigation_method": "string",   // 灌水方法
    "certification": "array"         // 認証取得状況
  },
  "customer_data": {
    "repeat_customers": "number",    // リピート顧客数
    "customer_feedback": "array",    // 顧客フィードバック
    "brand_recognition": "string"    // ブランド認知度
  }
}
```

### 3.2 外部データ

#### 気象・環境データ
```json
{
  "weather_data": {
    "source": "気象庁API",
    "update_frequency": "daily",
    "data_elements": [
      "temperature_max",           // 最高気温
      "temperature_min",           // 最低気温
      "precipitation",             // 降水量
      "sunshine_hours",            // 日照時間
      "humidity",                  // 湿度
      "wind_speed"                // 風速
    ],
    "forecast_period": "14_days"   // 予報期間
  },
  "disaster_risk": {
    "source": "気象庁API",
    "update_frequency": "real_time",
    "risk_types": [
      "typhoon",                   // 台風
      "frost",                     // 霜害
      "drought",                   // 干ばつ
      "heavy_rain"                // 豪雨
    ]
  }
}
```

#### 市場・価格データ
```json
{
  "market_price": {
    "wholesale_markets": {
      "source": "農林水産省卸売市場データ",
      "update_frequency": "daily",
      "coverage": "全国主要市場",
      "data_elements": [
        "daily_price",             // 日別価格
        "volume_traded",           // 取引量
        "quality_grade_price",     // 等級別価格
        "origin_price_diff"        // 産地別価格差
      ]
    },
    "retail_price": {
      "source": "小売価格統計",
      "update_frequency": "weekly",
      "data_elements": [
        "supermarket_price",       // スーパー価格
        "direct_sale_price",       // 直売価格
        "online_price"            // オンライン価格
      ]
    }
  },
  "supply_demand": {
    "production_statistics": {
      "source": "作況調査",
      "update_frequency": "monthly",
      "data_elements": [
        "nationwide_production",    // 全国生産量
        "regional_production",      // 地域別生産量
        "yield_forecast",          // 収穫予測
        "planted_area"            // 作付面積
      ]
    }
  }
}
```

#### 消費・需要データ
```json
{
  "consumption_data": {
    "household_survey": {
      "source": "家計調査",
      "update_frequency": "monthly",
      "data_elements": [
        "consumption_volume",       // 消費量
        "purchase_frequency",       // 購入頻度
        "seasonal_pattern",         // 季節パターン
        "price_sensitivity"         // 価格感応度
      ]
    },
    "event_calendar": {
      "source": "イベントカレンダーAPI",
      "update_frequency": "monthly",
      "data_elements": [
        "national_holidays",        // 祝日
        "seasonal_events",          // 季節イベント
        "gift_seasons",            // 贈答時期
        "harvest_festivals"         // 収穫祭等
      ]
    }
  }
}
```

---

## 4. データ取得・処理フロー

### 4.1 データ収集フロー

#### ユーザー入力フロー
1. **初回登録時**
   - レベル1（必須項目）の入力
   - データ検証・正規化
   - 基本予測モデルの実行

2. **継続利用時**
   - レベル2（詳細項目）の段階的入力
   - 実績データの更新（月次/年次）
   - 予測精度の継続的改善

#### 外部データ取得フロー
1. **リアルタイム取得**
   - 気象データ（日次更新）
   - 市場価格データ（日次更新）
   - 災害リスク情報（随時更新）

2. **バッチ取得**
   - 統計データ（月次/年次）
   - 消費動向データ（月次）
   - 産地情報（週次）

### 4.2 データ統合・前処理フロー

#### データクレンジング
```python
# データ検証・正規化例
def validate_user_input(data):
    # 入力値の範囲チェック
    # 異常値の検出・修正
    # 単位の統一化
    # 欠損値の補完
    return validated_data

def integrate_external_data(user_data, external_data):
    # 地域・品目・時期でのデータマッチング
    # 時系列データの同期
    # データの重み付け・優先順位設定
    return integrated_data
```

#### 特徴量エンジニアリング
```python
def create_features(integrated_data):
    features = {
        # 基本特徴量
        'area_yield_ratio': calculate_yield_per_area(),
        'price_volatility': calculate_price_volatility(),
        'seasonal_index': calculate_seasonal_pattern(),
        
        # 派生特徴量
        'weather_growth_score': calculate_weather_impact(),
        'market_competition_index': calculate_competition(),
        'quality_premium_ratio': calculate_quality_premium(),
        
        # 時系列特徴量
        'price_trend': calculate_price_trend(),
        'demand_forecast': calculate_demand_forecast(),
        'supply_pressure': calculate_supply_pressure()
    }
    return features
```

### 4.3 予測・最適化エンジンフロー

#### 売上予測エンジン
```python
class SalesPredictionEngine:
    def __init__(self):
        self.models = {
            'production_model': ProductionForecastModel(),
            'price_model': PriceForecastModel(),
            'demand_model': DemandForecastModel()
        }
    
    def predict_sales(self, features):
        # 生産量予測
        production_forecast = self.models['production_model'].predict(features)
        
        # 価格予測
        price_forecast = self.models['price_model'].predict(features)
        
        # 需要予測
        demand_forecast = self.models['demand_model'].predict(features)
        
        # 売上予測の統合
        sales_prediction = self.integrate_predictions(
            production_forecast, price_forecast, demand_forecast
        )
        
        return sales_prediction
```

#### 最適化エンジン
```python
class OptimizationEngine:
    def optimize_price(self, features, constraints):
        # 価格弾力性を考慮した最適価格計算
        optimal_price = self.price_elasticity_optimization(features)
        return optimal_price
    
    def recommend_channels(self, features, channels):
        # チャンネル別収益性分析
        channel_scores = {}
        for channel in channels:
            score = self.calculate_channel_score(features, channel)
            channel_scores[channel] = score
        
        return sorted(channel_scores.items(), key=lambda x: x[1], reverse=True)
    
    def optimize_harvest_timing(self, features, constraints):
        # 品質・価格・労働力を考慮した最適収穫時期
        optimal_timing = self.multi_objective_optimization(features, constraints)
        return optimal_timing
```

---

## 5. 段階的実装計画

### Phase 1: MVP（基本予測）
- **ユーザー入力**: レベル1のみ
- **外部データ**: 静的参考データ
- **機能**: 基本売上予測、簡易アドバイス
- **予測精度目標**: ±30%

### Phase 2: 精度向上
- **ユーザー入力**: レベル1 + レベル2
- **外部データ**: リアルタイムAPI連携
- **機能**: 高精度予測、具体的アドバイス
- **予測精度目標**: ±20%

### Phase 3: 高度分析
- **ユーザー入力**: 全レベル対応
- **外部データ**: 全データソース統合
- **機能**: 戦略的アドバイス、リスク分析
- **予測精度目標**: ±15%

---

## 6. データ品質管理

### 6.1 入力データの品質保証
- **バリデーションルール**: 入力値の範囲チェック、整合性チェック
- **異常値検出**: 統計的手法による外れ値検出
- **ユーザー教育**: 正確な入力方法のガイダンス

### 6.2 外部データの品質管理
- **データソース信頼性**: 公的機関・業界団体のデータ優先
- **更新頻度監視**: データ更新の遅延検出・アラート
- **データ補完**: 欠損データの推定・補完ロジック

### 6.3 継続的改善
- **フィードバックループ**: 予測結果と実績の比較分析
- **モデル更新**: 定期的な機械学習モデルの再学習
- **精度監視**: 予測精度の継続的監視・改善

---

## 7. プライバシー・セキュリティ

### 7.1 個人情報保護
- **データ匿名化**: 個人特定情報の除去・暗号化
- **アクセス制御**: ロールベースのデータアクセス管理
- **同意管理**: データ利用目的の明確化・同意取得

### 7.2 データセキュリティ
- **暗号化**: 保存時・転送時の暗号化
- **バックアップ**: 定期的なデータバックアップ
- **監査ログ**: データアクセス・操作の記録

このデータ設計により、ユーザーの「売上予測」と「AIアドバイス」のニーズを段階的に実現し、継続的な価値提供が可能になります。
