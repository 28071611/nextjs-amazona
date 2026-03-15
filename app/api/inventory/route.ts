import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectToDatabase } from '@/lib/db'
import Product from '@/lib/db/models/product.model'
import { revalidatePath } from 'next/cache'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    await connectToDatabase()

    // Get all products with stock information
    const products = await Product.find({ isPublished: true })
      .select('_id name stock countInStock category')
      .sort({ name: 1 })

    // Calculate inventory statistics
    const totalProducts = products.length
    const totalStock = products.reduce((sum, product) => sum + product.countInStock, 0)
    const lowStockItems = products.filter(product => product.countInStock < 10)
    const outOfStockItems = products.filter(product => product.countInStock === 0)

    const inventoryStats = {
      totalProducts,
      totalStock,
      lowStockItems: lowStockItems.map(item => ({
        id: item._id,
        name: item.name,
        currentStock: item.countInStock,
        category: item.category,
      })),
      outOfStockItems: outOfStockItems.map(item => ({
        id: item._id,
        name: item.name,
        category: item.category,
      })),
      categories: [...new Set(products.map(p => p.category))],
    }

    return NextResponse.json({
      success: true,
      data: inventoryStats,
    })
  } catch (error) {
    console.error('Inventory API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { productId, newStock } = body

    if (!productId || newStock === undefined) {
      return NextResponse.json(
        { error: 'Product ID and new stock are required' },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const product = await Product.findById(productId)
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Update stock
    product.countInStock = newStock
    product.updatedAt = new Date()
    await product.save()

    // Check if product is now out of stock
    const isOutOfStock = newStock === 0

    revalidatePath('/admin/inventory')

    return NextResponse.json({
      success: true,
      message: `Stock updated to ${newStock} units${isOutOfStock ? ' (Product is now out of stock)' : ''}`,
      isOutOfStock,
      product: {
        id: product._id,
        name: product.name,
        currentStock: newStock,
        category: product.category,
      },
    })
  } catch (error) {
    console.error('Inventory update error:', error)
    return NextResponse.json(
      { error: 'Failed to update stock' },
      { status: 500 }
    )
  }
}
