"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react"

interface ImageGalleryProps {
  images: string[]
  coverImage?: string
}

export function ImageGallery({ images, coverImage }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // Use all images, prioritizing cover if available
  const allImages = [...images]
  if (coverImage && !allImages.includes(coverImage)) {
    allImages.unshift(coverImage)
  }

  return (
    <div className="space-y-4">
      {/* Featured Image */}
      {coverImage && (
        <div className="relative aspect-[4/5] md:aspect-video rounded-3xl overflow-hidden shadow-2xl group cursor-pointer" onClick={() => setSelectedImage(coverImage)}>
          <Image
            src={coverImage}
            alt="Capa Processada"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
             <Maximize2 className="w-12 h-12 text-white" />
          </div>
          <div className="absolute bottom-6 left-6 bg-primary text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
            Capa Scroll Stopper
          </div>
        </div>
      )}

      {/* Grid of other images */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img, idx) => (
          <div 
            key={idx} 
            className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group hover:ring-2 ring-primary transition-all"
            onClick={() => setSelectedImage(img)}
          >
            <Image
              src={img}
              alt={`Foto ${idx + 1}`}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>
        ))}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl bg-transparent border-none p-0 flex items-center justify-center h-[90vh]">
          {selectedImage && (
            <div className="relative w-full h-full">
              <Image
                src={selectedImage}
                alt="Enlarged view"
                fill
                className="object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
