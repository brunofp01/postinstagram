"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Check, Sparkles, Hash } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface InstagramCaptionProps {
  initialCaption: string
  hashtags: string
}

export function InstagramCaption({ initialCaption, hashtags }: InstagramCaptionProps) {
  const [caption, setCaption] = useState(initialCaption)
  const [copiedCaption, setCopiedCaption] = useState(false)
  const [copiedHashtags, setCopiedHashtags] = useState(false)

  const copyToClipboard = async (text: string, setCopied: (v: boolean) => void) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card border-primary/20 bg-primary/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Legenda para o Instagram
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 border-primary/50 text-primary hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/10"
            onClick={() => copyToClipboard(caption, setCopiedCaption)}
          >
            {copiedCaption ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copiedCaption ? "Copiado!" : "Copiar Legenda"}
          </Button>
        </CardHeader>
        <CardContent>
          <Textarea 
            value={caption} 
            onChange={(e) => setCaption(e.target.value)}
            className="min-h-[300px] bg-background/50 border-white/5 focus:border-primary/30 text-base leading-relaxed resize-none"
          />
        </CardContent>
      </Card>

      <Card className="glass-card border-white/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Hash className="w-5 h-5 text-primary" />
            Hashtags Estratégicas
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 text-muted-foreground hover:text-primary transition-all"
            onClick={() => copyToClipboard(hashtags, setCopiedHashtags)}
          >
            {copiedHashtags ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copiedHashtags ? "Copiado!" : "Copiar Hashtags"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 p-4 rounded-xl text-sm text-muted-foreground leading-relaxed">
            {hashtags}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
