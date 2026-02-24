import Header from '@/components/shared/header'
import Footer from '@/components/shared/footer'

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='flex flex-col min-h-screen elite-grid'>
      <div className='bg-background/80 backdrop-blur-md border-b border-border/20 elite-glow'>
        <div className='container-elite'>
          <Header />
        </div>
      </div>
      <main className='flex-1 flex flex-col'>
        <div className='container-elite py-12 md:py-20 elite-spacing elite-fade'>
          {children}
        </div>
      </main>
      <div className='bg-background/80 backdrop-blur-md border-t border-border/20 mt-auto elite-glow'>
        <div className='container-elite'>
          <Footer />
        </div>
      </div>
    </div>
  )
}
