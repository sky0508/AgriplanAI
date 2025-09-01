"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Database, Download, Upload } from 'lucide-react'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDataManagementStore } from '@/lib/stores/data-management-store'
import { initializeData } from './utils/sample-data'
import { SalesRecordTable } from './components/SalesRecordTable'
// import { CropInfoTable } from './components/CropInfoTable'
// import { SalesChannelTable } from './components/SalesChannelTable'

export default function DataManagementPage() {
  const [activeTab, setActiveTab] = useState<'sales' | 'crops' | 'channels'>('sales')
  const [isLoading, setIsLoading] = useState(true)
  
  const {
    salesRecords,
    cropInfo,
    salesChannels,
    setSalesRecords,
    setCropInfo,
    setSalesChannels
  } = useDataManagementStore()

  useEffect(() => {
    const loadData = async () => {
      try {
        // 初期データを確認・作成
        initializeData()
        
        // ローカルストレージからデータを読み込み
        const savedSalesRecords = localStorage.getItem('sales_records')
        const savedCropInfo = localStorage.getItem('crop_info')
        const savedSalesChannels = localStorage.getItem('sales_channels')
        
        if (savedSalesRecords) {
          setSalesRecords(JSON.parse(savedSalesRecords))
        }
        
        if (savedCropInfo) {
          setCropInfo(JSON.parse(savedCropInfo))
        }
        
        if (savedSalesChannels) {
          setSalesChannels(JSON.parse(savedSalesChannels))
        }
      } catch (error) {
        console.error('データの読み込みに失敗しました:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [setSalesRecords, setCropInfo, setSalesChannels])

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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
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
            <div>
              <h1 className="text-3xl font-bold text-charcoal flex items-center gap-3">
                <Database className="w-8 h-8 text-sprout-green" />
                データ管理
              </h1>
              <p className="text-lg text-soil-brown">
                売上分析で使用するデータの閲覧・編集
              </p>
            </div>
          </div>
          
          {/* インポート・エクスポートボタン（将来実装） */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              size="sm"
              className="text-soil-brown border-soil-brown hover:bg-soil-brown/10"
              disabled
            >
              <Upload className="w-4 h-4 mr-2" />
              インポート
            </Button>
            <Button 
              variant="outline"
              size="sm"
              className="text-sky-blue border-sky-blue hover:bg-sky-blue/10"
              disabled
            >
              <Download className="w-4 h-4 mr-2" />
              エクスポート
            </Button>
          </div>
        </div>

        {/* データサマリー */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-0">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-5 h-5 text-sprout-green" />
            <h2 className="text-lg font-bold text-charcoal">データサマリー</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-soil-brown">売上記録</p>
              <p className="text-2xl font-bold text-charcoal">{salesRecords.length}件</p>
            </div>
            <div>
              <p className="text-soil-brown">登録作物</p>
              <p className="text-2xl font-bold text-charcoal">{cropInfo.filter(c => c.isActive).length}品目</p>
            </div>
            <div>
              <p className="text-soil-brown">販売チャンネル</p>
              <p className="text-2xl font-bold text-charcoal">{salesChannels.filter(c => c.isActive).length}箇所</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-white/90 backdrop-blur-sm">
            <TabsTrigger value="sales" className="flex items-center gap-2 data-[state=active]:bg-sprout-green data-[state=active]:text-white">
              📊 売上記録
            </TabsTrigger>
            <TabsTrigger value="crops" className="flex items-center gap-2 data-[state=active]:bg-sprout-green data-[state=active]:text-white">
              🌱 作物情報
            </TabsTrigger>
            <TabsTrigger value="channels" className="flex items-center gap-2 data-[state=active]:bg-sprout-green data-[state=active]:text-white">
              🏪 販売チャンネル
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="space-y-4">
            <SalesRecordTable />
          </TabsContent>

          <TabsContent value="crops" className="space-y-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border-0 text-center">
              <div className="w-16 h-16 bg-fog-grey rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="text-lg font-semibold text-charcoal mb-2">作物情報管理</h3>
              <p className="text-soil-brown mb-4">作物情報の管理機能は現在開発中です</p>
              <p className="text-sm text-soil-brown">近日公開予定</p>
            </div>
          </TabsContent>

          <TabsContent value="channels" className="space-y-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border-0 text-center">
              <div className="w-16 h-16 bg-fog-grey rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏪</span>
              </div>
              <h3 className="text-lg font-semibold text-charcoal mb-2">販売チャンネル管理</h3>
              <p className="text-soil-brown mb-4">販売チャンネル管理機能は現在開発中です</p>
              <p className="text-sm text-soil-brown">近日公開予定</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

