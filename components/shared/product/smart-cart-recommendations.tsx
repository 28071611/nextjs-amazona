'use client'

import { useEffect, useState } from 'react'
import { getAICartRecommendations } from '@/lib/actions/product.actions'
import ProductSlider from './product-slider'

export default function SmartCartRecommendations({
    cartItems,
}: {
    cartItems: any[]
}) {
    const [recommendedProducts, setRecommendedProducts] = useState<any[]>([])

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (cartItems.length > 0) {
                const products = await getAICartRecommendations(cartItems)
                setRecommendedProducts(products)
            }
        }
        fetchRecommendations()
    }, [cartItems])

    if (recommendedProducts.length === 0) return null

    return (
        <section className='mt-10'>
            <ProductSlider
                products={recommendedProducts}
                title="Frequently Bought Together"
            />
        </section>
    )
}
