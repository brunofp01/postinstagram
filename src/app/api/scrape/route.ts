import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { scrapeProperty } from '@/lib/scraper';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const scrapedData = await scrapeProperty(url);
    
    // Upload images to Supabase Storage
    const uploadedImages: string[] = [];
    const adminSupabase = createAdminClient();

    for (const imageUrl of scrapedData.imageUrls.slice(0, 15)) { // Limit to 15 images
      try {
        const response = await fetch(imageUrl);
        const buffer = await response.arrayBuffer();
        const fileExt = imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
        const fileName = `${user.id}/${uuidv4()}.${fileExt}`;

        const { data, error } = await adminSupabase.storage
          .from('property-images')
          .upload(fileName, buffer, {
            contentType: `image/${fileExt}`,
            upsert: true
          });

        if (error) throw error;

        const { data: { publicUrl } } = adminSupabase.storage
          .from('property-images')
          .getPublicUrl(fileName);

        uploadedImages.push(publicUrl);
      } catch (err) {
        console.error('Error uploading image:', err);
      }
    }

    // Save to database
    const { data: property, error: dbError } = await adminSupabase
      .from('properties')
      .insert({
        user_id: user.id,
        source_url: url,
        title: scrapedData.title,
        neighborhood: scrapedData.neighborhood,
        city: scrapedData.city,
        price: scrapedData.price,
        bedrooms: scrapedData.bedrooms,
        bathrooms: scrapedData.bathrooms,
        parking_spots: scrapedData.parking_spots,
        area_m2: scrapedData.area_m2,
        description: scrapedData.description,
        images: uploadedImages,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // Trigger image processing and caption generation
    try {
      if (property.images && property.images.length > 0) {
        const { processScrollStopper } = await import('@/lib/image-processor');
        await processScrollStopper({
          propertyId: property.id,
          imageUrl: property.images[0],
          neighborhood: property.neighborhood,
          price: property.price,
          bedrooms: property.bedrooms,
          parking_spots: property.parking_spots,
          userId: user.id,
        });
      }

      const { generateInstagramCaption } = await import('@/lib/gemini');
      await generateInstagramCaption(property.id);
    } catch (err) {
      console.error('Error in post-scrape processing:', err);
      // We don't fail the whole request because the property was already saved
    }
    
    return NextResponse.json(property);
  } catch (error: any) {
    console.error('Scrape error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
