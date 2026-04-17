"use client"

import { useState, useMemo } from "react"
import { Property } from "@/types/property"
import { PropertyCard } from "@/components/PropertyCard"
import { PropertyFilters } from "@/components/PropertyFilters"
import { Search, FilterX } from "lucide-react"

interface PropertyListProps {
  initialProperties: Property[]
}

export function PropertyList({ initialProperties }: PropertyListProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000])
  const [bedrooms, setBedrooms] = useState<number[]>([])
  const [parking, setParking] = useState<number[]>([])
  const [neighborhood, setNeighborhood] = useState("all")
  const [city, setCity] = useState("all")
  const [search, setSearch] = useState("")

  const neighborhoods = useMemo(() => 
    Array.from(new Set(initialProperties.map(p => p.neighborhood).filter(Boolean))),
    [initialProperties]
  )

  const cities = useMemo(() => 
    Array.from(new Set(initialProperties.map(p => p.city).filter(Boolean))),
    [initialProperties]
  )

  const filteredProperties = useMemo(() => {
    return initialProperties.filter(p => {
      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1]
      const matchesBedrooms = bedrooms.length === 0 || bedrooms.some(num => {
        if (num === 4) return p.bedrooms >= 4
        return p.bedrooms === num
      })
      const matchesParking = parking.length === 0 || parking.some(num => {
        if (num === 3) return p.parking_spots >= 3
        return p.parking_spots === num
      })
      const matchesNeighborhood = neighborhood === "all" || p.neighborhood === neighborhood
      const matchesCity = city === "all" || p.city === city
      const matchesSearch = !search || 
        p.title.toLowerCase().includes(search.toLowerCase()) || 
        p.neighborhood.toLowerCase().includes(search.toLowerCase())

      return matchesPrice && matchesBedrooms && matchesParking && matchesNeighborhood && matchesCity && matchesSearch
    })
  }, [initialProperties, priceRange, bedrooms, parking, neighborhood, city, search])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-1">
        <PropertyFilters 
          priceRange={priceRange} 
          setPriceRange={setPriceRange}
          bedrooms={bedrooms} 
          setBedrooms={setBedrooms}
          parking={parking} 
          setParking={setParking}
          neighborhood={neighborhood} 
          setNeighborhood={setNeighborhood}
          city={city} 
          setCity={setCity}
          neighborhoods={neighborhoods}
          cities={cities}
        />
      </div>

      <div className="lg:col-span-3 space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por título ou bairro..."
            className="w-full h-14 pl-12 pr-4 bg-card border border-white/5 rounded-2xl focus:border-primary/50 transition-all outline-none text-lg shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filteredProperties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-card/20 rounded-3xl border border-dashed border-white/10">
            <FilterX className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-xl font-medium">Nenhum imóvel encontrado com esses filtros.</p>
            <button 
              onClick={() => {
                setPriceRange([0, 5000000])
                setBedrooms([])
                setParking([])
                setNeighborhood("all")
                setCity("all")
                setSearch("")
              }}
              className="mt-4 text-primary hover:underline font-bold"
            >
              Limpar todos os filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProperties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
