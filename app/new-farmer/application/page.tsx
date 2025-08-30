"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, FileText, Download, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

interface ApplicationData {
  region: string
  crop: string
  area: string
  annualRevenue: number
  annualCost: number
  grossProfit: number
  initialInvestment: number
}

interface GenerationStep {
  id: string
  title: string
  status: "pending" | "in-progress" | "completed" | "error"
}

const StepIndicator = ({ steps }: { steps: GenerationStep[] }) => (
  <div className="flex items-center justify-center space-x-4 mb-8">
    {steps.map((step, index) => (
      <div key={step.id} className="flex items-center">
        <div
          className={`
          w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
          ${
            step.status === "completed"
              ? "bg-sprout-green text-white"
              : step.status === "in-progress"
                ? "bg-sky-blue text-white"
                : step.status === "error"
                  ? "bg-red-500 text-white"
                  : "bg-fog-grey text-soil-brown"
          }
        `}
        >
          {step.status === "completed" ? (
            <CheckCircle className="w-5 h-5" />
          ) : step.status === "error" ? (
            <AlertCircle className="w-5 h-5" />
          ) : (
            index + 1
          )}
        </div>
        <span className="ml-2 text-sm text-charcoal">{step.title}</span>
        {index < steps.length - 1 && <div className="w-8 h-0.5 bg-fog-grey mx-4" />}
      </div>
    ))}
  </div>
)

