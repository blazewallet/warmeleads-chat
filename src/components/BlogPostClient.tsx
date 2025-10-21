'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface BlogArticle {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: string;
  author: string;
  image: string;
  keywords: string[];
  content?: string;
}

interface BlogPostClientProps {
  article: BlogArticle;
  relatedArticles: BlogArticle[];
}

const categoryColors: Record<string, string> = {
  'SEO': 'bg-blue-500/20 text-blue-200 border-blue-400/30',
  'Marketing': 'bg-purple-500/20 text-purple-200 border-purple-400/30',
  'B2B': 'bg-green-500/20 text-green-200 border-green-400/30',
  'Conversie': 'bg-orange-500/20 text-orange-200 border-orange-400/30',
  'AI': 'bg-pink-500/20 text-pink-200 border-pink-400/30',
  'Social Media': 'bg-cyan-500/20 text-cyan-200 border-cyan-400/30',
  'E-commerce': 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30',
  'Analytics': 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30',
  'Sales': 'bg-red-500/20 text-red-200 border-red-400/30',
};

export default function BlogPostClient({ article, relatedArticles }: BlogPostClientProps) {
  const [readingProgress, setReadingProgress] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    const updateReadingProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = (scrollTop / docHeight) * 100;
      setReadingProgress(progress);
    };

    window.addEventListener('scroll', updateReadingProgress);
    return () => window.removeEventListener('scroll', updateReadingProgress);
  }, []);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `${article.title} - ${article.excerpt}`;

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);

    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      email: `mailto:?subject=${encodedText}&body=${encodedUrl}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('Link gekopieerd! 📋');
  };

  return (
    <>
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-white/10">
        <motion.div
          className="h-full bg-gradient-to-r from-brand-orange via-brand-pink to-brand-purple"
          style={{ width: `${readingProgress}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Floating Share Button */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:block">
        <div className="relative">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="bg-white/10 backdrop-blur-md text-white p-4 rounded-full border border-white/20 hover:bg-white/20 hover:scale-110 transition-all shadow-lg"
            title="Deel dit artikel"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>

          {showShareMenu && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute right-full mr-4 top-0 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-3 shadow-xl"
            >
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="flex items-center gap-2 text-white hover:text-green-300 transition-colors px-3 py-2 rounded-lg hover:bg-white/10"
                  title="Deel via WhatsApp"
                >
                  <span className="text-xl">💬</span>
                  <span className="text-sm font-medium whitespace-nowrap">WhatsApp</span>
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="flex items-center gap-2 text-white hover:text-blue-300 transition-colors px-3 py-2 rounded-lg hover:bg-white/10"
                  title="Deel op LinkedIn"
                >
                  <span className="text-xl">💼</span>
                  <span className="text-sm font-medium whitespace-nowrap">LinkedIn</span>
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors px-3 py-2 rounded-lg hover:bg-white/10"
                  title="Deel op Twitter"
                >
                  <span className="text-xl">🐦</span>
                  <span className="text-sm font-medium whitespace-nowrap">Twitter</span>
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="flex items-center gap-2 text-white hover:text-blue-500 transition-colors px-3 py-2 rounded-lg hover:bg-white/10"
                  title="Deel op Facebook"
                >
                  <span className="text-xl">👍</span>
                  <span className="text-sm font-medium whitespace-nowrap">Facebook</span>
                </button>
                <button
                  onClick={copyLink}
                  className="flex items-center gap-2 text-white hover:text-purple-300 transition-colors px-3 py-2 rounded-lg hover:bg-white/10"
                  title="Kopieer link"
                >
                  <span className="text-xl">🔗</span>
                  <span className="text-sm font-medium whitespace-nowrap">Kopieer</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Mobile Share Bar */}
      <div className="lg:hidden sticky top-0 z-40 bg-black/40 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/blog" className="text-white/70 hover:text-white text-sm flex items-center gap-1">
              <span>←</span>
              <span>Terug</span>
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleShare('whatsapp')}
                className="text-white/70 hover:text-white p-2"
                title="Deel via WhatsApp"
              >
                💬
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="text-white/70 hover:text-white p-2"
                title="Deel op LinkedIn"
              >
                💼
              </button>
              <button
                onClick={copyLink}
                className="text-white/70 hover:text-white p-2"
                title="Kopieer link"
              >
                🔗
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-brand-purple via-brand-pink to-brand-orange">
        {/* Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-500" />
        </div>

        <article className="relative pt-8 lg:pt-20 pb-20">
          <div className="max-w-4xl mx-auto px-4">
            {/* Breadcrumb */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-sm text-white/60 mb-8"
            >
              <Link href="/" className="hover:text-white/90 transition-colors">Home</Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-white/90 transition-colors">Blog</Link>
              <span>/</span>
              <span className="text-white/90">{article.category}</span>
            </motion.div>

            {/* Article Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              {/* Category Badge & Meta */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className={`px-4 py-2 rounded-xl text-sm font-semibold border ${categoryColors[article.category] || 'bg-white/20 text-white border-white/30'}`}>
                  {article.category}
                </span>
                <span className="text-white/60 text-sm">{article.readTime}</span>
                <span className="text-white/60 text-sm">•</span>
                <span className="text-white/60 text-sm">{article.date}</span>
              </div>

              {/* Icon */}
              <div className="text-7xl mb-6">{article.image}</div>

              {/* Title */}
              <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                {article.title}
              </h1>

              {/* Excerpt */}
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed mb-6">
                {article.excerpt}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 text-white/70">
                <span className="text-2xl">✍️</span>
                <span className="font-medium">{article.author}</span>
              </div>
            </motion.div>

            {/* Article Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/10 backdrop-blur-md rounded-3xl p-6 md:p-12 border border-white/20 mb-12"
            >
              <div className="prose prose-lg prose-invert max-w-none">
                {/* Main Content - Using the same structure as before */}
                <section className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Inleiding</h2>
                  <p className="text-white/90 leading-relaxed mb-4 text-lg">
                    In de snel veranderende wereld van leadgeneratie is het cruciaal om bij te blijven met de laatste 
                    trends en strategieën. Dit artikel biedt u diepgaande inzichten en praktische tips om uw 
                    leadgeneratie naar een hoger niveau te tillen.
                  </p>
                  <p className="text-white/90 leading-relaxed text-lg">
                    Of u nu net begint met leadgeneratie of een ervaren marketeer bent, deze gids biedt waardevolle 
                    kennis die direct toepasbaar is in uw dagelijkse praktijk.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Waarom dit belangrijk is</h2>
                  <p className="text-white/90 leading-relaxed mb-4 text-lg">
                    De Nederlandse markt kent unieke uitdagingen en kansen. Met de juiste strategie en tools kunt u 
                    significante resultaten behalen. Uit recent onderzoek blijkt dat bedrijven die gestructureerd 
                    werken aan leadgeneratie tot 50% meer gekwalificeerde leads genereren.
                  </p>
                  <ul className="space-y-3 mb-6">
                    {['Verhoogde naamsbekendheid in uw doelgroep', 'Lagere kosten per acquisitie (CPA)', 'Betere kwaliteit van inkomende leads', 'Hogere conversieratio\'s in uw verkoopproces'].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-white/90 text-lg">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Praktische Implementatie</h2>
                  <p className="text-white/90 leading-relaxed mb-6 text-lg">
                    De implementatie van deze strategieën vereist een gestructureerde aanpak. Begin met een grondige 
                    analyse van uw huidige situatie en stel duidelijke, meetbare doelen. Volg deze stappen:
                  </p>
                  <div className="space-y-4">
                    {[
                      { title: 'Analyseer uw huidige leadgeneratie', desc: 'Waar komen uw leads vandaan en wat is de kwaliteit?' },
                      { title: 'Definieer uw ideale klantprofiel', desc: 'Wie wilt u bereiken en waarom?' },
                      { title: 'Kies de juiste kanalen', desc: 'Focus op wat het beste werkt voor uw doelgroep' },
                      { title: 'Test en optimaliseer', desc: 'Continue verbetering is de sleutel tot succes' },
                      { title: 'Meet en rapporteer', desc: 'Data-driven beslissingen leiden tot betere resultaten' }
                    ].map((step, i) => (
                      <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-8 h-8 bg-brand-orange/30 text-white rounded-full flex items-center justify-center font-bold">{i + 1}</span>
                          <div>
                            <h3 className="font-bold text-white mb-1">{step.title}</h3>
                            <p className="text-white/80 text-sm">{step.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Veelgemaakte Fouten</h2>
                  <div className="bg-red-500/10 border-2 border-red-500/30 rounded-2xl p-6 mb-4">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <span>⚠️</span>
                      <span>Let op deze valkuilen</span>
                    </h3>
                    <ul className="space-y-3">
                      {['Te brede targeting zonder duidelijke focus', 'Geen follow-up strategie voor gegenereerde leads', 'Onvoldoende testen van verschillende benaderingen', 'Niet investeren in de juiste tools en training'].map((mistake, i) => (
                        <li key={i} className="flex items-start gap-3 text-white/90">
                          <span className="text-red-400 mt-0.5">✕</span>
                          <span>{mistake}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Success Stories</h2>
                  <div className="bg-green-500/10 border-2 border-green-500/30 rounded-2xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <span>🎯</span>
                      <span>Resultaten uit de praktijk</span>
                    </h3>
                    <blockquote className="text-white/90 italic border-l-4 border-green-400/50 pl-6 py-2 text-lg">
                      "Door de implementatie van deze strategieën zagen we binnen 3 maanden een toename van 127% 
                      in gekwalificeerde leads. De ROI was fenomenaal."
                      <footer className="text-white/70 text-sm mt-2 not-italic">
                        — Marketing Director bij groot Nederlands installatiebedrijf
                      </footer>
                    </blockquote>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Conclusie en Volgende Stappen</h2>
                  <p className="text-white/90 leading-relaxed mb-4 text-lg">
                    De wereld van leadgeneratie blijft evolueren, maar de fundamentele principes blijven hetzelfde: 
                    begrijp uw doelgroep, bied waarde, en optimaliseer continu. Door de strategieën uit dit artikel 
                    toe te passen, legt u een solide basis voor succesvolle leadgeneratie.
                  </p>
                  <p className="text-white/90 leading-relaxed text-lg">
                    Wilt u direct aan de slag met professionele leadgeneratie? 
                    <Link href="/" className="text-brand-orange underline hover:text-white ml-1 font-semibold">
                      Ontdek onze diensten
                    </Link> en zie hoe WarmeLeads u kan helpen uw doelen te bereiken.
                  </p>
                </section>

                {/* Keywords */}
                <section className="mt-12 pt-8 border-t border-white/20">
                  <h3 className="text-lg font-semibold text-white mb-4">Gerelateerde onderwerpen:</h3>
                  <div className="flex flex-wrap gap-2">
                    {article.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="bg-white/10 text-white/80 px-4 py-2 rounded-full text-sm border border-white/20 hover:bg-white/20 hover:scale-105 transition-all cursor-default"
                      >
                        #{keyword}
                      </span>
                    ))}
                  </div>
                </section>
              </div>
            </motion.div>

            {/* Internal Links Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-16"
            >
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
                🎯 Ontdek onze leads
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link href="/leads-thuisbatterijen" className="group block">
                  <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-6 hover:from-blue-600/30 hover:to-purple-600/30 transition-all border border-blue-500/30 hover:border-blue-400/50">
                    <div className="text-3xl mb-3">🔋</div>
                    <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
                      Thuisbatterij Leads
                    </h4>
                    <p className="text-white/70 text-sm">
                      Exclusieve en gedeelde leads voor thuisbatterij installateurs
                    </p>
                  </div>
                </Link>
                
                <Link href="/leads-zonnepanelen" className="group block">
                  <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-sm rounded-2xl p-6 hover:from-yellow-600/30 hover:to-orange-600/30 transition-all border border-yellow-500/30 hover:border-yellow-400/50">
                    <div className="text-3xl mb-3">☀️</div>
                    <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-yellow-300 transition-colors">
                      Zonnepaneel Leads
                    </h4>
                    <p className="text-white/70 text-sm">
                      Warme leads voor zonnepaneel installaties en onderhoud
                    </p>
                  </div>
                </Link>
                
                <Link href="/leads-warmtepompen" className="group block">
                  <div className="bg-gradient-to-br from-green-600/20 to-teal-600/20 backdrop-blur-sm rounded-2xl p-6 hover:from-green-600/30 hover:to-teal-600/30 transition-all border border-green-500/30 hover:border-green-400/50">
                    <div className="text-3xl mb-3">🌡️</div>
                    <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-green-300 transition-colors">
                      Warmtepomp Leads
                    </h4>
                    <p className="text-white/70 text-sm">
                      Kwalitatieve leads voor warmtepomp installaties
                    </p>
                  </div>
                </Link>
                
                <Link href="/maatwerk-leads" className="group block">
                  <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-2xl p-6 hover:from-purple-600/30 hover:to-pink-600/30 transition-all border border-purple-500/30 hover:border-purple-400/50">
                    <div className="text-3xl mb-3">🎯</div>
                    <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
                      Maatwerk Leads
                    </h4>
                    <p className="text-white/70 text-sm">
                      Op maat gemaakte leads voor jouw specifieke branche
                    </p>
                  </div>
                </Link>
              </div>
            </motion.div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/30 text-center mb-16"
            >
              <div className="text-5xl mb-4">🚀</div>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Klaar om uw leadgeneratie te transformeren?
              </h3>
              <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
                WarmeLeads levert dagelijks verse, hoogwaardige leads voor uw bedrijf. 
                Van zonnepanelen tot thuisbatterijen, van warmtepompen tot financial lease.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-white text-brand-purple px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-lg"
              >
                Start nu met WarmeLeads
                <span>→</span>
              </Link>
            </motion.div>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-16"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
                  📚 Gerelateerde Artikelen
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedArticles.map((related, index) => (
                    <motion.div
                      key={related.slug}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                    >
                      <Link href={`/blog/${related.slug}`}>
                        <div className="group bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 hover:border-white/40 transition-all duration-300 hover:scale-105 cursor-pointer h-full flex flex-col shadow-xl">
                          <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform">
                            {related.image}
                          </div>
                          <span className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold border mb-3 ${categoryColors[related.category] || 'bg-white/20 text-white border-white/30'}`}>
                            {related.category}
                          </span>
                          <h3 className="text-lg font-bold text-white mb-3 leading-tight group-hover:text-white/90 transition-colors">
                            {related.title}
                          </h3>
                          <p className="text-white/70 text-sm line-clamp-2 mb-4 flex-grow">
                            {related.excerpt}
                          </p>
                          <div className="flex items-center gap-2 text-white/60 text-xs">
                            <span>{related.readTime}</span>
                            <span>•</span>
                            <span>{related.date}</span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Back to Blog */}
            <div className="text-center">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold border border-white/20 hover:bg-white/20 hover:scale-105 transition-all"
              >
                <span>←</span>
                Terug naar alle artikelen
              </Link>
            </div>
          </div>
        </article>
      </div>
    </>
  );
}

