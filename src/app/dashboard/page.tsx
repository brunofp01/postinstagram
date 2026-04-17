import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/layout/Navbar"
import { PropertyList } from "./PropertyList"
import { ImportDialog } from "@/components/ImportDialog"
import { Sparkles } from "lucide-react"

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black flex items-center gap-3 tracking-tighter">
              Seus Imóveis
              <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              Gerencie seus anúncios e gere conteúdos de alto impacto para o Instagram.
            </p>
          </div>
          <ImportDialog />
        </div>

        <PropertyList initialProperties={properties || []} />
      </main>
    </div>
  )
}
