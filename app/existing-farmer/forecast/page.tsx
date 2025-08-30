"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, TrendingUp, Calendar, DollarSign } from "lucide-react"
import Link from "next/link"

interface ForecastResult {
  period: string
  expectedRevenue: number
  expectedCost: number
  expectedProfit: number
  confidence: number
  recommendations: string[]
}

export default function ForecastPage() {
  const [crop, setCrop] = useState("")
  const [area, setArea] = useState("")
  const [period, setPeriod] = useState("")
  const [forecast, setForecast] = useState<ForecastResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const handleForecast = async () => {
    if (!crop || !area || !period) return

    setIsCalculating(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const areaNum = Number.parseFloat(area)
    const multiplier = period === "monthly" ? 1 : period === "quarterly" ? 3 : 12

    const mockForecast: ForecastResult = {
      period: period === "monthly" ? "月間" : period === "quarterly" ? "四半期" : "年間",
      expectedRevenue: Math.round(areaNum * 12000 * multiplier * (0.9 + Math.random() * 0.2)),
      expectedCost: Math.round(areaNum * 7000 * multiplier * (0.9 + Math.random() * 0.2)),
      expectedProfit: 0,
      confidence: 80 + Math.random() * 15,
      recommendations: [
        "現在の市場価格は平均より5%高い傾向にあります",
        "来月の出荷量を20%増やすことで収益向上が期待できます",
        "肥料コストを10%削減する余地があります",
      ],
    }
    mockForecast.expectedProfit = mockForecast.expectedRevenue - mockForecast.expectedCost

    setForecast(mockForecast)
    setIsCalculating(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-fog-grey p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/existing-farmer">
            <Button variant="ghost" size="sm" className="text-soil-brown hover:text-charcoal">
              <ArrowLeft className="w-4 h-4 mr-2" />
              ダッシュボードに戻る
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-charcoal">収支予測</h1>
            <p className="text-soil-brown">将来の収支を予測して経営計画を立てましょう</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-charcoal flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-sky-blue" />
              予測条件設定
            </CardTitle>
            <CardDescription className="text-soil-brown">作物と期間を設定して収支を予測します</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="crop" className="text-sm font-medium text-charcoal">
                作物
              </Label>
              <Select value={crop} onValueChange={setCrop}>
                <SelectTrigger>
                  <SelectValue placeholder="作物を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tomato">トマト</SelectItem>
                  <SelectItem value="cucumber">きゅうり</SelectItem>
                  <SelectItem value="lettuce">レタス</SelectItem>
                  <SelectItem value="cabbage">キャベツ</SelectItem>
                  <SelectItem value="strawberry">いちご</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="area" className="text-sm font-medium text-charcoal">
                栽培面積
              </Label>
              <div className="flex gap-2">
                <Input
                  id="area"
                  type="number"
                  placeholder="100"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="flex-1"
                />
                <div className="flex items-center px-3 py-2 bg-fog-grey rounded-md text-sm text-soil-brown">
                  a (アール)
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="period" className="text-sm font-medium text-charcoal">
                予測期間
              </Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="期間を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">1ヶ月</SelectItem>
                  <SelectItem value="quarterly">3ヶ月</SelectItem>
                  <SelectItem value="yearly">1年</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleForecast}
              disabled={!crop || !area || !period || isCalculating}
              className="w-full bg-sky-blue text-white font-semibold py-3 px-6 rounded-xl hover:bg-sky-blue/90 transition-colors disabled:opacity-50"
            >
              {isCalculating ? "予測中..." : "収支を予測"}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {forecast && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-charcoal">{forecast.period}予測結果</h3>

            <div className="grid grid-cols-1 gap-4">
              <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-sprout-green" />
                    <h4 className="text-sm font-medium text-soil-brown">予想売上</h4>
                  </div>
                  <span className="text-2xl font-bold tabular-nums text-sprout-green">
                    {formatCurrency(forecast.expectedRevenue)}
                  </span>
                </CardContent>
              </Card>

              <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-soil-brown" />
                    <h4 className="text-sm font-medium text-soil-brown">予想コスト</h4>
                  </div>
                  <span className="text-2xl font-bold tabular-nums text-soil-brown">
                    {formatCurrency(forecast.expectedCost)}
                  </span>
                </CardContent>
              </Card>

              <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-harvest-yellow" />
                    <h4 className="text-sm font-medium text-soil-brown">予想利益</h4>
                  </div>
                  <span className="text-2xl font-bold tabular-nums text-harvest-yellow">
                    {formatCurrency(forecast.expectedProfit)}
                  </span>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-sky-blue/5 border-sky-blue/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-sky-blue rounded-full"></div>
                  <span className="text-sm font-medium text-charcoal">
                    予測信頼度: {Math.round(forecast.confidence)}%
                  </span>
                </div>
                <p className="text-xs text-soil-brown mb-3">過去のデータと市場動向に基づく予測です</p>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-charcoal">改善提案</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {forecast.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-soil-brown">
                      <span className="w-1.5 h-1.5 bg-harvest-yellow rounded-full flex-shrink-0 mt-2"></span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
