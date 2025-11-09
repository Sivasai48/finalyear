"use client"

import { useLanguage } from "@/context/language-context"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-gray-600" />
      <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1">
        <Button
          size="sm"
          variant={language === "en" ? "default" : "ghost"}
          onClick={() => setLanguage("en")}
          className="px-2 text-xs"
        >
          English
        </Button>
        <Button
          size="sm"
          variant={language === "te" ? "default" : "ghost"}
          onClick={() => setLanguage("te")}
          className="px-2 text-xs"
        >
          తెలుగు
        </Button>
        <Button
          size="sm"
          variant={language === "hi" ? "default" : "ghost"}
          onClick={() => setLanguage("hi")}
          className="px-2 text-xs"
        >
          हिंदी
        </Button>
      </div>
    </div>
  )
}
