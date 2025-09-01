// データフォーマット用ユーティリティ関数

/**
 * 数値を通貨形式でフォーマット
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * 日付をフォーマット
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

/**
 * 日付を短縮形式でフォーマット（MM/DD）
 */
export const formatShortDate = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ja-JP', {
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

/**
 * 数値を3桁区切りでフォーマット
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ja-JP').format(num)
}

/**
 * パーセンテージをフォーマット
 */
export const formatPercentage = (ratio: number): string => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(ratio / 100)
}

/**
 * 数量と単位をフォーマット
 */
export const formatQuantity = (quantity: number, unit: string): string => {
  return `${formatNumber(quantity)}${unit}`
}

/**
 * 日付をISO形式に変換（input[type="date"]用）
 */
export const formatDateForInput = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
}

/**
 * 今日の日付をISO形式で取得
 */
export const getTodayISO = (): string => {
  return new Date().toISOString().split('T')[0]
}

/**
 * 相対的な日付文字列を生成（例：3日前、1週間前）
 */
export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return '今日'
  } else if (diffDays === 1) {
    return '昨日'
  } else if (diffDays < 7) {
    return `${diffDays}日前`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks}週間前`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months}ヶ月前`
  } else {
    const years = Math.floor(diffDays / 365)
    return `${years}年前`
  }
}

/**
 * 文字列を指定の長さで切り詰める
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text
  }
  return text.substring(0, maxLength) + '...'
}

