import { Metadata } from 'next'
import SellerProductList from './seller-product-list'

export const metadata: Metadata = {
    title: 'Seller Products',
}

export default async function SellerProduct() {
    return <SellerProductList />
}
