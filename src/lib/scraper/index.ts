import * as cheerio from 'cheerio';
import { ScrapedProperty } from '@/types/property';

export async function scrapeProperty(url: string): Promise<ScrapedProperty> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  if (url.includes('zapimoveis.com.br') || url.includes('vivareal.com.br')) {
    return parseZapVivaReal($);
  } else if (url.includes('olx.com.br')) {
    return parseOlx($);
  } else if (url.includes('vitrine.quintoandar.com.br')) {
    return parseQuintoAndarVitrine($, url);
  } else {
    throw new Error('Website not supported yet.');
  }
}

function parseQuintoAndarVitrine($: cheerio.CheerioAPI, url: string): ScrapedProperty {
  const nextData = $('#__NEXT_DATA__').html();
  if (!nextData) throw new Error('Could not find __NEXT_DATA__ in QuintoAndar');

  const data = JSON.parse(nextData);
  const pageProps = data.props.pageProps;
  
  // Try to find the house ID from URL
  const houseIdMatch = url.match(/\/v2\/(\d+)\//);
  const houseId = houseIdMatch ? houseIdMatch[1] : null;

  // New discovery: QuintoAndar Vitrine often puts the main data in initialState.listing
  // or inside houses[id] if it's a normalized store.
  const listing = pageProps.initialState?.listing || pageProps.listing || pageProps.listingData;
  const houseFromStore = houseId && pageProps.initialState?.houses ? pageProps.initialState.houses[houseId] : null;
  
  const house = houseFromStore || listing || pageProps.house;

  if (!house) throw new Error('Could not find house data in QuintoAndar JSON');

  // QuintoAndar Vitrine specific mappings
  const address = house.address || {};
  
  return {
    title: house.title || house.subject || house.summary || '',
    neighborhood: address.neighborhood || house.neighborhood || '',
    city: address.city || house.city || '',
    price: house.salePrice || house.price || house.totalCost || 0,
    bedrooms: house.bedrooms || 0,
    bathrooms: house.bathrooms || 0,
    parking_spots: house.parkingSpaces || house.parking_spots || 0,
    area_m2: house.usableArea || house.area || 0,
    description: house.description || '',
    imageUrls: (house.photos || house.images || [])
      .map((img: any) => {
        // High res QuintoAndar photos usually have a specific URL pattern or are full URLs
        if (typeof img === 'string') return img;
        return img.url || img.original || img.src || img.placeholder;
      })
      .filter(Boolean),
  };
}

function parseZapVivaReal($: cheerio.CheerioAPI): ScrapedProperty {
  const nextData = $('#__NEXT_DATA__').html();
  if (!nextData) throw new Error('Could not find __NEXT_DATA__ in ZAP/VivaReal');

  const data = JSON.parse(nextData);
  const listing = data.props.pageProps.listing || data.props.pageProps.initialState?.listing?.listing;

  if (!listing) throw new Error('Could not find listing data in __NEXT_DATA__');

  return {
    title: listing.title || '',
    neighborhood: listing.address?.neighborhood || '',
    city: listing.address?.city || '',
    price: listing.pricingInfos?.[0]?.price || 0,
    bedrooms: listing.bedrooms?.[0] || 0,
    bathrooms: listing.bathrooms?.[0] || 0,
    parking_spots: listing.parkingSpaces?.[0] || 0,
    area_m2: listing.usableAreas?.[0] || 0,
    description: listing.description || '',
    imageUrls: listing.images?.map((img: { url: string }) => img.url) || [],
  };
}

function parseOlx($: cheerio.CheerioAPI): ScrapedProperty {
  // OLX often embeds data in a script tag as well
  const adDataScript = $('script[id="initial-data"]').attr('data-json');
  if (adDataScript) {
    const data = JSON.parse(adDataScript);
    const ad = data.ad;
    
    return {
      title: ad.subject || '',
      neighborhood: ad.properties?.find((p: { name: string, value: string }) => p.name === 'neighborhood')?.value || '',
      city: ad.location?.municipality || '',
      price: parseFloat(ad.priceValue?.replace(/[^\d]/g, '') || '0'),
      bedrooms: parseInt(ad.properties?.find((p: { name: string, value: string }) => p.name === 'rooms')?.value || '0'),
      bathrooms: parseInt(ad.properties?.find((p: { name: string, value: string }) => p.name === 'bathrooms')?.value || '0'),
      parking_spots: parseInt(ad.properties?.find((p: { name: string, value: string }) => p.name === 'garage_spaces')?.value || '0'),
      area_m2: parseInt(ad.properties?.find((p: { name: string, value: string }) => p.name === 'size')?.value || '0'),
      description: ad.body || '',
      imageUrls: ad.images?.map((img: { original: string }) => img.original) || [],
    };
  }

  // Fallback to HTML selectors if script not found
  return {
    title: $('h1').text().trim(),
    neighborhood: $('span:contains("Bairro")').next().text().trim(),
    city: $('span:contains("Município")').next().text().trim(),
    price: parseFloat($('h2:contains("R$")').text().replace(/[^\d]/g, '') || '0'),
    bedrooms: 0, // Harder to parse via selectors as they vary
    bathrooms: 0,
    parking_spots: 0,
    area_m2: 0,
    description: $('span:contains("Descrição")').next().text().trim(),
    imageUrls: [],
  };
}
