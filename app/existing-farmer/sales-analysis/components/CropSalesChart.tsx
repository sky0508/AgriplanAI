"use client"

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { SalesRecord, AnalysisPeriod } from '../types'
import { aggregateCropSalesData, getAvailableCrops, formatCurrency } from '../utils'
import { CROP_COLORS, CHART_COLORS } from '../constants'

interface CropSalesChartProps {
  data: SalesRecord[]
  period: AnalysisPeriod
}

export const CropSalesChart = ({ data, period }: CropSalesChartProps) => {
  const chartData = useMemo(() => {
    return aggregateCropSalesData(data, period)
  }, [data, period])

  const availableCrops = useMemo(() => {
    return getAvailableCrops(data)
  }, [data])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-charcoal mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (data.length === 0) {
    return (
      <Card className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-charcoal">品目別売上推移</CardTitle>
          <CardDescription className="text-soil-brown">
            時間軸での作物ごと売上推移
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-fog-grey rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <p className="text-soil-brown">売上データがありません</p>
              <p className="text-sm text-soil-brown/70">
                日々の記録から売上データを登録してください
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-charcoal">品目別売上推移</CardTitle>
        <CardDescription className="text-soil-brown">
          {period === 'monthly' ? '月別' : period === 'quarterly' ? '四半期別' : '年別'}の作物ごと売上推移
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="period" 
                stroke="#8D6E63"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="#8D6E63"
                fontSize={12}
                tickFormatter={(value) => formatCurrency(value).replace('￥', '¥')}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* 動的に作物ごとのLineを生成 */}
              {availableCrops.map((crop, index) => (
                <Line
                  key={crop}
                  type="monotone"
                  dataKey={crop}
                  stroke={CROP_COLORS[crop as keyof typeof CROP_COLORS] || CHART_COLORS[index % CHART_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 統計情報 */}
        {chartData.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-soil-brown">データ期間</p>
                <p className="font-medium text-charcoal">{chartData.length}期間</p>
              </div>
              <div>
                <p className="text-soil-brown">作物数</p>
                <p className="font-medium text-charcoal">{availableCrops.length}品目</p>
              </div>
              <div>
                <p className="text-soil-brown">最新売上</p>
                <p className="font-medium text-charcoal">
                  {formatCurrency(
                    Object.values(chartData[chartData.length - 1] || {})
                      .filter(val => typeof val === 'number')
                      .reduce((sum: number, val: any) => sum + val, 0)
                  )}
                </p>
              </div>
              <div>
                <p className="text-soil-brown">総売上</p>
                <p className="font-medium text-charcoal">
                  {formatCurrency(
                    data.reduce((sum, record) => sum + record.total, 0)
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
