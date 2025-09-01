import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SalesRecord, CropInfo, SalesChannel } from '@/app/existing-farmer/data-management/types'

interface DataManagementState {
  // 売上記録
  salesRecords: SalesRecord[]
  setSalesRecords: (records: SalesRecord[]) => void
  addSalesRecord: (record: SalesRecord) => void
  updateSalesRecord: (id: number, updates: Partial<SalesRecord>) => void
  deleteSalesRecord: (id: number) => void
  
  // 作物情報
  cropInfo: CropInfo[]
  setCropInfo: (crops: CropInfo[]) => void
  addCropInfo: (crop: CropInfo) => void
  updateCropInfo: (id: string, updates: Partial<CropInfo>) => void
  deleteCropInfo: (id: string) => void
  
  // 販売チャンネル
  salesChannels: SalesChannel[]
  setSalesChannels: (channels: SalesChannel[]) => void
  addSalesChannel: (channel: SalesChannel) => void
  updateSalesChannel: (id: string, updates: Partial<SalesChannel>) => void
  deleteSalesChannel: (id: string) => void
  
  // UI状態
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  lastUpdated: string | null
  setLastUpdated: (timestamp: string) => void
  
  // リアルタイム反映用
  triggerSalesAnalysisUpdate: () => void
}

export const useDataManagementStore = create<DataManagementState>()(
  persist(
    (set, get) => ({
      // 売上記録
      salesRecords: [],
      setSalesRecords: (records) => set({ salesRecords: records }),
      addSalesRecord: (record) => {
        set((state) => ({
          salesRecords: [...state.salesRecords, record],
          lastUpdated: new Date().toISOString()
        }))
        // リアルタイム反映をトリガー
        get().triggerSalesAnalysisUpdate()
      },
      updateSalesRecord: (id, updates) => {
        set((state) => ({
          salesRecords: state.salesRecords.map(record =>
            record.id === id ? { ...record, ...updates, updatedAt: new Date().toISOString() } : record
          ),
          lastUpdated: new Date().toISOString()
        }))
        // リアルタイム反映をトリガー
        get().triggerSalesAnalysisUpdate()
      },
      deleteSalesRecord: (id) => {
        set((state) => ({
          salesRecords: state.salesRecords.filter(record => record.id !== id),
          lastUpdated: new Date().toISOString()
        }))
        // リアルタイム反映をトリガー
        get().triggerSalesAnalysisUpdate()
      },
      
      // 作物情報
      cropInfo: [],
      setCropInfo: (crops) => set({ cropInfo: crops }),
      addCropInfo: (crop) => {
        set((state) => ({
          cropInfo: [...state.cropInfo, crop],
          lastUpdated: new Date().toISOString()
        }))
      },
      updateCropInfo: (id, updates) => {
        set((state) => ({
          cropInfo: state.cropInfo.map(crop =>
            crop.id === id ? { ...crop, ...updates, updatedAt: new Date().toISOString() } : crop
          ),
          lastUpdated: new Date().toISOString()
        }))
      },
      deleteCropInfo: (id) => {
        set((state) => ({
          cropInfo: state.cropInfo.filter(crop => crop.id !== id),
          lastUpdated: new Date().toISOString()
        }))
      },
      
      // 販売チャンネル
      salesChannels: [],
      setSalesChannels: (channels) => set({ salesChannels: channels }),
      addSalesChannel: (channel) => {
        set((state) => ({
          salesChannels: [...state.salesChannels, channel],
          lastUpdated: new Date().toISOString()
        }))
      },
      updateSalesChannel: (id, updates) => {
        set((state) => ({
          salesChannels: state.salesChannels.map(channel =>
            channel.id === id ? { ...channel, ...updates, updatedAt: new Date().toISOString() } : channel
          ),
          lastUpdated: new Date().toISOString()
        }))
      },
      deleteSalesChannel: (id) => {
        set((state) => ({
          salesChannels: state.salesChannels.filter(channel => channel.id !== id),
          lastUpdated: new Date().toISOString()
        }))
      },
      
      // UI状態
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      lastUpdated: null,
      setLastUpdated: (timestamp) => set({ lastUpdated: timestamp }),
      
      // リアルタイム反映用
      triggerSalesAnalysisUpdate: () => {
        // カスタムイベントを発火して売上分析画面に変更を通知
        const salesRecords = get().salesRecords
        
        // ローカルストレージも更新（売上分析画面との互換性のため）
        localStorage.setItem('sales_records', JSON.stringify(salesRecords))
        
        // カスタムイベントを発火
        window.dispatchEvent(new CustomEvent('salesDataUpdated', { 
          detail: { 
            type: 'update', 
            records: salesRecords,
            timestamp: new Date().toISOString()
          } 
        }))
      }
    }),
    {
      name: 'data-management-store',
      partialize: (state) => ({
        salesRecords: state.salesRecords,
        cropInfo: state.cropInfo,
        salesChannels: state.salesChannels,
        lastUpdated: state.lastUpdated
      })
    }
  )
)