export default function ApplicationGenerationPage() {
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null)
  const [applicantName, setApplicantName] = useState("田中太郎")
  const [applicantAddress, setApplicantAddress] = useState("")
  const [generatedContent, setGeneratedContent] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [steps, setSteps] = useState<GenerationStep[]>([
    { id: "data", title: "データ収集", status: "pending" },
    { id: "generate", title: "AI生成", status: "pending" },
    { id: "format", title: "整形", status: "pending" },
  ])

  // Mock data - in real app, this would come from URL params or state management
  useEffect(() => {
    const mockData: ApplicationData = {
      region: "hokkaido",
      crop: "tomato",
      area: "100",
      annualRevenue: 1500000,
      annualCost: 900000,
      grossProfit: 600000,
      initialInvestment: 2000000,
    }
    setApplicationData(mockData)
    setApplicantAddress("北海道")
  }, [])

  const generateApplication = async () => {
    if (!applicationData) return

    setIsGenerating(true)
    setError(null)

    try {
      // Step 1: Data Collection
      setSteps((prev) => prev.map((step, index) => ({ ...step, status: index === 0 ? "in-progress" : "pending" })))
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSteps((prev) => prev.map((step, index) => ({ ...step, status: index === 0 ? "completed" : step.status })))

      // Step 2: AI Generation
      setSteps((prev) => prev.map((step, index) => ({ ...step, status: index === 1 ? "in-progress" : step.status })))

      const response = await fetch("/api/generate-application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...applicationData,
          applicantName,
          applicantAddress,
        }),
      })

      if (!response.ok) {
        throw new Error("申請書の生成に失敗しました")
      }

      const result = await response.json()
      setGeneratedContent(result.content)
      setSteps((prev) => prev.map((step, index) => ({ ...step, status: index === 1 ? "completed" : step.status })))

      // Step 3: Formatting
      setSteps((prev) => prev.map((step, index) => ({ ...step, status: index === 2 ? "in-progress" : step.status })))
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSteps((prev) => prev.map((step, index) => ({ ...step, status: index === 2 ? "completed" : step.status })))
    } catch (err) {
      setError(err instanceof Error ? err.message : "申請書の生成中にエラーが発生しました")
      setSteps((prev) =>
        prev.map((step) => ({
          ...step,
          status: step.status === "in-progress" ? "error" : step.status,
        })),
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadAsWord = async () => {
    try {
      const response = await fetch("/api/download-application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: generatedContent,
          filename: "農業経営改善計画認定申請書",
        }),
      })

      if (!response.ok) {
        throw new Error("ダウンロードに失敗しました")
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "農業経営改善計画認定申請書.docx"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "ダウンロード中にエラーが発生しました")
    }
  }

  const regenerateContent = () => {
    setGeneratedContent("")
    setError(null)
    setSteps([
      { id: "data", title: "データ収集", status: "pending" },
      { id: "generate", title: "AI生成", status: "pending" },
      { id: "format", title: "整形", status: "pending" },
    ])
    generateApplication()
  }

  return (
    <div className="min-h-screen bg-fog-grey p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/new-farmer">
            <Button variant="ghost" size="sm" className="text-soil-brown hover:text-charcoal">
              <ArrowLeft className="w-4 h-4 mr-2" />
              戻る
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-charcoal">AI申請書生成</h1>
            <p className="text-soil-brown">農業経営改善計画認定申請書を自動生成します</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Error Display */}
        {error && (
          <Card className="mb-8 bg-red-50 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">エラーが発生しました</span>
              </div>
              <p className="text-red-600 mt-2">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Generation Steps */}
        {isGenerating && (
          <Card className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100">
            <CardContent className="p-6">
              <StepIndicator steps={steps} />
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-sky-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-sm text-soil-brown">申請書を生成しています...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Applicant Information */}
        <Card className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-charcoal">申請者情報</CardTitle>
            <CardDescription className="text-soil-brown">申請書に記載される個人情報を入力してください</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="applicant-name">氏名</Label>
                <Input
                  id="applicant-name"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder="田中太郎"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="applicant-address">住所</Label>
                <Input
                  id="applicant-address"
                  value={applicantAddress}
                  onChange={(e) => setApplicantAddress(e.target.value)}
                  placeholder="北海道札幌市..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Input Summary */}
        {applicationData && (
          <Card className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-charcoal">営農計画データ確認</CardTitle>
              <CardDescription className="text-soil-brown">以下の情報で申請書を生成します</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-soil-brown">地域</p>
                  <p className="font-semibold text-charcoal">
                    {applicationData.region === "hokkaido" ? "北海道" : applicationData.region}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-soil-brown">作物</p>
                  <p className="font-semibold text-charcoal">
                    {applicationData.crop === "tomato" ? "トマト" : applicationData.crop}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-soil-brown">面積</p>
                  <p className="font-semibold text-charcoal">{applicationData.area}a</p>
                </div>
                <div>
                  <p className="text-sm text-soil-brown">予想粗利</p>
                  <p className="font-semibold text-charcoal">{applicationData.grossProfit.toLocaleString()}円</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generate Button */}
        {!generatedContent && !isGenerating && (
          <div className="text-center mb-8">
            <Button
              onClick={generateApplication}
              disabled={!applicantName || !applicantAddress}
              className="bg-harvest-yellow text-white font-semibold py-4 px-8 rounded-xl hover:bg-harvest-yellow/90 transition-colors disabled:opacity-50"
            >
              <FileText className="w-5 h-5 mr-2" />
              申請書を生成する
            </Button>
          </div>
        )}

        {/* Generated Content */}
        {generatedContent && (
          <div className="space-y-6">
            <Card className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-charcoal">生成された申請書</CardTitle>
                  <CardDescription className="text-soil-brown">
                    内容を確認し、必要に応じて編集してください
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={regenerateContent}
                    variant="outline"
                    size="sm"
                    className="text-soil-brown hover:text-charcoal bg-transparent"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    再生成
                  </Button>
                  <Button
                    onClick={downloadAsWord}
                    className="bg-sprout-green text-white hover:bg-sprout-green/90"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Word形式でダウンロード
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={generatedContent}
                  onChange={(e) => setGeneratedContent(e.target.value)}
                  className="min-h-[600px] font-mono text-sm"
                  placeholder="生成された申請書の内容がここに表示されます..."
                />
              </CardContent>
            </Card>

            {/* Success Message */}
            <Card className="bg-sprout-green/5 border-sprout-green/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-sprout-green rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-charcoal mb-2">申請書の生成が完了しました</h3>
                    <p className="text-sm text-soil-brown mb-4">
                      生成された申請書は編集可能です。内容を確認し、必要に応じて修正してからダウンロードしてください。
                      申請書は農業経営改善計画認定申請の正式な書式に準拠しています。
                    </p>
                    <div className="flex gap-2">
                      <Button onClick={downloadAsWord} className="bg-sprout-green text-white hover:bg-sprout-green/90">
                        <Download className="w-4 h-4 mr-2" />
                        Word形式でダウンロード
                      </Button>
                      <Link href="/new-farmer">
                        <Button variant="outline" className="text-soil-brown hover:text-charcoal bg-transparent">
                          新しい申請書を作成
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
