import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { content, filename = "農業経営改善計画認定申請書" } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "コンテンツが提供されていません" }, { status: 400 })
    }

    // In a real implementation, you would use a library like docx to create proper Word documents
    // For now, we'll create a simple text file that can be opened in Word
    const buffer = Buffer.from(content, "utf-8")

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}.docx"`,
        "Content-Length": buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ error: "ダウンロード中にエラーが発生しました" }, { status: 500 })
  }
}
