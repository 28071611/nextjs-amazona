import { getProductsByTag, getAllProducts } from '@/lib/actions/product.actions'
import { getSetting } from '@/lib/actions/setting.actions'
import data from '@/lib/data'
import { HomeCarousel } from '@/components/shared/home/home-carousel'
import ProductSlider from '@/components/shared/product/product-slider'
import BrowsingHistoryList from '@/components/shared/browsing-history-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Star, TrendingUp, Clock, Shield } from 'lucide-react'

export default async function HomePage() {
  // Get featured products
  const todaysDeals = await getProductsByTag({ tag: 'todays-deal' })
  const bestSellingProducts = await getProductsByTag({ tag: 'best-seller' })
  const featuredProducts = await getAllProducts({ query: '', category: 'all', tag: 'featured', page: 1, sort: 'rating-desc' })
  const settings = await getSetting()
  const { carousels } = settings || data.settings[0]

  return (
    <div className="flex flex-col">
      {/* Hero Carousel - Keep existing model intact */}
      {carousels && carousels.length > 0 && (
        <section className="relative">
          <HomeCarousel items={carousels} />
        </section>
      )}

      {/* Featured Products Section */}
      <section className="container-elite py-12">
        <div className="text-center space-y-4 mb-8">
          <h1 className="h1-bold elite-heading">Welcome to NxtAmzn</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover amazing products with AI-powered recommendations and unbeatable prices
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/products">Shop All Products</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/search">Advanced Search</Link>
            </Button>
          </div>
        </div>

        {/* Today's Deals */}
        {todaysDeals && todaysDeals.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-6 w-6 text-orange-500" />
                <h2 className="h2-bold">Today&apos;s Deals</h2>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  Limited Time
                </Badge>
              </div>
              <Button variant="outline" asChild>
                <Link href="/search?tag=todays-deal">View All</Link>
              </Button>
            </div>
            <ProductSlider 
              products={todaysDeals} 
              title="Today's Deals"
              hideDetails={false}
            />
          </div>
        )}

        {/* Best Sellers */}
        {bestSellingProducts && bestSellingProducts.length > 0 && (
          <div className="space-y-6 mt-16">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-green-500" />
                <h2 className="h2-bold">Best Sellers</h2>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Popular
                </Badge>
              </div>
              <Button variant="outline" asChild>
                <Link href="/search?tag=best-seller">View All</Link>
              </Button>
            </div>
            <ProductSlider 
              products={bestSellingProducts} 
              title="Best Sellers"
              hideDetails={false}
            />
          </div>
        )}

        {/* Featured Products */}
        {featuredProducts && featuredProducts.products && featuredProducts.products.length > 0 && (
          <div className="space-y-6 mt-16">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-500" />
                <h2 className="h2-bold">Featured Products</h2>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Top Rated
                </Badge>
              </div>
              <Button variant="outline" asChild>
                <Link href="/search?tag=featured">View All</Link>
              </Button>
            </div>
            <ProductSlider 
              products={featuredProducts.products} 
              title="Featured Products"
              hideDetails={false}
            />
          </div>
        )}

        {/* Browsing History */}
        <BrowsingHistoryList className="mt-16" />

        {/* Trust Badges */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardHeader>
              <Shield className="h-8 w-8 mx-auto text-blue-500 mb-2" />
              <CardTitle className="text-lg">Secure Shopping</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                100% secure payment processing with SSL encryption
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <Clock className="h-8 w-8 mx-auto text-green-500 mb-2" />
              <CardTitle className="text-lg">Fast Delivery</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Quick delivery with real-time tracking
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <Star className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
              <CardTitle className="text-lg">Quality Products</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Curated selection of premium quality items
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <TrendingUp className="h-8 w-8 mx-auto text-purple-500 mb-2" />
              <CardTitle className="text-lg">Best Prices</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Competitive pricing with regular deals and discounts
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
