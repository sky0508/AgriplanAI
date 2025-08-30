"use client"

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { SalesRecord } from '../types'
import { generateChannelAnalysisData, formatCurrency } from '../utils'

interface ChannelAnalysisChartProps {
  data: SalesRecord[]
}

export const ChannelAnalysisChart = ({ data }: ChannelAnalysisChartProps) => {
  const chartData = useMemo(() => {
    return generateChannelAnalysisData(data)
  }, [data])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-charcoal mb-2">{label}</p>
          <p className="text-sm text-charcoal">
            売上: {formatCurrency(data.revenue)}
          </p>
          <p className="text-sm text-charcoal">
            販売量: {data.volume.toLocaleString()}kg
          </p>
          <p className="text-sm text-charcoal">
            平均単価: {formatCurrency(data.averagePrice)}/kg
          </p>
          <p className="text-sm text-charcoal">
            構成比: {data.percentage.toFixed(1)}%
          </p>
        </div>
      )
    }
    return null
  }

  if (data.length === 0) {
    return (
      <Card className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-charcoal">販売チャンネル別分析</CardTitle>
          <CardDescription className="text-soil-brown">
            販売先ごとの売上・収益性分析
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-fog-grey rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏪</span>
              </div>
              <p className="text-soil-brown">販売データがありません</p>
              <p className="text-sm text-soil-brown/70">
                販売チャンネル別の分析データを表示します
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
        <CardTitle className="text-lg font-bold text-charcoal">販売チャンネル別分析</CardTitle>
        <CardDescription className="text-soil-brown">
          販売先ごとの売上・収益性分析
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="channel" 
                stroke="#8D6E63"
                fontSize={12}
              />
              <YAxis 
                stroke="#8D6E63"
                fontSize={12}
                tickFormatter={(value) => formatCurrency(value).replace('￥', '¥')}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="revenue" 
                fill="#42A5F5"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 詳細統計 */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="space-y-3">
            {chartData.map((channel, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-sky-blue rounded-full"></div>
                  <span className="font-medium text-charcoal">{channel.channel}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-charcoal">
                    {formatCurrency(channel.revenue)}
                  </p>
                  <p className="text-xs text-soil-brown">
                    {formatCurrency(channel.averagePrice)}/kg
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 比較分析 */}
        {chartData.length >= 2 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-medium text-charcoal mb-3">価格比較</h4>
            <div className="space-y-2">
              {chartData
                .sort((a, b) => b.averagePrice - a.averagePrice)
                .map((channel, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-soil-brown">{channel.channel}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-charcoal font-medium">
                        {formatCurrency(channel.averagePrice)}/kg
                      </span>
                      {index === 0 && (
                        <span className="px-2 py-1 bg-sprout-green/10 text-sprout-green text-xs rounded-full">
                          最高価格
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
