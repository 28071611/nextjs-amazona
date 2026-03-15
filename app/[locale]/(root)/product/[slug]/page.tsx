import { auth } from '@/auth'
import AddToCart from '@/components/shared/product/add-to-cart'
import { Card, CardContent } from '@/components/ui/card'
import {
  getProductBySlug,
  getRelatedProductsByCategory,
} from '@/lib/actions/product.actions'

import ReviewList from './review-list'
import { generateId, round2 } from '@/lib/utils'
import SelectVariant from '@/components/shared/product/select-variant'
import ProductPrice from '@/components/shared/product/product-price'
import ProductGallery from '@/components/shared/product/product-gallery'
import AddToBrowsingHistory from '@/components/shared/product/add-to-browsing-history'
import { Separator } from '@/components/ui/separator'
import BrowsingHistoryList from '@/components/shared/browsing-history-list'
import RatingSummary from '@/components/shared/product/rating-summary'
import ProductSlider from '@/components/shared/product/product-slider'
import AIRecommendations from '@/components/shared/product/ai-recommendations'

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>
}) {
  const params = await props.params
  const product = await getProductBySlug(params.slug)
  if (!product) {
    return { title: 'Product not found' }
  }
  
  return {
    title: product.name,
    description: product.description,
  }
}

export default async function ProductDetails(props: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page: string; color: string; size: string }>
}) {
  const searchParams = await props.searchParams
  const { page, color, size } = searchParams
  const params = await props.params
  const { slug } = params

  const session = await auth()
  const product = await getProductBySlug(slug)

  const relatedProducts = await getRelatedProductsByCategory({
    category: product.category,
    productId: product._id,
    page: Number(page || '1'),
  })

  return (
    <div>
      <AddToBrowsingHistory id={product._id} category={product.category} />
      <section>
        <div className='grid grid-cols-1 md:grid-cols-5'>
          <div className='col-span-2'>
            <ProductGallery images={product.images} />
          </div>

          <div className='flex w-full flex-col gap-2 md:p-5 col-span-2'>
            <div className='flex flex-col gap-3'>
              <p className='p-medium-16 rounded-full bg-grey-500/10 text-grey-500'>
                Brand {product.brand} {product.category}
              </p>
              {product.seller && (product.seller as any).name && (
                <p className='p-medium-16 rounded-full bg-grey-500/10 text-grey-500'>
                  Sold by: {(product.seller as any).name}
                </p>
              )}
              <h1 className='font-bold text-lg lg:text-xl'>{product.name}</h1>

              <RatingSummary
                avgRating={product.avgRating}
                numReviews={product.numReviews}
                ratingDistribution={product.ratingDistribution}
                asPopover={true}
              />

              <div className='flex items-center gap-2 mt-2'>
                <ProductPrice
                  price={product.price}
                  listPrice={product.listPrice}
                  plain
                />
                <span className='text-xs text-muted-foreground'>List Price: ${product.listPrice.toFixed(2)}</span>
              </div>
              <p className='text-muted-foreground leading-relaxed mt-2'>{product.description}</p>

              <div className='flex items-center gap-2 mt-4'>
                <SelectVariant
                  product={product}
                  color={color}
                  size={size}
                />
                <AddToCart 
                  item={{
                    name: product.name,
                    slug: product.slug,
                    category: product.category,
                    price: product.price,
                    countInStock: product.countInStock,
                    product: product._id,
                    image: product.images[0],
                    clientId: 'temp-id',
                    quantity: 1,
                    size: size || product.sizes[0],
                    color: color || product.colors[0],
                  }} 
                />
              </div>
            </div>
          </div>
        </div>

        <div className='col-span-3 space-y-4'>
          <div className='text-center space-y-4'>
            <h2 className='h2-bold elite-heading font-light tracking-tight'>Customer Reviews</h2>
            <div className='elite-divider max-w-32 mx-auto'></div>
            <ReviewList
              product={product}
              userId={session?.user?.id}
            />
          </div>

          <div className='text-center space-y-4'>
            <h2 className='h2-bold elite-heading font-light tracking-tight'>Related Products</h2>
            <div className='elite-divider max-w-32 mx-auto'></div>
            <ProductSlider
              title="Related Products"
              products={relatedProducts.data}
              hideDetails
            />
          </div>

          <div className='text-center space-y-4'>
            <h2 className='h2-bold elite-heading font-light tracking-tight'>AI Recommendations</h2>
            <div className='elite-divider max-w-32 mx-auto'></div>
            <AIRecommendations productId={product._id} />
          </div>
        </div>
      </section>
      <section>
        <BrowsingHistoryList className='mt-10' />
      </section>
    </div>
  )
}
