// AI-Powered Content Generator met OpenAI (via fetch)

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'sk-test-dummy';

interface AIContentRequest {
  branche: string;
  contentType: 'marktanalyse' | 'tips' | 'trends' | 'subsidie-update' | 'prijsanalyse';
  actueleData?: string[];
  targetKeywords: string[];
}

// AI Content Generator
export async function generateAIContent(request: AIContentRequest): Promise<{
  title: string;
  content: string;
  metaDescription: string;
  slug: string;
}> {
  try {
    const { branche, contentType, actueleData = [], targetKeywords } = request;
    
    // Maak geoptimaliseerde prompt
    const prompt = createOptimizedPrompt(branche, contentType, actueleData, targetKeywords);
    
    // Genereer content met OpenAI via fetch
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Je bent een expert content writer voor WarmeLeads, een Nederlandse leadgeneratie specialist. 
            Je schrijft SEO-geoptimaliseerde blog artikelen die converteren naar leads. 
            Schrijf altijd in het Nederlands, gebruik actuele data, en focus op praktische waarde voor de lezer.
            Voeg altijd een sterke call-to-action toe die linkt naar relevante lead pages.`
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const completion = await response.json();
    const aiContent = completion.choices[0]?.message?.content || '';
    
    // Parseer AI response
    const parsedContent = parseAIResponse(aiContent, branche);
    
    return parsedContent;

  } catch (error) {
    console.error('OpenAI content generation failed:', error);
    
    // Fallback naar template content
    return generateFallbackContent(request);
  }
}

// Geoptimaliseerde AI prompt
function createOptimizedPrompt(
  branche: string, 
  contentType: string, 
  actueleData: string[], 
  targetKeywords: string[]
): string {
  const currentDate = new Date().toLocaleDateString('nl-NL');
  const currentMonth = new Date().toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' });
  
  return `
Schrijf een SEO-geoptimaliseerd blog artikel voor WarmeLeads over ${branche} in Nederland.

ARTIKEL TYPE: ${contentType}
DOELGROEP: ${branche} installateurs en bedrijven in Nederland
DATUM: ${currentDate}
TARGET KEYWORDS: ${targetKeywords.join(', ')}

ACTUELE MARKTDATA:
${actueleData.map(data => `- ${data}`).join('\n')}

VEREISTEN:
1. Titel: SEO-geoptimaliseerd met hoofdkeyword
2. Inleiding: Hook die direct waarde belooft  
3. Hoofdcontent: 3-4 secties met praktische waarde
4. Actuele data: Verwerk de marktdata natuurlijk in de tekst
5. Expert tips: Concrete, implementeerbare adviezen
6. CTA: Sterke call-to-action naar WarmeLeads ${branche} leads
7. SEO: Gebruik keywords natuurlijk door de tekst
8. Lengte: 800-1200 woorden
9. Toon: Professioneel maar toegankelijk
10. Focus: Conversie naar leads, niet alleen informatie

STRUCTUUR:
# [SEO Titel]
## Inleiding met hook
## Hoofdpunt 1 (met actuele data)
## Hoofdpunt 2 (expert tips)
## Hoofdpunt 3 (praktische implementatie)
## WarmeLeads perspectief
## Conclusie met sterke CTA

Maak het artikel waardevol, actueel en conversie-gericht!
`;
}

// Parseer AI response
function parseAIResponse(aiContent: string, branche: string): {
  title: string;
  content: string;
  metaDescription: string;
  slug: string;
} {
  // Extract title (eerste # regel)
  const titleMatch = aiContent.match(/^#\s*(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : `${branche.charAt(0).toUpperCase() + branche.slice(1)} Update`;
  
  // Maak slug van title
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 60);
  
  // Extract eerste paragraaf voor meta description
  const paragraphs = aiContent.split('\n\n');
  const firstParagraph = paragraphs.find(p => p.length > 50 && !p.startsWith('#'));
  const metaDescription = firstParagraph 
    ? firstParagraph.substring(0, 155) + '...'
    : `Expert inzichten over ${branche} in Nederland. Actuele trends, tips en strategieën voor professionals.`;

  return {
    title,
    content: aiContent,
    metaDescription,
    slug: `${slug}-${Date.now()}`
  };
}

// Fallback content generator
function generateFallbackContent(request: AIContentRequest): {
  title: string;
  content: string;
  metaDescription: string;
  slug: string;
} {
  const { branche, contentType } = request;
  const currentDate = new Date().toLocaleDateString('nl-NL');
  
  return {
    title: `${branche.charAt(0).toUpperCase() + branche.slice(1)} Update ${currentDate}`,
    content: `# ${branche.charAt(0).toUpperCase() + branche.slice(1)} Update ${currentDate}\n\nExpert inzichten over de ${branche} markt in Nederland...`,
    metaDescription: `Actuele informatie over ${branche} in Nederland. Expert tips en marktinzichten.`,
    slug: `${branche}-update-${Date.now()}`
  };
}

