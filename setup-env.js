const fs = require('fs')
const path = require('path')

// Create .env.local file with basic configuration
const envContent = `# App Configuration
NEXT_PUBLIC_APP_NAME=Amazona
NEXT_PUBLIC_APP_DESCRIPTION=An Amazon clone built with Next.js, MongoDB, Shadcn
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost/nextjs-amazona

# Auth (run 'npx auth secret' to generate AUTH_SECRET)
AUTH_SECRET=your-auth-secret-here
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

# Email (Resend)
RESEND_API_KEY=
SENDER_EMAIL=

# UploadThing
UPLOADTHING_TOKEN=

# PayPal
PAYPAL_API_URL=https://api-m.sandbox.paypal.com
PAYPAL_CLIENT_ID=
PAYPAL_APP_SECRET=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
`

const envPath = path.join(__dirname, '.env.local')

try {
  fs.writeFileSync(envPath, envContent)
  console.log('✅ .env.local file created successfully!')
  console.log('\n📝 Next steps:')
  console.log('1. Run "npx auth secret" and update AUTH_SECRET in .env.local')
  console.log('2. Configure your MongoDB URI if needed')
  console.log('3. Add Resend API key for email functionality')
  console.log('4. Add PayPal/Stripe keys for payment processing')
  console.log('\n🚀 Restart the development server: npm run dev')
} catch (error) {
  console.error('❌ Error creating .env.local:', error.message)
  console.log('\n💡 Manual setup required:')
  console.log('1. Copy .example-env to .env.local')
  console.log('2. Fill in the required environment variables')
}
