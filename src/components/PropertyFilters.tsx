"use client"

 

import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"

interface PropertyFiltersProps {
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  bedrooms: number[];
  setBedrooms: (beds: number[]) => void;
  parking: number[];
  setParking: (spaces: number[]) => void;
  neighborhood: string;
  setNeighborhood: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  neighborhoods: string[];
  cities: string[];
}

export function PropertyFilters(props: PropertyFiltersProps) {
  const {
    priceRange, setPriceRange,
    bedrooms, setBedrooms,
    parking, setParking,
    neighborhood, setNeighborhood,
    city, setCity,
    neighborhoods, cities
  } = props

  const toggleFilter = (list: number[], set: (l: number[]) => void, value: number) => {
    if (list.includes(value)) {
      set(list.filter(v => v !== value))
    } else {
      set([...list, value])
    }
  }

  return (
    <aside className="space-y-8 glass-card p-6 h-fit sticky top-24">
      <div className="space-y-4">
        <h3 className="font-bold text-lg border-b border-primary/20 pb-2">Preço</h3>
        <div className="space-y-6 pt-2">
          <Slider
            min={0}
            max={5000000}
            step={50000}
            value={priceRange}
            onValueChange={(val) => setPriceRange(val as [number, number])}
            className="text-primary"
          />
          <div className="flex justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <span>Min: {formatCurrency(priceRange[0])}</span>
            <span>Max: {formatCurrency(priceRange[1])}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-lg border-b border-primary/20 pb-2">Cidade</h3>
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger className="w-full bg-background/50">
            <SelectValue placeholder="Selecione a cidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as cidades</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-lg border-b border-primary/20 pb-2">Bairro</h3>
        <Select value={neighborhood} onValueChange={setNeighborhood}>
          <SelectTrigger className="w-full bg-background/50">
            <SelectValue placeholder="Selecione o bairro" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os bairros</SelectItem>
            {neighborhoods.map((n) => (
              <SelectItem key={n} value={n}>{n}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-lg border-b border-primary/20 pb-2">Dormitórios</h3>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="flex items-center space-x-2">
              <Checkbox 
                id={`bed-${num}`} 
                checked={bedrooms.includes(num)} 
                onCheckedChange={() => toggleFilter(bedrooms, setBedrooms, num)}
              />
              <Label htmlFor={`bed-${num}`} className="text-sm cursor-pointer">{num === 4 ? "4+" : num} {num === 1 ? "Quarto" : "Quartos"}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-lg border-b border-primary/20 pb-2">Vagas</h3>
        <div className="grid grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((num) => (
            <div key={num} className="flex items-center space-x-2">
              <Checkbox 
                id={`car-${num}`} 
                checked={parking.includes(num)} 
                onCheckedChange={() => toggleFilter(parking, setParking, num)}
              />
              <Label htmlFor={`car-${num}`} className="text-sm cursor-pointer">{num === 3 ? "3+" : num} {num === 1 ? "Vaga" : "Vagas"}</Label>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
