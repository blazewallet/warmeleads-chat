#!/bin/bash

# WarmeLeads Deployment Preparation Script
# Bereidt alle bestanden voor upload naar MijnDomein

echo "🚀 Preparing WarmeLeads for deployment to www.warmeleads.eu"

# Create deployment directory
DEPLOY_DIR="../warmeleads-deployment"
rm -rf "$DEPLOY_DIR" 2>/dev/null || true
mkdir -p "$DEPLOY_DIR"

echo "📁 Creating deployment package..."

# Copy essential files for production
cp -r .next "$DEPLOY_DIR/"
cp -r public "$DEPLOY_DIR/"
cp -r src "$DEPLOY_DIR/"
cp package.json "$DEPLOY_DIR/"
cp package-lock.json "$DEPLOY_DIR/"
cp next.config.js "$DEPLOY_DIR/"
cp tailwind.config.ts "$DEPLOY_DIR/"
cp tsconfig.json "$DEPLOY_DIR/"

# Create production environment template
cat > "$DEPLOY_DIR/.env.production.template" << 'EOF'
# WarmeLeads Production Environment Variables
# Kopieer naar .env.local in MijnDomein hosting

# Stripe Configuration (VERPLICHT - vervang met echte keys)
STRIPE_SECRET_KEY=sk_live_jouw_stripe_secret_key_hier
STRIPE_WEBHOOK_SECRET=whsec_jouw_webhook_secret_hier  
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_jouw_stripe_publishable_key_hier

# Database (optioneel)
DATABASE_URL=postgresql://username:password@localhost:5432/warmeleads

# Email Service (optioneel)
SMTP_HOST=smtp.jouw-provider.com
SMTP_USER=info@warmeleads.eu
SMTP_PASS=jouw_email_wachtwoord
FROM_EMAIL=info@warmeleads.eu

# Environment
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://www.warmeleads.eu
EOF

# Create deployment instructions
cat > "$DEPLOY_DIR/UPLOAD_INSTRUCTIES.md" << 'EOF'
# 📤 Upload Instructies voor MijnDomein

## 🔧 Wat te uploaden:
1. Upload ALLE bestanden en mappen naar je hosting directory
2. Zorg dat .next/ en src/ mappen compleet zijn
3. Upload package.json en package-lock.json

## ⚙️ MijnDomein Configuratie:
1. Ga naar Node.js hosting instellingen
2. Set entry point: "npm start"
3. Enable Node.js versie 18+
4. Kopieer .env.production.template naar .env.local
5. Vul echte Stripe keys in

## 🌐 Domain Setup:
1. Point www.warmeleads.eu naar hosting directory
2. Enable SSL certificaat
3. Test: https://www.warmeleads.eu

## ✅ Na Upload:
MijnDomein zal automatisch uitvoeren:
- npm install
- npm run build  
- npm start

De website is dan live op www.warmeleads.eu! 🎉
EOF

# Create ZIP for easy upload
cd "$DEPLOY_DIR"
zip -r "../warmeleads-production.zip" . -x "*.DS_Store*" "*.git*"
cd ..

echo ""
echo "✅ Deployment package created!"
echo "📁 Location: $DEPLOY_DIR"
echo "📦 ZIP file: warmeleads-production.zip"
echo ""
echo "📤 Upload stappen:"
echo "1. Upload warmeleads-production.zip naar MijnDomein"
echo "2. Extract in hosting directory"
echo "3. Configure Node.js hosting"
echo "4. Set environment variables"
echo "5. Point domain naar hosting"
echo ""
echo "🌐 Website wordt dan live op: https://www.warmeleads.eu"
echo ""






