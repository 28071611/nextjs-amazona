import { getAIRecommendations } from '@/lib/actions/product.actions'
import ProductSlider from './product-slider'
import { getTranslations } from 'next-intl/server'

export default async function AIRecommendations({
    productId,
}: {
    productId: string
}) {
    const t = await getTranslations()
    const recommendedProducts = await getAIRecommendations(productId)

    if (recommendedProducts.length === 0) return null

    return (
        <section className='mt-10'>
            <ProductSlider
                products={recommendedProducts}
                title={t('Product.Recommended for You')}
            />
        </section>
    )
}
