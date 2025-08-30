import { type NextRequest, NextResponse } from "next/server"
import { eStatService } from "@/lib/e-stat-api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const region = searchParams.get("region")
    const crop = searchParams.get("crop")

    if (!region || !crop) {
      return NextResponse.json({ error: "地域と作物の指定が必要です" }, { status: 400 })
    }

    // Get crop data from e-Stat API
    const cropData = await eStatService.getCropData(region, crop)

    if (!cropData) {
      return NextResponse.json({ error: "データの取得に失敗しました" }, { status: 500 })
    }

    // Get regional averages for comparison
    const regionalAverages = await eStatService.getRegionalAverages(region)

    return NextResponse.json({
      cropData,
      regionalAverages,
      dataSource: "e-Stat API",
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Crop data API error:", error)
    return NextResponse.json({ error: "データ取得中にエラーが発生しました" }, { status: 500 })
  }
}
