import sharp from 'sharp';
import { createAdminClient } from './supabase/server';

interface ProcessOptions {
  propertyId: string;
  imageUrl: string;
  neighborhood: string;
  price: number;
  bedrooms: number;
  parking_spots: number;
  userId: string;
}

export async function processScrollStopper(options: ProcessOptions) {
  const { propertyId, imageUrl, neighborhood, price, bedrooms, parking_spots, userId } = options;

  // Fetch the image
  const response = await fetch(imageUrl);
  const buffer = await response.arrayBuffer();
  const image = sharp(Buffer.from(buffer));
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error('Could not get image metadata');
  }

  const { width, height } = metadata;

  // Instagram Safe Zone (10% margins)
  const safeXStart = width * 0.1;
  const safeXEnd = width * 0.9;
  const safeYStart = height * 0.1;
  const safeYEnd = height * 0.9;

  // Proportional font sizes based on image width
  const titleFontSize = Math.round(width * 0.05); // ~72px for 1440px wide
  const detailFontSize = Math.round(width * 0.025); // ~36px for 1440px wide
  const badgeFontSize = Math.round(width * 0.035); // ~50px for 1440px wide
  const iconSize = Math.round(width * 0.03);

  // Formatting price
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(price);

  // SVG Overlay
  const svgOverlay = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bottomGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="black" stop-opacity="0" />
          <stop offset="100%" stop-color="black" stop-opacity="0.85" />
        </linearGradient>
      </defs>

      <!-- Bottom Gradient Band (35% height) -->
      <rect x="0" y="${height * 0.65}" width="${width}" height="${height * 0.35}" fill="url(#bottomGradient)" />

      <!-- Price Badge (Upper Right of Safe Zone) -->
      <g transform="translate(${safeXEnd - (formattedPrice.length * badgeFontSize * 0.6 + width * 0.04)}, ${safeYStart})">
        <rect 
          width="${formattedPrice.length * badgeFontSize * 0.6 + width * 0.04}" 
          height="${badgeFontSize * 1.5}" 
          rx="${width * 0.01}" 
          fill="#00C49A" 
        />
        <text 
          x="${(formattedPrice.length * badgeFontSize * 0.6 + width * 0.04) / 2}" 
          y="${badgeFontSize * 1.0}" 
          font-family="Arial, sans-serif" 
          font-size="${badgeFontSize}" 
          font-weight="bold" 
          fill="white" 
          text-anchor="middle"
        >${formattedPrice}</text>
      </g>

      <!-- Neighborhood Title (Bottom Center of Safe Zone) -->
      <text 
        x="${width / 2}" 
        y="${safeYEnd - height * 0.05}" 
        font-family="Arial, sans-serif" 
        font-size="${titleFontSize}" 
        font-weight="bold" 
        fill="white" 
        text-anchor="middle"
        style="text-transform: uppercase; letter-spacing: 0.1em; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));"
      >${neighborhood}</text>

      <!-- Details Line (Above Title) -->
      <g transform="translate(${width / 2}, ${safeYEnd - height * 0.12})" text-anchor="middle">
        <!-- Bed Icon -->
        <g transform="translate(${-width * 0.1}, 0)">
           <path d="M7 8V5c0-1.1.9-2 2-2h6a2 2 0 0 1 2 2v3m-9 5h10a2 2 0 0 1 2 2v2m-14 0v-2a2 2 0 0 1 2-2h2m2 0h6m-10 4v2m10-2v2" 
                 fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="scale(${iconSize / 24}) translate(-12, -12)" />
           <text x="${iconSize}" y="${iconSize / 4}" font-family="Arial" font-size="${detailFontSize}" fill="white" fill-opacity="0.9">${bedrooms} Quartos</text>
        </g>
        
        <!-- separator -->
        <text x="0" y="${iconSize / 4}" font-family="Arial" font-size="${detailFontSize}" fill="white" fill-opacity="0.5">|</text>

        <!-- Car Icon -->
        <g transform="translate(${width * 0.1}, 0)">
           <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A2 2 0 0 0 2 12v4c0 .6.4 1 1 1h2m10 0h4" 
                 fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="scale(${iconSize / 24}) translate(-12, -12)" />
           <text x="${iconSize}" y="${iconSize / 4}" font-family="Arial" font-size="${detailFontSize}" fill="white" fill-opacity="0.9">${parking_spots} Vagas</text>
        </g>
      </g>

      <!-- Watermark (Bottom Right of Safe Zone) -->
      <text 
        x="${safeXEnd}" 
        y="${safeYEnd}" 
        font-family="Arial, sans-serif" 
        font-size="${Math.round(detailFontSize * 0.8)}" 
        fill="white" 
        fill-opacity="0.5" 
        text-anchor="end"
      >@PostInstagram</text>
    </svg>
  `;

  const processedBuffer = await image
    .composite([{
      input: Buffer.from(svgOverlay),
      top: 0,
      left: 0,
    }])
    .toBuffer();

  // Upload to Supabase
  const adminSupabase = createAdminClient();
  const fileExt = imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
  const fileName = `${userId}/${propertyId}_cover.${fileExt}`;

  const { error: uploadError } = await adminSupabase.storage
    .from('property-images')
    .upload(fileName, processedBuffer, {
      contentType: `image/${fileExt}`,
      upsert: true
    });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = adminSupabase.storage
    .from('property-images')
    .getPublicUrl(fileName);

  // Update property record
  const { error: updateError } = await adminSupabase
    .from('properties')
    .update({ cover_image_url: publicUrl })
    .eq('id', propertyId);

  if (updateError) throw updateError;

  return publicUrl;
}
