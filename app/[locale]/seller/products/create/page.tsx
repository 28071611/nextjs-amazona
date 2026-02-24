import Link from 'next/link'
import ProductForm from '@/app/[locale]/admin/products/product-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Create Product',
}

const CreateProductPage = async (props: {
    params: Promise<{ locale: string }>
}) => {
    const { locale } = await props.params
    return (
        <main className='max-w-6xl mx-auto p-4'>
            <div className='flex mb-4'>
                <Link href={`/${locale}/seller/products`}>Products</Link>
                <span className='mx-1'>›</span>
                <Link href={`/${locale}/seller/products/create`}>Create</Link>
            </div>

            <div className='my-8'>
                <ProductForm type='Create' path={`/${locale}/seller/products`} />
            </div>
        </main>
    )
}

export default CreateProductPage
