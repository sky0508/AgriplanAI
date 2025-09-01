// 詳細分析機能 - サンプルデータ生成

import { WorkRecord, CostRecord, SalesRecord, Target, AIInsight } from '../types'
import { WORK_TYPES, COST_CATEGORIES, CROPS, DEV_CONFIG } from '../constants'

// ===== サンプルデータ生成メイン関数 =====

export function generateDetailedAnalysisSampleData() {
  const workRecords = generateSampleWorkData()
  const costRecords = generateSampleCostData()
  const salesRecords = generateSampleSalesData()
  const targets = generateSampleTargets()
  const insights = generateSampleInsights()

  return {
    workRecords,
    costRecords,
    salesRecords,
    targets,
    insights
  }
}

// ===== 作業記録サンプルデータ生成 =====

export function generateSampleWorkData(): WorkRecord[] {
  const records: WorkRecord[] = []
  let id = 1
  const dataSize = DEV_CONFIG.sampleDataSize

  // 1年分のデータを生成
  for (let month = 1; month <= 12; month++) {
    const daysInMonth = new Date(2024, month, 0).getDate()
    
    // 月ごとの作業パターンを定義
    const monthlyWorkPattern = getMonthlyWorkPattern(month)
    
    for (let day = 1; day <= daysInMonth; day += Math.floor(Math.random() * 3) + 1) {
      // その月の主要作業を実行
      monthlyWorkPattern.forEach(workPattern => {
        if (Math.random() < workPattern.frequency) {
          const duration = workPattern.baseDuration + Math.random() * workPattern.variability
          const laborCost = calculateLaborCost(duration, workPattern.workType)
          
          records.push({
            id: id++,
            date: `2024-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
            workType: workPattern.workType,
            duration: Math.round(duration),
            crop: workPattern.crop,
            laborCost,
            notes: generateWorkNotes(workPattern.workType, workPattern.crop),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })
        }
      })
      
      // データサイズ制限
      if (records.length >= dataSize) break
    }
    if (records.length >= dataSize) break
  }

  return records.slice(0, dataSize)
}

// 月別作業パターンの定義
function getMonthlyWorkPattern(month: number) {
  const patterns = []
  
  switch (month) {
    case 1: case 2: // 冬季 - 管理作業中心
      patterns.push(
        { workType: '管理作業', crop: 'grape', frequency: 0.3, baseDuration: 120, variability: 60 },
        { workType: '剪定', crop: 'grape', frequency: 0.4, baseDuration: 180, variability: 90 }
      )
      break
      
    case 3: case 4: // 春季 - 施肥・除草開始
      patterns.push(
        { workType: '施肥', crop: 'grape', frequency: 0.5, baseDuration: 150, variability: 60 },
        { workType: '除草', crop: 'grape', frequency: 0.4, baseDuration: 180, variability: 90 },
        { workType: '管理作業', crop: 'grape', frequency: 0.3, baseDuration: 90, variability: 45 }
      )
      break
      
    case 5: case 6: // 初夏 - 除草・防除強化
      patterns.push(
        { workType: '除草', crop: 'grape', frequency: 0.6, baseDuration: 200, variability: 100 },
        { workType: '防除', crop: 'grape', frequency: 0.4, baseDuration: 120, variability: 60 },
        { workType: '管理作業', crop: 'grape', frequency: 0.3, baseDuration: 90, variability: 45 }
      )
      break
      
    case 7: case 8: // 夏季 - 除草ピーク・収穫準備
      patterns.push(
        { workType: '除草', crop: 'grape', frequency: 0.7, baseDuration: 240, variability: 120 },
        { workType: '防除', crop: 'grape', frequency: 0.3, baseDuration: 120, variability: 60 },
        { workType: '管理作業', crop: 'grape', frequency: 0.4, baseDuration: 120, variability: 60 }
      )
      break
      
    case 9: case 10: // 秋季 - 収穫ピーク
      patterns.push(
        { workType: '収穫', crop: 'grape', frequency: 0.8, baseDuration: 300, variability: 150 },
        { workType: '出荷準備', crop: 'grape', frequency: 0.6, baseDuration: 180, variability: 90 },
        { workType: '除草', crop: 'grape', frequency: 0.3, baseDuration: 150, variability: 75 }
      )
      break
      
    case 11: case 12: // 冬季 - 収穫終了・管理作業
      patterns.push(
        { workType: '収穫', crop: 'grape', frequency: 0.4, baseDuration: 240, variability: 120 },
        { workType: '出荷準備', crop: 'grape', frequency: 0.3, baseDuration: 150, variability: 75 },
        { workType: '管理作業', crop: 'grape', frequency: 0.5, baseDuration: 120, variability: 60 }
      )
      break
  }
  
  return patterns
}

// 人件費計算（作業時間と作業種別に基づく）
function calculateLaborCost(duration: number, workType: string): number {
  const hourlyRates = {
    '収穫': 1500,      // 収穫は高単価
    '出荷準備': 1200,  // 出荷準備も高単価
    '除草': 1000,      // 標準単価
    '施肥': 1100,      // やや高単価
    '防除': 1100,      // やや高単価
    '剪定': 1200,      // 高単価
    '管理作業': 900,   // 低単価
    'その他': 1000     // 標準単価
  }
  
  const hours = duration / 60
  const rate = hourlyRates[workType as keyof typeof hourlyRates] || 1000
  return Math.round(hours * rate)
}

// 作業メモの生成
function generateWorkNotes(workType: string, crop: string): string {
  const noteTemplates = {
    '除草': ['畑の除草作業', '雑草除去', '草刈り作業', '手作業での除草'],
    '収穫': ['果実の収穫', '収穫作業', '選別しながら収穫', '朝の収穫作業'],
    '施肥': ['肥料散布', '追肥作業', '有機肥料投入', '土壌改良'],
    '出荷準備': ['選別・梱包', '出荷用準備', '箱詰め作業', '品質チェック'],
    '防除': ['病害虫防除', '薬剤散布', '予防散布', '防虫対策'],
    '剪定': ['枝の剪定', '整枝作業', '不要枝除去', '樹形調整'],
    '管理作業': ['圃場管理', '設備点検', '資材整理', '記録作業']
  }
  
  const templates = noteTemplates[workType as keyof typeof noteTemplates] || ['作業実施']
  const randomTemplate = templates[Math.floor(Math.random() * templates.length)]
  
  return `${randomTemplate}（${crop}）`
}

// ===== コスト記録サンプルデータ生成 =====

export function generateSampleCostData(): CostRecord[] {
  const records: CostRecord[] = []
  let id = 1

  // 1年分のコストデータを生成
  for (let month = 1; month <= 12; month++) {
    const monthlyCosts = getMonthlyCostPattern(month)
    
    monthlyCosts.forEach(costPattern => {
      const amount = costPattern.baseAmount + (Math.random() - 0.5) * costPattern.variability
      
      records.push({
        id: id++,
        date: `2024-${month.toString().padStart(2, '0')}-${Math.floor(Math.random() * 28) + 1}`,
        category: costPattern.category,
        subcategory: costPattern.subcategory,
        amount: Math.round(Math.max(0, amount)),
        description: costPattern.description,
        crop: costPattern.crop,
        supplier: costPattern.supplier,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    })
  }

  return records
}

// 月別コストパターンの定義
function getMonthlyCostPattern(month: number) {
  const baseCosts = [
    // 定期的なコスト
    { category: '肥料', subcategory: '化成肥料', baseAmount: 15000, variability: 5000, description: '化成肥料購入', crop: 'grape', supplier: 'JA' },
    { category: '農薬', subcategory: '殺菌剤', baseAmount: 8000, variability: 3000, description: '殺菌剤購入', crop: 'grape', supplier: '農協' },
    { category: '光熱費', subcategory: '電気代', baseAmount: 12000, variability: 4000, description: '電気料金', crop: undefined, supplier: '電力会社' },
    { category: '燃料費', subcategory: 'ガソリン', baseAmount: 8000, variability: 2000, description: '機械燃料', crop: undefined, supplier: 'ガソリンスタンド' }
  ]

  // 季節別の追加コスト
  const seasonalCosts = []
  
  if (month >= 3 && month <= 5) { // 春季
    seasonalCosts.push(
      { category: '肥料', subcategory: '有機肥料', baseAmount: 20000, variability: 8000, description: '春の追肥', crop: 'grape', supplier: '肥料店' },
      { category: '資材費', subcategory: '支柱', baseAmount: 15000, variability: 5000, description: '支柱材料', crop: 'grape', supplier: '農業資材店' }
    )
  }
  
  if (month >= 6 && month <= 8) { // 夏季
    seasonalCosts.push(
      { category: '農薬', subcategory: '除草剤', baseAmount: 12000, variability: 4000, description: '除草剤購入', crop: 'grape', supplier: '農協' },
      { category: '光熱費', subcategory: '水道代', baseAmount: 15000, variability: 5000, description: '灌水用水道代', crop: undefined, supplier: '水道局' }
    )
  }
  
  if (month >= 9 && month <= 11) { // 収穫期
    seasonalCosts.push(
      { category: '人件費', subcategory: 'アルバイト', baseAmount: 60000, variability: 20000, description: '収穫期アルバイト', crop: 'grape', supplier: undefined },
      { category: '資材費', subcategory: '包装材', baseAmount: 25000, variability: 10000, description: '出荷用包装材', crop: 'grape', supplier: '包装資材店' }
    )
  }

  return [...baseCosts, ...seasonalCosts]
}

// ===== 売上記録サンプルデータ生成 =====

export function generateSampleSalesData(): SalesRecord[] {
  const records: SalesRecord[] = []
  let id = 1

  // 収穫期（8-12月）の売上データを生成
  for (let month = 8; month <= 12; month++) {
    const salesCount = month === 9 || month === 10 ? 8 : 4 // ピーク月は多めに

    for (let i = 0; i < salesCount; i++) {
      const day = Math.floor(Math.random() * 28) + 1
      const isDirectSales = Math.random() < 0.4 // 40%が直売
      
      const quantity = 20 + Math.random() * 80 // 20-100kg
      const unitPrice = isDirectSales ? 400 + Math.random() * 100 : 300 + Math.random() * 50
      
      records.push({
        id: id++,
        date: `2024-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
        crop: 'grape',
        quantity: Math.round(quantity),
        unitPrice: Math.round(unitPrice),
        total: Math.round(quantity * unitPrice),
        channel: isDirectSales ? 'direct_sales' : 'wholesale_market',
        notes: isDirectSales ? '産直販売' : 'よ市出荷',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }
  }

  return records
}

// ===== 目標設定サンプルデータ生成 =====

export function generateSampleTargets(): Target[] {
  return [
    {
      id: 'efficiency-target-1',
      type: 'efficiency',
      title: '除草作業の効率化',
      description: '除草作業の時間を20%短縮する',
      targetValue: 20,
      currentValue: 8,
      unit: '%',
      deadline: '2025-06-30',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'cost-target-1',
      type: 'cost',
      title: '月間コスト削減',
      description: '月間運営コストを3万円削減する',
      targetValue: 30000,
      currentValue: 12000,
      unit: '円',
      deadline: '2025-03-31',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'revenue-target-1',
      type: 'revenue',
      title: '売上向上',
      description: '月間売上を15万円向上させる',
      targetValue: 150000,
      currentValue: 80000,
      unit: '円',
      deadline: '2025-12-31',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
}

// ===== AI改善インサイトサンプルデータ生成 =====

export function generateSampleInsights(): AIInsight[] {
  return [
    {
      id: 'insight-efficiency-1',
      type: 'efficiency',
      title: '除草作業の効率が低下しています',
      description: '7月から8月にかけて除草作業の時間が前年同期比+25%増加しています。高温期の作業効率低下が原因と考えられます。早朝作業への変更や機械化を検討してください。',
      impact: 'high',
      confidence: 85,
      suggestedActions: [
        '早朝（6-9時）の作業時間に変更',
        '草刈り機の導入を検討',
        '除草剤の併用で作業負荷軽減',
        '作業員の増員（ピーク時のみ）'
      ],
      dataSource: '7-8月の作業記録24件',
      generatedAt: new Date().toISOString(),
      isRead: false
    },
    {
      id: 'insight-cost-1',
      type: 'cost',
      title: '8月は利益率が最も低くなっています',
      description: '8月の利益率は18%と年間最低でした。主な要因は肥料代と人件費の増加です。購入タイミングの最適化やまとめ買いでコスト削減の余地があります。',
      impact: 'medium',
      confidence: 78,
      suggestedActions: [
        '肥料のまとめ買い（春季一括購入）',
        '複数業者からの見積もり比較',
        'JA以外の仕入先も検討',
        '有機肥料への一部切り替え'
      ],
      dataSource: '8月のコスト記録12件',
      generatedAt: new Date().toISOString(),
      isRead: false
    },
    {
      id: 'insight-timing-1',
      type: 'timing',
      title: '出荷時期の最適化で収益向上が期待できます',
      description: '10月第3週の出荷を第4週にずらすことで、単価が平均12%向上する可能性があります。市場の需要パターンと在庫状況を分析した結果です。',
      impact: 'high',
      confidence: 72,
      suggestedActions: [
        '10月第4週への出荷シフト',
        '貯蔵設備の活用検討',
        '品質保持技術の向上',
        '市場価格の定期的な確認'
      ],
      dataSource: '過去3年の市場価格データ',
      generatedAt: new Date().toISOString(),
      isRead: true
    },
    {
      id: 'insight-revenue-1',
      type: 'revenue',
      title: '直売比率を高めることで収益向上が期待できます',
      description: '現在の直売比率は35%ですが、45%まで高めることで月間売上が約8万円向上する試算です。直売ルートの拡充を検討してください。',
      impact: 'medium',
      confidence: 68,
      suggestedActions: [
        '直売所への出荷量増加',
        'オンライン販売の検討',
        '地域イベントへの参加',
        'リピーター獲得の仕組み作り'
      ],
      dataSource: '直売・卸売の売上比較データ',
      generatedAt: new Date().toISOString(),
      isRead: false
    }
  ]
}

// ===== データ初期化・検証関数 =====

export function initializeSampleData() {
  try {
    const data = generateDetailedAnalysisSampleData()
    
    // データ検証
    const validation = validateSampleData(data)
    if (!validation.isValid) {
      console.warn('サンプルデータの検証に失敗:', validation.errors)
    }
    
    console.log('サンプルデータを生成しました:', {
      workRecords: data.workRecords.length,
      costRecords: data.costRecords.length,
      salesRecords: data.salesRecords.length,
      targets: data.targets.length,
      insights: data.insights.length
    })
    
    return data
  } catch (error) {
    console.error('サンプルデータの生成に失敗:', error)
    throw error
  }
}

// サンプルデータの検証
function validateSampleData(data: ReturnType<typeof generateDetailedAnalysisSampleData>) {
  const errors: string[] = []
  
  // 基本的なデータ存在チェック
  if (data.workRecords.length === 0) errors.push('作業記録データが空です')
  if (data.costRecords.length === 0) errors.push('コスト記録データが空です')
  if (data.salesRecords.length === 0) errors.push('売上記録データが空です')
  
  // 日付形式のチェック
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  data.workRecords.forEach((record, index) => {
    if (!dateRegex.test(record.date)) {
      errors.push(`作業記録${index + 1}の日付形式が正しくありません: ${record.date}`)
    }
  })
  
  // 金額の妥当性チェック
  data.costRecords.forEach((record, index) => {
    if (record.amount < 0) {
      errors.push(`コスト記録${index + 1}の金額が負の値です: ${record.amount}`)
    }
  })
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
