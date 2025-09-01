import { z } from 'zod'
import type { SalesRecordFormData, CropInfoFormData, SalesChannelFormData } from '../types'

// 売上記録のバリデーションスキーマ
export const salesRecordSchema = z.object({
  date: z.string()
    .min(1, '日付は必須です')
    .refine(date => {
      const d = new Date(date)
      return !isNaN(d.getTime())
    }, '正しい日付形式で入力してください'),
  
  crop: z.string()
    .min(1, '作物を選択してください'),
  
  quantity: z.string()
    .min(1, '数量は必須です')
    .refine(val => {
      const num = Number(val)
      return !isNaN(num) && num > 0 && num <= 100000
    }, '数量は1以上100,000以下の数値で入力してください'),
  
  unit: z.string()
    .min(1, '単位は必須です'),
  
  unitPrice: z.string()
    .min(1, '単価は必須です')
    .refine(val => {
      const num = Number(val)
      return !isNaN(num) && num > 0 && num <= 1000000
    }, '単価は1円以上1,000,000円以下で入力してください'),
  
  channel: z.string()
    .min(1, '販売チャンネルを選択してください'),
  
  notes: z.string().optional()
})

// 作物情報のバリデーションスキーマ
export const cropInfoSchema = z.object({
  name: z.string()
    .min(1, '作物名は必須です')
    .max(50, '作物名は50文字以内で入力してください'),
  
  category: z.string()
    .min(1, 'カテゴリは必須です'),
  
  defaultUnit: z.string()
    .min(1, '標準単位は必須です'),
  
  standardPrice: z.string()
    .refine(val => {
      if (!val) return true // 任意項目
      const num = Number(val)
      return !isNaN(num) && num >= 0 && num <= 1000000
    }, '標準単価は0円以上1,000,000円以下で入力してください'),
  
  description: z.string()
    .max(200, '説明は200文字以内で入力してください')
    .optional()
})

// 販売チャンネルのバリデーションスキーマ
export const salesChannelSchema = z.object({
  name: z.string()
    .min(1, 'チャンネル名は必須です')
    .max(50, 'チャンネル名は50文字以内で入力してください')
    .regex(/^[a-zA-Z0-9_]+$/, 'チャンネル名は英数字とアンダースコアのみ使用可能です'),
  
  displayName: z.string()
    .min(1, '表示名は必須です')
    .max(50, '表示名は50文字以内で入力してください'),
  
  commissionRate: z.string()
    .refine(val => {
      if (!val) return true // 任意項目
      const num = Number(val)
      return !isNaN(num) && num >= 0 && num <= 100
    }, '手数料率は0%以上100%以下で入力してください'),
  
  contactInfo: z.string()
    .max(100, '連絡先は100文字以内で入力してください')
    .optional(),
  
  notes: z.string()
    .max(200, 'メモは200文字以内で入力してください')
    .optional()
})

// バリデーション実行関数
export const validateSalesRecord = async (data: SalesRecordFormData) => {
  return salesRecordSchema.parseAsync(data)
}

export const validateCropInfo = async (data: CropInfoFormData) => {
  return cropInfoSchema.parseAsync(data)
}

export const validateSalesChannel = async (data: SalesChannelFormData) => {
  return salesChannelSchema.parseAsync(data)
}

// カスタムバリデーション関数
export const validateRecordConsistency = (record: {
  quantity: number
  unitPrice: number
  total: number
  date: string
}): string[] => {
  const errors: string[] = []
  
  // 合計金額の整合性チェック
  const calculatedTotal = record.quantity * record.unitPrice
  if (Math.abs(record.total - calculatedTotal) > 0.01) {
    errors.push('合計金額が数量×単価と一致しません')
  }
  
  // 負の値チェック
  if (record.quantity < 0) {
    errors.push('数量は正の値で入力してください')
  }
  
  if (record.unitPrice < 0) {
    errors.push('単価は正の値で入力してください')
  }
  
  return errors
}

// 日々の記録モーダルのデータをSalesRecordに変換
export const convertDailyRecordToSalesRecord = (dailyRecord: any): any => {
  return {
    id: Date.now(), // 本来はサーバーサイドで生成
    date: dailyRecord.date,
    crop: dailyRecord.crop,
    quantity: Number(dailyRecord.quantity),
    unit: 'kg', // 一旦デフォルトとしてkg
    unitPrice: Number(dailyRecord.unitPrice),
    total: Number(dailyRecord.total) || (Number(dailyRecord.quantity) * Number(dailyRecord.unitPrice)),
    channel: dailyRecord.buyer, // buyer を channel に変換
    notes: dailyRecord.notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

