import BrowsingHistoryList from '@/components/shared/browsing-history-list'
import { HomeCard } from '@/components/shared/home/home-card'
import { HomeCarousel } from '@/components/shared/home/home-carousel'
import { PersonalizedProducts } from '@/components/shared/home/personalized-products'
import ProductSlider from '@/components/shared/product/product-slider'
import { Card, CardContent } from '@/components/ui/card'

import {
  getProductsForCard,
  getProductsByTag,
  getAllCategories,
  getCategoryCards,
} from '@/lib/actions/product.actions'
import { getSetting } from '@/lib/actions/setting.actions'
import { toSlug } from '@/lib/utils'
import { getTranslations } from 'next-intl/server'

export default async function HomePage() {
  const t = await getTranslations('Home')
  const { carousels } = await getSetting()
  const todaysDeals = await getProductsByTag({ tag: 'todays-deal' })
  const bestSellingProducts = await getProductsByTag({ tag: 'best-seller' })

  const categories = (await getAllCategories()).slice(0, 4)
  const newArrivals = await getProductsForCard({
    tag: 'new-arrival',
  })
  const featureds = await getProductsForCard({
    tag: 'featured',
  })
  const bestSellers = await getProductsForCard({
    tag: 'best-seller',
  })
  const cards = [
    {
      title: t('Categories to explore'),
      link: {
        text: t('See More'),
        href: '/search',
      },
      items: await getCategoryCards(),
    },
    {
      title: t('Explore New Arrivals'),
      items: newArrivals,
      link: {
        text: t('View All'),
        href: '/search?tag=new-arrival',
      },
    },
    {
      title: t('Discover Best Sellers'),
      items: bestSellers,
      link: {
        text: t('View All'),
        href: '/search?tag=new-arrival',
      },
    },
    {
      title: t('Featured Products'),
      items: featureds,
      link: {
        text: t('Shop Now'),
        href: '/search?tag=new-arrival',
      },
    },
  ]

  return (
    <div className='space-y-24 md:space-y-32'>
      {/* Hero Carousel */}
      <div className='overflow-hidden rounded-lg elite-shadow elite-glow-hover elite-float'>
        <HomeCarousel items={carousels} />
      </div>
      
      {/* Personalized Products */}
      <div className='elite-card elite-shadow-hover p-12 md:p-16'>
        <PersonalizedProducts />
      </div>
      
      {/* Category Collections */}
      <div className='space-y-12'>
        <div className='text-center space-y-6'>
          <h2 className='h2-bold elite-heading'>Exclusive Collections</h2>
          <div className='elite-divider max-w-32 mx-auto'></div>
        </div>
        <HomeCard cards={cards} />
      </div>
      
      {/* Product Showcases */}
      <div className='space-y-24'>
        <div className='elite-card elite-shadow-hover overflow-hidden'>
          <div className='p-12 md:p-16'>
            <div className='text-center mb-16'>
              <h3 className='h3-bold mb-6 font-light'>{t("Today's Deals")}</h3>
              <div className='elite-divider max-w-20 mx-auto'></div>
            </div>
            <ProductSlider products={todaysDeals} />
          </div>
        </div>
        
        <div className='elite-card elite-shadow-hover overflow-hidden'>
          <div className='p-12 md:p-16'>
            <div className='text-center mb-16'>
              <h3 className='h3-bold mb-6 font-light'>{t('Best Selling Products')}</h3>
              <div className='elite-divider max-w-20 mx-auto'></div>
            </div>
            <ProductSlider
              products={bestSellingProducts}
              hideDetails
            />
          </div>
        </div>
      </div>

      {/* Browsing History */}
      <div className='elite-card elite-shadow-hover p-12 md:p-16'>
        <BrowsingHistoryList />
      </div>
    </div>
  )
}
