"use client"

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import type { SalesRecord } from '../types'
import { generateCropCompositionData, formatCurrency } from '../utils'

interface CropCompositionChartProps {
  data: SalesRecord[]
}

export const CropCompositionChart = ({ data }: CropCompositionChartProps) => {
  const chartData = useMemo(() => {
    return generateCropCompositionData(data)
  }, [data])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-charcoal mb-1">{data.crop}</p>
          <p className="text-sm text-charcoal">
            売上: {formatCurrency(data.value)}
          </p>
          <p className="text-sm text-charcoal">
            構成比: {data.percentage.toFixed(1)}%
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null // 5%未満はラベルを表示しない
    
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  if (data.length === 0) {
    return (
      <Card className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-charcoal">作物別売上構成比</CardTitle>
          <CardDescription className="text-soil-brown">
            全体売上に占める各作物の割合
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-fog-grey rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🥕</span>
              </div>
              <p className="text-soil-brown">売上データがありません</p>
              <p className="text-sm text-soil-brown/70">
                作物別の構成比を表示します
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
        <CardTitle className="text-lg font-bold text-charcoal">作物別売上構成比</CardTitle>
        <CardDescription className="text-soil-brown">
          全体売上に占める各作物の割合
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 凡例と詳細情報 */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="space-y-2">
            {chartData
              .sort((a, b) => b.percentage - a.percentage)
              .map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.fill }}
                    ></div>
                    <span className="font-medium text-charcoal">{item.crop}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-charcoal">
                      {item.percentage.toFixed(1)}%
                    </p>
                    <p className="text-xs text-soil-brown">
                      {formatCurrency(item.value)}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* 売上分析サマリー */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-soil-brown">主力作物</p>
              <p className="font-medium text-charcoal">
                {chartData.length > 0 ? chartData.reduce((prev, current) => 
                  prev.percentage > current.percentage ? prev : current
                ).crop : '-'}
              </p>
            </div>
            <div>
              <p className="text-soil-brown">作物数</p>
              <p className="font-medium text-charcoal">{chartData.length}品目</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
