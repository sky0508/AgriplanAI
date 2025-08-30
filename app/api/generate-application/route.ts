import { type NextRequest, NextResponse } from "next/server"
import { openAIService } from "@/lib/openai-service"

interface ApplicationRequest {
  region: string
  crop: string
  area: string
  annualRevenue: number
  annualCost: number
  grossProfit: number
  initialInvestment: number
  applicantName?: string
  applicantAddress?: string
}

export async function POST(request: NextRequest) {
  try {
    const data: ApplicationRequest = await request.json()

    // Validate required fields
    if (!data.region || !data.crop || !data.area) {
      return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 })
    }

    const applicationContent = await openAIService.generateApplication({
      region: data.region,
      crop: data.crop,
      area: data.area,
      annualRevenue: data.annualRevenue,
      annualCost: data.annualCost,
      grossProfit: data.grossProfit,
      initialInvestment: data.initialInvestment,
      applicantName: data.applicantName || "田中太郎",
      applicantAddress: data.applicantAddress || data.region,
    })

    return NextResponse.json({
      content: applicationContent,
      metadata: {
        generatedAt: new Date().toISOString(),
        region: data.region,
        crop: data.crop,
        area: data.area,
        generatedBy: "OpenAI GPT-4",
      },
    })
  } catch (error) {
    console.error("Application generation error:", error)
    return NextResponse.json({ error: "申請書の生成中にエラーが発生しました" }, { status: 500 })
  }
}
