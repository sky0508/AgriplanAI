"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { SalesRecord } from '../types'

interface SalesCostComparisonChartProps {
  data: SalesRecord[]
}

export const SalesCostComparisonChart = ({ data }: SalesCostComparisonChartProps) => {
  // 現在はプレースホルダー実装
  // 将来的にコストデータとの連携時に本格実装
  
  const mockData = [
    { period: '10月', sales: 45000, cost: 25000 },
    { period: '11月', sales: 62000, cost: 35000 },
    { period: '12月', sales: 58000, cost: 32000 },
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-charcoal mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey === 'sales' ? '売上' : 'コスト'}: ¥${entry.value.toLocaleString()}`}
            </p>
          ))}
          {payload.length >= 2 && (
            <p className="text-sm text-sprout-green font-medium mt-1">
              粗利: ¥{(payload[0].value - payload[1].value).toLocaleString()}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <Card className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-charcoal">売上・コスト比較分析</CardTitle>
        <CardDescription className="text-soil-brown">
          売上とコストの推移比較（開発中）
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart 
              data={mockData}
              margin={{
                top: 20,
                right: 30,
                bottom: 20,
                left: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="period" 
                stroke="#8D6E63"
                fontSize={12}
              />
              <YAxis 
                stroke="#8D6E63"
                fontSize={12}
                tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              <Bar 
                dataKey="sales" 
                fill="#2E7D32" 
                name="売上"
                radius={[4, 4, 0, 0]}
              />
              <Line 
                type="monotone" 
                dataKey="cost" 
                stroke="#8D6E63" 
                strokeWidth={3}
                name="コスト"
                dot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* 将来実装予定の機能案内 */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="bg-sky-blue/5 border border-sky-blue/20 rounded-lg p-4">
            <h4 className="text-sm font-medium text-charcoal mb-2">🚧 開発中機能</h4>
            <p className="text-sm text-soil-brown">
              この機能は現在開発中です。将来的に以下の分析が可能になります：
            </p>
            <ul className="text-sm text-soil-brown mt-2 space-y-1">
              <li>• 売上とコストの月別推移比較</li>
              <li>• 粗利率の分析</li>
              <li>• 収益性の時系列変化</li>
              <li>• コスト構造の詳細分析</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
