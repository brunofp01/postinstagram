import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/layout/Navbar"
import { ImageGallery } from "@/components/ImageGallery"
import { InstagramCaption } from "@/components/InstagramCaption"
import { ActionButtons } from "@/components/ActionButtons"
import { Badge } from "@/components/ui/badge"
import { Bed, Car, Bath, Maximize, MapPin, Calendar, ExternalLink } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export default async function PropertyPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  
  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!property) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column: Media */}
          <div className="space-y-8">
            <ImageGallery 
              images={property.images} 
              coverImage={property.cover_image_url} 
            />
          </div>

          {/* Right Column: Info & Tools */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary font-bold tracking-wider uppercase text-sm">
                <MapPin className="w-4 h-4" />
                {property.neighborhood}, {property.city}
              </div>
              <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tighter">
                {property.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div className="text-3xl font-bold text-primary">
                  {formatCurrency(property.price)}
                </div>
                <Badge variant="outline" className="text-muted-foreground border-white/10 uppercase tracking-widest px-3 py-1">
                  Venda
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-card/40 rounded-3xl border border-white/5 backdrop-blur-sm">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Quartos</span>
                <div className="flex items-center gap-2 text-xl font-bold">
                  <Bed className="w-5 h-5 text-primary" />
                  {property.bedrooms}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Vagas</span>
                <div className="flex items-center gap-2 text-xl font-bold">
                  <Car className="w-5 h-5 text-primary" />
                  {property.parking_spots}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Banheiros</span>
                <div className="flex items-center gap-2 text-xl font-bold">
                  <Bath className="w-5 h-5 text-primary" />
                  {property.bathrooms}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Área</span>
                <div className="flex items-center gap-2 text-xl font-bold">
                  <Maximize className="w-5 h-5 text-primary" />
                  {property.area_m2}m²
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                 Ações Disponíveis
              </h2>
              <ActionButtons 
                propertyUrl={`${process.env.NEXT_PUBLIC_APP_URL}/imovel/${property.id}`}
                title={property.title}
                images={property.images}
                coverImage={property.cover_image_url}
              />
            </div>

            <div className="pt-4">
              <InstagramCaption 
                initialCaption={property.instagram_caption || ""} 
                hashtags={property.hashtags || ""} 
              />
            </div>

            <div className="pt-8 border-t border-white/5">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Importado em {new Date(property.created_at).toLocaleDateString('pt-BR')}
                </div>
                <a 
                  href={property.source_url} 
                  target="_blank" 
                  className="flex items-center gap-2 text-primary hover:underline font-medium"
                >
                  Anúncio Original
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
