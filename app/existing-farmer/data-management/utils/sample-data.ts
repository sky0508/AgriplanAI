import type { SalesRecord, CropInfo, SalesChannel } from '../types'

// 初期作物情報データ
export const initialCropInfo: CropInfo[] = [
  {
    id: 'grape',
    name: 'ぶどう',
    category: '果物',
    defaultUnit: 'kg',
    standardPrice: 350,
    description: '栽培期間が長く、品質による価格差が大きい果物',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'potato',
    name: 'じゃがいも',
    category: '野菜',
    defaultUnit: 'kg',
    standardPrice: 175,
    description: '保存が利き、安定した需要がある根菜類',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'tomato',
    name: 'トマト',
    category: '野菜',
    defaultUnit: 'kg',
    standardPrice: 400,
    description: '周年栽培可能な人気野菜',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'cucumber',
    name: 'きゅうり',
    category: '野菜',
    defaultUnit: 'kg',
    standardPrice: 300,
    description: '短期間で収穫でき、回転の早い作物',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }
]

// 初期販売チャンネル情報データ
export const initialSalesChannels: SalesChannel[] = [
  {
    id: 'wholesale_market',
    name: 'wholesale_market',
    displayName: 'よ市',
    commissionRate: 10,
    contactInfo: '卸売市場窓口: 000-0000-0000',
    notes: '大量販売に適している',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'direct_sales',
    name: 'direct_sales',
    displayName: '産直',
    commissionRate: 5,
    contactInfo: '産直施設: 000-0000-0001',
    notes: '高単価での販売が期待できる',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'ja',
    name: 'ja',
    displayName: '農協',
    commissionRate: 15,
    contactInfo: 'JA窓口: 000-0000-0002',
    notes: '安定した販売先',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'restaurant',
    name: 'restaurant',
    displayName: 'レストラン',
    commissionRate: 0,
    contactInfo: '直接取引',
    notes: '品質重視、継続的な取引',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }
]

