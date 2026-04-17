import Link from "next/link"
import Image from "next/image"
import { Property } from "@/types/property"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bed, Car, Bath, Maximize, MapPin } from "lucide-react"
import { formatCurrency, formatArea } from "@/lib/utils"

interface PropertyCardProps {
  property: Property
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Link href={`/imovel/${property.id}`}>
      <Card className="group overflow-hidden glass-card border-white/5 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10">
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={property.cover_image_url || property.images[0] || "/placeholder-house.jpg"}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
          
          <div className="absolute top-4 right-4">
            <Badge className="bg-primary/90 text-white font-bold px-3 py-1 text-base backdrop-blur-sm border-none shadow-lg">
              {formatCurrency(property.price)}
            </Badge>
          </div>

          <div className="absolute bottom-4 left-4 right-4 text-white">
             <div className="flex items-center gap-1 text-xs font-semibold mb-1 text-primary">
               <MapPin className="w-3 h-3" />
               {property.neighborhood}
             </div>
             <h3 className="font-bold text-lg leading-tight line-clamp-2 drop-shadow-md">
               {property.title}
             </h3>
          </div>
        </div>
        <CardContent className="p-4 bg-muted/30 backdrop-blur-sm">
          <div className="grid grid-cols-2 gap-y-3 gap-x-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center border border-white/5">
                <Bed className="w-4 h-4 text-primary" />
              </div>
              <span className="font-medium text-foreground">{property.bedrooms} qts</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center border border-white/5">
                <Car className="w-4 h-4 text-primary" />
              </div>
              <span className="font-medium text-foreground">{property.parking_spots} vagas</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center border border-white/5">
                <Bath className="w-4 h-4 text-primary" />
              </div>
              <span className="font-medium text-foreground">{property.bathrooms} banheiros</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center border border-white/5">
                <Maximize className="w-4 h-4 text-primary" />
              </div>
              <span className="font-medium text-foreground">{formatArea(property.area_m2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
