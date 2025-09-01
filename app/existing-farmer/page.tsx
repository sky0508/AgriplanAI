"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, TrendingUp, FileText, Calculator, BarChart3 } from "lucide-react"
import Link from "next/link"
import { DailyRecordModal } from "@/components/daily-record-modal"
import { SalesRecordsTable } from "./components/SalesRecordsTable"

interface QuickActionCardProps {
  icon: React.ReactNode
  title: string
  subtitle: string
  onClick: () => void
}

const QuickActionCard = ({ icon, title, subtitle, onClick }: QuickActionCardProps) => (
  <Card className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border-0 hover:shadow-xl transition-all hover:-translate-y-2 cursor-pointer p-2">
    <CardContent className="p-6" onClick={onClick}>
      <div className="w-16 h-16 bg-gradient-to-br from-white to-gray-50 rounded-2xl flex items-center justify-center mb-4 shadow-md">
        {icon}
      </div>
      <h3 className="font-semibold text-charcoal mb-2 text-lg">{title}</h3>
      <p className="text-sm text-soil-brown">{subtitle}</p>
    </CardContent>
  </Card>
)

interface MetricCardProps {
  title: string
  value: string
  change: string
  changeType: "positive" | "negative" | "neutral"
}

const MetricCard = ({ title, value, change, changeType }: MetricCardProps) => (
  <Card className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border-0">
    <CardContent className="p-6">
      <h3 className="text-sm font-medium text-soil-brown mb-3">{title}</h3>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-3xl font-bold tabular-nums text-charcoal">{value}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-xs text-soil-brown">前月比</span>
        <span
          className={`text-xs font-medium ${
            changeType === "positive"
              ? "text-sprout-green"
              : changeType === "negative"
                ? "text-red-500"
                : "text-soil-brown"
          }`}
        >
          {change}
        </span>
      </div>
    </CardContent>
  </Card>
)

const RevenueChart = () => (
  <div className="h-64 flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl">
    <div className="text-center">
      <BarChart3 className="w-12 h-12 text-soil-brown mx-auto mb-2" />
      <p className="text-sm text-soil-brown">収支推移グラフ</p>
      <p className="text-xs text-soil-brown/70">データ蓄積後に表示されます</p>
    </div>
  </div>
)

export default function ExistingFarmerPage() {
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false)
  const [records, setRecords] = useState<any[]>([])

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "revenue-forecast":
        window.location.href = "/existing-farmer/forecast"
        break
      case "daily-record":
        setIsRecordModalOpen(true)
        break
      case "sales-analysis":
        window.location.href = "/existing-farmer/sales-analysis"
        break
      case "detailed-analysis":
        window.location.href = "/existing-farmer/detailed-analysis"
        break
      default:
        console.log(`Selected action: ${action}`)
    }
  }

  const handleSaveRecord = (record: any) => {
    setRecords([...records, { ...record, id: Date.now() }])
    console.log("Saved record:", record)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-soil-brown hover:text-charcoal hover:bg-white/50 rounded-xl"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                ホーム
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-charcoal">農家ダッシュボード</h1>
              <p className="text-lg text-soil-brown">おかえりなさい、田中さん</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="text-charcoal hover:bg-white/80 bg-white/50 border-0 rounded-xl shadow-md"
          >
            設定
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Quick Actions */}
        <section>
          <h2 className="text-xl font-bold text-charcoal mb-6">クイックアクション</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <QuickActionCard
              icon={<Calculator className="w-8 h-8 text-sky-blue" />}
              title="収支予測"
              subtitle="3分で年間収支を予測"
              onClick={() => handleQuickAction("revenue-forecast")}
            />
            <QuickActionCard
              icon={<Plus className="w-8 h-8 text-sprout-green" />}
              title="日々の記録"
              subtitle="作業・売上・コストを記録"
              onClick={() => handleQuickAction("daily-record")}
            />
            <QuickActionCard
              icon={<TrendingUp className="w-8 h-8 text-harvest-yellow" />}
              title="売上分析"
              subtitle="最適化提案を確認"
              onClick={() => handleQuickAction("sales-analysis")}
            />
            <QuickActionCard
              icon={<FileText className="w-8 h-8 text-soil-brown" />}
              title="詳細分析"
              subtitle="詳細なレポートを確認"
              onClick={() => handleQuickAction("detailed-analysis")}
            />
          </div>
        </section>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2">
            <Card className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-charcoal">収支推移</CardTitle>
                <CardDescription className="text-soil-brown">今年度の月別収支状況</CardDescription>
              </CardHeader>
              <CardContent>
                <RevenueChart />
              </CardContent>
            </Card>
          </div>

          {/* Metric Cards */}
          <div className="space-y-6">
            <MetricCard title="今月の売上" value="¥300,000" change="+20%" changeType="positive" />
            <MetricCard title="今月のコスト" value="¥180,000" change="+5%" changeType="neutral" />
            <MetricCard title="純利益" value="¥120,000" change="+35%" changeType="positive" />
          </div>
        </div>

        {/* Sales Records Table */}
        <SalesRecordsTable className="mb-8" />

        {/* Recent Records */}
        {records.length > 0 && (
          <Card className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-charcoal">最近の記録</CardTitle>
              <CardDescription className="text-soil-brown">直近の作業・売上・コスト記録</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {records
                  .slice(-5)
                  .reverse()
                  .map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            record.type === "work"
                              ? "bg-sky-blue"
                              : record.type === "sales"
                                ? "bg-sprout-green"
                                : "bg-soil-brown"
                          }`}
                        ></div>
                        <div>
                          <p className="text-sm font-medium text-charcoal">
                            {record.type === "work"
                              ? `${record.crop} - ${record.activity}`
                              : record.type === "sales"
                                ? `${record.crop} 売上`
                                : `${record.category} - ${record.item}`}
                          </p>
                          <p className="text-xs text-soil-brown">{record.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {record.type === "work" && <span className="text-sm text-charcoal">{record.hours}時間</span>}
                        {record.type === "sales" && (
                          <span className="text-sm font-medium text-sprout-green">
                            +¥{record.total?.toLocaleString()}
                          </span>
                        )}
                        {record.type === "cost" && (
                          <span className="text-sm font-medium text-soil-brown">
                            -¥{Number(record.amount).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Getting Started */}
        <Card className="bg-gradient-to-r from-sprout-green/10 to-sky-blue/10 border-0 rounded-3xl shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-sprout-green rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-charcoal mb-3 text-lg">データ記録を始めましょう</h3>
                <p className="text-soil-brown mb-6">
                  日々の作業や売上を記録することで、より正確な分析とアドバイスを提供できます。
                </p>
                <Button
                  onClick={() => handleQuickAction("daily-record")}
                  className="bg-sprout-green text-white hover:bg-sprout-green/90 rounded-xl px-6 py-3 shadow-lg hover:scale-105 transition-all"
                >
                  記録を開始
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Record Modal */}
      <DailyRecordModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSave={handleSaveRecord}
      />
    </div>
  )
}