// Weekly AI content generation
export async function generateWeeklyAIContent(): Promise<Array<{
  title: string;
  content: string;
  metaDescription: string;
  slug: string;
  branche: string;
}>> {
  const branches = ['thuisbatterijen', 'zonnepanelen', 'warmtepompen', 'financial-lease'];
  const contentTypes = ['marktanalyse', 'tips', 'trends', 'subsidie-update'] as const;
  
  const articles = [];
  
  for (let i = 0; i < 4; i++) {
    const branche = branches[i];
    const contentType = contentTypes[i % contentTypes.length];
    
    const request: AIContentRequest = {
      branche,
      contentType,
      actueleData: await getActueleDataForBranche(branche),
      targetKeywords: [
        `${branche} Nederland`,
        `${branche} leads`,
        `${branche} installateur`,
        `${branche} markt 2025`
      ]
    };
    
    const article = await generateAIContent(request);
    articles.push({
      ...article,
      branche
    });
    
    console.log(`✅ AI generated article: ${article.title}`);
  }
  
  return articles;
}

// Actuele data ophalen voor branche
async function getActueleDataForBranche(branche: string): Promise<string[]> {
  // Simulatie van actuele data - in productie zou dit web scraping zijn
  const mockActueleData = {
    thuisbatterijen: [
      "ISDE subsidie verhoogd naar €2.500 per thuisbatterij",
      "Tesla Powerwall 3 gelanceerd in Nederland", 
      "Thuisbatterij verkoop groeit 45% in Q4 2025",
      "Nieuwe netcode voor batterij eigenaren van kracht"
    ],
    zonnepanelen: [
      "BTW op zonnepanelen blijft 0% tot eind 2025",
      "Record aantal solar installaties in oktober 2025",
      "Nieuwe bifaciale panelen 20% efficiënter",
      "Saldering regeling aangepast voor 2026"
    ],
    warmtepompen: [
      "Gasketel verbod definitief vanaf 2026",
      "ISDE subsidie warmtepompen verhoogd naar €4.000",
      "Tekort HVAC monteurs drijft prijzen op",
      "Nieuwe hybride warmtepomp technologie"
    ],
    'financial-lease': [
      "MKB lease markt groeit 25% in 2025",
      "Nieuwe fiscale voordelen voor electric vehicle lease",
      "Rente stabilisatie positief voor lease sector",
      "Duurzaamheid eisen voor bedrijfsfinanciering"
    ]
  };
  
  return mockActueleData[branche as keyof typeof mockActueleData] || [];
}

// Test functie
export async function testAIGeneration(): Promise<void> {
  console.log('🤖 Testing OpenAI content generation...');
  
  const testRequest: AIContentRequest = {
    branche: 'thuisbatterijen',
    contentType: 'marktanalyse',
    actueleData: await getActueleDataForBranche('thuisbatterijen'),
    targetKeywords: ['thuisbatterij Nederland', 'battery storage leads', 'energie opslag']
  };
  
  const result = await generateAIContent(testRequest);
  console.log('✅ AI Test Result:', {
    title: result.title,
    contentLength: result.content.length,
    slug: result.slug
  });
}
