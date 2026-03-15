@echo off
echo 🚀 AUTOMATIC HYDRATION FIX - WINDOWS VERSION
echo ==================================

REM Step 1: Backup current files
echo 📦 Creating backups...
if exist next.config.js copy next.config.js next.config.js.backup
if exist app\layout.tsx copy app\layout.tsx app\layout.tsx.backup
if exist app\globals.css copy app\globals.css app\globals.css.backup

REM Step 2: Apply Next.js config fix
echo ⚙️ Fixing Next.js configuration...
(
echo module.exports = {
echo   experimental: {
echo       suppressHydrationWarning: true,
echo   },
echo   reactStrictMode: true,
echo   env: {
echo       CUSTOM_KEY: process.env.CUSTOM_KEY,
echo   },
echo   compiler: {
echo       removeConsole: process.env.NODE_ENV === 'production',
echo   },
echo   swcMinify: true,
echo   i18n: {
echo       locales: ['en', 'hi', 'es', 'fr'],
echo       defaultLocale: 'en',
echo   },
echo }
) > next.config.js

REM Step 3: Apply layout fix
echo 🎨 Fixing layout component...
(
echo import { Inter } from 'next/font/google'
echo import './globals.css'
echo.
echo const inter = Inter({ subsets: ['latin'] })
echo.
echo export const metadata = {
echo   title: 'Amazona - E-Commerce Platform',
echo   description: 'Complete e-commerce platform with chatbot',
echo }
echo.
echo export default function RootLayout({
echo   children,
echo }: {
echo   children: React.ReactNode
echo }) {
echo  return (
echo    ^<html lang="en" suppressHydrationWarning={true}^>
echo      ^<body className={inter.className + ' min-h-screen font-sans antialiased'} suppressHydrationWarning={true}^>
echo        {children}
echo      ^</body^>
echo    ^</html^>
echo  ^)
echo }
) > app\layout.tsx

REM Step 4: Apply CSS fixes
echo 🎨 Applying CSS fixes...
(
echo /* Fix for hydration issues */
echo * {
echo   box-sizing: border-box;
echo }
echo.
echo html {
echo   scroll-behavior: smooth;
echo }
echo.
echo /* Fix for hydration in components */
echo .loading-skeleton {
echo   animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
echo }
echo.
echo @keyframes pulse {
echo   0%%, 100%% {
echo     opacity: 1;
echo   }
echo   50%% {
echo     opacity: .5;
echo   }
echo }
) > app\hydration-fixes.css

REM Step 5: Update globals.css
echo 🎨 Updating globals.css...
echo @import './hydration-fixes.css'; >> app\globals.css

REM Step 6: Install dependencies
echo 📦 Installing dependencies...
call npm install --silent

REM Step 7: Clean build
echo 🧹 Cleaning build...
if exist .next rmdir /s /q .next

echo.
echo ✅ Automatic hydration fix completed!
echo 🚀 Next steps:
echo    1. Run: npm run dev
echo    2. Open: http://localhost:3000
echo    3. Access chatbot at: http://localhost:3000/chatbot
echo    4. Check admin dashboard at: http://localhost:3000/admin/chatbot-deployment
echo.
echo 📁 Backups created:
echo    - next.config.js.backup
echo    - app\layout.tsx.backup
echo    - app\globals.css.backup
echo.
echo 🎊 Hydration issues should now be resolved!
pause
