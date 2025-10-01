import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Leadgeneratie Blog Nederland | Tips & Strategieën | WarmeLeads",
  description: "Lees onze blog over leadgeneratie in Nederland. Tips, strategieën en trends voor thuisbatterijen, zonnepanelen, warmtepompen en meer. Expert inzichten van WarmeLeads.",
  keywords: "leadgeneratie blog, lead generation tips, Nederlandse leadgeneratie, leadgeneratie strategie, marketing blog Nederland",
};

const blogPosts = [
  {
    slug: "ai-test-thuisbatterij-trends-oktober-2025",
    title: "🤖 Thuisbatterij Trends Oktober 2025: AI Marktanalyse",
    excerpt: "AI-gegenereerde marktanalyse van actuele thuisbatterij trends. Subsidie updates, prijsontwikkelingen en concrete kansen voor installateurs in oktober 2025.",
    date: "26 september 2025",
    category: "AI Gegenereerd",
    readTime: "6 min",
    image: "🔋"
  },
  {
    slug: "thuisbatterij-markt-2025",
    title: "Thuisbatterij Markt Nederland 2025: Kansen voor Installateurs",
    excerpt: "De thuisbatterij markt groeit explosief. Ontdek hoe installateurs kunnen profiteren van deze trend en welke leadgeneratie strategieën het beste werken.",
    date: "25 september 2025",
    category: "Marktanalyse",
    readTime: "5 min",
    image: "🔋"
  },
  {
    slug: "zonnepanelen-leads-kwaliteit",
    title: "Hoe Herken je Kwaliteit Zonnepanelen Leads?",
    excerpt: "Niet alle zonnepanelen leads zijn gelijk. Leer hoe je kwaliteitsleads herkent en welke vragen je moet stellen aan je leadgeneratie partner.",
    date: "24 september 2025", 
    category: "Tips & Tricks",
    readTime: "7 min",
    image: "☀️"
  },
  {
    slug: "warmtepomp-subsidies-2025",
    title: "Warmtepomp Subsidies 2025: Impact op Leadgeneratie",
    excerpt: "Nieuwe subsidies maken warmtepompen aantrekkelijker. Ontdek hoe dit de leadgeneratie beïnvloedt en hoe u hierop kunt inspelen.",
    date: "23 september 2025",
    category: "Trends",
    readTime: "6 min", 
    image: "🌡️"
  },
  {
    slug: "roi-berekenen-leadgeneratie",
    title: "ROI Berekenen van Leadgeneratie: Complete Gids",
    excerpt: "Leer hoe u de ROI van uw leadgeneratie correct berekent. Inclusief formules, voorbeelden en tips voor optimalisatie.",
    date: "22 september 2025",
    category: "Strategie",
    readTime: "8 min",
    image: "📊"
  },
  {
    slug: "financial-lease-trends",
    title: "Financial Lease Trends: Nieuwe Kansen in 2025",
    excerpt: "De financial lease markt evolueert snel. Ontdek nieuwe trends en hoe u uw leadgeneratie kunt aanpassen voor maximaal succes.",
    date: "21 september 2025",
    category: "B2B",
    readTime: "6 min",
    image: "💼"
  },
  {
    slug: "conversie-optimalisatie-leads",
    title: "Conversie Optimalisatie: Van Lead naar Klant",
    excerpt: "Krijgen is één ding, converteren is een ander. Leer hoe u uw leadconversie kunt maximaliseren met proven technieken.",
    date: "20 september 2025",
    category: "Conversie",
    readTime: "9 min",
    image: "🎯"
  }
];

export default function BlogPage() {
  // Toon alleen de eerste 9 artikelen (meest recent)
  const articlesPerPage = 9;
  const displayedPosts = blogPosts.slice(0, articlesPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-purple via-brand-pink to-brand-orange">
      {/* Hero Section */}
      <div className="relative py-20 overflow-hidden">
        {/* Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Leadgeneratie Blog
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            Expert inzichten, tips en strategieën voor Nederlandse bedrijven
          </p>
          <p className="text-lg text-white/80 max-w-3xl mx-auto mb-4">
            Blijf op de hoogte van de laatste trends in leadgeneratie, marktanalyses en proven strategieën 
            voor maximale ROI uit uw marketing investeringen.
          </p>
          <div className="text-sm text-white/60">
            {displayedPosts.length} nieuwste artikelen • Regelmatig nieuwe content
          </div>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {displayedPosts.map((post, index) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 cursor-pointer h-full">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-3">{post.image}</div>
                  <div className="text-xs text-white/60 mb-2">{post.category} • {post.readTime}</div>
                  <div className="text-sm text-white/70">{post.date}</div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3 leading-tight">
                  {post.title}
                </h3>
                
                <p className="text-white/80 text-sm leading-relaxed mb-4">
                  {post.excerpt}
                </p>
                
                <div className="text-center">
                  <span className="inline-block bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors">
                    Lees meer →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Content Info */}
        <div className="text-center mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 inline-block">
            <p className="text-white/80 text-sm">
              📝 Nieuwe artikelen worden automatisch elke maandag toegevoegd
            </p>
            <p className="text-white/60 text-xs mt-2">
              🤖 AI-gegenereerd met actuele marktdata voor maximale relevantie
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link 
            href="/"
            className="inline-block bg-white text-brand-purple px-8 py-4 rounded-xl font-semibold hover:scale-105 transition-transform"
          >
            ← Terug naar Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
