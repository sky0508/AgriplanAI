"use client"

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, TrendingUp, Edit } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { SalesRecord, AnalysisFilters } from './types'
import { SalesAnalysisFilters } from './components/SalesAnalysisFilters'
import { CropSalesChart } from './components/CropSalesChart'
import { ChannelAnalysisChart } from './components/ChannelAnalysisChart'
import { CropCompositionChart } from './components/CropCompositionChart'
import { SalesCostComparisonChart } from './components/SalesCostComparisonChart'
import { 
  generateSampleSalesData, 
  filterSalesData, 
  getAvailableCrops, 
  getAvailableChannels 
} from './utils'
import { initializeData } from '../data-management/utils/sample-data'
import { MINIMUM_RECORDS_FOR_ANALYSIS } from './constants'

export default function SalesAnalysisPage() {
  const [salesData, setSalesData] = useState<SalesRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const [filters, setFilters] = useState<AnalysisFilters>({
    startDate: '2024-10-01',
    endDate: '2024-12-31',
    crops: [],
    channels: [],
    period: 'monthly'
  })

  // データ初期化
  useEffect(() => {
    const loadSalesData = () => {
      try {
        // 初期データを確認・作成
        initializeData()
        
        // ローカルストレージから売上記録を取得
        const savedRecords = localStorage.getItem('sales_records')
        if (savedRecords) {
          const records = JSON.parse(savedRecords)
          setSalesData(records)
        } else {
          // 初回はサンプルデータを生成
          setSalesData(generateSampleSalesData())
        }
      } catch (error) {
        console.error('データの初期化に失敗しました:', error)
        setSalesData(generateSampleSalesData())
      } finally {
        setIsLoading(false)
      }
    }

    loadSalesData()

    // データ管理画面からの更新イベントリスナー
    const handleSalesDataUpdate = (event: CustomEvent) => {
      try {
        const { records } = event.detail
        if (records && Array.isArray(records)) {
          setSalesData(records)
          console.log('売上分析データが更新されました:', records.length, '件')
        }
      } catch (error) {
        console.error('データ更新の処理に失敗しました:', error)
      }
    }

    // イベントリスナーを追加
    window.addEventListener('salesDataUpdated', handleSalesDataUpdate as EventListener)

    return () => {
      // クリーンアップ
      window.removeEventListener('salesDataUpdated', handleSalesDataUpdate as EventListener)
    }
  }, [])

  // フィルタリングされたデータ
  const filteredData = useMemo(() => {
    return filterSalesData(salesData, filters)
  }, [salesData, filters])

  // 利用可能な作物・チャンネルリスト
  const availableCrops = useMemo(() => getAvailableCrops(salesData), [salesData])
  const availableChannels = useMemo(() => getAvailableChannels(salesData), [salesData])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-fog-grey flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-sky-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-soil-brown">データを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-fog-grey p-6">
      {/* ヘッダー */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/existing-farmer">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-soil-brown hover:text-charcoal hover:bg-white/50 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              ダッシュボードに戻る
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-charcoal">売上分析</h1>
            <p className="text-lg text-soil-brown">売上データの詳細分析と可視化</p>
          </div>
          <Button 
            onClick={() => router.push('/existing-farmer/data-management')}
            className="bg-sky-blue text-white hover:bg-sky-blue/90 rounded-xl"
          >
            <Edit className="w-4 h-4 mr-2" />
            データを編集
          </Button>
        </div>

        {/* データサマリー */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-0">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-sprout-green" />
            <h2 className="text-lg font-bold text-charcoal">データサマリー</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-soil-brown">総売上記録</p>
              <p className="text-xl font-bold text-charcoal">{salesData.length}件</p>
            </div>
            <div>
              <p className="text-soil-brown">分析対象</p>
              <p className="text-xl font-bold text-charcoal">{filteredData.length}件</p>
            </div>
            <div>
              <p className="text-soil-brown">作物数</p>
              <p className="text-xl font-bold text-charcoal">{availableCrops.length}品目</p>
            </div>
            <div>
              <p className="text-soil-brown">販売チャンネル</p>
              <p className="text-xl font-bold text-charcoal">{availableChannels.length}箇所</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* フィルター */}
        <SalesAnalysisFilters 
          filters={filters}
          onFiltersChange={setFilters}
          availableCrops={availableCrops}
          availableChannels={availableChannels}
        />

        {/* データ不足の警告 */}
        {filteredData.length < MINIMUM_RECORDS_FOR_ANALYSIS && (
          <div className="bg-harvest-yellow/10 border border-harvest-yellow/20 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-harvest-yellow rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">!</span>
              </div>
              <div>
                <h3 className="font-semibold text-charcoal mb-2">分析データが不足しています</h3>
                <p className="text-soil-brown mb-3">
                  より正確な分析のために、最低{MINIMUM_RECORDS_FOR_ANALYSIS}件以上の売上記録が必要です。
                  現在{filteredData.length}件のデータがあります。
                </p>
                <Link href="/existing-farmer">
                  <Button className="bg-harvest-yellow text-white hover:bg-harvest-yellow/90">
                    日々の記録を追加
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* グラフエリア */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 品目別売上推移 */}
          <CropSalesChart 
            data={filteredData} 
            period={filters.period}
          />

          {/* 販売チャンネル別分析 */}
          <ChannelAnalysisChart data={filteredData} />

          {/* 作物別売上構成比 */}
          <CropCompositionChart data={filteredData} />

          {/* 売上・コスト比較分析 */}
          <SalesCostComparisonChart data={filteredData} />
        </div>

        {/* 分析レポート（データがある場合のみ） */}
        {filteredData.length >= MINIMUM_RECORDS_FOR_ANALYSIS && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-0">
            <h3 className="text-lg font-bold text-charcoal mb-4">分析レポート</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-charcoal mb-2">💡 分析のポイント</h4>
                <ul className="space-y-1 text-sm text-soil-brown">
                  <li>• 産直販売の方が高単価で売れている傾向</li>
                  <li>• 作物別の販売時期を分析して最適化</li>
                  <li>• チャンネル別の収益性を比較検討</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-charcoal mb-2">📈 改善提案</h4>
                <ul className="space-y-1 text-sm text-soil-brown">
                  <li>• 高単価チャンネルの販売比率向上</li>
                  <li>• 季節性を活かした販売戦略</li>
                  <li>• 作物構成の最適化検討</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
