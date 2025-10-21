'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { blogArticles } from '@/data/blogArticles';

// Main categories - simplified and grouped
const mainCategories = ['SEO', 'Marketing', 'AI', 'B2B', 'Conversie', 'Analytics'];

// Category mapping - map all subcategories to main categories
const categoryMapping: Record<string, string> = {
  'SEO Marketing': 'SEO',
  'SEO': 'SEO',
  'Marketing': 'Marketing',
  'B2B Marketing': 'B2B',
  'B2B Strategy': 'B2B',
  'B2B': 'B2B',
  'Email Marketing': 'Marketing',
  'Content Marketing': 'Marketing',
  'Video Marketing': 'Marketing',
  'Social Media': 'Marketing',
  'Paid Advertising': 'Marketing',
  'Influencer Marketing': 'Marketing',
  'Audio Marketing': 'Marketing',
  'Mobile Marketing': 'Marketing',
  'Retargeting': 'Marketing',
  'Referral Marketing': 'Marketing',
  'UGC Marketing': 'Marketing',
  'Outbound Sales': 'Marketing',
  'AI & Technologie': 'AI',
  'AI': 'AI',
  'Chatbots': 'AI',
  'Automatisering': 'AI',
  'Conversie Optimalisatie': 'Conversie',
  'Conversie': 'Conversie',
  'Analytics': 'Analytics',
  'Data Analytics': 'Analytics',
  'Marktanalyse': 'Analytics',
  'Tools & Software': 'Analytics',
  'AI Gegenereerd': 'AI',
  'Webinars': 'Marketing',
  'Tips & Tricks': 'Marketing',
  'Trends': 'Marketing',
  'Strategie': 'Marketing',
  'Lead Management': 'B2B',
  'Voice SEO': 'SEO',
  'Personalisatie': 'Marketing',
  'Content Formats': 'Marketing',
  'Community': 'Marketing',
  'Partnerships': 'B2B',
  'Omnichannel': 'Marketing',
  'Compliance': 'B2B',
  'Customer Journey': 'Conversie',
  'Brand Storytelling': 'Marketing',
  'Mobile Strategy': 'Marketing',
  'Psychologie': 'Marketing',
  'Growth Hacking': 'Marketing',
};

const categoryColors: Record<string, string> = {
  'SEO': 'bg-blue-500/20 text-blue-200 border-blue-400/30',
  'Marketing': 'bg-purple-500/20 text-purple-200 border-purple-400/30',
  'B2B': 'bg-green-500/20 text-green-200 border-green-400/30',
  'Conversie': 'bg-orange-500/20 text-orange-200 border-orange-400/30',
  'AI': 'bg-pink-500/20 text-pink-200 border-pink-400/30',
  'Analytics': 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30',
};

