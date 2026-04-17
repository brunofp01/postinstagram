import { GoogleGenerativeAI } from "@google/generative-ai";
import { createAdminClient } from "./supabase/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateInstagramCaption(propertyId: string) {
  const adminSupabase = createAdminClient();
  
  const { data: property, error } = await adminSupabase
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .single();

  if (error || !property) {
    throw new Error('Property not found');
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Atue como um redator imobiliário experiente e especialista em Instagram.
    Gere uma descrição atraente e persuasiva para o seguinte imóvel:
    
    Título: ${property.title}
    Bairro: ${property.neighborhood}
    Cidade: ${property.city}
    Preço: R$ ${property.price}
    Quartos: ${property.bedrooms}
    Banheiros: ${property.bathrooms}
    Vagas: ${property.parking_spots}
    Área: ${property.area_m2}m²
    Descrição Original: ${property.description}

    Regras para a descrição:
    1. Inicie sempre com o formato "Bairro: Tipo de Xm² e Y quartos à venda" (Exemplo: Sion: Apartamento de 150m² e 3 quartos à venda).
    2. Tenha entre 5 a 8 linhas.
    3. Use emojis estratégicos no início de cada linha.
    4. Tom persuasivo, elegante e focado em benefícios.
    5. Mencione o bairro, diferenciais e o valor formatado.
    6. Chamada para ação final: "Chame no WhatsApp (31) 97336-2545".

    Além da descrição, gere um bloco com 30 hashtags relevantes em português, incluindo:
    - Bairro e cidade citados no imóvel.
    - Tipo do imóvel.
    - Hashtags gerais de mercado imobiliário (ex: #imoveis #casapropria #corretorimobiliario).

    Retorne a resposta no seguinte formato JSON (apenas o JSON):
    {
      "caption": "texto da descrição aqui",
      "hashtags": "#hashtag1 #hashtag2 ..."
    }
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  // Clean potential Markdown JSON blocks
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Could not parse Gemini response");
  
  const parsed = JSON.parse(jsonMatch[0]);

  // Update property record
  const { error: updateError } = await adminSupabase
    .from('properties')
    .update({ 
      instagram_caption: parsed.caption,
      hashtags: parsed.hashtags
    })
    .eq('id', propertyId);

  if (updateError) throw updateError;

  return parsed;
}
