import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maatwerk Leads Kopen | Custom Leadgeneratie Nederland | WarmeLeads",
  description: "Koop maatwerk leads voor uw specifieke branche in Nederland. Custom leadgeneratie campagnes voor elke sector. Nederlandse prospects uit onze campagnes, realtime delivery binnen 15 minuten.",
  keywords: "maatwerk leads, custom leadgeneratie, branche specifieke leads, maatwerk campagnes, custom prospects, specifieke sector leads",
  openGraph: {
    title: "Maatwerk Leads Kopen Nederland | Custom Leadgeneratie | WarmeLeads",
    description: "Maatwerk leadgeneratie voor uw specifieke branche. Nederlandse prospects uit custom campagnes, realtime delivery binnen 15 minuten.",
    url: "https://www.warmeleads.eu/maatwerk-leads",
  },
};

export default function MaatwerkLeadsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-purple via-brand-pink to-brand-orange">
      {/* SEO Hidden Content */}
      <div className="sr-only">
        <h1>Maatwerk Leads Kopen Nederland - Custom Leadgeneratie voor Elke Branche</h1>
        <p>WarmeLeads levert maatwerk leads voor specifieke branches in Nederland. Custom campagnes en prospects, realtime delivery binnen 15 minuten.</p>
      </div>

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-400/20 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center text-white">
          {/* Hero Content */}
          <div className="mb-12">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              Maatwerk Leads
            </h1>
            <p className="text-2xl md:text-3xl mb-8 text-white/90">
              Custom leadgeneratie voor uw specifieke branche
            </p>
            <p className="text-lg text-white/80 max-w-3xl mx-auto">
              Elke branche is uniek. Daarom maken wij custom campagnes voor uw specifieke doelgroep. 
              Van niche markten tot gespecialiseerde diensten - wij genereren de leads die u nodig heeft.
            </p>
          </div>

          {/* Service Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Custom Campagnes */}
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎨</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Custom Campagnes</h3>
                <p className="text-white/80 mb-6">Speciaal ontworpen voor uw branche</p>
                <ul className="text-left space-y-2 mb-8">
                  <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Branche-specifieke targeting</li>
                  <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Custom messaging en creatives</li>
                  <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Doelgroep analyse</li>
                  <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> A/B testing optimalisatie</li>
                </ul>
              </div>
            </div>

            {/* Niche Markten */}
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Niche Markten</h3>
                <p className="text-white/80 mb-6">Gespecialiseerde sectoren</p>
                <ul className="text-left space-y-2 mb-8">
                  <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Beveiligingssystemen</li>
                  <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Smart home technologie</li>
                  <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Industriële automatisering</li>
                  <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> En meer op maat</li>
                </ul>
              </div>
            </div>

            {/* Consultancy */}
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🧠</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Strategie Consultancy</h3>
                <p className="text-white/80 mb-6">Persoonlijk advies en strategie</p>
                <ul className="text-left space-y-2 mb-8">
                  <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Marktanalyse voor uw sector</li>
                  <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Campagne strategie ontwikkeling</li>
                  <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Targeting optimalisatie</li>
                  <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> ROI maximalisatie</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Process Section */}
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/20 mb-12">
            <h2 className="text-3xl font-bold mb-8">Ons Maatwerk Proces</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-4">📋</div>
                <h4 className="font-bold mb-2">1. Intake</h4>
                <p className="text-white/70">Analyse van uw doelgroep en markt</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🎨</div>
                <h4 className="font-bold mb-2">2. Campagne Design</h4>
                <p className="text-white/70">Custom creatives en messaging</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🚀</div>
                <h4 className="font-bold mb-2">3. Launch</h4>
                <p className="text-white/70">Campagne activatie en monitoring</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">📊</div>
                <h4 className="font-bold mb-2">4. Optimalisatie</h4>
                <p className="text-white/70">Continue verbetering en scaling</p>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Laten We Uw Campagne Bespreken</h2>
            <p className="text-xl text-white/80 mb-8">
              Vertel ons over uw branche en wij maken de perfecte leadgeneratie strategie
            </p>
            <a 
              href="/"
              className="inline-block bg-white text-brand-purple px-12 py-6 rounded-2xl font-bold text-xl hover:scale-110 transition-all duration-300 shadow-2xl"
            >
              🎯 Bespreek Maatwerk Leads
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
