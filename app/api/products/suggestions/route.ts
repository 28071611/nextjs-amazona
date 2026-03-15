import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import Product from '@/lib/db/models/product.model'

export async function GET(req: NextRequest) {
    try {
        const q = req.nextUrl.searchParams.get('q')?.trim()
        if (!q || q.length < 2) {
            return NextResponse.json({ suggestions: [] })
        }

        await connectToDatabase()
        const products = await Product.find(
            {
                isPublished: true,
                $or: [
                    { name: { $regex: q, $options: 'i' } },
                    { category: { $regex: q, $options: 'i' } },
                    { brand: { $regex: q, $options: 'i' } },
                ],
            },
            { name: 1, slug: 1, category: 1, images: 1, price: 1 }
        )
            .limit(8)
            .lean()

        const suggestions = products.map((p) => ({
            name: p.name,
            slug: p.slug,
            category: p.category,
            image: p.images?.[0] || '',
            price: p.price,
        }))

        return NextResponse.json({ suggestions })
    } catch (error) {
        console.error('Suggestions error:', error)
        return NextResponse.json({ suggestions: [] })
    }
}
