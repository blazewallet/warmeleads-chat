import { NextRequest, NextResponse } from 'next/server';
import { generateAIContent } from '@/lib/aiContentGenerator';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const { branche = 'thuisbatterijen' } = await req.json();
    
    console.log(`🤖 Generating and publishing AI article for ${branche}...`);
    
    // Genereer AI artikel
    const aiArticle = await generateAIContent({
      branche,
      contentType: 'marktanalyse',
      targetKeywords: [`${branche} Nederland`, `${branche} leads`, `${branche} markt 2025`],
      actueleData: [
        `${branche} markt groeit explosief in Q4 2025`,
        `Nieuwe subsidies beschikbaar voor ${branche} installaties`,
        `Nederlandse ${branche} sector ziet recordverkoop`,
        `Consumenten interesse in ${branche} stijgt 40%`
      ]
    });

    // Maak Next.js pagina content
    const pageContent = `import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "${aiArticle.title} | WarmeLeads Blog",
  description: "${aiArticle.metaDescription}",
  keywords: "${branche} Nederland, ${branche} leads, ${branche} markt 2025, Nederlandse ${branche}",
};

export default function ${aiArticle.slug.replace(/-/g, '')}Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-purple via-brand-pink to-brand-orange">
      <div className="relative py-20 overflow-hidden">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-white">
          <div className="text-center mb-12">
            <div className="text-6xl mb-6">${getBrancheEmoji(branche)}</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              ${aiArticle.title}
            </h1>
            <div className="text-sm text-white/70">${new Date().toLocaleDateString('nl-NL')} • AI Gegenereerd • Marktanalyse</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 mb-12">
            <div className="prose prose-lg max-w-none text-white">
              ${aiArticle.content.split('\n').map(line => {
                if (line.startsWith('# ')) return '';
                if (line.startsWith('## ')) return `<h2 className="text-2xl font-bold mb-4 text-white">${line.substring(3)}</h2>`;
                if (line.startsWith('### ')) return `<h3 className="text-xl font-bold mb-3 text-white">${line.substring(4)}</h3>`;
                if (line.trim() === '') return '<br />';
                return `<p className="text-white/90 mb-4">${line}</p>`;
              }).join('\n')}
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Klaar voor ${branche.charAt(0).toUpperCase() + branche.slice(1)} Leads?</h2>
            <p className="text-white/80 mb-6">Start vandaag met verse Nederlandse prospects</p>
            <Link href="/leads-${branche}" className="inline-block bg-white text-brand-purple px-8 py-4 rounded-xl font-semibold hover:scale-105 transition-transform mr-4">
              ${getBrancheEmoji(branche)} ${branche.charAt(0).toUpperCase() + branche.slice(1)} Leads
            </Link>
            <Link href="/blog" className="inline-block bg-white/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/30 transition-colors">
              ← Alle Artikelen
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}`;

    // Simuleer het aanmaken van een nieuw artikel bestand
    // In productie zou dit een echt bestand aanmaken
    console.log('📝 Article generated:', {
      title: aiArticle.title,
      slug: aiArticle.slug,
      contentLength: aiArticle.content.length
    });

    return NextResponse.json({
      success: true,
      article: aiArticle,
      pageContent: pageContent.substring(0, 500) + '...',
      message: `AI artikel "${aiArticle.title}" gegenereerd en klaar voor publicatie`
    });

  } catch (error) {
    console.error('AI article publishing failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to publish AI article',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function getBrancheEmoji(branche: string): string {
  const emojis: Record<string, string> = {
    'thuisbatterijen': '🔋',
    'zonnepanelen': '☀️',
    'warmtepompen': '🌡️',
    'airco': '❄️',
    'financial-lease': '💼'
  };
  return emojis[branche] || '📝';
}