export default function BlogPageClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Alle');
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 9;

  // Filter articles
  const filteredArticles = useMemo(() => {
    return blogArticles.filter(article => {
      const matchesSearch = 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Map article category to main category
      const mappedCategory = categoryMapping[article.category] || article.category;
      const matchesCategory = selectedCategory === 'Alle' || mappedCategory === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Pagination
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
  const startIndex = (currentPage - 1) * articlesPerPage;
  const paginatedArticles = filteredArticles.slice(startIndex, startIndex + articlesPerPage);

  // Featured article (most recent)
  const featuredArticle = blogArticles[0];

  // Category counts - based on mapped categories
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { 'Alle': blogArticles.length };
    
    // Count articles per main category
    blogArticles.forEach(article => {
      const mappedCategory = categoryMapping[article.category] || article.category;
      counts[mappedCategory] = (counts[mappedCategory] || 0) + 1;
    });
    
    return counts;
  }, []);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-purple via-brand-pink to-brand-orange">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Header */}
      <div className="relative z-10 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <Link href="/" className="hover:text-white/90 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white/90">Blog</span>
          </div>

          {/* Hero Section */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                Leadgeneratie Blog
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-4 max-w-3xl mx-auto">
                Expert inzichten, tips en strategieën voor Nederlandse bedrijven
              </p>
              <div className="flex items-center justify-center gap-6 text-white/70 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📚</span>
                  <span>{blogArticles.length} artikelen</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏷️</span>
                  <span>{mainCategories.length} categorieën</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✍️</span>
                  <span>Dagelijks updates</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Zoek artikelen over leadgeneratie, SEO, marketing..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/90 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          </motion.div>

          {/* Category Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex flex-wrap items-center justify-center gap-3">
              {['Alle', ...mainCategories].map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`
                    px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300
                    ${selectedCategory === category
                      ? 'bg-white text-brand-purple scale-110 shadow-xl'
                      : 'bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:bg-white/20 hover:scale-105'
                    }
                  `}
                >
                  {category}
                  <span className="ml-2 text-xs opacity-70">({categoryCounts[category] || 0})</span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Featured Article */}
      {selectedCategory === 'Alle' && !searchQuery && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16"
        >
          <div className="text-center mb-6">
            <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold border border-white/30">
              ⭐ Uitgelicht Artikel
            </span>
          </div>
          <Link href={`/blog/${featuredArticle.slug}`}>
            <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/30 hover:border-white/50 transition-all duration-500 hover:scale-[1.02] cursor-pointer shadow-2xl">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="text-8xl mb-6">{featuredArticle.image}</div>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${categoryColors[featuredArticle.category] || 'bg-white/20 text-white border-white/30'}`}>
                      {featuredArticle.category}
                    </span>
                    <span className="text-white/60 text-sm">{featuredArticle.readTime}</span>
                    <span className="text-white/60 text-sm">•</span>
                    <span className="text-white/60 text-sm">{featuredArticle.date}</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-white/80 text-lg mb-6 leading-relaxed">
                    {featuredArticle.excerpt}
                  </p>
                  <div className="inline-flex items-center gap-2 bg-white text-brand-purple px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-transform">
                    Lees dit artikel
                    <span>→</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      )}

      {/* Articles Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Results Info */}
        <div className="text-center mb-8">
          <p className="text-white/70 text-lg">
            {filteredArticles.length === 0 ? (
              <>😔 Geen artikelen gevonden voor "{searchQuery}"</>
            ) : (
              <>📖 {filteredArticles.length} artikel{filteredArticles.length !== 1 ? 'en' : ''} gevonden</>
            )}
          </p>
        </div>

        {/* Articles Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedCategory}-${searchQuery}-${currentPage}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
          >
            {paginatedArticles.map((article, index) => (
              <motion.div
                key={article.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Link href={`/blog/${article.slug}`}>
                  <div className="group bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 hover:border-white/40 transition-all duration-300 hover:scale-105 cursor-pointer h-full flex flex-col shadow-xl hover:shadow-2xl">
                    {/* Icon */}
                    <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">
                      {article.image}
                    </div>
                    
                    {/* Metadata */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${categoryColors[article.category] || 'bg-white/20 text-white border-white/30'}`}>
                        {article.category}
                      </span>
                      <span className="text-white/50 text-xs">{article.readTime}</span>
                    </div>

                    {/* Date */}
                    <div className="text-sm text-white/60 mb-3">{article.date}</div>
                    
                    {/* Title */}
                    <h3 className="text-xl font-bold text-white mb-3 leading-tight group-hover:text-white/90 transition-colors flex-grow">
                      {article.title}
                    </h3>
                    
                    {/* Excerpt */}
                    <p className="text-white/70 text-sm leading-relaxed mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>
                    
                    {/* CTA */}
                    <div className="mt-auto">
                      <span className="inline-flex items-center gap-2 text-white font-medium text-sm group-hover:gap-3 transition-all">
                        Lees meer
                        <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mb-12">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 transition-all"
            >
              ← Vorige
            </button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first, last, current, and adjacent pages
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`
                        w-10 h-10 rounded-xl font-semibold transition-all
                        ${currentPage === page
                          ? 'bg-white text-brand-purple scale-110'
                          : 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20'
                        }
                      `}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return (
                    <span key={page} className="text-white/50 px-2">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 transition-all"
            >
              Volgende →
            </button>
          </div>
        )}

        {/* Newsletter CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/30 text-center mb-12"
        >
          <div className="text-5xl mb-4">📬</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Mis geen enkel artikel
          </h2>
          <p className="text-white/80 text-lg mb-6 max-w-2xl mx-auto">
            Ontvang wekelijks de nieuwste leadgeneratie tips, strategieën en case studies direct in je inbox
          </p>
          <Link
            href="/#contact"
            className="inline-flex items-center gap-2 bg-white text-brand-purple px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-lg"
          >
            📧 Blijf op de hoogte
          </Link>
        </motion.div>

        {/* Back to Home */}
        <div className="text-center">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold border border-white/20 hover:bg-white/20 hover:scale-105 transition-all"
          >
            <span>←</span>
            Terug naar homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

