"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/Navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Link as LinkIcon, 
  Loader2, 
  Sparkles, 
  Search, 
  Image as ImageIcon, 
  Type, 
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from "lucide-react"

type Step = 'IDLE' | 'SCRAPING' | 'IMAGE' | 'CAPTION' | 'SUCCESS' | 'ERROR'

export default function ImportPage() {
  const [url, setUrl] = useState("")
  const [step, setStep] = useState<Step>('IDLE')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleImport = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!url) return

    setStep('SCRAPING')
    setError(null)

    try {
      // Simulate real-time steps for better UX since the route does everything at once
      // Step 1: SCRAPING (Actually calls the API)
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao processar imóvel")
      }

      setStep('IMAGE')
      await new Promise(r => setTimeout(r, 1500)) // Visual pause for "Stopper" magic
      
      setStep('CAPTION')
      await new Promise(r => setTimeout(r, 1200)) // Visual pause for "Gemini" magic
      
      const property = await response.json()
      setStep('SUCCESS')
      
      setTimeout(() => {
        router.push(`/imovel/${property.id}`)
      }, 1000)

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      setStep('ERROR')
    }
  }

  const stepsInfo = [
    { id: 'SCRAPING', label: 'Extraindo dados do anúncio', icon: Search },
    { id: 'IMAGE', label: 'Aplicando Design Scroll Stopper', icon: ImageIcon },
    { id: 'CAPTION', label: 'IA Gerando Legenda e Hashtags', icon: Type },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-12 pb-24 max-w-4xl">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm tracking-wide uppercase border border-primary/20 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            Importação Inteligente
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
            Crie seu Post em <span className="text-primary italic">Segundos.</span>
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
            Cole o link do imóvel e deixe nossa IA fazer o trabalho pesado: extração, design de alta conversão e legendas magnéticas.
          </p>
        </div>

        <div className="glass-card p-8 md:p-12 border-white/5 relative overflow-hidden group">
          {/* Subtle background glow */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
          
          {step === 'IDLE' || step === 'ERROR' ? (
            <form onSubmit={handleImport} className="space-y-8">
              <div className="space-y-4">
                <Label htmlFor="url" className="text-lg font-bold flex items-center gap-2">
                  Link do Anúncio
                  <span className="text-xs font-normal text-muted-foreground">(Zap, OLX ou VivaReal)</span>
                </Label>
                <div className="relative group/input">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <LinkIcon className="w-6 h-6 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                  </div>
                  <Input 
                    id="url"
                    placeholder="https://www.zapimoveis.com.br/imovel/..."
                    className="h-16 pl-14 pr-4 bg-background/50 border-white/10 text-xl rounded-2xl focus:border-primary/50 transition-all shadow-inner"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-2 p-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 animate-shake">
                    <AlertCircle className="w-5 h-5" />
                    <p className="font-semibold">{error}</p>
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                size="lg" 
                disabled={!url || step === 'SCRAPING'}
                className="w-full h-16 text-xl font-black gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Gerar Conteúdo Agora
                <ExternalLink className="w-5 h-5" />
              </Button>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                  <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Passo 1</p>
                  <p className="font-bold">Colar URL</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                  <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Passo 2</p>
                  <p className="font-bold">IA Processa</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                  <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Passo 3</p>
                  <p className="font-bold">Instagram Live</p>
                </div>
              </div>
            </form>
          ) : (
            <div className="py-12 space-y-12">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                {step === 'SUCCESS' ? (
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center animate-bounce">
                    <CheckCircle2 className="w-12 h-12 text-primary" />
                  </div>
                ) : (
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                    </div>
                  </div>
                )}
                
                <h2 className="text-3xl font-bold">
                  {step === 'SUCCESS' ? "Imóvel Processado!" : "Criando sua Obra-prima..."}
                </h2>
                <p className="text-muted-foreground text-lg">
                  {step === 'SCRAPING' && "Iniciando captura de dados e fotos de alta resolução..."}
                  {step === 'IMAGE' && "Aplicando design estratégico para reter a atenção do usuário..."}
                  {step === 'CAPTION' && "A IA está escrevendo uma legenda que vende para você..."}
                  {step === 'SUCCESS' && "Tudo pronto! Redirecionando para o seu novo post..."}
                </p>
              </div>

              <div className="space-y-6 max-w-sm mx-auto">
                {stepsInfo.map((s, idx) => {
                  const isActive = step === s.id
                  const isDone = stepsInfo.findIndex(si => si.id === step) > idx || step === 'SUCCESS'
                  
                  const Icon = s.icon
                  return (
                    <div key={s.id} className={`flex items-center gap-4 transition-all duration-500 ${isActive ? 'scale-105' : isDone ? 'opacity-100' : 'opacity-30'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isDone ? 'bg-primary border-primary text-white' : isActive ? 'border-primary text-primary animate-pulse' : 'border-white/10 text-muted-foreground'}`}>
                        {isDone ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                      </div>
                      <span className={`font-bold ${isActive ? 'text-primary' : ''}`}>{s.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground font-medium mb-8 uppercase tracking-widest text-xs">Portais Suportados Atualmente</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
            <span className="text-2xl font-black italic">ZAP</span>
            <span className="text-2xl font-black">VivaReal</span>
            <span className="text-2xl font-black">OLX</span>
          </div>
        </div>
      </main>
    </div>
  )
}
