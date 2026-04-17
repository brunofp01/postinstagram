"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Link as LinkIcon, Loader2, Sparkles } from "lucide-react"

export function ImportDialog() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleImport = async () => {
    if (!url) return
    setLoading(true)

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao importar imóvel")
      }

      const property = await response.json()
      setOpen(false)
      setUrl("")
      router.refresh()
      router.push(`/imovel/${property.id}`)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro desconhecido"
      alert(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-300 transform hover:scale-105">
          <Plus className="w-4 h-4" />
          Importar Imóvel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] glass-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            Nova Importação
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-lg">
            Cole o link do anúncio (ZAP, OLX ou VivaReal) para gerar automaticamente o post de alto impacto.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-3">
            <Label htmlFor="url" className="text-base font-semibold">URL do Anúncio</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                id="url"
                placeholder="https://www.zapimoveis.com.br/imovel/..."
                className="pl-10 h-12 bg-background/50 border-white/10 focus:border-primary/50 transition-all"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
            <p className="text-sm text-primary/80 leading-relaxed italic">
              &quot;Nosso sistema fará o scraping dos dados, aplicará o design scroll stopper na capa e gerará a legenda persuasiva com IA.&quot;
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleImport} 
            disabled={loading || !url} 
            className="w-full h-12 text-lg font-bold transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processando...
              </>
            ) : (
              "Importar e Gerar Post"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
