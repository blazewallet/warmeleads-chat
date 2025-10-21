import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Privacyverklaring | Warmeleads.eu',
  description: 'Privacyverklaring van Warmeleads.eu over de verwerking van persoonsgegevens conform de AVG.',
};

export default function PrivacyverklaringPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Terug naar home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Privacyverklaring</h1>
          <p className="text-gray-600 mt-2">Laatst gewijzigd op 13 oktober 2025</p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          
          {/* Introductie */}
          <section className="mb-8">
            <p className="text-gray-700 leading-relaxed">
              Warmeleads.eu, hierna te noemen "wij" of "ons", hecht grote waarde aan de bescherming van uw persoonsgegevens. In deze privacyverklaring leggen wij uit welke persoonsgegevens wij verzamelen, waarom wij deze verzamelen, hoe wij deze gebruiken en wat uw rechten zijn. Deze privacyverklaring is van toepassing op alle diensten die wij aanbieden via onze website en andere kanalen.
            </p>
          </section>

          {/* Artikel 1 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Wie is verantwoordelijk voor de verwerking van uw gegevens?</h2>
            <div className="space-y-3 text-gray-700">
              <p>Warmeleads.eu is verantwoordelijk voor de verwerking van persoonsgegevens zoals beschreven in deze privacyverklaring.</p>
              <p className="font-semibold">Contactgegevens:</p>
              <ul className="list-none space-y-1 ml-4">
                <li>Website: www.warmeleads.eu</li>
                <li>E-mail: info@warmeleads.eu</li>
                <li>Telefoon: +31 85 047 7067</li>
              </ul>
            </div>
          </section>

          {/* Artikel 2 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Welke persoonsgegevens verwerken wij?</h2>
            <div className="space-y-3 text-gray-700">
              <p>Wij kunnen de volgende categorieën persoonsgegevens van u verwerken:</p>
              
              <h3 className="font-semibold mt-4">2.1 Contactgegevens</h3>
              <ul className="list-disc pl-8 space-y-1">
                <li>Voor- en achternaam</li>
                <li>E-mailadres</li>
                <li>Telefoonnummer</li>
                <li>Bedrijfsnaam en functie</li>
                <li>Postadres en factuuradres</li>
              </ul>

              <h3 className="font-semibold mt-4">2.2 Accountgegevens</h3>
              <ul className="list-disc pl-8 space-y-1">
                <li>Gebruikersnaam en wachtwoord (versleuteld)</li>
                <li>Accountvoorkeuren en instellingen</li>
                <li>Communicatievoorkeuren</li>
              </ul>

              <h3 className="font-semibold mt-4">2.3 Transactiegegevens</h3>
              <ul className="list-disc pl-8 space-y-1">
                <li>Bestelgeschiedenis en ordergegevens</li>
                <li>Betaalgegevens (via beveiligde betaalproviders)</li>
                <li>Factuurgegevens en betalingsstatus</li>
              </ul>

              <h3 className="font-semibold mt-4">2.4 Leadgegevens</h3>
              <ul className="list-disc pl-8 space-y-1">
                <li>Gegevens van geleverde leads (namen, contactgegevens, interesse)</li>
                <li>Branche- en doelgroepinformatie</li>
                <li>Leadkwalificatie en -status</li>
              </ul>

              <h3 className="font-semibold mt-4">2.5 Technische en gebruiksgegevens</h3>
              <ul className="list-disc pl-8 space-y-1">
                <li>IP-adres en locatiegegevens</li>
                <li>Browser- en apparaatinformatie</li>
                <li>Cookies en vergelijkbare technologieën</li>
                <li>Websitegebruik en navigatiegedrag</li>
                <li>Klik- en scrollgedrag</li>
              </ul>

              <h3 className="font-semibold mt-4">2.6 Communicatiegegevens</h3>
              <ul className="list-disc pl-8 space-y-1">
                <li>E-mailcorrespondentie</li>
                <li>Chatgesprekken en WhatsApp-communicatie</li>
                <li>Telefoongesprekken (indien opgenomen, met uw toestemming)</li>
                <li>Feedback en enquêtes</li>
              </ul>

              <h3 className="font-semibold mt-4">2.7 Marketing en analysegegevens</h3>
              <ul className="list-disc pl-8 space-y-1">
                <li>Marketingvoorkeuren</li>
                <li>Interactie met marketingcampagnes</li>
                <li>Social media interacties</li>
                <li>Remarketing en retargeting data</li>
              </ul>
            </div>
          </section>

          {/* Artikel 3 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Waarom en op welke grondslag verwerken wij uw gegevens?</h2>
            <div className="space-y-3 text-gray-700">
              <p>Wij verwerken uw persoonsgegevens voor de volgende doeleinden en op de volgende grondslagen:</p>

              <h3 className="font-semibold mt-4">3.1 Uitvoering van de overeenkomst</h3>
              <ul className="list-disc pl-8 space-y-1">
                <li>Verwerken van uw bestellingen en leveren van leads</li>
                <li>Beheren van uw account en klantenportaal</li>
                <li>Klantenservice en ondersteuning</li>
                <li>Facturatie en betalingsverwerking</li>
                <li>Afhandeling van reclamaties</li>
              </ul>

              <h3 className="font-semibold mt-4">3.2 Wettelijke verplichtingen</h3>
              <ul className="list-disc pl-8 space-y-1">
                <li>Voldoen aan boekhoudkundige verplichtingen</li>
                <li>Belastingaangiften</li>
                <li>Naleving van toepasselijke wet- en regelgeving</li>
              </ul>

              <h3 className="font-semibold mt-4">3.3 Gerechtvaardigd belang</h3>
              <ul className="list-disc pl-8 space-y-1">
                <li>Verbeteren van onze dienstverlening en gebruikerservaring</li>
                <li>Analyseren van websitegebruik en optimalisatie</li>
                <li>Fraudepreventie en beveiliging</li>
                <li>Directe marketing naar bestaande klanten</li>
                <li>Marktonderzoek en productverbeteringen</li>
                <li>Netwerkbeveiliging en systeemonderhoud</li>
              </ul>

              <h3 className="font-semibold mt-4">3.4 Toestemming</h3>
              <ul className="list-disc pl-8 space-y-1">
                <li>Marketing en nieuwsbrieven naar prospects</li>
                <li>Plaatsen van niet-functionele cookies</li>
                <li>Gepersonaliseerde advertenties en remarketing</li>
                <li>Delen van gegevens met derde partijen voor marketingdoeleinden</li>
                <li>Gebruik van chat- en communicatietools zoals WhatsApp</li>
              </ul>
              <p className="italic text-sm">U kunt uw toestemming te allen tijde intrekken zonder dat dit afbreuk doet aan de rechtmatigheid van de verwerking vóór de intrekking.</p>
            </div>
          </section>

          {/* Artikel 4 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Cookies en vergelijkbare technologieën</h2>
            <div className="space-y-3 text-gray-700">
              <p>Onze website maakt gebruik van cookies en vergelijkbare technologieën om de functionaliteit te waarborgen, het gebruik te analyseren en te verbeteren, en om gerichte advertenties te tonen.</p>

              <h3 className="font-semibold mt-4">4.1 Soorten cookies</h3>
              <ul className="list-disc pl-8 space-y-2">
                <li><span className="font-semibold">Functionele cookies:</span> Noodzakelijk voor de basisfunctionaliteit van de website</li>
                <li><span className="font-semibold">Analytische cookies:</span> Voor het analyseren van websitegebruik (Google Analytics, etc.)</li>
                <li><span className="font-semibold">Marketing cookies:</span> Voor het tonen van relevante advertenties en remarketing</li>
                <li><span className="font-semibold">Social media cookies:</span> Voor integratie met social media platforms</li>
              </ul>

              <h3 className="font-semibold mt-4">4.2 Third-party diensten</h3>
              <p>Wij maken gebruik van de volgende third-party diensten die cookies kunnen plaatsen:</p>
              <ul className="list-disc pl-8 space-y-1">
                <li>Google Analytics - voor website analyse</li>
                <li>Google Ads - voor online advertenties</li>
                <li>Facebook Pixel - voor social media marketing</li>
                <li>LinkedIn Insights - voor B2B marketing</li>
                <li>Hotjar of vergelijkbare tools - voor gebruikersgedrag analyse</li>
                <li>Stripe - voor betalingsverwerking</li>
              </ul>

              <p className="mt-4">U kunt cookies beheren via uw browserinstellingen. Let op: het uitschakelen van cookies kan de functionaliteit van onze website beperken.</p>
            </div>
          </section>

          {/* Artikel 5 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Met wie delen wij uw gegevens?</h2>
            <div className="space-y-3 text-gray-700">
              <p>Wij kunnen uw persoonsgegevens delen met de volgende partijen:</p>

              <h3 className="font-semibold mt-4">5.1 Dienstverleners en verwerkers</h3>
              <ul className="list-disc pl-8 space-y-1">
                <li>Hosting- en cloudopslagproviders</li>
                <li>Betalingsproviders (zoals Stripe)</li>
                <li>E-mailmarketingdiensten</li>
                <li>CRM-systemen en klantenservicesoftware</li>
                <li>Analysetools en marketingplatforms</li>
                <li>WhatsApp Business API providers</li>
              </ul>

              <h3 className="font-semibold mt-4">5.2 Marketingpartners</h3>
              <p>Met uw toestemming kunnen wij uw gegevens delen met partners voor marketingdoeleinden, zoals:</p>
              <ul className="list-disc pl-8 space-y-1">
                <li>Advertentienetwerken (Google, Facebook, LinkedIn)</li>
                <li>Affiliatepartners</li>
                <li>Samenwerkingspartners in de energiesector</li>
              </ul>

              <h3 className="font-semibold mt-4">5.3 Wettelijke verplichtingen</h3>
              <p>Wij kunnen uw gegevens delen indien wij hiertoe wettelijk verplicht zijn of dit noodzakelijk is voor:</p>
              <ul className="list-disc pl-8 space-y-1">
                <li>Naleving van wettelijke procedures</li>
                <li>Bescherming van onze rechten en eigendom</li>
                <li>Fraudepreventie</li>
                <li>Bescherming van de veiligheid van gebruikers</li>
              </ul>

              <h3 className="font-semibold mt-4">5.4 Bedrijfsoverdrachten</h3>
              <p>Bij een fusie, overname of verkoop van activa kunnen uw gegevens worden overgedragen aan de betrokken partijen.</p>
            </div>
          </section>

          {/* Artikel 6 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Gegevensoverdracht buiten de EU</h2>
            <div className="space-y-3 text-gray-700">
              <p>Sommige van onze dienstverleners kunnen uw gegevens verwerken buiten de Europese Economische Ruimte (EER). In dat geval zorgen wij voor passende waarborgen conform de AVG, zoals:</p>
              <ul className="list-disc pl-8 space-y-1">
                <li>EU-goedgekeurde standaardcontractbepalingen</li>
                <li>Adequaatheidsbesluit van de Europese Commissie</li>
                <li>Privacy Shield certificering (waar van toepassing)</li>
                <li>Bindende bedrijfsvoorschriften (Binding Corporate Rules)</li>
              </ul>
            </div>
          </section>

          {/* Artikel 7 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Hoe lang bewaren wij uw gegevens?</h2>
            <div className="space-y-3 text-gray-700">
              <p>Wij bewaren uw persoonsgegevens niet langer dan noodzakelijk voor de doeleinden waarvoor ze zijn verzameld:</p>

              <ul className="list-disc pl-8 space-y-2">
                <li><span className="font-semibold">Accountgegevens:</span> Zolang uw account actief is, en tot 3 maanden na sluiting</li>
                <li><span className="font-semibold">Transactiegegevens:</span> 7 jaar (wettelijke bewaarplicht)</li>
                <li><span className="font-semibold">Leadgegevens:</span> Tot 2 jaar na levering, tenzij langer nodig voor klantrelatie</li>
                <li><span className="font-semibold">Marketinggegevens:</span> Tot u zich afmeldt of tot 3 jaar na laatste interactie</li>
                <li><span className="font-semibold">Cookies:</span> Maximaal 2 jaar, afhankelijk van het type cookie</li>
                <li><span className="font-semibold">Analysegegevens:</span> 26 maanden (Google Analytics standaard)</li>
                <li><span className="font-semibold">Correspondentie:</span> Tot 2 jaar na laatste contact</li>
              </ul>

              <p className="mt-4">Na afloop van de bewaartermijn worden uw gegevens veilig verwijderd of geanonimiseerd.</p>
            </div>
          </section>

          {/* Artikel 8 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Beveiliging van uw gegevens</h2>
            <div className="space-y-3 text-gray-700">
              <p>Wij nemen de bescherming van uw gegevens serieus en hebben passende technische en organisatorische maatregelen getroffen:</p>
              <ul className="list-disc pl-8 space-y-1">
                <li>SSL/TLS-versleuteling voor gegevensoverdracht</li>
                <li>Versleutelde opslag van gevoelige gegevens</li>
                <li>Regelmatige beveiligingsupdates en patches</li>
                <li>Toegangscontrole en authenticatie</li>
                <li>Regelmatige back-ups</li>
                <li>Beveiligingsmonitoring en logging</li>
                <li>Medewerkerstraining over gegevensbescherming</li>
              </ul>
            </div>
          </section>

          {/* Artikel 9 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Uw rechten</h2>
            <div className="space-y-3 text-gray-700">
              <p>U heeft de volgende rechten met betrekking tot uw persoonsgegevens:</p>

              <ul className="list-disc pl-8 space-y-2">
                <li><span className="font-semibold">Recht op inzage:</span> U kunt opvragen welke persoonsgegevens wij van u verwerken</li>
                <li><span className="font-semibold">Recht op rectificatie:</span> U kunt onjuiste gegevens laten corrigeren</li>
                <li><span className="font-semibold">Recht op verwijdering:</span> U kunt verzoeken om verwijdering van uw gegevens ('recht om vergeten te worden')</li>
                <li><span className="font-semibold">Recht op beperking:</span> U kunt verzoeken om beperking van de verwerking</li>
                <li><span className="font-semibold">Recht op dataportabiliteit:</span> U kunt uw gegevens in een gestructureerde vorm ontvangen</li>
                <li><span className="font-semibold">Recht van bezwaar:</span> U kunt bezwaar maken tegen verwerking op basis van gerechtvaardigd belang</li>
                <li><span className="font-semibold">Recht om toestemming in te trekken:</span> U kunt eerder gegeven toestemming te allen tijde intrekken</li>
              </ul>

              <p className="mt-4 font-semibold">Hoe kunt u uw rechten uitoefenen?</p>
              <p>U kunt uw rechten uitoefenen door contact met ons op te nemen via:</p>
              <ul className="list-none space-y-1 ml-4">
                <li>E-mail: info@warmeleads.eu</li>
                <li>Telefoon: +31 85 047 7067</li>
              </ul>
              <p className="mt-4">Wij reageren binnen 30 dagen op uw verzoek. In bepaalde gevallen kunnen wij verzoeken weigeren op basis van wettelijke gronden, bijvoorbeeld indien wij gegevens moeten bewaren voor fiscale doeleinden.</p>
            </div>
          </section>

          {/* Artikel 10 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Klachten</h2>
            <div className="space-y-3 text-gray-700">
              <p>Heeft u een klacht over de verwerking van uw persoonsgegevens? Neem dan eerst contact met ons op. U heeft ook het recht om een klacht in te dienen bij de Autoriteit Persoonsgegevens:</p>
              <ul className="list-none space-y-1 ml-4 mt-4">
                <li className="font-semibold">Autoriteit Persoonsgegevens</li>
                <li>Postbus 93374</li>
                <li>2509 AJ Den Haag</li>
                <li>Website: www.autoriteitpersoonsgegevens.nl</li>
                <li>Telefoon: 088 - 1805 250</li>
              </ul>
            </div>
          </section>

          {/* Artikel 11 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Geautomatiseerde besluitvorming en profiling</h2>
            <div className="space-y-3 text-gray-700">
              <p>Wij kunnen geautomatiseerde besluitvorming en profiling toepassen voor:</p>
              <ul className="list-disc pl-8 space-y-1">
                <li>Leadkwalificatie en scoring</li>
                <li>Personalisatie van content en aanbiedingen</li>
                <li>Fraudedetectie</li>
                <li>Website optimalisatie en A/B testing</li>
                <li>Gepersonaliseerde marketing en advertenties</li>
              </ul>
              <p className="mt-4">Deze verwerking heeft geen ingrijpende juridische gevolgen voor u. U heeft het recht om niet onderworpen te worden aan volledig geautomatiseerde besluitvorming indien dit wel significante gevolgen heeft.</p>
            </div>
          </section>

          {/* Artikel 12 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Minderjarigen</h2>
            <div className="space-y-3 text-gray-700">
              <p>Onze diensten zijn niet gericht op personen jonger dan 18 jaar. Wij verzamelen niet bewust persoonsgegevens van minderjarigen. Indien u vermoedt dat wij gegevens hebben verzameld van een minderjarige, neem dan contact met ons op.</p>
            </div>
          </section>

          {/* Artikel 13 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Links naar andere websites</h2>
            <div className="space-y-3 text-gray-700">
              <p>Onze website kan links bevatten naar websites van derden. Wij zijn niet verantwoordelijk voor het privacybeleid en de praktijken van deze externe websites. Wij raden u aan om hun privacyverklaring te lezen wanneer u deze websites bezoekt.</p>
            </div>
          </section>

          {/* Artikel 14 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Wijzigingen in deze privacyverklaring</h2>
            <div className="space-y-3 text-gray-700">
              <p>Wij behouden ons het recht voor om deze privacyverklaring te wijzigen. Wijzigingen worden gepubliceerd op deze pagina met vermelding van de datum van laatste wijziging. Wij adviseren u om deze privacyverklaring regelmatig te raadplegen om op de hoogte te blijven van eventuele wijzigingen.</p>
              <p className="mt-4">Bij ingrijpende wijzigingen zullen wij u hiervan op de hoogte stellen via e-mail of een melding op onze website.</p>
            </div>
          </section>

          {/* Artikel 15 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Contact</h2>
            <div className="space-y-3 text-gray-700">
              <p>Voor vragen over deze privacyverklaring of over de verwerking van uw persoonsgegevens kunt u contact met ons opnemen:</p>
              <ul className="list-none space-y-1 ml-4 mt-4">
                <li className="font-semibold">Warmeleads.eu</li>
                <li>E-mail: info@warmeleads.eu</li>
                <li>Telefoon: +31 85 047 7067</li>
                <li>Website: www.warmeleads.eu</li>
              </ul>
            </div>
          </section>

          {/* Back to home button */}
          <div className="mt-12 text-center">
            <Link 
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Terug naar home
            </Link>
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center pt-6 border-t border-gray-200">
            <div className="space-x-4 text-sm">
              <a 
                href="/algemene-voorwaarden" 
                className="text-gray-600 hover:text-gray-900 underline transition-colors"
              >
                Algemene voorwaarden
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600">
          <p>&copy; 2025 Warmeleads.eu. Alle rechten voorbehouden.</p>
        </div>
      </footer>
    </div>
  );
}

