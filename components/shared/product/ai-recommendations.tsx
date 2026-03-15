import { getAIRecommendations } from '@/lib/actions/product.actions'
import ProductSlider from './product-slider'

export default async function AIRecommendations({
    productId,
}: {
    productId: string
}) {
    const recommendedProducts = await getAIRecommendations(productId)

    if (recommendedProducts.length === 0) return null

    return (
        <section className='mt-10'>
            <ProductSlider
                products={recommendedProducts}
                title="Recommended for You"
            />
        </section>
    )
}
