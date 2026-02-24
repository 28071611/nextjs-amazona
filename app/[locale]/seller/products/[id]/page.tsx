import Link from 'next/link'
import ProductForm from '@/app/[locale]/admin/products/product-form'
import { Metadata } from 'next'
import { getProductById } from '@/lib/actions/product.actions'
import { notFound } from 'next/navigation'
import { auth } from '@/auth'

export const metadata: Metadata = {
    title: 'Edit Product',
}

const EditProductPage = async (props: {
    params: Promise<{ id: string; locale: string }>
}) => {
    const { id, locale } = await props.params
    const product = await getProductById(id)

    if (!product) notFound()

    const session = await auth()
    // Check if seller owns the product
    if (session?.user.role === 'Seller' && product.seller && product.seller.toString() !== session.user.id) {
        return <div className="p-4 text-red-500">You are not authorized to edit this product.</div>
    }

    return (
        <main className='max-w-6xl mx-auto p-4'>
            <div className='flex mb-4'>
                <Link href={`/${locale}/seller/products`}>Products</Link>
                <span className='mx-1'>›</span>
                <Link href={`/${locale}/seller/products/${product._id}`}>{product.name}</Link>
            </div>

            <div className='my-8'>
                <ProductForm type='Update' product={product} productId={product._id} path={`/${locale}/seller/products`} />
            </div>
        </main>
    )
}

export default EditProductPage
