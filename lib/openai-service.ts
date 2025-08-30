// OpenAI API integration for AI application generation

interface OpenAIRequest {
  region: string
  crop: string
  area: string
  annualRevenue: number
  annualCost: number
  grossProfit: number
  initialInvestment: number
  applicantName: string
  applicantAddress: string
}

export class OpenAIService {
  private readonly apiKey = process.env.OPENAI_API_KEY
  private readonly baseUrl = "https://api.openai.com/v1/chat/completions"

  async generateApplication(data: OpenAIRequest): Promise<string> {
    if (!this.apiKey) {
      console.warn("OpenAI API key not configured, using fallback generation")
      return this.generateFallbackApplication(data)
    }

    try {
      const prompt = this.createPrompt(data)

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "あなたは農業経営の専門家です。日本の農業経営改善計画認定申請書を正確で詳細に作成してください。",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 3000,
          temperature: 0.7,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const result = await response.json()
      return result.choices[0]?.message?.content || this.generateFallbackApplication(data)
    } catch (error) {
      console.error("OpenAI API error:", error)
      return this.generateFallbackApplication(data)
    }
  }

  private createPrompt(data: OpenAIRequest): string {
    return `以下の情報を基に、農業経営改善計画認定申請書を作成してください：

申請者情報：
- 氏名: ${data.applicantName}
- 住所: ${data.applicantAddress}
- 営農予定地: ${data.region}

営農計画：
- 主要作物: ${data.crop}
- 栽培面積: ${data.area}a
- 年間売上予想: ${data.annualRevenue.toLocaleString()}円
- 年間コスト予想: ${data.annualCost.toLocaleString()}円
- 粗利予想: ${data.grossProfit.toLocaleString()}円
- 初期投資: ${data.initialInvestment.toLocaleString()}円

以下の項目を含む詳細な申請書を作成してください：
1. 申請者の概要
2. 営農計画の概要
3. 経営収支計画（詳細な内訳含む）
4. 設備投資計画
5. 資金調達計画
6. 営農技術の習得計画
7. 販路確保の取り組み
8. 経営発展計画（5年間）
9. 環境保全への取り組み
10. 地域貢献計画

日本の農業政策と実情に合わせた現実的で具体的な内容にしてください。`
  }

  private generateFallbackApplication(data: OpenAIRequest): string {
    // Fallback to the existing template-based generation
    return `農業経営改善計画認定申請書

申請日：${new Date().toLocaleDateString("ja-JP")}

1. 申請者の概要
氏名：${data.applicantName}
住所：${data.applicantAddress}
営農予定地：${data.region}

2. 営農計画の概要
主要作物：${data.crop}
栽培面積：${data.area}a
年間売上予想：${data.annualRevenue.toLocaleString()}円
年間コスト予想：${data.annualCost.toLocaleString()}円
粗利予想：${data.grossProfit.toLocaleString()}円

この計画により、持続可能で収益性の高い農業経営を実現し、
地域農業の発展に貢献してまいります。

（注：OpenAI APIが利用できないため、簡易版を表示しています）`
  }
}

export const openAIService = new OpenAIService()
