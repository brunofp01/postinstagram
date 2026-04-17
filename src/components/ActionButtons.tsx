"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, Download, Image as ImageIcon, Loader2 } from "lucide-react"
import JSZip from "jszip"
import { saveAs } from "file-saver" // I need to install file-saver or use a native alternative

interface ActionButtonsProps {
  propertyUrl: string
  title: string
  images: string[]
  coverImage?: string
}

export function ActionButtons({ propertyUrl, title, images, coverImage }: ActionButtonsProps) {
  const [downloading, setDownloading] = useState(false)

  const handleWhatsAppShare = () => {
    const text = `Encontrei este imóvel incrível, veja os detalhes: ${propertyUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  const downloadAllImages = async () => {
    setDownloading(true)
    try {
      const zip = new JSZip()
      const folder = zip.folder("fotos-imovel")
      
      const promises = images.map(async (url, idx) => {
        const response = await fetch(url)
        const blob = await response.blob()
        const extension = url.split('.').pop()?.split('?')[0] || 'jpg'
        folder?.file(`foto-${idx + 1}.${extension}`, blob)
      })

      await Promise.all(promises)
      const content = await zip.generateAsync({ type: "blob" })
      
      // Use URL.createObjectURL and a temporary link to download
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(content);
      downloadLink.download = `${title.slice(0, 20).replace(/\s+/g, '-')}-fotos.zip`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (error) {
      console.error("Error downloading images:", error)
      alert("Erro ao baixar fotos.")
    } finally {
      setDownloading(false)
    }
  }

  const downloadCover = async () => {
    if (!coverImage) return
    try {
      const response = await fetch(coverImage)
      const blob = await response.blob()
      const extension = coverImage.split('.').pop()?.split('?')[0] || 'jpg'
      
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = `capa-${title.slice(0, 20).replace(/\s+/g, '-')}.${extension}`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (error) {
      console.error("Error downloading cover:", error)
    }
  }

  return (
    <div className="flex flex-wrap gap-4">
      <Button 
        size="lg" 
        className="flex-1 min-w-[200px] h-14 text-lg font-bold gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white shadow-xl shadow-green-500/20"
        onClick={handleWhatsAppShare}
      >
        <MessageCircle className="w-6 h-6" />
        Compartilhar no WhatsApp
      </Button>

      <Button 
        size="lg" 
        variant="outline"
        className="flex-1 min-w-[200px] h-14 text-lg font-bold gap-3 glass-card border-white/10 hover:border-primary transition-all"
        onClick={downloadAllImages}
        disabled={downloading}
      >
        {downloading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <Download className="w-6 h-6" />
        )}
        Baixar Todas as Fotos
      </Button>

      {coverImage && (
        <Button 
          size="lg" 
          variant="outline"
          className="flex-1 min-w-[200px] h-14 text-lg font-bold gap-3 border-primary/50 text-primary hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/10"
          onClick={downloadCover}
        >
          <ImageIcon className="w-6 h-6" />
          Baixar Foto Capa
        </Button>
      )}
    </div>
  )
}
