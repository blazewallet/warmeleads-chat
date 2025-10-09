# 🚀 WarmeLeads Deployment Guide - MijnDomein Hosting

## 📋 Stap-voor-Stap Deployment naar www.warmeleads.eu

### 🔧 **STAP 1: Production Build Voorbereiden**

✅ **Build Status**: Succesvol voltooid!
- Route /: 48.5 kB (178 kB First Load)
- Totaal: 87.1 kB shared JavaScript
- Alle pagina's geoptimaliseerd voor productie

### 📁 **STAP 2: Upload Bestanden naar MijnDomein**

#### **Upload deze mappen/bestanden:**
```
📁 .next/          (volledige map - production build)
📁 public/         (volledige map - assets)
📁 src/            (volledige map - source code)
📄 package.json    (dependencies)
📄 package-lock.json (exact versions)
📄 next.config.js  (Next.js configuratie)
📄 tailwind.config.ts (styling)
📄 tsconfig.json   (TypeScript config)
```

#### **NIET uploaden:**
- ❌ node_modules/ (wordt server-side geïnstalleerd)
- ❌ .git/ (version control)
- ❌ *.log bestanden
- ❌ .env.* bestanden (gevoelige data)

### 🌐 **STAP 3: MijnDomein Configuratie**

#### **A. Node.js Hosting Setup:**
1. **Login** bij MijnDomein control panel
2. **Ga naar** hosting beheer voor warmeleads.eu
3. **Selecteer** Node.js hosting (versie 18+ vereist)
4. **Set** entry point: `server.js` of `npm start`

#### **B. Environment Variables instellen:**
```bash
# In MijnDomein control panel → Environment Variables:
NODE_ENV=production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_jouw_stripe_key
STRIPE_SECRET_KEY=sk_live_jouw_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_jouw_webhook_secret
```

#### **C. Domain & SSL:**
1. **Point** www.warmeleads.eu naar hosting
2. **Enable** SSL certificaat (gratis via Let's Encrypt)
3. **Redirect** http → https

### 📦 **STAP 4: Dependencies Installeren**

MijnDomein zal automatisch uitvoeren:
```bash
npm install --production
npm run build
npm start
```

### 🔧 **STAP 5: Server Configuratie**

#### **Package.json Scripts (al geconfigureerd):**
```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "dev": "next dev"
  }
}
```

#### **Next.js Configuratie (al geoptimaliseerd):**
- ✅ Production optimalisaties
- ✅ Memory management
- ✅ Static file serving
- ✅ SEO optimalisatie

### 🚀 **STAP 6: Go Live Checklist**

#### **Voor Go-Live:**
- [ ] **Upload** alle bestanden naar MijnDomein
- [ ] **Install** dependencies via MijnDomein panel
- [ ] **Configure** environment variables
- [ ] **Set** Node.js entry point
- [ ] **Enable** SSL certificaat
- [ ] **Test** www.warmeleads.eu

#### **Na Go-Live:**
- [ ] **Test** alle chat flows
- [ ] **Verify** contact formulieren
- [ ] **Check** ROI calculator
- [ ] **Test** mobile responsive design
- [ ] **Verify** alle links werken

### 📞 **STAP 7: Stripe Live Configuratie**

#### **Voor echte betalingen:**
1. **Stripe Dashboard** → API keys
2. **Copy** live keys (pk_live_... en sk_live_...)
3. **Update** environment variables in MijnDomein
4. **Configure** webhook endpoint: `https://www.warmeleads.eu/api/webhooks/stripe`

### 🔍 **STAP 8: Testing & Monitoring**

#### **Test URLs:**
- `https://www.warmeleads.eu` - Homepage
- `https://www.warmeleads.eu/?chat=roi` - ROI Calculator
- `https://www.warmeleads.eu/admin` - Admin panel

#### **Contact Testing:**
- 📞 Telefoon: +31 85 047 7067
- 📧 Email: info@warmeleads.eu
- 💬 WhatsApp: +31 6 1392 7338

### 🎯 **DEPLOYMENT SAMENVATTING**

**Hosting Provider**: MijnDomein
**Domain**: www.warmeleads.eu
**Technology**: Next.js 14 (Node.js)
**Build Size**: 178 kB (zeer geoptimaliseerd!)
**Features**: 
- ✅ Responsive design
- ✅ PWA capabilities
- ✅ Chat interface met Lisa
- ✅ ROI calculator
- ✅ Contact integration
- ✅ Express checkout flow
- ✅ Error boundaries
- ✅ SEO optimized

### 📞 **MijnDomein Support**

Als je hulp nodig hebt bij het uploaden:
- **MijnDomein Support**: Contacteer hun voor Node.js hosting setup
- **Documentatie**: Zoek naar "Node.js hosting" in hun kennisbank

**DE WEBSITE IS KLAAR VOOR PRODUCTIE!** 🎉


