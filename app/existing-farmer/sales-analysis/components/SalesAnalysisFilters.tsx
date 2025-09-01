"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { AnalysisFilters } from '../types'
import { CHANNEL_NAMES, CROP_NAMES } from '../constants'

interface SalesAnalysisFiltersProps {
  filters: AnalysisFilters
  onFiltersChange: (filters: AnalysisFilters) => void
  availableCrops: string[]
  availableChannels: string[]
}

export const SalesAnalysisFilters = ({ 
  filters, 
  onFiltersChange, 
  availableCrops, 
  availableChannels 
}: SalesAnalysisFiltersProps) => {
  const handlePeriodChange = (period: string) => {
    onFiltersChange({
      ...filters,
      period: period as 'monthly' | 'quarterly' | 'yearly'
    })
  }

  const handleStartDateChange = (startDate: string) => {
    onFiltersChange({ ...filters, startDate })
  }

  const handleEndDateChange = (endDate: string) => {
    onFiltersChange({ ...filters, endDate })
  }

  const handleCropToggle = (crop: string) => {
    const newCrops = filters.crops.includes(crop)
      ? filters.crops.filter(c => c !== crop)
      : [...filters.crops, crop]
    onFiltersChange({ ...filters, crops: newCrops })
  }

  const handleChannelToggle = (channel: string) => {
    const newChannels = filters.channels.includes(channel)
      ? filters.channels.filter(c => c !== channel)
      : [...filters.channels, channel]
    onFiltersChange({ ...filters, channels: newChannels })
  }

  return (
    <Card className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-charcoal">分析条件</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* 期間選択 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-charcoal">期間</Label>
            <Select value={filters.period} onValueChange={handlePeriodChange}>
              <SelectTrigger>
                <SelectValue placeholder="期間を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">月別</SelectItem>
                <SelectItem value="quarterly">四半期別</SelectItem>
                <SelectItem value="yearly">年別</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 開始日 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-charcoal">開始日</Label>
            <Input 
              type="date" 
              value={filters.startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
            />
          </div>

          {/* 終了日 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-charcoal">終了日</Label>
            <Input 
              type="date" 
              value={filters.endDate}
              onChange={(e) => handleEndDateChange(e.target.value)}
            />
          </div>

          {/* リセットボタン */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-charcoal">操作</Label>
            <button
              onClick={() => onFiltersChange({
                ...filters,
                crops: [],
                channels: []
              })}
              className="w-full px-3 py-2 text-sm text-soil-brown hover:text-charcoal border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              フィルターリセット
            </button>
          </div>
        </div>

        {/* 作物フィルター */}
        {availableCrops.length > 0 && (
          <div className="space-y-3 mb-4">
            <Label className="text-sm font-medium text-charcoal">作物</Label>
            <div className="flex flex-wrap gap-2">
              {availableCrops.map((crop, index) => (
                <button
                  key={`crop-${crop}-${index}`}
                  onClick={() => handleCropToggle(crop)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    filters.crops.includes(crop)
                      ? 'bg-sprout-green text-white border-sprout-green'
                      : 'bg-white text-soil-brown border-gray-300 hover:border-sprout-green'
                  }`}
                >
                  {CROP_NAMES[crop as keyof typeof CROP_NAMES] || crop}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 販売チャンネルフィルター */}
        {availableChannels.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-charcoal">販売チャンネル</Label>
            <div className="flex flex-wrap gap-2">
              {availableChannels.map((channel, index) => (
                <button
                  key={`channel-${channel}-${index}`}
                  onClick={() => handleChannelToggle(channel)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    filters.channels.includes(channel)
                      ? 'bg-sky-blue text-white border-sky-blue'
                      : 'bg-white text-soil-brown border-gray-300 hover:border-sky-blue'
                  }`}
                >
                  {CHANNEL_NAMES[channel as keyof typeof CHANNEL_NAMES] || channel}
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
