"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Save } from "lucide-react"

interface DailyRecordModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (record: any) => void
}

export function DailyRecordModal({ isOpen, onClose, onSave }: DailyRecordModalProps) {
  const [activeTab, setActiveTab] = useState("work")
  const [workRecord, setWorkRecord] = useState({
    date: new Date().toISOString().split("T")[0],
    crop: "",
    activity: "",
    hours: "",
    notes: "",
  })
  const [salesRecord, setSalesRecord] = useState({
    date: new Date().toISOString().split("T")[0],
    crop: "",
    quantity: "",
    unitPrice: "",
    buyer: "",
    notes: "",
  })
  const [costRecord, setCostRecord] = useState({
    date: new Date().toISOString().split("T")[0],
    category: "",
    item: "",
    amount: "",
    supplier: "",
    notes: "",
  })

  const handleSave = () => {
    let record
    switch (activeTab) {
      case "work":
        record = { type: "work", ...workRecord }
        break
      case "sales":
        record = { type: "sales", ...salesRecord, total: Number(salesRecord.quantity) * Number(salesRecord.unitPrice) }
        break
      case "cost":
        record = { type: "cost", ...costRecord }
        break
      default:
        return
    }
    onSave(record)
    onClose()
    // Reset forms
    setWorkRecord({ date: new Date().toISOString().split("T")[0], crop: "", activity: "", hours: "", notes: "" })
    setSalesRecord({
      date: new Date().toISOString().split("T")[0],
      crop: "",
      quantity: "",
      unitPrice: "",
      buyer: "",
      notes: "",
    })
    setCostRecord({
      date: new Date().toISOString().split("T")[0],
      category: "",
      item: "",
      amount: "",
      supplier: "",
      notes: "",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-charcoal">日々の記録</DialogTitle>
          <DialogDescription className="text-soil-brown">
            作業・売上・コストを記録して、経営状況を把握しましょう
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="work">作業記録</TabsTrigger>
            <TabsTrigger value="sales">売上記録</TabsTrigger>
            <TabsTrigger value="cost">コスト記録</TabsTrigger>
          </TabsList>

          <TabsContent value="work" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="work-date">日付</Label>
                <Input
                  id="work-date"
                  type="date"
                  value={workRecord.date}
                  onChange={(e) => setWorkRecord({ ...workRecord, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="work-crop">作物</Label>
                <Select
                  value={workRecord.crop}
                  onValueChange={(value) => setWorkRecord({ ...workRecord, crop: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="作物を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tomato">トマト</SelectItem>
                    <SelectItem value="cucumber">きゅうり</SelectItem>
                    <SelectItem value="lettuce">レタス</SelectItem>
                    <SelectItem value="cabbage">キャベツ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="work-activity">作業内容</Label>
                <Select
                  value={workRecord.activity}
                  onValueChange={(value) => setWorkRecord({ ...workRecord, activity: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="作業を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seeding">播種</SelectItem>
                    <SelectItem value="watering">水やり</SelectItem>
                    <SelectItem value="fertilizing">施肥</SelectItem>
                    <SelectItem value="harvesting">収穫</SelectItem>
                    <SelectItem value="weeding">除草</SelectItem>
                    <SelectItem value="pest-control">病害虫防除</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="work-hours">作業時間（時間）</Label>
                <Input
                  id="work-hours"
                  type="number"
                  step="0.5"
                  placeholder="2.5"
                  value={workRecord.hours}
                  onChange={(e) => setWorkRecord({ ...workRecord, hours: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="work-notes">メモ</Label>
              <Textarea
                id="work-notes"
                placeholder="作業の詳細や気づいたことを記録..."
                value={workRecord.notes}
                onChange={(e) => setWorkRecord({ ...workRecord, notes: e.target.value })}
              />
            </div>
          </TabsContent>

          <TabsContent value="sales" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sales-date">日付</Label>
                <Input
                  id="sales-date"
                  type="date"
                  value={salesRecord.date}
                  onChange={(e) => setSalesRecord({ ...salesRecord, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sales-crop">作物</Label>
                <Select
                  value={salesRecord.crop}
                  onValueChange={(value) => setSalesRecord({ ...salesRecord, crop: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="作物を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tomato">トマト</SelectItem>
                    <SelectItem value="cucumber">きゅうり</SelectItem>
                    <SelectItem value="lettuce">レタス</SelectItem>
                    <SelectItem value="cabbage">キャベツ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sales-quantity">数量（kg）</Label>
                <Input
                  id="sales-quantity"
                  type="number"
                  placeholder="50"
                  value={salesRecord.quantity}
                  onChange={(e) => setSalesRecord({ ...salesRecord, quantity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sales-price">単価（円/kg）</Label>
                <Input
                  id="sales-price"
                  type="number"
                  placeholder="300"
                  value={salesRecord.unitPrice}
                  onChange={(e) => setSalesRecord({ ...salesRecord, unitPrice: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>合計金額</Label>
                <div className="flex items-center h-10 px-3 py-2 bg-fog-grey rounded-md text-sm">
                  {salesRecord.quantity && salesRecord.unitPrice
                    ? `¥${(Number(salesRecord.quantity) * Number(salesRecord.unitPrice)).toLocaleString()}`
                    : "¥0"}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sales-buyer">販売先</Label>
              <Select
                value={salesRecord.buyer}
                onValueChange={(value) => setSalesRecord({ ...salesRecord, buyer: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="販売先を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct-sales">直売所</SelectItem>
                  <SelectItem value="ja">農協</SelectItem>
                  <SelectItem value="market">市場</SelectItem>
                  <SelectItem value="restaurant">レストラン</SelectItem>
                  <SelectItem value="individual">個人販売</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sales-notes">メモ</Label>
              <Textarea
                id="sales-notes"
                placeholder="品質や市場の状況など..."
                value={salesRecord.notes}
                onChange={(e) => setSalesRecord({ ...salesRecord, notes: e.target.value })}
              />
            </div>
          </TabsContent>

          <TabsContent value="cost" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost-date">日付</Label>
                <Input
                  id="cost-date"
                  type="date"
                  value={costRecord.date}
                  onChange={(e) => setCostRecord({ ...costRecord, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost-category">カテゴリ</Label>
                <Select
                  value={costRecord.category}
                  onValueChange={(value) => setCostRecord({ ...costRecord, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="カテゴリを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seeds">種苗費</SelectItem>
                    <SelectItem value="fertilizer">肥料費</SelectItem>
                    <SelectItem value="pesticide">農薬費</SelectItem>
                    <SelectItem value="fuel">燃料費</SelectItem>
                    <SelectItem value="equipment">機械・設備費</SelectItem>
                    <SelectItem value="utilities">光熱費</SelectItem>
                    <SelectItem value="other">その他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost-item">品目</Label>
                <Input
                  id="cost-item"
                  placeholder="具体的な品目名"
                  value={costRecord.item}
                  onChange={(e) => setCostRecord({ ...costRecord, item: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost-amount">金額（円）</Label>
                <Input
                  id="cost-amount"
                  type="number"
                  placeholder="5000"
                  value={costRecord.amount}
                  onChange={(e) => setCostRecord({ ...costRecord, amount: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost-supplier">購入先</Label>
              <Input
                id="cost-supplier"
                placeholder="購入先名"
                value={costRecord.supplier}
                onChange={(e) => setCostRecord({ ...costRecord, supplier: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost-notes">メモ</Label>
              <Textarea
                id="cost-notes"
                placeholder="詳細や用途など..."
                value={costRecord.notes}
                onChange={(e) => setCostRecord({ ...costRecord, notes: e.target.value })}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} className="text-soil-brown hover:text-charcoal bg-transparent">
            キャンセル
          </Button>
          <Button onClick={handleSave} className="bg-sprout-green text-white hover:bg-sprout-green/90">
            <Save className="w-4 h-4 mr-2" />
            保存
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
