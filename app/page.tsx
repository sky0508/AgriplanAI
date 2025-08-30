"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sprout, Users } from "lucide-react"
import Link from "next/link"

interface UserTypeCardProps {
  icon: React.ReactNode
  title: string
  subtitle: string
  features: string[]
  ctaText: string
  ctaColor: "sprout-green" | "harvest-yellow"
  href: string
}

const UserTypeCard = ({ icon, title, subtitle, features, ctaText, ctaColor, href }: UserTypeCardProps) => (
  <Card className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border-0 hover:shadow-xl transition-all hover:-translate-y-2 p-2">
    <CardHeader className="text-center pb-6">
      <div className="w-20 h-20 bg-gradient-to-br from-white to-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
        {icon}
      </div>
      <CardTitle className="text-2xl font-bold text-charcoal mb-3">{title}</CardTitle>
      <CardDescription className="text-soil-brown text-lg">{subtitle}</CardDescription>
    </CardHeader>

    <CardContent className="space-y-6">
      <div>
        <h4 className="font-semibold text-charcoal mb-4 text-lg">主な機能：</h4>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3 text-soil-brown">
              <span className="text-sprout-green text-lg">✓</span>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <Link href={href}>
        <Button
          className={`w-full py-4 px-6 rounded-2xl font-semibold text-white transition-all hover:scale-105 text-lg ${
            ctaColor === "sprout-green"
              ? "bg-sprout-green hover:bg-sprout-green/90 shadow-lg"
              : "bg-harvest-yellow hover:bg-harvest-yellow/90 shadow-lg"
          }`}
        >
          {ctaText}
        </Button>
      </Link>
    </CardContent>
  </Card>
)

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-6">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-12 bg-sprout-green rounded-2xl flex items-center justify-center shadow-lg">
              <Sprout className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-charcoal">農業収支管理AI</h1>
              <p className="text-sm text-soil-brown">Agricultural Financial Management</p>
            </div>
          </div>
          <h2 className="text-5xl font-bold text-charcoal mb-6 text-balance">農業収支管理を始めましょう</h2>
          <p className="text-xl text-soil-brown text-pretty">あなたの状況に合わせて最適な機能をご提供します</p>
        </div>

        {/* User Type Selection Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <UserTypeCard
            icon={<Users className="w-10 h-10 text-sprout-green" />}
            title="既存農家の方"
            subtitle="すでに農業を営んでいる方"
            features={["収支予測・分析", "日々の記録管理", "ダッシュボード", "品目別収支分析"]}
            ctaText="農家ホームへ"
            ctaColor="sprout-green"
            href="/existing-farmer"
          />

          <UserTypeCard
            icon={<Sprout className="w-10 h-10 text-harvest-yellow" />}
            title="新規就農者の方"
            subtitle="これから農業を始める方"
            features={["就農計画書作成", "5年収支計画", "設備投資計画", "PDF出力"]}
            ctaText="就農計画を作成"
            ctaColor="harvest-yellow"
            href="/new-farmer"
          />
        </div>

        {/* Footer */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-sprout-green rounded-xl flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-charcoal">農業収支管理AI</span>
          </div>
          <p className="text-sm text-soil-brown">© 2024 農業収支管理AI. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