// サンプル売上記録データ（編集可能な状態で提供）
export const generateSampleSalesRecords = (): SalesRecord[] => {
  const records: SalesRecord[] = []
  let id = 1

  // ぶどうデータ（11月〜12月）
  const grapeWholesale = [
    { date: '2024-11-01', quantity: 50, unitPrice: 300 },
    { date: '2024-11-05', quantity: 30, unitPrice: 300 },
    { date: '2024-11-10', quantity: 45, unitPrice: 300 },
    { date: '2024-11-15', quantity: 35, unitPrice: 300 },
    { date: '2024-11-20', quantity: 40, unitPrice: 300 },
    { date: '2024-12-01', quantity: 25, unitPrice: 320 },
    { date: '2024-12-10', quantity: 30, unitPrice: 320 }
  ]

  const grapeDirect = [
    { date: '2024-11-03', quantity: 20, unitPrice: 400 },
    { date: '2024-11-07', quantity: 25, unitPrice: 400 },
    { date: '2024-11-12', quantity: 15, unitPrice: 400 },
    { date: '2024-11-18', quantity: 30, unitPrice: 400 },
    { date: '2024-11-25', quantity: 22, unitPrice: 400 },
    { date: '2024-12-05', quantity: 18, unitPrice: 420 },
    { date: '2024-12-15', quantity: 20, unitPrice: 420 }
  ]

  // じゃがいもデータ（10月〜11月）
  const potatoWholesale = [
    { date: '2024-10-15', quantity: 100, unitPrice: 150 },
    { date: '2024-10-20', quantity: 120, unitPrice: 150 },
    { date: '2024-10-25', quantity: 80, unitPrice: 150 },
    { date: '2024-11-02', quantity: 90, unitPrice: 150 },
    { date: '2024-11-08', quantity: 110, unitPrice: 150 },
    { date: '2024-11-15', quantity: 85, unitPrice: 160 },
    { date: '2024-11-25', quantity: 95, unitPrice: 160 }
  ]

  const potatoDirect = [
    { date: '2024-10-18', quantity: 60, unitPrice: 200 },
    { date: '2024-10-22', quantity: 70, unitPrice: 200 },
    { date: '2024-10-28', quantity: 50, unitPrice: 200 },
    { date: '2024-11-04', quantity: 80, unitPrice: 200 },
    { date: '2024-11-12', quantity: 65, unitPrice: 200 },
    { date: '2024-11-20', quantity: 75, unitPrice: 210 },
    { date: '2024-11-28', quantity: 55, unitPrice: 210 }
  ]

  // トマトデータ（9月〜11月）
  const tomatoData = [
    { date: '2024-09-15', quantity: 40, unitPrice: 350, channel: 'direct_sales' },
    { date: '2024-09-25', quantity: 35, unitPrice: 330, channel: 'wholesale_market' },
    { date: '2024-10-05', quantity: 45, unitPrice: 370, channel: 'restaurant' },
    { date: '2024-10-15', quantity: 50, unitPrice: 340, channel: 'direct_sales' },
    { date: '2024-10-25', quantity: 40, unitPrice: 320, channel: 'wholesale_market' },
    { date: '2024-11-05', quantity: 35, unitPrice: 380, channel: 'direct_sales' }
  ]

  // ぶどうレコード生成
  grapeWholesale.forEach(item => {
    records.push({
      id: id++,
      date: item.date,
      crop: 'grape',
      quantity: item.quantity,
      unit: 'kg',
      unitPrice: item.unitPrice,
      total: item.quantity * item.unitPrice,
      channel: 'wholesale_market',
      notes: item.quantity > 40 ? '品質良好' : '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  })

  grapeDirect.forEach(item => {
    records.push({
      id: id++,
      date: item.date,
      crop: 'grape',
      quantity: item.quantity,
      unit: 'kg',
      unitPrice: item.unitPrice,
      total: item.quantity * item.unitPrice,
      channel: 'direct_sales',
      notes: item.unitPrice > 400 ? '高品質品' : '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  })

  // じゃがいもレコード生成
  potatoWholesale.forEach(item => {
    records.push({
      id: id++,
      date: item.date,
      crop: 'potato',
      quantity: item.quantity,
      unit: 'kg',
      unitPrice: item.unitPrice,
      total: item.quantity * item.unitPrice,
      channel: 'wholesale_market',
      notes: item.quantity > 100 ? '大口販売' : '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  })

  potatoDirect.forEach(item => {
    records.push({
      id: id++,
      date: item.date,
      crop: 'potato',
      quantity: item.quantity,
      unit: 'kg',
      unitPrice: item.unitPrice,
      total: item.quantity * item.unitPrice,
      channel: 'direct_sales',
      notes: item.unitPrice > 200 ? '特選品' : '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  })

  // トマトレコード生成
  tomatoData.forEach(item => {
    records.push({
      id: id++,
      date: item.date,
      crop: 'tomato',
      quantity: item.quantity,
      unit: 'kg',
      unitPrice: item.unitPrice,
      total: item.quantity * item.unitPrice,
      channel: item.channel,
      notes: item.channel === 'restaurant' ? 'レストラン納品' : '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  })

  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// 作物名の取得
export const getCropName = (cropId: string): string => {
  const crop = initialCropInfo.find(c => c.id === cropId)
  return crop?.name || cropId
}

// チャンネル表示名の取得
export const getChannelDisplayName = (channelId: string): string => {
  const channel = initialSalesChannels.find(c => c.id === channelId)
  return channel?.displayName || channelId
}

// データを初期化する関数
export const initializeData = () => {
  // ローカルストレージに初期データがない場合のみ設定
  if (!localStorage.getItem('sales_records')) {
    localStorage.setItem('sales_records', JSON.stringify(generateSampleSalesRecords()))
  }
  
  if (!localStorage.getItem('crop_info')) {
    localStorage.setItem('crop_info', JSON.stringify(initialCropInfo))
  }
  
  if (!localStorage.getItem('sales_channels')) {
    localStorage.setItem('sales_channels', JSON.stringify(initialSalesChannels))
  }
}

